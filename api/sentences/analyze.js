"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeEnglishSentence = void 0;
exports.default = handler;
const render_1 = require("../types/render");
const gemini_1 = require("../ai/gemini");
Object.defineProperty(exports, "analyzeEnglishSentence", { enumerable: true, get: function () { return gemini_1.analyzeEnglishSentence; } });
const response_1 = require("../utils/response");
async function handler(req, res) {
    console.log('Analyze handler called:', req.method, req.url);
    const request = req;
    const response = (0, render_1.enhanceResponse)(res);
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
    console.log('Request body from Express:', req.body);
    if (!req.body || !req.body.englishSentence) {
        console.error('Missing englishSentence in request body');
        return response.status(400).json({
            success: false,
            error: 'englishSentence is required'
        });
    }
    try {
        const { sentenceId, englishSentence, userTranslation, context } = req.body;
        if (!sentenceId && !englishSentence) {
            return response.status(400).json({
                success: false,
                error: 'Sentence ID or English sentence is required'
            });
        }
        const sentenceData = {
            englishSentence: englishSentence || 'Mock sentence',
            userTranslation: userTranslation || undefined,
            context: context || undefined,
            status: 'pending'
        };
        const currentCredits = 10;
        if (currentCredits < 1) {
            return response.status(402).json({
                success: false,
                error: 'Insufficient credits. Please purchase more credits to continue.',
                code: 'INSUFFICIENT_CREDITS'
            });
        }
        try {
            console.log('Starting AI analysis for:', sentenceData.englishSentence);
            const analysisResult = await (0, gemini_1.analyzeEnglishSentence)(sentenceData.englishSentence, sentenceData.userTranslation, sentenceData.context);
            console.log('AI analysis completed successfully');
            const creditsRemaining = currentCredits - 1;
            console.log('Sending success response with analysis result');
            return response.status(200).json({
                success: true,
                data: {
                    sentenceId: sentenceId || 'mock-id-' + Date.now(),
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
