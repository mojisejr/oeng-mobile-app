// Firebase Firestore Helper Functions
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  serverTimestamp,
  increment,
  runTransaction,
  writeBatch,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase-sdk';
import {
  UserDocument,
  SentenceDocument,
  PaymentDocument,
  CreditTransactionDocument,
  COLLECTION_PATHS,
  DEFAULT_VALUES,
  ERROR_CODES,
  ErrorCode,
} from './db-schema';

// Custom error class for Firebase operations
class FirebaseError extends Error {
  constructor(public code: ErrorCode, message: string, public originalError?: any) {
    super(message);
    this.name = 'FirebaseError';
  }
}

// User operations
export const userOperations = {
  // Create a new user document
  async create(userData: Omit<UserDocument, 'createdAt' | 'lastLoginAt'>): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_PATHS.USERS, userData.uid);
      await setDoc(userRef, {
        ...userData,
        ...DEFAULT_VALUES.USER,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      // Create welcome bonus credit transaction
      await creditOperations.addTransaction({
        userId: userData.uid,
        type: 'bonus',
        amount: DEFAULT_VALUES.USER.credits,
        balanceBefore: 0,
        balanceAfter: DEFAULT_VALUES.USER.credits,
        description: 'Welcome bonus - Free credits for new users',
        metadata: {
          source: 'welcome_bonus',
        },
      });
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to create user', error);
    }
  },

  // Get user by ID
  async getById(userId: string): Promise<UserDocument | null> {
    try {
      const userRef = doc(db, COLLECTION_PATHS.USERS, userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return null;
      }
      
      const userData = userSnap.data();
      return { id: userSnap.id, ...userData } as unknown as UserDocument;
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to get user', error);
    }
  },

  // Update user data
  async update(userId: string, updates: Partial<UserDocument>): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_PATHS.USERS, userId);
      await updateDoc(userRef, {
        ...updates,
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to update user', error);
    }
  },

  // Update last login time
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_PATHS.USERS, userId);
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to update last login', error);
    }
  },
};

