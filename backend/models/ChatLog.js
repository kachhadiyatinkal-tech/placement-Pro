const mongoose = require('mongoose');

/**
 * Persists each chatbot exchange (user message + bot reply + optional action buttons)
 * for analytics and auditing.
 */
const ChatLogSchema = new mongoose.Schema({
  userMessage: { type: String, default: '' },
  botReply: { type: String, default: '' },
  /** Stores action button metadata returned to the client (navigate / link / message). */
  actions: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatLog', ChatLogSchema);
