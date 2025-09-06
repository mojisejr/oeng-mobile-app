"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const render_1 = require("../types/render");
const firebase_admin_1 = require("../../firebase-admin");
const response_1 = require("../utils/response");
const db_schema_1 = require("../utils/db-schema");
async function handler(req, res) {
    const request = req;
    const response = (0, render_1.enhanceResponse)(res);
    const query = (0, render_1.parseQuery)(request.url || '');
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
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return response.status(401).json({
                success: false,
                error: 'Authorization header required'
            });
        }
        const token = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await firebase_admin_1.adminAuth.verifyIdToken(token);
        }
        catch (authError) {
            console.error('Auth verification failed:', authError);
            return response.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        const userId = decodedToken.uid;
        const limitParam = query.limit;
        const limit = limitParam ? parseInt(limitParam, 10) : 20;
        if (limit < 1 || limit > 100) {
            return response.status(400).json({
                success: false,
                error: 'Limit must be between 1 and 100'
            });
        }
        const transactionsQuery = firebase_admin_1.adminDb
            .collection(db_schema_1.COLLECTION_PATHS.CREDIT_TRANSACTIONS)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(limit);
        const transactionsSnapshot = await transactionsQuery.get();
        const transactions = transactionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                type: data.type,
                amount: data.amount,
                description: data.description,
                relatedDocumentId: data.relatedDocumentId || null,
                createdAt: data.createdAt,
                balanceAfter: data.balanceAfter
            };
        });
        const totalQuery = firebase_admin_1.adminDb
            .collection(db_schema_1.COLLECTION_PATHS.CREDIT_TRANSACTIONS)
            .where('userId', '==', userId);
        const totalSnapshot = await totalQuery.count().get();
        const totalTransactions = totalSnapshot.data().count;
        const hasMore = transactions.length === limit && totalTransactions > limit;
        return response.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    limit,
                    total: totalTransactions,
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
            if (error.message.includes('index')) {
                return response.status(500).json({
                    success: false,
                    error: 'Database index required. Please contact support.'
                });
            }
        }
        return response.status(500).json({
            success: false,
            error: 'Internal server error. Please try again.'
        });
    }
}
