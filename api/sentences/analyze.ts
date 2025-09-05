import { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth, adminDb } from '../../firebase-admin';
import { analyzeEnglishSentence, AIAnalysisError } from '../ai/gemini';
import { setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { COLLECTION_PATHS } from '../utils/db-schema';
import { deductCredits } from '../utils/credit-operations';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(res);
  }

  // Set CORS headers
  setCorsHeaders(res);

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
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
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const userId = decodedToken.uid;

    // Validate request body
    const { sentenceId } = req.body;

    if (!sentenceId) {
      return res.status(400).json({
        success: false,
        error: 'Sentence ID is required'
      });
    }

    // Get sentence document
    const sentenceDoc = await adminDb.collection(COLLECTION_PATHS.SENTENCES).doc(sentenceId).get();

    if (!sentenceDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Sentence not found'
      });
    }

    const sentenceData = sentenceDoc.data();
    if (!sentenceData) {
      return res.status(404).json({
        success: false,
        error: 'Sentence data not found'
      });
    }

    // Check if user owns this sentence
    if (sentenceData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only analyze your own sentences.'
      });
    }

    // Check if sentence is already analyzed
    if (sentenceData.status === 'analyzed') {
      return res.status(400).json({
        success: false,
        error: 'Sentence has already been analyzed'
      });
    }

    // Check user's credit balance
    const userDoc = await adminDb.collection(COLLECTION_PATHS.USERS).doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User data not found'
      });
    }
    const currentCredits = userData.creditBalance || 0;

    if (currentCredits < 1) {
      return res.status(402).json({
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
        return res.status(402).json({
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
      return res.status(200).json({
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

        return res.status(statusCode).json({
          success: false,
          error: errorMessage,
          code: aiError.code
        });
      }

      // Generic AI error
      return res.status(500).json({
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

    // Generic server error
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.'
    });
  }
}

// Export for testing
export { analyzeEnglishSentence };