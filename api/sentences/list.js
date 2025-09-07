"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_sdk_1 = require("../../firebase-sdk");
const firestore_1 = require("firebase/firestore");
const response_1 = require("../utils/response");
const db_schema_1 = require("../utils/db-schema");
const auth_middleware_1 = require("../utils/auth-middleware");
async function listHandler(req, res) {
    (0, response_1.setCorsHeaders)(res);
    if (req.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(res);
    }
    if (req.method !== 'GET') {
        return (0, response_1.createErrorResponse)(res, 'Method not allowed', 405);
    }
    try {
        const clerkUserId = req.user?.id;
        if (!clerkUserId) {
            return (0, response_1.createErrorResponse)(res, 'User authentication required', 401);
        }
        const { status, search, pageSize = '20', lastDocId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const pageSizeNum = parseInt(pageSize);
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 50) {
            return (0, response_1.createErrorResponse)(res, 'Page size must be between 1 and 50', 400);
        }
        let sentencesQuery = (0, firestore_1.query)((0, firestore_1.collection)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.SENTENCES), (0, firestore_1.where)('clerkUserId', '==', clerkUserId), (0, firestore_1.orderBy)(sortBy, sortOrder), (0, firestore_1.limit)(pageSizeNum));
        if (status && (status === 'pending' || status === 'analyzed')) {
            sentencesQuery = (0, firestore_1.query)((0, firestore_1.collection)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.SENTENCES), (0, firestore_1.where)('clerkUserId', '==', clerkUserId), (0, firestore_1.where)('status', '==', status), (0, firestore_1.orderBy)(sortBy, sortOrder), (0, firestore_1.limit)(pageSizeNum));
        }
        if (lastDocId) {
            const lastDocRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.SENTENCES, lastDocId);
            const lastDocSnap = await (0, firestore_1.getDoc)(lastDocRef);
            if (lastDocSnap.exists()) {
                sentencesQuery = (0, firestore_1.query)(sentencesQuery, (0, firestore_1.startAfter)(lastDocSnap));
            }
        }
        const querySnapshot = await (0, firestore_1.getDocs)(sentencesQuery);
        let sentences = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            sentences.push({
                ...data,
                id: doc.id
            });
        });
        if (search && typeof search === 'string') {
            const searchTerm = search.toLowerCase().trim();
            sentences = sentences.filter(sentence => sentence.englishSentence.toLowerCase().includes(searchTerm) ||
                (sentence.userTranslation && sentence.userTranslation.toLowerCase().includes(searchTerm)) ||
                (sentence.context && sentence.context.toLowerCase().includes(searchTerm)));
        }
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
        return (0, response_1.createSuccessResponse)(res, response, 'Sentences retrieved successfully');
    }
    catch (error) {
        console.error('Error retrieving sentences:', error);
        return (0, response_1.createErrorResponse)(res, 'Failed to retrieve sentences', 500);
    }
}
exports.default = (0, auth_middleware_1.withAuth)(listHandler);
