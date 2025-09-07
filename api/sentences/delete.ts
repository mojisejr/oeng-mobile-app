import { db } from '../../firebase-sdk';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { COLLECTION_PATHS } from '../utils/db-schema';
import { withAuth, type AuthenticatedRequest } from '../utils/auth-middleware';

async function deleteHandler(req: AuthenticatedRequest, res: any) {
  // Handle CORS
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(res);
  }

  if (req.method !== 'DELETE') {
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

    // Get sentence document to verify ownership
    const sentenceRef = doc(db, COLLECTION_PATHS.SENTENCES, id);
    const sentenceSnap = await getDoc(sentenceRef);

    if (!sentenceSnap.exists()) {
      return createErrorResponse(res, 'Sentence not found', 404);
    }

    const sentenceData = sentenceSnap.data();

    // Check if user owns this sentence (check both userId and clerkUserId for backward compatibility)
    if (sentenceData.clerkUserId !== clerkUserId && sentenceData.userId !== clerkUserId) {
      return createErrorResponse(res, 'Access denied', 403);
    }

    // Delete the sentence
    await deleteDoc(sentenceRef);

    return createSuccessResponse(
      res,
      { id, deleted: true },
      'Sentence deleted successfully'
    );

  } catch (error) {
    console.error('Error deleting sentence:', error);
    return createErrorResponse(res, 'Failed to delete sentence', 500);
  }
}

export default withAuth(deleteHandler);