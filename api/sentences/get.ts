import { db } from '../../firebase-sdk';
import { doc, getDoc } from 'firebase/firestore';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { COLLECTION_PATHS } from '../utils/db-schema';
import type { SentenceDocument } from '../utils/db-schema';
import { withAuth, type AuthenticatedRequest } from '../utils/auth-middleware';

async function getHandler(req: AuthenticatedRequest, res: any) {
  // Handle CORS
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(res);
  }

  if (req.method !== 'GET') {
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

    // Get sentence document
    const sentenceRef = doc(db, COLLECTION_PATHS.SENTENCES, id);
    const sentenceSnap = await getDoc(sentenceRef);

    if (!sentenceSnap.exists()) {
      return createErrorResponse(res, 'Sentence not found', 404);
    }

    const sentenceData = sentenceSnap.data() as SentenceDocument;

    // Check if user owns this sentence (check both userId and clerkUserId for backward compatibility)
    if (sentenceData.clerkUserId !== clerkUserId && sentenceData.userId !== clerkUserId) {
      return createErrorResponse(res, 'Access denied', 403);
    }

    // Prepare response data
    const response = {
      ...sentenceData,
      id: sentenceSnap.id
    };

    return createSuccessResponse(res, response, 'Sentence retrieved successfully');

  } catch (error) {
    console.error('Error retrieving sentence:', error);
    return createErrorResponse(res, 'Failed to retrieve sentence', 500);
  }
}

export default withAuth(getHandler);