"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const response_1 = require("../utils/response");
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
            englishSentence: englishSentence.trim(),
            userTranslation: userTranslation?.trim() || undefined,
            context: context?.trim() || undefined,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        const responseData = {
            id: 'mock-id-' + Date.now(),
            ...sentenceData,
        };
        return (0, response_1.createSuccessResponse)(res, responseData, 'Sentence created successfully');
    }
    catch (error) {
        console.error('Create sentence error:', error);
        return (0, response_1.createErrorResponse)(res, 'Failed to create sentence. Please try again', 500);
    }
}
