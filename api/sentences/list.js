"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const firebase_sdk_1 = require("../../firebase-sdk");
const firestore_1 = require("firebase/firestore");
const response_1 = require("../utils/response");
const db_schema_1 = require("../utils/db-schema");
async function handler(req, res) {
    (0, response_1.setCorsHeaders)(res);
    if (req.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(res);
    }
    if (req.method !== 'GET') {
        return (0, response_1.createErrorResponse)(res, 'Method not allowed', 405);
    }
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.createErrorResponse)(res, 'Authorization token required', 401);
        }
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return (0, response_1.createErrorResponse)(res, 'User ID required', 401);
        }
        const { status, search, pageSize = '20', lastDocId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const pageSizeNum = parseInt(pageSize);
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 50) {
            return (0, response_1.createErrorResponse)(res, 'Page size must be between 1 and 50', 400);
        }
        let sentencesQuery = (0, firestore_1.query)((0, firestore_1.collection)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.SENTENCES), (0, firestore_1.where)('userId', '==', userId));
        if (status && ['pending', 'analyzed'].includes(status)) {
            sentencesQuery = (0, firestore_1.query)(sentencesQuery, (0, firestore_1.where)('status', '==', status));
        }
        const validSortFields = ['createdAt', 'updatedAt', 'englishSentence'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const sortDirection = sortOrder === 'asc' ? 'asc' : 'desc';
        sentencesQuery = (0, firestore_1.query)(sentencesQuery, (0, firestore_1.orderBy)(sortField, sortDirection));
        if (lastDocId) {
            try {
                const lastDocRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.SENTENCES, lastDocId);
                const lastDocSnap = await (0, firestore_1.getDoc)(lastDocRef);
                if (lastDocSnap.exists()) {
                    sentencesQuery = (0, firestore_1.query)(sentencesQuery, (0, firestore_1.startAfter)(lastDocSnap));
                }
            }
            catch (error) {
                return (0, response_1.createErrorResponse)(res, 'Invalid lastDocId parameter', 400);
            }
        }
        sentencesQuery = (0, firestore_1.query)(sentencesQuery, (0, firestore_1.limit)(pageSizeNum));
        const querySnapshot = await (0, firestore_1.getDocs)(sentencesQuery);
        let sentences = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            sentences.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                analyzedAt: data.analyzedAt?.toDate?.()?.toISOString() || data.analyzedAt,
            });
        });
        if (search && typeof search === 'string') {
            const searchTerm = search.toLowerCase().trim();
            sentences = sentences.filter(sentence => sentence.englishSentence.toLowerCase().includes(searchTerm) ||
                sentence.userTranslation?.toLowerCase().includes(searchTerm) ||
                sentence.context?.toLowerCase().includes(searchTerm));
        }
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
        return (0, response_1.createSuccessResponse)(res, responseData, 'Sentences retrieved successfully');
    }
    catch (error) {
        console.error('List sentences error:', error);
        if (error.message?.includes('firestore') || error.code?.startsWith('firestore/')) {
            return (0, response_1.createErrorResponse)(res, 'Database error. Please try again', 500);
        }
        if (error.code === 'permission-denied') {
            return (0, response_1.createErrorResponse)(res, 'Permission denied. Please check your authentication', 403);
        }
        return (0, response_1.createErrorResponse)(res, 'Failed to retrieve sentences. Please try again', 500);
    }
}
