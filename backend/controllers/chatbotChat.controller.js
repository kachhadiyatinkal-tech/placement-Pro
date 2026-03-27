const ChatLog = require('../models/ChatLog');
const { getChatbotResponseWithContext } = require('../utils/geminiService');
const { detectIntent } = require('../utils/intentDetector');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * In-memory session store for mock interview state.
 * Key: req.user._id (string) or fallback to IP.
 * In production, use Redis or DB-backed sessions.
 */
const mockInterviewSessions = new Map();

function getSessionKey(req) {
  return req.user ? String(req.user._id) : req.ip;
}

async function postChat(req, res) {
  try {
    const raw = req.body?.message;
    const lang = req.body?.lang || 'en'; // language preference
    const userMessage = typeof raw === 'string' ? raw : '';
    const user = req.user || null;

    if (!userMessage.trim()) {
      return res.status(400).json({ message: 'Empty message' });
    }

    const sessionKey = getSessionKey(req);
    const mockState = mockInterviewSessions.get(sessionKey) || null;

    // Detect intent (mock interview state takes priority)
    const intent = mockState?.active ? 'mock_interview' : detectIntent(userMessage);

    const { reply, actions, mockState: newMockState } = await getChatbotResponseWithContext(
      userMessage,
      intent,
      user,
      mockState
    );

    // Update mock interview session state
    if (newMockState && newMockState.active) {
      mockInterviewSessions.set(sessionKey, newMockState);
    } else {
      mockInterviewSessions.delete(sessionKey);
    }

    // Log to DB (non-blocking)
    ChatLog.create({
      userMessage,
      botReply: reply,
      actions,
      userId: user?._id || null,
      intent,
    }).catch(e => console.error('ChatLog save error:', e));

    return res.json({ reply, actions, intent });
  } catch (err) {
    console.error('chatbot POST chat error:', err);
    return res.status(500).json({ message: 'Chat failed' });
  }
}

async function analyzeResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please upload a PDF or text file.' });
    }

    let resumeText = '';

    // Handle PDF
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      resumeText = data.text;
    } else {
      // Plain text / doc
      resumeText = req.file.buffer.toString('utf-8');
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ message: 'Could not extract text from resume. Please try a text-based PDF.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ reply: 'AI is not configured (missing GEMINI_API_KEY).' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

    const prompt = `Analyze the following resume and provide a structured assessment:\n\n---\n${resumeText.slice(0, 4000)}\n---\n\nProvide:\n1. **📊 Skills Identified** – List all technical and soft skills found.\n2. **✅ Strengths** – What stands out positively.\n3. **⚠️ Areas to Improve** – Specific, actionable improvements (3-5 points).\n4. **🔑 Missing Keywords** – Important keywords for tech/software roles that are absent.\n5. **⭐ Overall Score** – Rate the resume out of 10 for a software/tech role.\n\nFormat clearly with markdown.`;

    const response = await model.generateContent(prompt);
    const reply = response.response.text();

    return res.json({
      reply,
      actions: [
        { label: '📋 View Jobs', type: 'navigate', target: '/student/jobs' },
        { label: '👤 Update Profile', type: 'navigate', target: '/student/profile' },
      ],
    });
  } catch (err) {
    console.error('resume analyze error:', err);
    if (err?.message?.includes('GEMINI_API_KEY')) {
      return res.status(500).json({ message: 'AI not configured.' });
    }
    return res.status(500).json({ message: 'Resume analysis failed. Please try again.' });
  }
}

module.exports = { postChat, analyzeResume };
