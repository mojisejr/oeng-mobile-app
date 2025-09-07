"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../utils/response");
const db_schema_1 = require("../utils/db-schema");
const auth_middleware_1 = require("../utils/auth-middleware");
const firebase_1 = require("../utils/firebase");
async function createHandler(req, res) {
    (0, response_1.setCorsHeaders)(res);
    if (req.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(res);
    }
    if (req.method !== 'POST') {
        return (0, response_1.createErrorResponse)(res, 'Method not allowed', 405);
    }
    try {
        const clerkUserId = req.user?.id;
        if (!clerkUserId) {
            return (0, response_1.createErrorResponse)(res, 'User authentication required', 401);
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
            userId: clerkUserId,
            clerkUserId,
            englishSentence: englishSentence.trim(),
            userTranslation: userTranslation?.trim() || undefined,
            context: context?.trim() || undefined,
            status: 'pending',
            creditsUsed: 1,
            isFavorite: false
        };
        const sentenceId = await firebase_1.sentenceOperations.create(sentenceData);
        const responseData = {
            id: sentenceId,
            ...sentenceData,
        };
        return (0, response_1.createSuccessResponse)(res, responseData, 'Sentence created successfully');
    }
    catch (error) {
        console.error('Create sentence error:', error);
        if (error.code === 'permission-denied') {
            return (0, response_1.createErrorResponse)(res, 'Permission denied', 403);
        }
        if (error.code === 'unavailable') {
            return (0, response_1.createErrorResponse)(res, 'Service temporarily unavailable', 503);
        }
        return (0, response_1.createErrorResponse)(res, 'Failed to create sentence. Please try again', 500);
    }
}
exports.default = (0, auth_middleware_1.withAuth)(createHandler);
