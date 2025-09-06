import { adminDb } from '../../firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest, validateRequiredFields } from '../utils/response';
import { verifyToken } from '../middleware/auth';
import { COLLECTION_PATHS, DEFAULT_VALUES, VALIDATION_RULES } from '../utils/db-schema';
import type { SentenceDocument } from '../utils/db-schema';

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
    // Extract and verify token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse(res, 'Authorization token required', 401);
    }

    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);
    
    if (!user) {
      return createErrorResponse(res, 'Invalid or expired token', 401);
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

    // Create sentence document
    const sentenceData: any = {
      userId: user.uid,
      englishSentence: englishSentence.trim(),
      userTranslation: userTranslation?.trim() || undefined,
      context: context?.trim() || undefined,
      ...DEFAULT_VALUES.SENTENCE,
      createdAt: FieldValue.serverTimestamp(),
    };

    // Add to Firestore using Admin SDK
    const docRef = await adminDb.collection(COLLECTION_PATHS.SENTENCES).add(sentenceData);

    // Return success response with created sentence data
    const responseData = {
      id: docRef.id,
      ...sentenceData,
      createdAt: new Date().toISOString(), // Convert for response
    };

    return createSuccessResponse(
      res,
      responseData,
      'Sentence created successfully'
    );

  } catch (error: any) {
    console.error('Create sentence error:', error);

    // Handle Firestore errors
    if (error.message?.includes('firestore') || error.code?.startsWith('firestore/')) {
      return createErrorResponse(res, 'Database error. Please try again', 500);
    }

    // Handle permission errors
    if (error.code === 'permission-denied') {
      return createErrorResponse(res, 'Permission denied. Please check your authentication', 403);
    }

    return createErrorResponse(res, 'Failed to create sentence. Please try again', 500);
  }
}