// Gemini API endpoint wrapper for Express.js
const { analyzeEnglishSentence, AIAnalysisError } = require('./gemini.js');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Main handler function
async function handler(req, res) {
  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST method is supported'
    });
  }

  try {
    const { englishSentence, userTranslation, context } = req.body;

    // Validate required fields
    if (!englishSentence || typeof englishSentence !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'englishSentence is required and must be a string'
      });
    }

    // Validate sentence length
    if (englishSentence.length > 500) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'English sentence must be 500 characters or less'
      });
    }

    // Call AI analysis
    const analysis = await analyzeEnglishSentence(
      englishSentence,
      userTranslation,
      context
    );

    return res.status(200).json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gemini API Error:', error);

    if (error instanceof AIAnalysisError) {
      const statusCode = error.code === 'QUOTA_EXCEEDED' ? 429 :
                        error.code === 'INVALID_INPUT' ? 400 :
                        error.code === 'NETWORK_ERROR' ? 503 : 500;

      return res.status(statusCode).json({
        error: error.code,
        message: error.message,
        details: error.details
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

module.exports = handler;
module.exports.default = handler;