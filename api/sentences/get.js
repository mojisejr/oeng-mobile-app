"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const firebase_sdk_1 = require("../../firebase-sdk");
const firestore_1 = require("firebase/firestore");
const response_1 = require("../utils/response");
const db_schema_1 = require("../utils/db-schema");
async function handler(req, res) {
    (0, response_1.setCorsHeaders)(res);
    if (req.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(res);
    }
    if (req.method !== 'GET') {
        return (0, response_1.createErrorResponse)(res, 'Method not allowed', 405);
    }
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.createErrorResponse)(res, 'Authorization token required', 401);
        }
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return (0, response_1.createErrorResponse)(res, 'User ID required', 401);
        }
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return (0, response_1.createErrorResponse)(res, 'Sentence ID is required', 400);
        }
        const sentenceRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.SENTENCES, id);
        const sentenceSnap = await (0, firestore_1.getDoc)(sentenceRef);
        if (!sentenceSnap.exists()) {
            return (0, response_1.createErrorResponse)(res, 'Sentence not found', 404);
        }
        const sentenceData = sentenceSnap.data();
        if (sentenceData.userId !== userId) {
            return (0, response_1.createErrorResponse)(res, 'Access denied. You can only view your own sentences', 403);
        }
        const responseData = {
            id: sentenceSnap.id,
            ...sentenceData,
            createdAt: sentenceData.createdAt?.toDate?.()?.toISOString() || sentenceData.createdAt,
            updatedAt: sentenceData.updatedAt?.toDate?.()?.toISOString() || sentenceData.updatedAt,
            analyzedAt: sentenceData.analyzedAt?.toDate?.()?.toISOString() || sentenceData.analyzedAt,
        };
        return (0, response_1.createSuccessResponse)(res, responseData, 'Sentence retrieved successfully');
    }
    catch (error) {
        console.error('Get sentence error:', error);
        if (error.message?.includes('firestore') || error.code?.startsWith('firestore/')) {
            return (0, response_1.createErrorResponse)(res, 'Database error. Please try again', 500);
        }
        if (error.code === 'permission-denied') {
            return (0, response_1.createErrorResponse)(res, 'Permission denied. Please check your authentication', 403);
        }
        if (error.code === 'invalid-argument') {
            return (0, response_1.createErrorResponse)(res, 'Invalid sentence ID format', 400);
        }
        return (0, response_1.createErrorResponse)(res, 'Failed to retrieve sentence. Please try again', 500);
    }
}
