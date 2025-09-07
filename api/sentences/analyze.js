"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeEnglishSentence = void 0;
const gemini_1 = require("../ai/gemini");
Object.defineProperty(exports, "analyzeEnglishSentence", { enumerable: true, get: function () { return gemini_1.analyzeEnglishSentence; } });
const response_1 = require("../utils/response");
const auth_middleware_1 = require("../utils/auth-middleware");
const firebase_sdk_1 = require("../../firebase-sdk");
const firestore_1 = require("firebase/firestore");
const db_schema_1 = require("../utils/db-schema");
async function analyzeHandler(req, res) {
    console.log('Analyze handler called:', req.method, req.url);
    if (req.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(res);
    }
    (0, response_1.setCorsHeaders)(res);
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed. Use POST.'
        });
    }
    try {
        const clerkUserId = req.user?.id;
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }
        const { sentenceId, englishSentence, userTranslation, context } = req.body;
        if (!sentenceId && !englishSentence) {
            return res.status(400).json({
                success: false,
                error: 'Sentence ID or English sentence is required'
            });
        }
        let sentenceData;
        let sentenceRef;
        if (sentenceId) {
            sentenceRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.SENTENCES, sentenceId);
            const sentenceSnap = await (0, firestore_1.getDoc)(sentenceRef);
            if (!sentenceSnap.exists()) {
                return res.status(404).json({
                    success: false,
                    error: 'Sentence not found'
                });
            }
            sentenceData = sentenceSnap.data();
            if (sentenceData.clerkUserId !== clerkUserId && sentenceData.userId !== clerkUserId) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }
            if (sentenceData.status === 'analyzed') {
                return res.status(400).json({
                    success: false,
                    error: 'Sentence is already analyzed'
                });
            }
        }
        else {
            sentenceData = {
                englishSentence: englishSentence,
                userTranslation: userTranslation || undefined,
                context: context || undefined,
                status: 'pending'
            };
        }
        const userRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.USERS, clerkUserId);
        const userSnap = await (0, firestore_1.getDoc)(userRef);
        if (!userSnap.exists()) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }
        const userData = userSnap.data();
        const currentCredits = userData.credits || 0;
        if (currentCredits < 1) {
            return res.status(402).json({
                success: false,
                error: 'Insufficient credits. Please purchase more credits to continue.',
                code: 'INSUFFICIENT_CREDITS'
            });
        }
        try {
            console.log('Starting AI analysis for:', sentenceData.englishSentence);
            const analysisResult = await (0, gemini_1.analyzeEnglishSentence)(sentenceData.englishSentence, sentenceData.userTranslation, sentenceData.context);
            console.log('AI analysis completed successfully');
            await (0, firestore_1.updateDoc)(userRef, {
                credits: currentCredits - 1,
                updatedAt: (0, firestore_1.serverTimestamp)()
            });
            if (sentenceId && sentenceRef) {
                await (0, firestore_1.updateDoc)(sentenceRef, {
                    analysis: analysisResult,
                    status: 'analyzed',
                    analyzedAt: (0, firestore_1.serverTimestamp)(),
                    creditsUsed: (sentenceData.creditsUsed || 0) + 1,
                    updatedAt: (0, firestore_1.serverTimestamp)()
                });
            }
            const creditsRemaining = currentCredits - 1;
            console.log('Sending success response with analysis result');
            return res.status(200).json({
                success: true,
                data: {
                    sentenceId: sentenceId || 'analysis-only-' + Date.now(),
                    analysis: analysisResult,
                    creditsRemaining: creditsRemaining
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
                return res.status(statusCode).json({
                    success: false,
                    error: errorMessage,
                    code: aiError.code
                });
            }
            return res.status(500).json({
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
                return res.status(403).json({
                    success: false,
                    error: 'Permission denied. Please check your authentication.'
                });
            }
            if (error.message.includes('not-found')) {
                return res.status(404).json({
                    success: false,
                    error: 'Resource not found'
                });
            }
            if (error.message.includes('network')) {
                return res.status(503).json({
                    success: false,
                    error: 'Network error. Please try again.'
                });
            }
        }
        return res.status(500).json({
            success: false,
            error: 'Internal server error. Please try again.'
        });
    }
}
exports.default = (0, auth_middleware_1.withAuth)(analyzeHandler);
