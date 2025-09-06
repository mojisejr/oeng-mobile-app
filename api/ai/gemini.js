"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAnalysisError = void 0;
exports.analyzeEnglishSentence = analyzeEnglishSentence;
exports.estimateTokenUsage = estimateTokenUsage;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');
class AIAnalysisError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'AIAnalysisError';
    }
}
exports.AIAnalysisError = AIAnalysisError;
async function analyzeEnglishSentence(englishSentence, userTranslation, context) {
    try {
        if (!englishSentence || englishSentence.trim().length === 0) {
            throw new AIAnalysisError('English sentence is required', 'INVALID_INPUT');
        }
        if (englishSentence.length > 500) {
            throw new AIAnalysisError('English sentence is too long (max 500 characters)', 'INVALID_INPUT');
        }
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const prompt = createAnalysisPrompt(englishSentence, userTranslation, context);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        let analysisData;
        try {
            const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
            analysisData = JSON.parse(cleanedText);
        }
        catch (parseError) {
            console.error('Failed to parse AI response:', text);
            throw new AIAnalysisError('Failed to parse AI response', 'PARSING_ERROR', { originalResponse: text, parseError });
        }
        validateAnalysisResponse(analysisData);
        return analysisData;
    }
    catch (error) {
        console.error('AI Analysis Error:', error);
        if (error.message?.includes('API key')) {
            throw new AIAnalysisError('Invalid API key configuration', 'API_ERROR', error);
        }
        if (error.message?.includes('quota') || error.message?.includes('limit')) {
            throw new AIAnalysisError('API quota exceeded. Please try again later', 'QUOTA_EXCEEDED', error);
        }
        if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
            throw new AIAnalysisError('Network error. Please check your connection', 'NETWORK_ERROR', error);
        }
        if (error instanceof AIAnalysisError) {
            throw error;
        }
        throw new AIAnalysisError('Failed to analyze sentence. Please try again', 'API_ERROR', error);
    }
}
function createAnalysisPrompt(englishSentence, userTranslation, context) {
    const basePrompt = `
You are an expert English coach for Thai speakers. Analyze the following English sentence and provide comprehensive feedback in Thai language.

English Sentence: "${englishSentence}"
${userTranslation ? `User's Thai Translation: "${userTranslation}"` : ''}
${context ? `Context/Situation: "${context}"` : ''}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no additional text):

{
  "translationAnalysis": {
    "correctTranslation": "คำแปลภาษาไทยที่ถูกต้อง",
    "explanation": "คำอธิบายเหตุผลของการแปล",
    "accuracy": "excellent|good|fair|poor"
  },
  "grammarCorrection": {
    "mistakes": [
      {
        "original": "ส่วนที่ผิด",
        "corrected": "ส่วนที่แก้ไขแล้ว",
        "explanation": "คำอธิบายข้อผิดพลาด",
        "type": "grammar|syntax|tense|agreement"
      }
    ],
    "correctedSentence": "ประโยคที่แก้ไขแล้ว",
    "overallGrammarScore": 85
  },
  "spellingCheck": {
    "mistakes": [
      {
        "original": "คำที่สะกดผิด",
        "corrected": "คำที่สะกดถูก",
        "position": 5
      }
    ],
    "correctedSentence": "ประโยคที่แก้การสะกดแล้ว",
    "spellingScore": 90
  },
  "vocabularyBreakdown": {
    "keyWords": [
      {
        "word": "คำศัพท์",
        "partOfSpeech": "ชนิดของคำ",
        "meaning": "ความหมาย",
        "example": "ตัวอย่างการใช้",
        "difficulty": "beginner|intermediate|advanced"
      }
    ],
    "vocabularyLevel": "beginner|intermediate|advanced"
  },
  "alternativeSentences": {
    "alternatives": [
      {
        "sentence": "ประโยคทางเลือก",
        "tone": "formal|informal|casual|professional",
        "explanation": "คำอธิบายการใช้"
      }
    ]
  },
  "contextAnalysis": {
    "appropriateness": "very_appropriate|appropriate|somewhat_appropriate|inappropriate",
    "suggestions": ["คำแนะนำ 1", "คำแนะนำ 2"],
    "culturalNotes": "หมายเหตุทางวัฒนธรรม"
  },
  "finalRecommendation": {
    "overallScore": 85,
    "strengths": ["จุดแข็ง 1", "จุดแข็ง 2"],
    "improvements": ["ข้อควรปรับปรุง 1", "ข้อควรปรับปรุง 2"],
    "nextSteps": "ขั้นตอนต่อไปในการพัฒนา",
    "encouragement": "คำให้กำลังใจ"
  }
}

Important guidelines:
- Provide all explanations in Thai language
- Be encouraging and constructive
- Focus on practical, real-life usage
- If no mistakes are found, provide empty arrays but still give constructive feedback
- Scores should be realistic (0-100)
- Always provide at least 2 alternative sentences
- Include cultural context when relevant
`;
    return basePrompt;
}
function validateAnalysisResponse(data) {
    const requiredFields = [
        'translationAnalysis',
        'grammarCorrection',
        'spellingCheck',
        'vocabularyBreakdown',
        'alternativeSentences',
        'contextAnalysis',
        'finalRecommendation'
    ];
    for (const field of requiredFields) {
        if (!data[field]) {
            throw new AIAnalysisError(`Missing required field: ${field}`, 'PARSING_ERROR', { missingField: field });
        }
    }
    if (!data.translationAnalysis.correctTranslation) {
        throw new AIAnalysisError('Missing correct translation', 'PARSING_ERROR');
    }
    if (!Array.isArray(data.grammarCorrection.mistakes)) {
        throw new AIAnalysisError('Grammar mistakes must be an array', 'PARSING_ERROR');
    }
    if (!Array.isArray(data.vocabularyBreakdown.keyWords)) {
        throw new AIAnalysisError('Vocabulary key words must be an array', 'PARSING_ERROR');
    }
    if (!Array.isArray(data.alternativeSentences.alternatives)) {
        throw new AIAnalysisError('Alternative sentences must be an array', 'PARSING_ERROR');
    }
    if (typeof data.finalRecommendation.overallScore !== 'number') {
        throw new AIAnalysisError('Overall score must be a number', 'PARSING_ERROR');
    }
}
function estimateTokenUsage(englishSentence, userTranslation, context) {
    const basePromptTokens = 800;
    const sentenceTokens = Math.ceil(englishSentence.length / 4);
    const translationTokens = userTranslation ? Math.ceil(userTranslation.length / 4) : 0;
    const contextTokens = context ? Math.ceil(context.length / 4) : 0;
    const responseTokens = 1500;
    return basePromptTokens + sentenceTokens + translationTokens + contextTokens + responseTokens;
}
exports.default = {
    analyzeEnglishSentence,
    estimateTokenUsage,
    AIAnalysisError
};
