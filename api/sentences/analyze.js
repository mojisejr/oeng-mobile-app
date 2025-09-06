"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeEnglishSentence = void 0;
exports.default = handler;
const render_1 = require("../types/render");
const firebase_admin_1 = require("../../firebase-admin");
const gemini_1 = require("../ai/gemini");
Object.defineProperty(exports, "analyzeEnglishSentence", { enumerable: true, get: function () { return gemini_1.analyzeEnglishSentence; } });
const response_1 = require("../utils/response");
const db_schema_1 = require("../utils/db-schema");
const credit_operations_1 = require("../utils/credit-operations");
async function handler(req, res) {
    const request = req;
    const response = (0, render_1.enhanceResponse)(res);
    if (request.method === 'POST') {
        try {
            request.body = await (0, render_1.parseRequestBody)(request);
        }
        catch (error) {
            return response.status(400).json({
                success: false,
                error: 'Invalid JSON in request body'
            });
        }
    }
    if (request.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(response);
    }
    (0, response_1.setCorsHeaders)(response);
    if (request.method !== 'POST') {
        return response.status(405).json({
            success: false,
            error: 'Method not allowed. Use POST.'
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
        const { sentenceId } = request.body;
        if (!sentenceId) {
            return response.status(400).json({
                success: false,
                error: 'Sentence ID is required'
            });
        }
        const sentenceDoc = await firebase_admin_1.adminDb.collection(db_schema_1.COLLECTION_PATHS.SENTENCES).doc(sentenceId).get();
        if (!sentenceDoc.exists) {
            return response.status(404).json({
                success: false,
                error: 'Sentence not found'
            });
        }
        const sentenceData = sentenceDoc.data();
        if (!sentenceData) {
            return response.status(404).json({
                success: false,
                error: 'Sentence data not found'
            });
        }
        if (sentenceData.userId !== userId) {
            return response.status(403).json({
                success: false,
                error: 'Access denied. You can only analyze your own sentences.'
            });
        }
        if (sentenceData.status === 'analyzed') {
            return response.status(400).json({
                success: false,
                error: 'Sentence has already been analyzed'
            });
        }
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
        const currentCredits = userData.creditBalance || 0;
        if (currentCredits < 1) {
            return response.status(402).json({
                success: false,
                error: 'Insufficient credits. Please purchase more credits to continue.',
                code: 'INSUFFICIENT_CREDITS'
            });
        }
        try {
            const analysisResult = await (0, gemini_1.analyzeEnglishSentence)(sentenceData.englishSentence, sentenceData.userTranslation, sentenceData.context);
            const creditResult = await (0, credit_operations_1.deductCredits)(userId, 1, `AI analysis for sentence: ${sentenceData.englishSentence.substring(0, 50)}...`, sentenceId);
            if (!creditResult.success) {
                return response.status(402).json({
                    success: false,
                    error: creditResult.error || 'Failed to deduct credits'
                });
            }
            await firebase_admin_1.adminDb.collection(db_schema_1.COLLECTION_PATHS.SENTENCES).doc(sentenceId).update({
                status: 'analyzed',
                analysis: analysisResult,
                analyzedAt: new Date(),
                creditsUsed: 1
            });
            return response.status(200).json({
                success: true,
                data: {
                    sentenceId,
                    analysis: analysisResult,
                    creditsRemaining: currentCredits - 1
                },
                message: 'Sentence analyzed successfully'
            });
        }
        catch (aiError) {
            console.error('AI Analysis failed:', aiError);
            if (aiError instanceof gemini_1.AIAnalysisError) {
                let statusCode = 500;
                let errorMessage = aiError.message;
                switch (aiError.code) {
                    case 'INVALID_INPUT':
                        statusCode = 400;
                        break;
                    case 'QUOTA_EXCEEDED':
                        statusCode = 429;
                        errorMessage = 'AI service temporarily unavailable. Please try again later.';
                        break;
                    case 'NETWORK_ERROR':
                        statusCode = 503;
                        errorMessage = 'Network error. Please check your connection and try again.';
                        break;
                    case 'API_ERROR':
                    case 'PARSING_ERROR':
                    default:
                        statusCode = 500;
                        errorMessage = 'Analysis failed. Please try again.';
                        break;
                }
                return response.status(statusCode).json({
                    success: false,
                    error: errorMessage,
                    code: aiError.code
                });
            }
            return response.status(500).json({
                success: false,
                error: 'Analysis failed. Please try again.',
                code: 'AI_ERROR'
            });
        }
    }
    catch (error) {
        console.error('Analyze sentence error:', error);
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
