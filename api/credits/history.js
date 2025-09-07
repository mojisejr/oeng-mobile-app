"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const render_1 = require("../types/render");
const response_1 = require("../utils/response");
const auth_middleware_1 = require("../utils/auth-middleware");
const firebase_sdk_1 = require("../../firebase-sdk");
const firestore_1 = require("firebase/firestore");
const db_schema_1 = require("../utils/db-schema");
async function historyHandler(req, res) {
    const request = req;
    const response = (0, render_1.enhanceResponse)(res);
    const queryParams = (0, render_1.parseQuery)(request.url || '');
    if (request.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(response);
    }
    (0, response_1.setCorsHeaders)(response);
    if (request.method !== 'GET') {
        return response.status(405).json({
            success: false,
            error: 'Method not allowed. Use GET.'
        });
    }
    try {
        const clerkUserId = request.user?.id;
        if (!clerkUserId) {
            return response.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const limitParam = queryParams.limit;
        const limit = limitParam ? parseInt(limitParam, 10) : 20;
        if (limit < 1 || limit > 100) {
            return response.status(400).json({
                success: false,
                error: 'Limit must be between 1 and 100'
            });
        }
        const transactionsRef = (0, firestore_1.collection)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.CREDIT_TRANSACTIONS);
        const q = (0, firestore_1.query)(transactionsRef, (0, firestore_1.where)('clerkUserId', '==', clerkUserId), (0, firestore_1.orderBy)('createdAt', 'desc'), (0, firestore_1.limit)(limit));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        const transactions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
        }));
        const hasMore = transactions.length === limit;
        return response.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    limit,
                    hasMore,
                    returned: transactions.length
                }
            },
            message: 'Credit history retrieved successfully'
        });
    }
    catch (error) {
        console.error('Get credit history error:', error);
        if (error instanceof Error) {
            if (error.message.includes('permission-denied')) {
                return response.status(403).json({
                    success: false,
                    error: 'Permission denied. Please check your authentication.'
                });
            }
            if (error.message.includes('not-found')) {
                return response.status(404).json({
                    success: false,
                    error: 'Resource not found'
                });
            }
            if (error.message.includes('network')) {
                return response.status(503).json({
                    success: false,
                    error: 'Network error. Please try again.'
                });
            }
        }
        return response.status(500).json({
            success: false,
            error: 'Internal server error. Please try again.'
        });
    }
}
exports.default = (0, auth_middleware_1.withAuth)(historyHandler);
