import { db } from '../../firebase-sdk';
import { collection, query, where, orderBy, limit, startAfter, getDocs, doc, getDoc } from 'firebase/firestore';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { COLLECTION_PATHS } from '../utils/db-schema';
import type { SentenceDocument } from '../utils/db-schema';

export default async function handler(req: any, res: any) {
  // Handle CORS
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(res);
  }

  if (req.method !== 'GET') {
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

    // Parse query parameters
    const {
      status,
      search,
      pageSize = '20',
      lastDocId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Validate pageSize
    const pageSizeNum = parseInt(pageSize as string);
    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 50) {
      return createErrorResponse(res, 'Page size must be between 1 and 50', 400);
    }

    // Build query
    let sentencesQuery = query(
      collection(db, COLLECTION_PATHS.SENTENCES),
      where('userId', '==', userId)
    );

    // Add status filter if provided
    if (status && ['pending', 'analyzed'].includes(status as string)) {
      sentencesQuery = query(
        sentencesQuery,
        where('status', '==', status)
      );
    }

    // Add ordering
    const validSortFields = ['createdAt', 'updatedAt', 'englishSentence'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 'asc' : 'desc';
    
    sentencesQuery = query(
      sentencesQuery,
      orderBy(sortField, sortDirection)
    );

    // Add pagination
    if (lastDocId) {
      try {
        const lastDocRef = doc(db, COLLECTION_PATHS.SENTENCES, lastDocId as string);
        const lastDocSnap = await getDoc(lastDocRef);
        if (lastDocSnap.exists()) {
          sentencesQuery = query(
            sentencesQuery,
            startAfter(lastDocSnap)
          );
        }
      } catch (error) {
        return createErrorResponse(res, 'Invalid lastDocId parameter', 400);
      }
    }

    // Add limit
    sentencesQuery = query(sentencesQuery, limit(pageSizeNum));

    // Execute query
    const querySnapshot = await getDocs(sentencesQuery);
    
    let sentences: (SentenceDocument & { id: string })[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sentences.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to ISO strings
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        analyzedAt: data.analyzedAt?.toDate?.()?.toISOString() || data.analyzedAt,
      } as unknown as SentenceDocument & { id: string });
    });

    // Apply text search filter if provided (client-side filtering)
    if (search && typeof search === 'string') {
      const searchTerm = search.toLowerCase().trim();
      sentences = sentences.filter(sentence => 
        sentence.englishSentence.toLowerCase().includes(searchTerm) ||
        sentence.userTranslation?.toLowerCase().includes(searchTerm) ||
        sentence.context?.toLowerCase().includes(searchTerm)
      );
    }

    // Prepare response metadata
    const hasMore = querySnapshot.docs.length === pageSizeNum;
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextPageToken = hasMore && lastDoc ? lastDoc.id : null;

    const responseData = {
      sentences,
      pagination: {
        pageSize: pageSizeNum,
        hasMore,
        nextPageToken,
        total: sentences.length
      },
      filters: {
        status: status || null,
        search: search || null,
        sortBy: sortField,
        sortOrder: sortDirection
      }
    };

    return createSuccessResponse(
      res,
      responseData,
      'Sentences retrieved successfully'
    );

  } catch (error: any) {
    console.error('List sentences error:', error);

    // Handle Firestore errors
    if (error.message?.includes('firestore') || error.code?.startsWith('firestore/')) {
      return createErrorResponse(res, 'Database error. Please try again', 500);
    }

    // Handle permission errors
    if (error.code === 'permission-denied') {
      return createErrorResponse(res, 'Permission denied. Please check your authentication', 403);
    }

    return createErrorResponse(res, 'Failed to retrieve sentences. Please try again', 500);
  }
}