// Sentence operations
export const sentenceOperations = {
  // Create a new sentence
  async create(sentenceData: Omit<SentenceDocument, 'id' | 'createdAt'>): Promise<string> {
    try {
      const sentenceRef = await addDoc(collection(db, COLLECTION_PATHS.SENTENCES), {
        ...sentenceData,
        ...DEFAULT_VALUES.SENTENCE,
        createdAt: serverTimestamp(),
      });
      return sentenceRef.id;
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to create sentence', error);
    }
  },

  // Get sentence by ID
  async getById(sentenceId: string): Promise<SentenceDocument | null> {
    try {
      const sentenceRef = doc(db, COLLECTION_PATHS.SENTENCES, sentenceId);
      const sentenceSnap = await getDoc(sentenceRef);
      
      if (!sentenceSnap.exists()) {
        return null;
      }
      
      return { id: sentenceSnap.id, ...sentenceSnap.data() } as SentenceDocument;
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to get sentence', error);
    }
  },

  // Get user's sentences with filtering and pagination
  async getUserSentences(
    userId: string,
    options: {
      status?: 'pending' | 'analyzed';
      limit?: number;
      lastDoc?: DocumentSnapshot;
      searchText?: string;
    } = {}
  ): Promise<{ sentences: SentenceDocument[]; hasMore: boolean }> {
    try {
      let q = query(
        collection(db, COLLECTION_PATHS.SENTENCES),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (options.status) {
        q = query(q, where('status', '==', options.status));
      }

      if (options.limit) {
        q = query(q, limit(options.limit + 1)); // +1 to check if there are more
      }

      if (options.lastDoc) {
        q = query(q, startAfter(options.lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const sentences: SentenceDocument[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as SentenceDocument;
        
        // Apply text search filter if provided
        if (options.searchText) {
          const searchLower = options.searchText.toLowerCase();
          const matchesSearch = 
            data.englishSentence.toLowerCase().includes(searchLower) ||
            data.userTranslation?.toLowerCase().includes(searchLower) ||
            data.context?.toLowerCase().includes(searchLower);
          
          if (matchesSearch) {
            sentences.push(data);
          }
        } else {
          sentences.push(data);
        }
      });

      const hasMore = options.limit ? sentences.length > options.limit : false;
      if (hasMore) {
        sentences.pop(); // Remove the extra item used for pagination check
      }

      return { sentences, hasMore };
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to get user sentences', error);
    }
  },

  // Update sentence with analysis results
  async updateWithAnalysis(
    sentenceId: string,
    analysis: SentenceDocument['analysis']
  ): Promise<void> {
    try {
      const sentenceRef = doc(db, COLLECTION_PATHS.SENTENCES, sentenceId);
      await updateDoc(sentenceRef, {
        analysis,
        status: 'analyzed',
        analyzedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to update sentence with analysis', error);
    }
  },

  // Update sentence data
  async update(sentenceId: string, updates: Partial<SentenceDocument>): Promise<void> {
    try {
      const sentenceRef = doc(db, COLLECTION_PATHS.SENTENCES, sentenceId);
      await updateDoc(sentenceRef, updates);
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to update sentence', error);
    }
  },

  // Delete sentence
  async delete(sentenceId: string): Promise<void> {
    try {
      const sentenceRef = doc(db, COLLECTION_PATHS.SENTENCES, sentenceId);
      await deleteDoc(sentenceRef);
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to delete sentence', error);
    }
  },
};

// Credit operations
export const creditOperations = {
  // Get user's current credit balance
  async getBalance(userId: string): Promise<number> {
    try {
      const user = await userOperations.getById(userId);
      if (!user) {
        throw new FirebaseError(ERROR_CODES.USER_NOT_FOUND, 'User not found');
      }
      return user.credits;
    } catch (error) {
      if (error instanceof FirebaseError) throw error;
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to get credit balance', error);
    }
  },

  // Deduct credits (with transaction for consistency)
  async deduct(userId: string, amount: number, description: string, relatedDocumentId?: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, COLLECTION_PATHS.USERS, userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new FirebaseError(ERROR_CODES.USER_NOT_FOUND, 'User not found');
        }
        
        const userData = userDoc.data() as UserDocument;
        const currentCredits = userData.credits;
        
        if (currentCredits < amount) {
          throw new FirebaseError(ERROR_CODES.INSUFFICIENT_CREDITS, 'Insufficient credits');
        }
        
        const newBalance = currentCredits - amount;
        
        // Update user credits
        transaction.update(userRef, {
          credits: newBalance,
          totalCreditsUsed: increment(amount),
        });
        
        // Create credit transaction record
        const transactionRef = doc(collection(db, COLLECTION_PATHS.CREDIT_TRANSACTIONS));
        transaction.set(transactionRef, {
          userId,
          type: 'usage',
          amount: -amount,
          balanceBefore: currentCredits,
          balanceAfter: newBalance,
          description,
          relatedDocumentId,
          relatedDocumentType: 'sentence',
          createdAt: serverTimestamp(),
          metadata: {
            source: 'analysis',
          },
        });
      });
    } catch (error) {
      if (error instanceof FirebaseError) throw error;
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to deduct credits', error);
    }
  },

  // Add credits (from purchase)
  async add(userId: string, amount: number, paymentId: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, COLLECTION_PATHS.USERS, userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new FirebaseError(ERROR_CODES.USER_NOT_FOUND, 'User not found');
        }
        
        const userData = userDoc.data() as UserDocument;
        const currentCredits = userData.credits;
        const newBalance = currentCredits + amount;
        
        // Update user credits
        transaction.update(userRef, {
          credits: newBalance,
          totalCreditsPurchased: increment(amount),
        });
        
        // Create credit transaction record
        const transactionRef = doc(collection(db, COLLECTION_PATHS.CREDIT_TRANSACTIONS));
        transaction.set(transactionRef, {
          userId,
          type: 'purchase',
          amount,
          balanceBefore: currentCredits,
          balanceAfter: newBalance,
          description: `Credits purchased - ${amount} credits`,
          relatedDocumentId: paymentId,
          relatedDocumentType: 'payment',
          createdAt: serverTimestamp(),
          metadata: {
            source: 'stripe',
          },
        });
      });
    } catch (error) {
      if (error instanceof FirebaseError) throw error;
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to add credits', error);
    }
  },

  // Add credit transaction record
  async addTransaction(transactionData: Omit<CreditTransactionDocument, 'id' | 'createdAt'>): Promise<string> {
    try {
      const transactionRef = await addDoc(collection(db, COLLECTION_PATHS.CREDIT_TRANSACTIONS), {
        ...transactionData,
        createdAt: serverTimestamp(),
      });
      return transactionRef.id;
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to add credit transaction', error);
    }
  },

  // Get credit transaction history
  async getHistory(
    userId: string,
    limitCount: number = 20
  ): Promise<CreditTransactionDocument[]> {
    try {
      const q = query(
        collection(db, COLLECTION_PATHS.CREDIT_TRANSACTIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const transactions: CreditTransactionDocument[] = [];
      
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() } as CreditTransactionDocument);
      });
      
      return transactions;
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to get credit history', error);
    }
  },
};

