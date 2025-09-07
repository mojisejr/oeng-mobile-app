import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest, validateRequiredFields } from '../utils/response';
import { VALIDATION_RULES } from '../utils/db-schema';

export default async function handler(req: any, res: any) {
  // Handle CORS
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(res);
  }

  if (req.method !== 'POST') {
    return createErrorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Note: Authentication removed as part of Firebase Auth cleanup

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

    // Create sentence document (Firebase removed)
    const sentenceData = {
      englishSentence: englishSentence.trim(),
      userTranslation: userTranslation?.trim() || undefined,
      context: context?.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // TODO: Replace with new database implementation
    // For now, return mock response
    const responseData = {
      id: 'mock-id-' + Date.now(),
      ...sentenceData,
    };

    return createSuccessResponse(
      res,
      responseData,
      'Sentence created successfully'
    );

  } catch (error: any) {
    console.error('Create sentence error:', error);

    // Handle general errors (Firebase removed)

    return createErrorResponse(res, 'Failed to create sentence. Please try again', 500);
  }
}