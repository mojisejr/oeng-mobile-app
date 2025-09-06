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
    if (req.method !== 'PUT' && req.method !== 'PATCH') {
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
        const currentData = sentenceSnap.data();
        if (currentData.userId !== userId) {
            return (0, response_1.createErrorResponse)(res, 'Access denied. You can only update your own sentences', 403);
        }
        if (currentData.status === 'analyzed') {
            return (0, response_1.createErrorResponse)(res, 'Cannot update analyzed sentences', 400);
        }
        const { englishSentence, userTranslation, context, isFavorite } = req.body;
        const updateData = {
            updatedAt: (0, firestore_1.serverTimestamp)(),
        };
        if (englishSentence !== undefined) {
            if (typeof englishSentence !== 'string') {
                return (0, response_1.createErrorResponse)(res, 'English sentence must be a string', 400);
            }
            const trimmedSentence = englishSentence.trim();
            if (trimmedSentence.length < db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.minLength) {
                return (0, response_1.createErrorResponse)(res, `English sentence must be at least ${db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.minLength} characters long`, 400);
            }
            if (trimmedSentence.length > db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.maxLength) {
                return (0, response_1.createErrorResponse)(res, `English sentence must not exceed ${db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.maxLength} characters`, 400);
            }
            if (!db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.pattern.test(trimmedSentence)) {
                return (0, response_1.createErrorResponse)(res, 'English sentence contains invalid characters', 400);
            }
            updateData.englishSentence = trimmedSentence;
        }
        if (userTranslation !== undefined) {
            if (userTranslation === null || userTranslation === '') {
                updateData.userTranslation = null;
            }
            else if (typeof userTranslation === 'string') {
                const trimmedTranslation = userTranslation.trim();
                if (trimmedTranslation.length > db_schema_1.VALIDATION_RULES.USER_TRANSLATION.maxLength) {
                    return (0, response_1.createErrorResponse)(res, `User translation must not exceed ${db_schema_1.VALIDATION_RULES.USER_TRANSLATION.maxLength} characters`, 400);
                }
                updateData.userTranslation = trimmedTranslation || null;
            }
            else {
                return (0, response_1.createErrorResponse)(res, 'User translation must be a string or null', 400);
            }
        }
        if (context !== undefined) {
            if (context === null || context === '') {
                updateData.context = null;
            }
            else if (typeof context === 'string') {
                const trimmedContext = context.trim();
                if (trimmedContext.length > db_schema_1.VALIDATION_RULES.CONTEXT.maxLength) {
                    return (0, response_1.createErrorResponse)(res, `Context must not exceed ${db_schema_1.VALIDATION_RULES.CONTEXT.maxLength} characters`, 400);
                }
                updateData.context = trimmedContext || null;
            }
            else {
                return (0, response_1.createErrorResponse)(res, 'Context must be a string or null', 400);
            }
        }
        if (isFavorite !== undefined) {
            if (typeof isFavorite !== 'boolean') {
                return (0, response_1.createErrorResponse)(res, 'isFavorite must be a boolean', 400);
            }
            updateData.isFavorite = isFavorite;
        }
        if (Object.keys(updateData).length === 1) {
            return (0, response_1.createErrorResponse)(res, 'No valid fields provided for update', 400);
        }
        await (0, firestore_1.updateDoc)(sentenceRef, updateData);
        const updatedSnap = await (0, firestore_1.getDoc)(sentenceRef);
        const updatedData = updatedSnap.data();
        const responseData = {
            id: updatedSnap.id,
            ...updatedData,
            createdAt: updatedData?.createdAt?.toDate?.()?.toISOString() || updatedData?.createdAt,
            updatedAt: updatedData?.updatedAt?.toDate?.()?.toISOString() || updatedData?.updatedAt,
            analyzedAt: updatedData?.analyzedAt?.toDate?.()?.toISOString() || updatedData?.analyzedAt,
        };
        return (0, response_1.createSuccessResponse)(res, responseData, 'Sentence updated successfully');
    }
    catch (error) {
        console.error('Update sentence error:', error);
        if (error.message?.includes('firestore') || error.code?.startsWith('firestore/')) {
            return (0, response_1.createErrorResponse)(res, 'Database error. Please try again', 500);
        }
        if (error.code === 'permission-denied') {
            return (0, response_1.createErrorResponse)(res, 'Permission denied. Please check your authentication', 403);
        }
        if (error.code === 'invalid-argument') {
            return (0, response_1.createErrorResponse)(res, 'Invalid sentence ID format', 400);
        }
        return (0, response_1.createErrorResponse)(res, 'Failed to update sentence. Please try again', 500);
    }
}
