"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.VALIDATION_RULES = exports.CREDIT_PACKAGES = exports.DEFAULT_VALUES = exports.COLLECTION_PATHS = void 0;
exports.COLLECTION_PATHS = {
    USERS: 'users',
    SENTENCES: 'sentences',
    PAYMENTS: 'payments',
    CREDIT_TRANSACTIONS: 'creditTransactions',
};
exports.DEFAULT_VALUES = {
    USER: {
        credits: 3,
        totalCreditsUsed: 0,
        totalCreditsPurchased: 0,
        photoURL: null,
        emailVerified: false,
        isActive: true,
        preferences: {
            language: 'th',
            notifications: true,
            theme: 'auto',
        },
    },
    SENTENCE: {
        status: 'pending',
        creditsUsed: 1,
        isFavorite: false,
        tags: [],
    },
    PAYMENT: {
        currency: 'THB',
        status: 'pending',
    },
};
exports.CREDIT_PACKAGES = {
    BASIC: {
        credits: 10,
        price: 99,
        packageType: 'basic',
        popular: false,
    },
    PREMIUM: {
        credits: 25,
        price: 199,
        packageType: 'premium',
        popular: true,
        bonus: 5,
    },
    PRO: {
        credits: 50,
        price: 349,
        packageType: 'pro',
        popular: false,
        bonus: 15,
    },
};
exports.VALIDATION_RULES = {
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
};
exports.ERROR_CODES = {
    INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
    INVALID_SENTENCE: 'INVALID_SENTENCE',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    SENTENCE_NOT_FOUND: 'SENTENCE_NOT_FOUND',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    UNAUTHORIZED: 'UNAUTHORIZED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
};
