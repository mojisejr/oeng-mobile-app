"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const firebase_admin_1 = require("../../firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const response_1 = require("../utils/response");
const auth_1 = require("../middleware/auth");
const db_schema_1 = require("../utils/db-schema");
async function handler(req, res) {
    (0, response_1.setCorsHeaders)(res);
    if (req.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(res);
    }
    if (req.method !== 'POST') {
        return (0, response_1.createErrorResponse)(res, 'Method not allowed', 405);
    }
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.createErrorResponse)(res, 'Authorization token required', 401);
        }
        const token = authHeader.split(' ')[1];
        const user = await (0, auth_1.verifyToken)(token);
        if (!user) {
            return (0, response_1.createErrorResponse)(res, 'Invalid or expired token', 401);
        }
        const { englishSentence, userTranslation, context } = req.body;
        const validation = (0, response_1.validateRequiredFields)(req.body, ['englishSentence']);
        if (!validation.isValid) {
            return (0, response_1.createErrorResponse)(res, `Missing required fields: ${validation.missingFields.join(', ')}`, 400);
        }
        if (englishSentence.length < db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.minLength) {
            return (0, response_1.createErrorResponse)(res, `English sentence must be at least ${db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.minLength} characters long`, 400);
        }
        if (englishSentence.length > db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.maxLength) {
            return (0, response_1.createErrorResponse)(res, `English sentence must not exceed ${db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.maxLength} characters`, 400);
        }
        if (!db_schema_1.VALIDATION_RULES.ENGLISH_SENTENCE.pattern.test(englishSentence)) {
            return (0, response_1.createErrorResponse)(res, 'English sentence contains invalid characters', 400);
        }
        if (userTranslation && userTranslation.length > db_schema_1.VALIDATION_RULES.USER_TRANSLATION.maxLength) {
            return (0, response_1.createErrorResponse)(res, `User translation must not exceed ${db_schema_1.VALIDATION_RULES.USER_TRANSLATION.maxLength} characters`, 400);
        }
        if (context && context.length > db_schema_1.VALIDATION_RULES.CONTEXT.maxLength) {
            return (0, response_1.createErrorResponse)(res, `Context must not exceed ${db_schema_1.VALIDATION_RULES.CONTEXT.maxLength} characters`, 400);
        }
        const sentenceData = {
            userId: user.uid,
            englishSentence: englishSentence.trim(),
            userTranslation: userTranslation?.trim() || undefined,
            context: context?.trim() || undefined,
            ...db_schema_1.DEFAULT_VALUES.SENTENCE,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        };
        const docRef = await firebase_admin_1.adminDb.collection(db_schema_1.COLLECTION_PATHS.SENTENCES).add(sentenceData);
        const responseData = {
            id: docRef.id,
            ...sentenceData,
            createdAt: new Date().toISOString(),
        };
        return (0, response_1.createSuccessResponse)(res, responseData, 'Sentence created successfully');
    }
    catch (error) {
        console.error('Create sentence error:', error);
        if (error.message?.includes('firestore') || error.code?.startsWith('firestore/')) {
            return (0, response_1.createErrorResponse)(res, 'Database error. Please try again', 500);
        }
        if (error.code === 'permission-denied') {
            return (0, response_1.createErrorResponse)(res, 'Permission denied. Please check your authentication', 403);
        }
        return (0, response_1.createErrorResponse)(res, 'Failed to create sentence. Please try again', 500);
    }
}
