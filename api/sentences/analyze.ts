import { IncomingMessage, ServerResponse } from 'http';
import { RenderRequest, RenderResponse, enhanceResponse, parseRequestBody } from '../types/render';
import { adminAuth, adminDb } from '../../firebase-admin';
import { analyzeEnglishSentence, AIAnalysisError } from '../ai/gemini';
import { setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { COLLECTION_PATHS } from '../utils/db-schema';
import { deductCredits } from '../utils/credit-operations';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const request = req as RenderRequest;
  const response = enhanceResponse(res);
  
  // Parse request body
  if (request.method === 'POST') {
    try {
      request.body = await parseRequestBody(request);
    } catch (error) {
      return response.status(400).json({
        success: false,
        error: 'Invalid JSON in request body'
      });
    }
  }
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return handleOptionsRequest(response);
  }

  // Set CORS headers
  setCorsHeaders(response);

  // Only allow POST method
  if (request.method !== 'POST') {
    return response.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    // Get authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.status(401).json({
        success: false,
        error: 'Authorization header required'
      });
    }

    // Verify Firebase token
    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (authError) {
      console.error('Auth verification failed:', authError);
      return response.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const userId = decodedToken.uid;

    // Validate request body
    const { sentenceId } = request.body;

    if (!sentenceId) {
      return response.status(400).json({
        success: false,
        error: 'Sentence ID is required'
      });
    }

    // Get sentence document
    const sentenceDoc = await adminDb.collection(COLLECTION_PATHS.SENTENCES).doc(sentenceId).get();

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

    // Check if user owns this sentence
    if (sentenceData.userId !== userId) {
      return response.status(403).json({
        success: false,
        error: 'Access denied. You can only analyze your own sentences.'
      });
    }

    // Check if sentence is already analyzed
    if (sentenceData.status === 'analyzed') {
      return response.status(400).json({
        success: false,
        error: 'Sentence has already been analyzed'
      });
    }

    // Check user's credit balance
    const userDoc = await adminDb.collection(COLLECTION_PATHS.USERS).doc(userId).get();

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
      // Perform AI analysis
      const analysisResult = await analyzeEnglishSentence(
        sentenceData.englishSentence,
        sentenceData.userTranslation,
        sentenceData.context
      );

      // Deduct credit from user (with transaction logging)
      const creditResult = await deductCredits(
        userId,
        1,
        `AI analysis for sentence: ${sentenceData.englishSentence.substring(0, 50)}...`,
        sentenceId
      );

      if (!creditResult.success) {
        return response.status(402).json({
          success: false,
          error: creditResult.error || 'Failed to deduct credits'
        });
      }

      // Update sentence with analysis results
      await adminDb.collection(COLLECTION_PATHS.SENTENCES).doc(sentenceId).update({
        status: 'analyzed',
        analysis: analysisResult,
        analyzedAt: new Date(),
        creditsUsed: 1
      });

      // Return success response
      return response.status(200).json({
        success: true,
        data: {
          sentenceId,
          analysis: analysisResult,
          creditsRemaining: currentCredits - 1
        },
        message: 'Sentence analyzed successfully'
      });

    } catch (aiError) {
      console.error('AI Analysis failed:', aiError);

      // Handle specific AI errors
      if (aiError instanceof AIAnalysisError) {
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

      // Generic AI error
      return response.status(500).json({
        success: false,
        error: 'Analysis failed. Please try again.',
        code: 'AI_ERROR'
      });
    }

  } catch (error) {
    console.error('Analyze sentence error:', error);

    // Handle Firestore errors
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

    // Generic server error
    return response.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.'
    });
  }
}

// Export for testing
export { analyzeEnglishSentence };