"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_sdk_1 = require("../../firebase-sdk");
const firestore_1 = require("firebase/firestore");
const response_1 = require("../utils/response");
const db_schema_1 = require("../utils/db-schema");
const auth_middleware_1 = require("../utils/auth-middleware");
async function deleteHandler(req, res) {
    (0, response_1.setCorsHeaders)(res);
    if (req.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(res);
    }
    if (req.method !== 'DELETE') {
        return (0, response_1.createErrorResponse)(res, 'Method not allowed', 405);
    }
    try {
        const clerkUserId = req.user?.id;
        if (!clerkUserId) {
            return (0, response_1.createErrorResponse)(res, 'User authentication required', 401);
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
        if (sentenceData.clerkUserId !== clerkUserId && sentenceData.userId !== clerkUserId) {
            return (0, response_1.createErrorResponse)(res, 'Access denied', 403);
        }
        await (0, firestore_1.deleteDoc)(sentenceRef);
        return (0, response_1.createSuccessResponse)(res, { id, deleted: true }, 'Sentence deleted successfully');
    }
    catch (error) {
        console.error('Error deleting sentence:', error);
        return (0, response_1.createErrorResponse)(res, 'Failed to delete sentence', 500);
    }
}
exports.default = (0, auth_middleware_1.withAuth)(deleteHandler);
