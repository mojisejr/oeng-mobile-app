// Database Schema Definitions for AI English Coach App
import { Timestamp } from 'firebase/firestore';

// User document structure
export interface UserDocument {
  uid: string; // Firebase UID (legacy support)
  clerkUserId?: string; // Clerk User ID (new primary identifier)
  email: string;
  displayName: string;
  photoURL?: string | null;
  emailVerified: boolean;
  credits: number;
  totalCreditsUsed: number;
  totalCreditsPurchased: number;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  isActive: boolean;
  authProvider: 'firebase' | 'clerk'; // Track authentication provider
  preferences?: {
    language: 'th' | 'en';
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
}

// Sentence document structure
export interface SentenceDocument {
  id: string;
  userId: string; // Can be Firebase UID or Clerk User ID
  clerkUserId?: string; // Clerk User ID for new records
  englishSentence: string;
  userTranslation?: string;
  context?: string;
  status: 'pending' | 'analyzed';
  analysis?: AnalysisResult;
  createdAt: Timestamp;
  analyzedAt?: Timestamp;
  creditsUsed: number;
  tags?: string[];
  isFavorite: boolean;
}

// AI Analysis result structure
export interface AnalysisResult {
  translationAnalysis: {
    correctTranslation: string;
    explanation: string;
    accuracy: number; // 0-100
  };
  grammarCorrection: {
    mistakes: Array<{
      word: string;
      correction: string;
      explanation: string;
      position: number;
    }>;
    correctedSentence: string;
    grammarScore: number; // 0-100
  };
  spellingCheck: {
    misspelledWords: Array<{
      word: string;
      correction: string;
      position: number;
    }>;
    correctedSentence: string;
    spellingScore: number; // 0-100
  };
  vocabularyBreakdown: {
    keyWords: Array<{
      word: string;
      partOfSpeech: string;
      meaning: string;
      example: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
    }>;
  };
  alternativeSentences: {
    alternatives: Array<{
      sentence: string;
      context: string;
      explanation: string;
      formality: 'casual' | 'formal' | 'neutral';
    }>;
  };
  contextAnalysis: {
    appropriateness: string;
    suggestions: string;
    contextScore: number; // 0-100
  };
  finalRecommendation: {
    overallScore: number; // 0-100
    mainIssues: string[];
    actionableAdvice: string;
    nextSteps: string[];
  };
  metadata: {
    aiModel: string;
    processingTime: number; // milliseconds
    tokenUsage: number;
    analysisVersion: string;
  };
}

// Payment document structure
export interface PaymentDocument {
  id: string;
  userId: string; // Can be Firebase UID or Clerk User ID
  clerkUserId?: string; // Clerk User ID for new records
  amount: number; // in Thai Baht
  credits: number;
  stripePaymentIntentId: string;
  stripePaymentMethodId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  currency: 'THB';
  paymentMethod: 'card' | 'promptpay' | 'bank_transfer';
  createdAt: Timestamp;
  completedAt?: Timestamp;
  failureReason?: string;
  metadata?: {
    packageType: 'basic' | 'premium' | 'pro';
    discountApplied?: number;
    promoCode?: string;
  };
}

// Credit transaction document structure
export interface CreditTransactionDocument {
  id: string;
  userId: string; // Can be Firebase UID or Clerk User ID
  clerkUserId?: string; // Clerk User ID for new records
  type: 'purchase' | 'usage' | 'bonus' | 'refund';
  amount: number; // positive for additions, negative for deductions
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  relatedDocumentId?: string; // payment ID or sentence ID
  relatedDocumentType?: 'payment' | 'sentence' | 'bonus';
  createdAt: Timestamp;
  metadata?: {
    source: 'stripe' | 'analysis' | 'welcome_bonus' | 'admin';
    adminUserId?: string;
    notes?: string;
  };
}

// Firestore collection paths
export const COLLECTION_PATHS = {
  USERS: 'users',
  SENTENCES: 'sentences',
  PAYMENTS: 'payments',
  CREDIT_TRANSACTIONS: 'creditTransactions',
} as const;

// Default values for new documents
export const DEFAULT_VALUES = {
  USER: {
    credits: 3, // Free credits for new users
    totalCreditsUsed: 0,
    totalCreditsPurchased: 0,
    photoURL: null,
    emailVerified: false,
    isActive: true,
    preferences: {
      language: 'th' as const,
      notifications: true,
      theme: 'auto' as const,
    },
  },
  SENTENCE: {
    status: 'pending' as const,
    creditsUsed: 1,
    isFavorite: false,
    tags: [],
  },
  PAYMENT: {
    currency: 'THB' as const,
    status: 'pending' as const,
  },
} as const;

// Credit packages configuration
export const CREDIT_PACKAGES = {
  BASIC: {
    credits: 10,
    price: 99, // THB
    packageType: 'basic' as const,
    popular: false,
  },
  PREMIUM: {
    credits: 25,
    price: 199, // THB
    packageType: 'premium' as const,
    popular: true,
    bonus: 5, // Extra credits
  },
  PRO: {
    credits: 50,
    price: 349, // THB
    packageType: 'pro' as const,
    popular: false,
    bonus: 15, // Extra credits
  },
} as const;

// Validation schemas
export const VALIDATION_RULES = {
  ENGLISH_SENTENCE: {
    minLength: 3,
    maxLength: 500,
    pattern: /^[a-zA-Z0-9\s.,!?;:'"-()]+$/,
  },
  USER_TRANSLATION: {
    minLength: 1,
    maxLength: 1000,
  },
  CONTEXT: {
    minLength: 1,
    maxLength: 300,
  },
  DISPLAY_NAME: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s._-]+$/,
  },
} as const;

// Error codes for consistent error handling
export const ERROR_CODES = {
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  INVALID_SENTENCE: 'INVALID_SENTENCE',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  SENTENCE_NOT_FOUND: 'SENTENCE_NOT_FOUND',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type CreditPackageType = keyof typeof CREDIT_PACKAGES;
export type CollectionPath = typeof COLLECTION_PATHS[keyof typeof COLLECTION_PATHS];