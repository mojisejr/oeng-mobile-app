// Jest setup file

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.FIREBASE_API_KEY = 'test-api-key';
process.env.FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
process.env.FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.FIREBASE_APP_ID = 'test-app-id';
process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-gemini-key';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            translationAnalysis: 'Test translation',
            grammarCorrection: 'Test grammar',
            spellingCheck: 'Test spelling',
            vocabularyBreakdown: 'Test vocabulary',
            alternativeSentences: ['Alternative 1', 'Alternative 2'],
            contextAnalysis: 'Test context',
            finalRecommendation: 'Test recommendation'
          }))
        }
      })
    })
  }))
}));

// Mock Firebase Admin SDK
jest.mock('../firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user-id' })
  },
  adminDb: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ credits: 100 })
        }),
        set: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({})
      }),
      add: jest.fn().mockResolvedValue({ id: 'mock-doc-id' }),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      count: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ count: 5 })
        })
      }),
      get: jest.fn().mockResolvedValue({
        docs: [
          {
            id: 'transaction-1',
            data: () => ({
              type: 'purchase',
              amount: 10,
              description: 'Credit purchase',
              createdAt: new Date(),
              balanceAfter: 110
            })
          }
        ]
      })
    })
  }
}));