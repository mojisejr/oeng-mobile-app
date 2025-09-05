import { db } from '../../firebase-sdk';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { COLLECTION_PATHS, VALIDATION_RULES } from '../utils/db-schema';

export default async function handler(req: any, res: any) {
  // Handle CORS
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(res);
  }

  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return createErrorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Get user ID from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse(res, 'Authorization token required', 401);
    }

    const userId = req.headers['x-user-id']; // Temporary solution
    
    if (!userId) {
      return createErrorResponse(res, 'User ID required', 401);
    }

    // Get sentence ID from query parameters
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return createErrorResponse(res, 'Sentence ID is required', 400);
    }

    // Get current sentence document
    const sentenceRef = doc(db, COLLECTION_PATHS.SENTENCES, id);
    const sentenceSnap = await getDoc(sentenceRef);

    if (!sentenceSnap.exists()) {
      return createErrorResponse(res, 'Sentence not found', 404);
    }

    const currentData = sentenceSnap.data();

    // Check if user owns this sentence
    if (currentData.userId !== userId) {
      return createErrorResponse(res, 'Access denied. You can only update your own sentences', 403);
    }

    // Check if sentence is already analyzed (prevent editing analyzed sentences)
    if (currentData.status === 'analyzed') {
      return createErrorResponse(res, 'Cannot update analyzed sentences', 400);
    }

    const { englishSentence, userTranslation, context, isFavorite } = req.body;

    // Prepare update data
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    // Validate and update English sentence if provided
    if (englishSentence !== undefined) {
      if (typeof englishSentence !== 'string') {
        return createErrorResponse(res, 'English sentence must be a string', 400);
      }

      const trimmedSentence = englishSentence.trim();
      
      if (trimmedSentence.length < VALIDATION_RULES.ENGLISH_SENTENCE.minLength) {
        return createErrorResponse(
          res,
          `English sentence must be at least ${VALIDATION_RULES.ENGLISH_SENTENCE.minLength} characters long`,
          400
        );
      }

      if (trimmedSentence.length > VALIDATION_RULES.ENGLISH_SENTENCE.maxLength) {
        return createErrorResponse(
          res,
          `English sentence must not exceed ${VALIDATION_RULES.ENGLISH_SENTENCE.maxLength} characters`,
          400
        );
      }

      if (!VALIDATION_RULES.ENGLISH_SENTENCE.pattern.test(trimmedSentence)) {
        return createErrorResponse(
          res,
          'English sentence contains invalid characters',
          400
        );
      }

      updateData.englishSentence = trimmedSentence;
    }

    // Validate and update user translation if provided
    if (userTranslation !== undefined) {
      if (userTranslation === null || userTranslation === '') {
        updateData.userTranslation = null;
      } else if (typeof userTranslation === 'string') {
        const trimmedTranslation = userTranslation.trim();
        
        if (trimmedTranslation.length > VALIDATION_RULES.USER_TRANSLATION.maxLength) {
          return createErrorResponse(
            res,
            `User translation must not exceed ${VALIDATION_RULES.USER_TRANSLATION.maxLength} characters`,
            400
          );
        }

        updateData.userTranslation = trimmedTranslation || null;
      } else {
        return createErrorResponse(res, 'User translation must be a string or null', 400);
      }
    }

    // Validate and update context if provided
    if (context !== undefined) {
      if (context === null || context === '') {
        updateData.context = null;
      } else if (typeof context === 'string') {
        const trimmedContext = context.trim();
        
        if (trimmedContext.length > VALIDATION_RULES.CONTEXT.maxLength) {
          return createErrorResponse(
            res,
            `Context must not exceed ${VALIDATION_RULES.CONTEXT.maxLength} characters`,
            400
          );
        }

        updateData.context = trimmedContext || null;
      } else {
        return createErrorResponse(res, 'Context must be a string or null', 400);
      }
    }

    // Update favorite status if provided
    if (isFavorite !== undefined) {
      if (typeof isFavorite !== 'boolean') {
        return createErrorResponse(res, 'isFavorite must be a boolean', 400);
      }
      updateData.isFavorite = isFavorite;
    }

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 1) { // Only updatedAt
      return createErrorResponse(res, 'No valid fields provided for update', 400);
    }

    // Update the document
    await updateDoc(sentenceRef, updateData);

    // Get updated document
    const updatedSnap = await getDoc(sentenceRef);
    const updatedData = updatedSnap.data();

    // Prepare response data
    const responseData = {
      id: updatedSnap.id,
      ...updatedData,
      // Convert Firestore timestamps to ISO strings
      createdAt: updatedData?.createdAt?.toDate?.()?.toISOString() || updatedData?.createdAt,
      updatedAt: updatedData?.updatedAt?.toDate?.()?.toISOString() || updatedData?.updatedAt,
      analyzedAt: updatedData?.analyzedAt?.toDate?.()?.toISOString() || updatedData?.analyzedAt,
    };

    return createSuccessResponse(
      res,
      responseData,
      'Sentence updated successfully'
    );

  } catch (error: any) {
    console.error('Update sentence error:', error);

    // Handle Firestore errors
    if (error.message?.includes('firestore') || error.code?.startsWith('firestore/')) {
      return createErrorResponse(res, 'Database error. Please try again', 500);
    }

    // Handle permission errors
    if (error.code === 'permission-denied') {
      return createErrorResponse(res, 'Permission denied. Please check your authentication', 403);
    }

    // Handle invalid document ID
    if (error.code === 'invalid-argument') {
      return createErrorResponse(res, 'Invalid sentence ID format', 400);
    }

    return createErrorResponse(res, 'Failed to update sentence. Please try again', 500);
  }
}