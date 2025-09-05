const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'oeng-app-api',
    version: '1.0.0'
  });
});

// API routes - Import Vercel functions
const authRoutes = {
  register: require('./api/auth/register.ts'),
  login: require('./api/auth/login.ts'),
  logout: require('./api/auth/logout.ts'),
  'reset-password': require('./api/auth/reset-password.ts')
};

const sentenceRoutes = {
  create: require('./api/sentences/create.ts'),
  list: require('./api/sentences/list.ts'),
  get: require('./api/sentences/get.ts'),
  update: require('./api/sentences/update.ts'),
  delete: require('./api/sentences/delete.ts'),
  analyze: require('./api/sentences/analyze.ts')
};

const creditRoutes = {
  balance: require('./api/credits/balance.ts'),
  history: require('./api/credits/history.ts')
};

const aiRoutes = {
  gemini: require('./api/ai/gemini-endpoint.js')
};

const healthRoute = require('./api/health.ts');

// Mount auth routes
Object.keys(authRoutes).forEach(route => {
  app.all(`/api/auth/${route}`, authRoutes[route].default);
});

// Mount sentence routes
Object.keys(sentenceRoutes).forEach(route => {
  app.all(`/api/sentences/${route}`, sentenceRoutes[route].default);
});

// Mount credit routes
Object.keys(creditRoutes).forEach(route => {
  app.all(`/api/credits/${route}`, creditRoutes[route].default);
});

// Mount AI routes
Object.keys(aiRoutes).forEach(route => {
  const handler = aiRoutes[route].default || aiRoutes[route];
  if (typeof handler === 'function') {
    app.all(`/api/ai/${route}`, handler);
  }
});

// Mount health route
app.all('/api/health', healthRoute.default);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI English Coach API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        resetPassword: 'POST /api/auth/reset-password'
      },
      sentences: {
        create: 'POST /api/sentences/create',
        list: 'GET /api/sentences/list',
        get: 'GET /api/sentences/get',
        update: 'PUT /api/sentences/update',
        delete: 'DELETE /api/sentences/delete',
        analyze: 'POST /api/sentences/analyze'
      },
      credits: {
        balance: 'GET /api/credits/balance',
        history: 'GET /api/credits/history'
      }
    },
    documentation: 'https://github.com/mojisejr/oeng-mobile-app'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.path} was not found`,
    availableEndpoints: [
      'GET /health',
      'POST /api/auth/*',
      'POST /api/sentences/*',
      'GET /api/credits/*'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI English Coach API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })} (Thailand time)`);
});

module.exports = app;