// Payment operations
export const paymentOperations = {
  // Create payment record
  async create(paymentData: Omit<PaymentDocument, 'id' | 'createdAt'>): Promise<string> {
    try {
      const paymentRef = await addDoc(collection(db, COLLECTION_PATHS.PAYMENTS), {
        ...paymentData,
        ...DEFAULT_VALUES.PAYMENT,
        createdAt: serverTimestamp(),
      });
      return paymentRef.id;
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to create payment', error);
    }
  },

  // Update payment status
  async updateStatus(
    paymentId: string,
    status: PaymentDocument['status'],
    failureReason?: string
  ): Promise<void> {
    try {
      const paymentRef = doc(db, COLLECTION_PATHS.PAYMENTS, paymentId);
      const updates: any = { status };
      
      if (status === 'completed') {
        updates.completedAt = serverTimestamp();
      }
      
      if (failureReason) {
        updates.failureReason = failureReason;
      }
      
      await updateDoc(paymentRef, updates);
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to update payment status', error);
    }
  },

  // Get payment by ID
  async getById(paymentId: string): Promise<PaymentDocument | null> {
    try {
      const paymentRef = doc(db, COLLECTION_PATHS.PAYMENTS, paymentId);
      const paymentSnap = await getDoc(paymentRef);
      
      if (!paymentSnap.exists()) {
        return null;
      }
      
      return { id: paymentSnap.id, ...paymentSnap.data() } as PaymentDocument;
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to get payment', error);
    }
  },

  // Get user's payment history
  async getUserPayments(
    userId: string,
    limitCount: number = 20
  ): Promise<PaymentDocument[]> {
    try {
      const q = query(
        collection(db, COLLECTION_PATHS.PAYMENTS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const payments: PaymentDocument[] = [];
      
      querySnapshot.forEach((doc) => {
        payments.push({ id: doc.id, ...doc.data() } as PaymentDocument);
      });
      
      return payments;
    } catch (error) {
      throw new FirebaseError(ERROR_CODES.DATABASE_ERROR, 'Failed to get user payments', error);
    }
  },
};

// Utility functions
export const utils = {
  // Convert Firestore timestamp to Date
  timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  },

  // Convert Date to Firestore timestamp
  dateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  },

  // Batch operations helper
  createBatch() {
    return writeBatch(db);
  },

  // Check if user owns a document
  async verifyOwnership(userId: string, documentId: string, collection: string): Promise<boolean> {
    try {
      const docRef = doc(db, collection, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return false;
      }
      
      const data = docSnap.data();
      return data.userId === userId;
    } catch (error) {
      return false;
    }
  },
};

export { FirebaseError, ERROR_CODES };