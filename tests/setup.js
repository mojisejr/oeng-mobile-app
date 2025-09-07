// Jest setup file

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.FIREBASE_API_KEY = 'test-api-key';

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
            translationAnalysis: {
              correctTranslation: 'สวัสดีโลก',
              explanation: 'คำทักทายทั่วไป',
              accuracy: 'excellent'
            },
            grammarCorrection: {
              mistakes: [],
              correctedSentence: 'Hello world',
              overallGrammarScore: 100
            },
            spellingCheck: {
              mistakes: [],
              correctedSentence: 'Hello world',
              spellingScore: 100
            },
            vocabularyBreakdown: {
              keyWords: [{
                word: 'hello',
                partOfSpeech: 'interjection',
                meaning: 'คำทักทาย',
                example: 'Hello, how are you?',
                difficulty: 'beginner'
              }],
              vocabularyLevel: 'beginner'
            },
            alternativeSentences: {
              alternatives: [{
                sentence: 'Hi there',
                tone: 'casual',
                explanation: 'More casual greeting'
              }]
            },
            contextAnalysis: {
              appropriateness: 'very_appropriate',
              suggestions: ['Great for casual conversations'],
              culturalNotes: 'Universal greeting'
            },
            finalRecommendation: {
              overallScore: 95,
              strengths: ['Clear pronunciation'],
              improvements: ['Try variations'],
              nextSteps: 'Practice with different contexts',
              encouragement: 'Great job!'
            }
          }))
        }
      })
    })
  }))
}));

// Mock Firebase SDK (client-side)
jest.mock('../firebase-sdk', () => ({
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    addDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    startAfter: jest.fn()
  }
}));

// Global test cleanup
afterAll(async () => {
  // Force close any remaining handles
  await new Promise((resolve) => {
    setTimeout(resolve, 100);
  });
  
  // Clear all timers
  jest.clearAllTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});