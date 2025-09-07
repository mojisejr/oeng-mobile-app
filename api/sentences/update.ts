import { db } from '../../firebase-sdk';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { COLLECTION_PATHS, VALIDATION_RULES } from '../utils/db-schema';
import { withAuth, type AuthenticatedRequest } from '../utils/auth-middleware';

async function updateHandler(req: AuthenticatedRequest, res: any) {
  // Handle CORS
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(res);
  }

  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return createErrorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Get Clerk user ID from authenticated request
    const clerkUserId = req.user?.id;
    
    if (!clerkUserId) {
      return createErrorResponse(res, 'User authentication required', 401);
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

    // Check if user owns this sentence (check both userId and clerkUserId for backward compatibility)
    if (currentData.clerkUserId !== clerkUserId && currentData.userId !== clerkUserId) {
      return createErrorResponse(res, 'Access denied', 403);
    }

    // Parse request body
    const { englishSentence, userTranslation, context, isFavorite, tags } = req.body;

    // Validate fields if provided
    const updateData: any = {};

    if (englishSentence !== undefined) {
      if (typeof englishSentence !== 'string') {
        return createErrorResponse(res, 'English sentence must be a string', 400);
      }
      
      const trimmed = englishSentence.trim();
      if (trimmed.length < VALIDATION_RULES.ENGLISH_SENTENCE.minLength) {
        return createErrorResponse(res, `English sentence must be at least ${VALIDATION_RULES.ENGLISH_SENTENCE.minLength} characters`, 400);
      }
      
      if (trimmed.length > VALIDATION_RULES.ENGLISH_SENTENCE.maxLength) {
        return createErrorResponse(res, `English sentence must not exceed ${VALIDATION_RULES.ENGLISH_SENTENCE.maxLength} characters`, 400);
      }
      
      if (!VALIDATION_RULES.ENGLISH_SENTENCE.pattern.test(trimmed)) {
        return createErrorResponse(res, 'English sentence contains invalid characters', 400);
      }
      
      updateData.englishSentence = trimmed;
    }

    if (userTranslation !== undefined) {
      if (userTranslation === null || userTranslation === '') {
        updateData.userTranslation = null;
      } else {
        if (typeof userTranslation !== 'string') {
          return createErrorResponse(res, 'User translation must be a string', 400);
        }
        
        const trimmed = userTranslation.trim();
        if (trimmed.length > VALIDATION_RULES.USER_TRANSLATION.maxLength) {
          return createErrorResponse(res, `User translation must not exceed ${VALIDATION_RULES.USER_TRANSLATION.maxLength} characters`, 400);
        }
        
        updateData.userTranslation = trimmed;
      }
    }

    if (context !== undefined) {
      if (context === null || context === '') {
        updateData.context = null;
      } else {
        if (typeof context !== 'string') {
          return createErrorResponse(res, 'Context must be a string', 400);
        }
        
        const trimmed = context.trim();
        if (trimmed.length > VALIDATION_RULES.CONTEXT.maxLength) {
          return createErrorResponse(res, `Context must not exceed ${VALIDATION_RULES.CONTEXT.maxLength} characters`, 400);
        }
        
        updateData.context = trimmed;
      }
    }

    if (isFavorite !== undefined) {
      if (typeof isFavorite !== 'boolean') {
        return createErrorResponse(res, 'isFavorite must be a boolean', 400);
      }
      updateData.isFavorite = isFavorite;
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return createErrorResponse(res, 'Tags must be an array', 400);
      }
      
      // Validate and clean tags
      const cleanTags = tags
        .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
        .map(tag => tag.trim().toLowerCase())
        .slice(0, 10); // Limit to 10 tags
      
      updateData.tags = cleanTags;
    }

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return createErrorResponse(res, 'No valid fields provided for update', 400);
    }

    // Add timestamp
    updateData.updatedAt = serverTimestamp();

    // If updating core content and sentence was analyzed, reset analysis
    if (updateData.englishSentence || updateData.userTranslation || updateData.context) {
      if (currentData.status === 'analyzed') {
        updateData.status = 'pending';
        updateData.analysis = null;
        updateData.analyzedAt = null;
      }
    }

    // Update the document
    await updateDoc(sentenceRef, updateData);

    // Get updated document
    const updatedSnap = await getDoc(sentenceRef);
    const updatedData = updatedSnap.data();

    const response = {
      ...updatedData,
      id: updatedSnap.id
    };

    return createSuccessResponse(res, response, 'Sentence updated successfully');

  } catch (error) {
    console.error('Error updating sentence:', error);
    return createErrorResponse(res, 'Failed to update sentence', 500);
  }
}

export default withAuth(updateHandler);