import { db } from '../../firebase-sdk';
import { collection, query, where, orderBy, limit, startAfter, getDocs, doc, getDoc } from 'firebase/firestore';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { COLLECTION_PATHS } from '../utils/db-schema';
import type { SentenceDocument } from '../utils/db-schema';
import { withAuth, type AuthenticatedRequest } from '../utils/auth-middleware';

async function listHandler(req: AuthenticatedRequest, res: any) {
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

    // Build query - search by both userId and clerkUserId for backward compatibility
    let sentencesQuery = query(
      collection(db, COLLECTION_PATHS.SENTENCES),
      where('clerkUserId', '==', clerkUserId),
      orderBy(sortBy as string, sortOrder as 'asc' | 'desc'),
      limit(pageSizeNum)
    );

    // Add status filter if provided
    if (status && (status === 'pending' || status === 'analyzed')) {
      sentencesQuery = query(
        collection(db, COLLECTION_PATHS.SENTENCES),
        where('clerkUserId', '==', clerkUserId),
        where('status', '==', status),
        orderBy(sortBy as string, sortOrder as 'asc' | 'desc'),
        limit(pageSizeNum)
      );
    }

    // Handle pagination
    if (lastDocId) {
      const lastDocRef = doc(db, COLLECTION_PATHS.SENTENCES, lastDocId as string);
      const lastDocSnap = await getDoc(lastDocRef);
      
      if (lastDocSnap.exists()) {
        sentencesQuery = query(
          sentencesQuery,
          startAfter(lastDocSnap)
        );
      }
    }

    // Execute query
    const querySnapshot = await getDocs(sentencesQuery);
    
    let sentences: (SentenceDocument & { id: string })[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as SentenceDocument;
      sentences.push({
        ...data,
        id: doc.id
      });
    });

    // Apply text search filter if provided (client-side filtering)
    if (search && typeof search === 'string') {
      const searchTerm = search.toLowerCase().trim();
      sentences = sentences.filter(sentence => 
        sentence.englishSentence.toLowerCase().includes(searchTerm) ||
        (sentence.userTranslation && sentence.userTranslation.toLowerCase().includes(searchTerm)) ||
        (sentence.context && sentence.context.toLowerCase().includes(searchTerm))
      );
    }

    // Prepare response
    const response = {
      sentences,
      pagination: {
        hasMore: sentences.length === pageSizeNum,
        lastDocId: sentences.length > 0 ? sentences[sentences.length - 1].id : null,
        pageSize: pageSizeNum,
        total: sentences.length
      },
      filters: {
        status: status || 'all',
        search: search || '',
        sortBy,
        sortOrder
      }
    };

    return createSuccessResponse(res, response, 'Sentences retrieved successfully');

  } catch (error) {
    console.error('Error retrieving sentences:', error);
    return createErrorResponse(res, 'Failed to retrieve sentences', 500);
  }
}

export default withAuth(listHandler);