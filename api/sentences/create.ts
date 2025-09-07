import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest, validateRequiredFields } from '../utils/response';
import { VALIDATION_RULES } from '../utils/db-schema';
import { withAuth, AuthenticatedRequest } from '../utils/auth-middleware';
import { sentenceOperations } from '../utils/firebase';
import { ServerResponse } from 'http';

async function createHandler(req: AuthenticatedRequest, res: ServerResponse) {
  // Handle CORS
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(res);
  }

  if (req.method !== 'POST') {
    return createErrorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Get Clerk user ID from authenticated request
    const clerkUserId = req.user?.id;
    
    if (!clerkUserId) {
      return createErrorResponse(res, 'User authentication required', 401);
    }

    const { englishSentence, userTranslation, context } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['englishSentence']);
    if (!validation.isValid) {
      return createErrorResponse(
        res,
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      );
    }

    // Validate English sentence
    if (englishSentence.length < VALIDATION_RULES.ENGLISH_SENTENCE.minLength) {
      return createErrorResponse(
        res,
        `English sentence must be at least ${VALIDATION_RULES.ENGLISH_SENTENCE.minLength} characters long`,
        400
      );
    }

    if (englishSentence.length > VALIDATION_RULES.ENGLISH_SENTENCE.maxLength) {
      return createErrorResponse(
        res,
        `English sentence must not exceed ${VALIDATION_RULES.ENGLISH_SENTENCE.maxLength} characters`,
        400
      );
    }

    if (!VALIDATION_RULES.ENGLISH_SENTENCE.pattern.test(englishSentence)) {
      return createErrorResponse(
        res,
        'English sentence contains invalid characters',
        400
      );
    }

    // Validate user translation if provided
    if (userTranslation && userTranslation.length > VALIDATION_RULES.USER_TRANSLATION.maxLength) {
      return createErrorResponse(
        res,
        `User translation must not exceed ${VALIDATION_RULES.USER_TRANSLATION.maxLength} characters`,
        400
      );
    }

    // Validate context if provided
    if (context && context.length > VALIDATION_RULES.CONTEXT.maxLength) {
      return createErrorResponse(
        res,
        `Context must not exceed ${VALIDATION_RULES.CONTEXT.maxLength} characters`,
        400
      );
    }

    // Create sentence document in Firestore
    const sentenceData = {
      userId: clerkUserId, // Use Clerk user ID as primary identifier
      clerkUserId,
      englishSentence: englishSentence.trim(),
      userTranslation: userTranslation?.trim() || undefined,
      context: context?.trim() || undefined,
      status: 'pending' as const,
      creditsUsed: 1, // Default credit cost for analysis
      isFavorite: false
    };

    // Save to Firestore using sentence operations
    const sentenceId = await sentenceOperations.create(sentenceData);

    const responseData = {
      id: sentenceId,
      ...sentenceData,
    };

    return createSuccessResponse(
      res,
      responseData,
      'Sentence created successfully'
    );

  } catch (error: any) {
    console.error('Create sentence error:', error);

    // Handle specific Firebase errors
    if (error.code === 'permission-denied') {
      return createErrorResponse(res, 'Permission denied', 403);
    }

    if (error.code === 'unavailable') {
      return createErrorResponse(res, 'Service temporarily unavailable', 503);
    }

    return createErrorResponse(res, 'Failed to create sentence. Please try again', 500);
  }
}

export default withAuth(createHandler);