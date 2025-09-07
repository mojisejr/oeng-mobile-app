"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_sdk_1 = require("../../firebase-sdk");
const firestore_1 = require("firebase/firestore");
const response_1 = require("../utils/response");
const db_schema_1 = require("../utils/db-schema");
const auth_middleware_1 = require("../utils/auth-middleware");
async function updateHandler(req, res) {
    (0, response_1.setCorsHeaders)(res);
    if (req.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(res);
    }
    if (req.method !== 'PUT' && req.method !== 'PATCH') {
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
        const currentData = sentenceSnap.data();
        if (currentData.clerkUserId !== clerkUserId && currentData.userId !== clerkUserId) {
            return (0, response_1.createErrorResponse)(res, 'Access denied', 403);
        }
        const { englishSentence, userTranslation, context, isFavorite, tags } = req.body;
        const updateData = {};
        if (englishSentence !== undefined) {
            if (typeof englishSentence !== 'string') {
                return (0, response_1.createErrorResponse)(res, 'English sentence must be a string', 400);
            }
            const trimmed = englishSentence.trim();
            if (trimmed.length < db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.minLength) {
                return (0, response_1.createErrorResponse)(res, `English sentence must be at least ${db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.minLength} characters`, 400);
            }
            if (trimmed.length > db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.maxLength) {
                return (0, response_1.createErrorResponse)(res, `English sentence must not exceed ${db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.maxLength} characters`, 400);
            }
            if (!db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.pattern.test(trimmed)) {
                return (0, response_1.createErrorResponse)(res, 'English sentence contains invalid characters', 400);
            }
            updateData.englishSentence = trimmed;
        }
        if (userTranslation !== undefined) {
            if (userTranslation === null || userTranslation === '') {
                updateData.userTranslation = null;
            }
            else {
                if (typeof userTranslation !== 'string') {
                    return (0, response_1.createErrorResponse)(res, 'User translation must be a string', 400);
                }
                const trimmed = userTranslation.trim();
                if (trimmed.length > db_schema_1.VALIDATION_RULES.USER_TRANSLATION.maxLength) {
                    return (0, response_1.createErrorResponse)(res, `User translation must not exceed ${db_schema_1.VALIDATION_RULES.USER_TRANSLATION.maxLength} characters`, 400);
                }
                updateData.userTranslation = trimmed;
            }
        }
        if (context !== undefined) {
            if (context === null || context === '') {
                updateData.context = null;
            }
            else {
                if (typeof context !== 'string') {
                    return (0, response_1.createErrorResponse)(res, 'Context must be a string', 400);
                }
                const trimmed = context.trim();
                if (trimmed.length > db_schema_1.VALIDATION_RULES.CONTEXT.maxLength) {
                    return (0, response_1.createErrorResponse)(res, `Context must not exceed ${db_schema_1.VALIDATION_RULES.CONTEXT.maxLength} characters`, 400);
                }
                updateData.context = trimmed;
            }
        }
        if (isFavorite !== undefined) {
            if (typeof isFavorite !== 'boolean') {
                return (0, response_1.createErrorResponse)(res, 'isFavorite must be a boolean', 400);
            }
            updateData.isFavorite = isFavorite;
        }
        if (tags !== undefined) {
            if (!Array.isArray(tags)) {
                return (0, response_1.createErrorResponse)(res, 'Tags must be an array', 400);
            }
            const cleanTags = tags
                .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
                .map(tag => tag.trim().toLowerCase())
                .slice(0, 10);
            updateData.tags = cleanTags;
        }
        if (Object.keys(updateData).length === 0) {
            return (0, response_1.createErrorResponse)(res, 'No valid fields provided for update', 400);
        }
        updateData.updatedAt = (0, firestore_1.serverTimestamp)();
        if (updateData.englishSentence || updateData.userTranslation || updateData.context) {
            if (currentData.status === 'analyzed') {
                updateData.status = 'pending';
                updateData.analysis = null;
                updateData.analyzedAt = null;
            }
        }
        await (0, firestore_1.updateDoc)(sentenceRef, updateData);
        const updatedSnap = await (0, firestore_1.getDoc)(sentenceRef);
        const updatedData = updatedSnap.data();
        const response = {
            ...updatedData,
            id: updatedSnap.id
        };
        return (0, response_1.createSuccessResponse)(res, response, 'Sentence updated successfully');
    }
    catch (error) {
        console.error('Error updating sentence:', error);
        return (0, response_1.createErrorResponse)(res, 'Failed to update sentence', 500);
    }
}
exports.default = (0, auth_middleware_1.withAuth)(updateHandler);
