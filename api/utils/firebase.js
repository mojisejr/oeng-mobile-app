"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.FirebaseError = exports.utils = exports.paymentOperations = exports.creditOperations = exports.sentenceOperations = exports.userOperations = void 0;
const firestore_1 = require("firebase/firestore");
const firebase_sdk_1 = require("../../firebase-sdk");
const db_schema_1 = require("./db-schema");
Object.defineProperty(exports, "ERROR_CODES", { enumerable: true, get: function () { return db_schema_1.ERROR_CODES; } });
class FirebaseError extends Error {
    constructor(code, message, originalError) {
        super(message);
        this.code = code;
        this.originalError = originalError;
        this.name = 'FirebaseError';
    }
}
exports.FirebaseError = FirebaseError;
exports.userOperations = {
    async create(userData) {
        try {
            const userRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.USERS, userData.uid);
            await (0, firestore_1.setDoc)(userRef, {
                ...userData,
                ...db_schema_1.DEFAULT_VALUES.USER,
                createdAt: (0, firestore_1.serverTimestamp)(),
                lastLoginAt: (0, firestore_1.serverTimestamp)(),
            });
            await exports.creditOperations.addTransaction({
                userId: userData.uid,
                type: 'bonus',
                amount: db_schema_1.DEFAULT_VALUES.USER.credits,
                balanceBefore: 0,
                balanceAfter: db_schema_1.DEFAULT_VALUES.USER.credits,
                description: 'Welcome bonus - Free credits for new users',
                metadata: {
                    source: 'welcome_bonus',
                },
            });
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to create user', error);
        }
    },
    async getById(userId) {
        try {
            const userRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.USERS, userId);
            const userSnap = await (0, firestore_1.getDoc)(userRef);
            if (!userSnap.exists()) {
                return null;
            }
            const userData = userSnap.data();
            return { id: userSnap.id, ...userData };
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to get user', error);
        }
    },
    async update(userId, updates) {
        try {
            const userRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.USERS, userId);
            await (0, firestore_1.updateDoc)(userRef, {
                ...updates,
                lastLoginAt: (0, firestore_1.serverTimestamp)(),
            });
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to update user', error);
        }
    },
    async updateLastLogin(userId) {
        try {
            const userRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.USERS, userId);
            await (0, firestore_1.updateDoc)(userRef, {
                lastLoginAt: (0, firestore_1.serverTimestamp)(),
            });
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to update last login', error);
        }
    },
};
exports.sentenceOperations = {
    async create(sentenceData) {
        try {
            const sentenceRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.SENTENCES), {
                ...sentenceData,
                ...db_schema_1.DEFAULT_VALUES.SENTENCE,
                createdAt: (0, firestore_1.serverTimestamp)(),
            });
            return sentenceRef.id;
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to create sentence', error);
        }
    },
    async getById(sentenceId) {
        try {
            const sentenceRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.SENTENCES, sentenceId);
            const sentenceSnap = await (0, firestore_1.getDoc)(sentenceRef);
            if (!sentenceSnap.exists()) {
                return null;
            }
            return { id: sentenceSnap.id, ...sentenceSnap.data() };
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to get sentence', error);
        }
    },
    async getUserSentences(userId, options = {}) {
        try {
            let q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.SENTENCES), (0, firestore_1.where)('userId', '==', userId), (0, firestore_1.orderBy)('createdAt', 'desc'));
            if (options.status) {
                q = (0, firestore_1.query)(q, (0, firestore_1.where)('status', '==', options.status));
            }
            if (options.limit) {
                q = (0, firestore_1.query)(q, (0, firestore_1.limit)(options.limit + 1));
            }
            if (options.lastDoc) {
                q = (0, firestore_1.query)(q, (0, firestore_1.startAfter)(options.lastDoc));
            }
            const querySnapshot = await (0, firestore_1.getDocs)(q);
            const sentences = [];
            querySnapshot.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                if (options.searchText) {
                    const searchLower = options.searchText.toLowerCase();
                    const matchesSearch = data.englishSentence.toLowerCase().includes(searchLower) ||
                        data.userTranslation?.toLowerCase().includes(searchLower) ||
                        data.context?.toLowerCase().includes(searchLower);
                    if (matchesSearch) {
                        sentences.push(data);
                    }
                }
                else {
                    sentences.push(data);
                }
            });
            const hasMore = options.limit ? sentences.length > options.limit : false;
            if (hasMore) {
                sentences.pop();
            }
            return { sentences, hasMore };
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to get user sentences', error);
        }
    },
    async updateWithAnalysis(sentenceId, analysis) {
        try {
            const sentenceRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.SENTENCES, sentenceId);
            await (0, firestore_1.updateDoc)(sentenceRef, {
                analysis,
                status: 'analyzed',
                analyzedAt: (0, firestore_1.serverTimestamp)(),
            });
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to update sentence with analysis', error);
        }
    },
    async update(sentenceId, updates) {
        try {
            const sentenceRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.SENTENCES, sentenceId);
            await (0, firestore_1.updateDoc)(sentenceRef, updates);
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to update sentence', error);
        }
    },
    async delete(sentenceId) {
        try {
            const sentenceRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.SENTENCES, sentenceId);
            await (0, firestore_1.deleteDoc)(sentenceRef);
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to delete sentence', error);
        }
    },
};
exports.creditOperations = {
    async getBalance(userId) {
        try {
            const user = await exports.userOperations.getById(userId);
            if (!user) {
                throw new FirebaseError(db_schema_1.ERROR_CODES.USER_NOT_FOUND, 'User not found');
            }
            return user.credits;
        }
        catch (error) {
            if (error instanceof FirebaseError)
                throw error;
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to get credit balance', error);
        }
    },
    async deduct(userId, amount, description, relatedDocumentId) {
        try {
            await (0, firestore_1.runTransaction)(firebase_sdk_1.db, async (transaction) => {
                const userRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.USERS, userId);
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) {
                    throw new FirebaseError(db_schema_1.ERROR_CODES.USER_NOT_FOUND, 'User not found');
                }
                const userData = userDoc.data();
                const currentCredits = userData.credits;
                if (currentCredits < amount) {
                    throw new FirebaseError(db_schema_1.ERROR_CODES.INSUFFICIENT_CREDITS, 'Insufficient credits');
                }
                const newBalance = currentCredits - amount;
                transaction.update(userRef, {
                    credits: newBalance,
                    totalCreditsUsed: (0, firestore_1.increment)(amount),
                });
                const transactionRef = (0, firestore_1.doc)((0, firestore_1.collection)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.CREDIT_TRANSACTIONS));
                transaction.set(transactionRef, {
                    userId,
                    type: 'usage',
                    amount: -amount,
                    balanceBefore: currentCredits,
                    balanceAfter: newBalance,
                    description,
                    relatedDocumentId,
                    relatedDocumentType: 'sentence',
                    createdAt: (0, firestore_1.serverTimestamp)(),
                    metadata: {
                        source: 'analysis',
                    },
                });
            });
        }
        catch (error) {
            if (error instanceof FirebaseError)
                throw error;
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to deduct credits', error);
        }
    },
    async add(userId, amount, paymentId) {
        try {
            await (0, firestore_1.runTransaction)(firebase_sdk_1.db, async (transaction) => {
                const userRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.USERS, userId);
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) {
                    throw new FirebaseError(db_schema_1.ERROR_CODES.USER_NOT_FOUND, 'User not found');
                }
                const userData = userDoc.data();
                const currentCredits = userData.credits;
                const newBalance = currentCredits + amount;
                transaction.update(userRef, {
                    credits: newBalance,
                    totalCreditsPurchased: (0, firestore_1.increment)(amount),
                });
                const transactionRef = (0, firestore_1.doc)((0, firestore_1.collection)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.CREDIT_TRANSACTIONS));
                transaction.set(transactionRef, {
                    userId,
                    type: 'purchase',
                    amount,
                    balanceBefore: currentCredits,
                    balanceAfter: newBalance,
                    description: `Credits purchased - ${amount} credits`,
                    relatedDocumentId: paymentId,
                    relatedDocumentType: 'payment',
                    createdAt: (0, firestore_1.serverTimestamp)(),
                    metadata: {
                        source: 'stripe',
                    },
                });
            });
        }
        catch (error) {
            if (error instanceof FirebaseError)
                throw error;
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to add credits', error);
        }
    },
    async addTransaction(transactionData) {
        try {
            const transactionRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.CREDIT_TRANSACTIONS), {
                ...transactionData,
                createdAt: (0, firestore_1.serverTimestamp)(),
            });
            return transactionRef.id;
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to add credit transaction', error);
        }
    },
    async getHistory(userId, limitCount = 20) {
        try {
            const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.CREDIT_TRANSACTIONS), (0, firestore_1.where)('userId', '==', userId), (0, firestore_1.orderBy)('createdAt', 'desc'), (0, firestore_1.limit)(limitCount));
            const querySnapshot = await (0, firestore_1.getDocs)(q);
            const transactions = [];
            querySnapshot.forEach((doc) => {
                transactions.push({ id: doc.id, ...doc.data() });
            });
            return transactions;
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to get credit history', error);
        }
    },
};
exports.paymentOperations = {
    async create(paymentData) {
        try {
            const paymentRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.PAYMENTS), {
                ...paymentData,
                ...db_schema_1.DEFAULT_VALUES.PAYMENT,
                createdAt: (0, firestore_1.serverTimestamp)(),
            });
            return paymentRef.id;
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to create payment', error);
        }
    },
    async updateStatus(paymentId, status, failureReason) {
        try {
            const paymentRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.PAYMENTS, paymentId);
            const updates = { status };
            if (status === 'completed') {
                updates.completedAt = (0, firestore_1.serverTimestamp)();
            }
            if (failureReason) {
                updates.failureReason = failureReason;
            }
            await (0, firestore_1.updateDoc)(paymentRef, updates);
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to update payment status', error);
        }
    },
    async getById(paymentId) {
        try {
            const paymentRef = (0, firestore_1.doc)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.PAYMENTS, paymentId);
            const paymentSnap = await (0, firestore_1.getDoc)(paymentRef);
            if (!paymentSnap.exists()) {
                return null;
            }
            return { id: paymentSnap.id, ...paymentSnap.data() };
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to get payment', error);
        }
    },
    async getUserPayments(userId, limitCount = 20) {
        try {
            const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_sdk_1.db, db_schema_1.COLLECTION_PATHS.PAYMENTS), (0, firestore_1.where)('userId', '==', userId), (0, firestore_1.orderBy)('createdAt', 'desc'), (0, firestore_1.limit)(limitCount));
            const querySnapshot = await (0, firestore_1.getDocs)(q);
            const payments = [];
            querySnapshot.forEach((doc) => {
                payments.push({ id: doc.id, ...doc.data() });
            });
            return payments;
        }
        catch (error) {
            throw new FirebaseError(db_schema_1.ERROR_CODES.DATABASE_ERROR, 'Failed to get user payments', error);
        }
    },
};
exports.utils = {
    timestampToDate(timestamp) {
        return timestamp.toDate();
    },
    dateToTimestamp(date) {
        return firestore_1.Timestamp.fromDate(date);
    },
    createBatch() {
        return (0, firestore_1.writeBatch)(firebase_sdk_1.db);
    },
    async verifyOwnership(userId, documentId, collection) {
        try {
            const docRef = (0, firestore_1.doc)(firebase_sdk_1.db, collection, documentId);
            const docSnap = await (0, firestore_1.getDoc)(docRef);
            if (!docSnap.exists()) {
                return false;
            }
            const data = docSnap.data();
            return data.userId === userId;
        }
        catch (error) {
            return false;
        }
    },
};
