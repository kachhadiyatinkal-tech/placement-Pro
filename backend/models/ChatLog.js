const mongoose = require('mongoose');

/**
 * Persists each chatbot exchange (user message + bot reply + optional action buttons)
 * for analytics and auditing.
 */
const ChatLogSchema = new mongoose.Schema(
  {
    userMessage: { type: String, default: '' },
    botReply: { type: String, default: '' },
    actions: { type: Array, default: [] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
    intent: { type: String, default: 'general_question' },
    lang: { type: String, default: 'en' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatLog', ChatLogSchema);
