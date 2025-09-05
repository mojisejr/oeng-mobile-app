import { adminDb } from '../../firebase-admin';
import { COLLECTION_PATHS } from './db-schema';
import { FieldValue } from 'firebase-admin/firestore';

export interface CreditTransaction {
  userId: string;
  type: 'deduct' | 'add' | 'purchase' | 'refund';
  amount: number;
  description: string;
  relatedDocumentId?: string;
  balanceAfter: number;
  createdAt: any;
}

export interface CreditOperationResult {
  success: boolean;
  newBalance: number;
  transactionId?: string;
  error?: string;
}

/**
 * Deduct credits from user account with transaction logging
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  relatedDocumentId?: string
): Promise<CreditOperationResult> {
  const batch = adminDb.batch();

  try {
    // Get user document reference
    const userRef = adminDb.collection(COLLECTION_PATHS.USERS).doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        success: false,
        newBalance: 0,
        error: 'User not found'
      };
    }

    const userData = userDoc.data();
    if (!userData) {
      return {
        success: false,
        newBalance: 0,
        error: 'User data not found'
      };
    }

    const currentBalance = userData.creditBalance || 0;

    // Check if user has sufficient credits
    if (currentBalance < amount) {
      return {
        success: false,
        newBalance: currentBalance,
        error: 'Insufficient credits'
      };
    }

    const newBalance = currentBalance - amount;
    const totalCreditsUsed = (userData.totalCreditsUsed || 0) + amount;

    // Update user document
    batch.update(userRef, {
      creditBalance: newBalance,
      totalCreditsUsed,
      lastCreditUsed: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    // Create transaction record
    const transactionRef = adminDb.collection(COLLECTION_PATHS.CREDIT_TRANSACTIONS).doc();
    const transactionData: CreditTransaction = {
      userId,
      type: 'deduct',
      amount,
      description,
      relatedDocumentId,
      balanceAfter: newBalance,
      createdAt: FieldValue.serverTimestamp()
    };

    batch.set(transactionRef, transactionData);

    // Commit the batch
    await batch.commit();

    return {
      success: true,
      newBalance,
      transactionId: transactionRef.id
    };

  } catch (error) {
    console.error('Credit deduction error:', error);
    return {
      success: false,
      newBalance: 0,
      error: 'Failed to deduct credits'
    };
  }
}

/**
 * Add credits to user account with transaction logging
 */
export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  type: 'add' | 'purchase' | 'refund' = 'add',
  relatedDocumentId?: string
): Promise<CreditOperationResult> {
  const batch = adminDb.batch();

  try {
    // Get user document reference
    const userRef = adminDb.collection(COLLECTION_PATHS.USERS).doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        success: false,
        newBalance: 0,
        error: 'User not found'
      };
    }

    const userData = userDoc.data();
    if (!userData) {
      return {
        success: false,
        newBalance: 0,
        error: 'User data not found'
      };
    }

    const currentBalance = userData.creditBalance || 0;
    const newBalance = currentBalance + amount;
    
    // Update totals based on transaction type
    const updateData: any = {
      creditBalance: newBalance,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (type === 'purchase') {
      updateData.totalCreditsPurchased = (userData.totalCreditsPurchased || 0) + amount;
    }

    // Update user document
    batch.update(userRef, updateData);

    // Create transaction record
    const transactionRef = adminDb.collection(COLLECTION_PATHS.CREDIT_TRANSACTIONS).doc();
    const transactionData: CreditTransaction = {
      userId,
      type,
      amount,
      description,
      relatedDocumentId,
      balanceAfter: newBalance,
      createdAt: FieldValue.serverTimestamp()
    };

    batch.set(transactionRef, transactionData);

    // Commit the batch
    await batch.commit();

    return {
      success: true,
      newBalance,
      transactionId: transactionRef.id
    };

  } catch (error) {
    console.error('Credit addition error:', error);
    return {
      success: false,
      newBalance: 0,
      error: 'Failed to add credits'
    };
  }
}

/**
 * Get user's current credit balance
 */
export async function getCreditBalance(userId: string): Promise<number> {
  try {
    const userDoc = await adminDb.collection(COLLECTION_PATHS.USERS).doc(userId).get();
    
    if (!userDoc.exists) {
      return 0;
    }

    const userData = userDoc.data();
    return userData?.creditBalance || 0;
  } catch (error) {
    console.error('Get credit balance error:', error);
    return 0;
  }
}

/**
 * Grant free credits to new users
 */
export async function grantFreeCredits(
  userId: string,
  amount: number = 3
): Promise<CreditOperationResult> {
  return addCredits(
    userId,
    amount,
    `Free credits for new user (${amount} credits)`,
    'add'
  );
}