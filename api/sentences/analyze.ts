import { IncomingMessage, ServerResponse } from 'http';
import { RenderRequest, RenderResponse, enhanceResponse, parseRequestBody } from '../types/render';
import { analyzeEnglishSentence, AIAnalysisError } from '../ai/gemini';
import { setCorsHeaders, handleOptionsRequest } from '../utils/response';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  console.log('Analyze handler called:', req.method, req.url);
  const request = req as RenderRequest;
  const response = enhanceResponse(res);
  
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
  
  // Express middleware already parsed the body, so we can use req.body directly
  console.log('Request body from Express:', (req as any).body);
  
  if (!(req as any).body || !(req as any).body.englishSentence) {
    console.error('Missing englishSentence in request body');
    return response.status(400).json({ 
      success: false,
      error: 'englishSentence is required' 
    });
  }

  try {
    // Note: Authentication removed as part of Firebase Auth cleanup

    // Validate request body
    const { sentenceId, englishSentence, userTranslation, context } = (req as any).body;

    if (!sentenceId && !englishSentence) {
      return response.status(400).json({
        success: false,
        error: 'Sentence ID or English sentence is required'
      });
    }

    // TODO: Replace with new database implementation
    // For now, use mock data
    const sentenceData = {
      englishSentence: englishSentence || 'Mock sentence',
      userTranslation: userTranslation || undefined,
      context: context || undefined,
      status: 'pending'
    };

    // Mock credit check (always allow for now)
    const currentCredits = 10; // Mock credits

    // Mock sufficient credits for now
    if (currentCredits < 1) {
      return response.status(402).json({
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

      // TODO: Implement credit deduction with new system
      // TODO: Update sentence with analysis results in new database
      
      // Mock credit deduction
      const creditsRemaining = currentCredits - 1;

      // Return success response
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