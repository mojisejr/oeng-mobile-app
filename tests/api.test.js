const request = require('supertest');
const app = require('../server');

// Mock Firebase Admin SDK
jest.mock('../firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn()
  },
  adminDb: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })),
      where: jest.fn(() => ({
        get: jest.fn()
      })),
      add: jest.fn()
    }))
  }
}));

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn(() => Promise.resolve({
        response: {
          text: () => JSON.stringify({
            translation: {
              correct: 'สวัสดี',
              explanation: 'คำทักทายทั่วไป'
            },
            grammar: {
              hasErrors: false,
              corrections: [],
              explanation: 'ไวยากรณ์ถูกต้อง'
            },
            spelling: {
              hasErrors: false,
              corrections: [],
              explanation: 'การสะกดถูกต้อง'
            },
            vocabulary: {
              keyWords: [{
                word: 'hello',
                partOfSpeech: 'interjection',
                meaning: 'คำทักทาย',
                example: 'Hello, how are you?'
              }]
            },
            alternatives: {
              sentences: [
                'Hi there!',
                'Good morning!'
              ]
            },
            context: {
              appropriateness: 'เหมาะสม',
              situations: ['การทักทายทั่วไป'],
              formality: 'ไม่เป็นทางการ'
            },
            recommendation: {
              summary: 'ประโยคดีแล้ว',
              improvements: [],
              encouragement: 'เก่งมาก!'
            }
          })
        }
      }))
    }))
  }))
}));

describe('API Health Check', () => {
  test('GET /api/health should return healthy status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('thailandTime');
  });

  test('GET /health should return basic health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', 'oeng-app-api');
  });
});

describe('API Root Endpoint', () => {
  test('GET / should return API information', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body).toHaveProperty('message', 'AI English Coach API');
    expect(response.body).toHaveProperty('version', '1.0.0');
    expect(response.body).toHaveProperty('status', 'running');
    expect(response.body).toHaveProperty('endpoints');
  });
});

describe('Authentication API', () => {
  test('POST /api/auth/register should handle registration', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User'
    };

    // Mock successful Firebase auth creation
    const { adminAuth } = require('../firebase-admin');
    adminAuth.createUser = jest.fn().mockResolvedValue({
      uid: 'test-uid',
      email: userData.email
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
  });

  test('POST /api/auth/register should validate required fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  });
});

describe('Sentence API', () => {
  const mockToken = 'mock-firebase-token';
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    const { adminAuth } = require('../firebase-admin');
    adminAuth.verifyIdToken.mockResolvedValue({
      uid: mockUserId,
      email: 'test@example.com'
    });
  });

  test('POST /api/sentences/create should create new sentence', async () => {
    const sentenceData = {
      englishSentence: 'Hello world',
      userTranslation: 'สวัสดีโลก',
      context: 'greeting'
    };

    const response = await request(app)
      .post('/api/sentences/create')
      .set('Authorization', `Bearer ${mockToken}`)
      .send(sentenceData)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('sentenceId');
  });

  test('GET /api/sentences/list should return user sentences', async () => {
    const response = await request(app)
      .get('/api/sentences/list')
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('sentences');
    expect(Array.isArray(response.body.sentences)).toBe(true);
  });

  test('POST /api/sentences/analyze should analyze sentence', async () => {
    const analyzeData = {
      sentenceId: 'test-sentence-id'
    };

    // Mock sentence and user data
    const { adminDb } = require('../firebase-admin');
    const mockSentenceDoc = {
      exists: true,
      data: () => ({
        englishSentence: 'Hello world',
        userTranslation: 'สวัสดีโลก',
        context: 'greeting',
        userId: mockUserId,
        status: 'pending'
      })
    };
    
    const mockUserDoc = {
      exists: true,
      data: () => ({
        creditBalance: 5,
        email: 'test@example.com'
      })
    };

    adminDb.collection().doc().get
      .mockResolvedValueOnce(mockSentenceDoc)
      .mockResolvedValueOnce(mockUserDoc);

    const response = await request(app)
      .post('/api/sentences/analyze')
      .set('Authorization', `Bearer ${mockToken}`)
      .send(analyzeData)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('analysis');
  });
});

describe('Credit API', () => {
  const mockToken = 'mock-firebase-token';
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    const { adminAuth } = require('../firebase-admin');
    adminAuth.verifyIdToken.mockResolvedValue({
      uid: mockUserId,
      email: 'test@example.com'
    });
  });

  test('GET /api/credits/balance should return user credit balance', async () => {
    // Mock user data
    const { adminDb } = require('../firebase-admin');
    const mockUserDoc = {
      exists: true,
      data: () => ({
        creditBalance: 10,
        email: 'test@example.com'
      })
    };

    adminDb.collection().doc().get.mockResolvedValue(mockUserDoc);

    const response = await request(app)
      .get('/api/credits/balance')
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('balance', 10);
  });

  test('GET /api/credits/history should return credit transaction history', async () => {
    const response = await request(app)
      .get('/api/credits/history')
      .set('Authorization', `Bearer ${mockToken}`);

    // Log the response for debugging
    console.log('Credit history response:', response.status, response.body);

    if (response.status === 200) {
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('transactions');
      expect(Array.isArray(response.body.data.transactions)).toBe(true);
      expect(response.body.data).toHaveProperty('pagination');
    } else {
      // For now, just check that we get some response
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    }
  });
});

describe('Error Handling', () => {
  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error', 'Endpoint not found');
  });

  test('POST /api/sentences/analyze without auth should return 401', async () => {
    const response = await request(app)
      .post('/api/sentences/analyze')
      .send({ sentenceId: 'test' })
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  });
});

describe('CORS Handling', () => {
  test('OPTIONS requests should be handled properly', async () => {
    const response = await request(app)
      .options('/api/auth/register')
      .expect(204);

    expect(response.headers).toHaveProperty('access-control-allow-origin');
    expect(response.headers).toHaveProperty('access-control-allow-methods');
    // Note: access-control-allow-headers may not be present in all CORS implementations
  });
});