import { IncomingMessage, ServerResponse } from 'http';
import { RenderRequest, RenderResponse, enhanceResponse, parseRequestBody } from '../types/render';
import { analyzeEnglishSentence, AIAnalysisError } from '../ai/gemini';
import { setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { withAuth, type AuthenticatedRequest } from '../utils/auth-middleware';
import { db } from '../../firebase-sdk';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { COLLECTION_PATHS } from '../utils/db-schema';

async function analyzeHandler(req: AuthenticatedRequest, res: any) {
  console.log('Analyze handler called:', req.method, req.url);
  
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
    // Get Clerk user ID from authenticated request
    const clerkUserId = req.user?.id;
    
    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    // Validate request body
    const { sentenceId, englishSentence, userTranslation, context } = req.body;

    if (!sentenceId && !englishSentence) {
      return res.status(400).json({
        success: false,
        error: 'Sentence ID or English sentence is required'
      });
    }

    let sentenceData;
    let sentenceRef;

    // If sentenceId is provided, get the sentence from database
    if (sentenceId) {
      sentenceRef = doc(db, COLLECTION_PATHS.SENTENCES, sentenceId);
      const sentenceSnap = await getDoc(sentenceRef);

      if (!sentenceSnap.exists()) {
        return res.status(404).json({
          success: false,
          error: 'Sentence not found'
        });
      }

      sentenceData = sentenceSnap.data();

      // Check if user owns this sentence
      if (sentenceData.clerkUserId !== clerkUserId && sentenceData.userId !== clerkUserId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Check if sentence is already analyzed
      if (sentenceData.status === 'analyzed') {
        return res.status(400).json({
          success: false,
          error: 'Sentence is already analyzed'
        });
      }
    } else {
      // Use provided data for analysis without saving
      sentenceData = {
        englishSentence: englishSentence,
        userTranslation: userTranslation || undefined,
        context: context || undefined,
        status: 'pending'
      };
    }

    // Get user's current credits
    const userRef = doc(db, COLLECTION_PATHS.USERS, clerkUserId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    const userData = userSnap.data();
    const currentCredits = userData.credits || 0;

    // Check if user has sufficient credits
    if (currentCredits < 1) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient credits. Please purchase more credits to continue.',
        code: 'INSUFFICIENT_CREDITS'
      });
    }

    try {
      // Perform AI analysis
      console.log('Starting AI analysis for:', sentenceData.englishSentence);
      const analysisResult = await analyzeEnglishSentence(
        sentenceData.englishSentence,
        sentenceData.userTranslation,
        sentenceData.context
      );
      console.log('AI analysis completed successfully');

      // Deduct credit from user
      await updateDoc(userRef, {
        credits: currentCredits - 1,
        updatedAt: serverTimestamp()
      });

      // If sentenceId was provided, update the sentence with analysis results
      if (sentenceId && sentenceRef) {
        await updateDoc(sentenceRef, {
          analysis: analysisResult,
          status: 'analyzed',
          analyzedAt: serverTimestamp(),
          creditsUsed: (sentenceData.creditsUsed || 0) + 1,
          updatedAt: serverTimestamp()
        });
      }
      
      const creditsRemaining = currentCredits - 1;

      // Return success response
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

export default withAuth(analyzeHandler);

// Export for testing
export { analyzeEnglishSentence };