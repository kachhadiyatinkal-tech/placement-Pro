const ChatLog = require('../models/ChatLog');
const { getChatbotResponse } = require('../services/geminiChatService');

async function postChat(req, res) {
  try {
    const raw = req.body?.message;
    const userMessage = typeof raw === 'string' ? raw : '';

    const { reply, actions } = await getChatbotResponse(userMessage);

    await ChatLog.create({
      userMessage,
      botReply: reply,
      actions,
    });

    return res.json({ reply, actions });
  } catch (err) {
    console.error('chatbot POST chat error:', err);
    return res.status(500).json({ message: 'Chat failed' });
  }
}

module.exports = { postChat };
