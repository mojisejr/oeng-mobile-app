import { db } from '../../firebase-sdk';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { COLLECTION_PATHS } from '../utils/db-schema';

export default async function handler(req: any, res: any) {
  // Handle CORS
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(res);
  }

  if (req.method !== 'DELETE') {
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

    // Get sentence document to verify ownership
    const sentenceRef = doc(db, COLLECTION_PATHS.SENTENCES, id);
    const sentenceSnap = await getDoc(sentenceRef);

    if (!sentenceSnap.exists()) {
      return createErrorResponse(res, 'Sentence not found', 404);
    }

    const sentenceData = sentenceSnap.data();

    // Check if user owns this sentence
    if (sentenceData.userId !== userId) {
      return createErrorResponse(res, 'Access denied. You can only delete your own sentences', 403);
    }

    // Delete the document
    await deleteDoc(sentenceRef);

    return createSuccessResponse(
      res,
      { id, deleted: true },
      'Sentence deleted successfully'
    );

  } catch (error: any) {
    console.error('Delete sentence error:', error);

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

    return createErrorResponse(res, 'Failed to delete sentence. Please try again', 500);
  }
}