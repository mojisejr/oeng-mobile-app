import { creditOperations } from './firebase';
import { ERROR_CODES } from './db-schema';

export interface CreditTransaction {
  userId: string;
  clerkUserId?: string; // Clerk User ID for new records
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
 * Uses Clerk user ID as primary identifier
 */
export async function deductCredits(
  clerkUserId: string,
  amount: number,
  description: string,
  relatedDocumentId?: string
): Promise<CreditOperationResult> {
  try {
    // Get current balance before deduction
    const currentBalance = await creditOperations.getBalance(clerkUserId);
    
    if (currentBalance < amount) {
      return {
        success: false,
        newBalance: currentBalance,
        error: 'Insufficient credits'
      };
    }
    
    // Perform deduction using Firebase operations
    await creditOperations.deduct(clerkUserId, amount, description, relatedDocumentId);
    
    // Get new balance after deduction
    const newBalance = await creditOperations.getBalance(clerkUserId);
    
    return {
      success: true,
      newBalance,
      transactionId: `deduct-${Date.now()}`
    };
  } catch (error) {
    console.error('Deduct credits error:', error);
    return {
      success: false,
      newBalance: 0,
      error: error instanceof Error ? error.message : 'Failed to deduct credits'
    };
  }
}

/**
 * Add credits to user account with transaction logging
 * Uses Clerk user ID as primary identifier
 */
export async function addCredits(
  clerkUserId: string,
  amount: number,
  description: string,
  type: 'add' | 'purchase' | 'refund' = 'add',
  relatedDocumentId?: string
): Promise<CreditOperationResult> {
  try {
    // Get current balance before addition
    const currentBalance = await creditOperations.getBalance(clerkUserId);
    
    // Perform addition using Firebase operations
    if (type === 'purchase' && relatedDocumentId) {
      await creditOperations.add(clerkUserId, amount, relatedDocumentId);
    } else {
      // For non-purchase additions, we need to implement a generic add method
      // For now, use the purchase method with a generated ID
      const transactionId = `${type}-${Date.now()}`;
      await creditOperations.add(clerkUserId, amount, transactionId);
    }
    
    // Get new balance after addition
    const newBalance = await creditOperations.getBalance(clerkUserId);
    
    return {
      success: true,
      newBalance,
      transactionId: `add-${Date.now()}`
    };
  } catch (error) {
    console.error('Add credits error:', error);
    return {
      success: false,
      newBalance: 0,
      error: error instanceof Error ? error.message : 'Failed to add credits'
    };
  }
}

/**
 * Get current credit balance for user
 * Uses Clerk user ID as primary identifier
 */
export async function getCreditBalance(clerkUserId: string): Promise<number> {
  try {
    return await creditOperations.getBalance(clerkUserId);
  } catch (error) {
    console.error('Get credit balance error:', error);
    return 0;
  }
}

/**
 * Grant free credits to new users
 * Uses Clerk user ID as primary identifier
 */
export async function grantFreeCredits(
  clerkUserId: string,
  amount: number = 3
): Promise<CreditOperationResult> {
  return addCredits(clerkUserId, amount, 'Free credits for new user', 'add');
}