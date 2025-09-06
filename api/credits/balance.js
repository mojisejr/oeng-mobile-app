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
        const userDoc = await firebase_admin_1.adminDb.collection(db_schema_1.COLLECTION_PATHS.USERS).doc(userId).get();
        if (!userDoc.exists) {
            return response.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const userData = userDoc.data();
        if (!userData) {
            return response.status(404).json({
                success: false,
                error: 'User data not found'
            });
        }
        const creditBalance = userData.creditBalance || 0;
        const totalCreditsUsed = userData.totalCreditsUsed || 0;
        const totalCreditsPurchased = userData.totalCreditsPurchased || 0;
        return response.status(200).json({
            success: true,
            data: {
                creditBalance,
                totalCreditsUsed,
                totalCreditsPurchased,
                lastCreditUsed: userData.lastCreditUsed || null,
                accountCreated: userData.createdAt || null
            },
            message: 'Credit balance retrieved successfully'
        });
    }
    catch (error) {
        console.error('Get credit balance error:', error);
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
