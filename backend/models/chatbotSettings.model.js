const mongoose = require('mongoose');

/**
 * Singleton-style document: one row holds global chatbot widget UI configuration.
 * Created on first read if missing.
 */
const ChatbotSettingsSchema = new mongoose.Schema(
  {
    /** Custom Icon URL for the Chatbot avatar */
    chatbotIcon: { type: String, default: '/chatbot-placement-bot.svg', trim: true },
    /** Header title in the chat popup */
    title: { type: String, default: 'Placement Assistant', trim: true, maxlength: 100 },
    /** First bot bubble shown when the widget opens */
    welcomeMessage: {
      type: String,
      default:
        "Hi! I'm your placement assistant. Ask me about jobs, registration, or getting started.",
      maxlength: 2000,
    },
    /** Primary accent (user bubbles, send, launcher gradient start) — #RRGGBB */
    primaryColor: { type: String, default: '#059669', trim: true },
    /** Mixed with primary in header & launcher gradient — #RRGGBB */
    secondaryColor: { type: String, default: '#0d9488', trim: true },
    /** Main transcript / panel background behind messages — #RRGGBB */
    chatBgColor: { type: String, default: '#f4f4f5', trim: true },
    /** Floating button diameter in px */
    launcherSize: { type: Number, default: 56, min: 48, max: 80 },
    /** Popup width / height in px */
    panelWidth: { type: Number, default: 320, min: 280, max: 480 },
    panelHeight: { type: Number, default: 420, min: 320, max: 640 },
    /** Anchor preset for the floating widget */
    launcherPosition: {
      type: String,
      enum: [
        'right-bottom',
        'right-middle',
        'right-top',
        'left-bottom',
        'left-middle',
        'left-top',
        'center',
      ],
      default: 'right-bottom',
    },
    /** Fixed offset from viewport bottom (used with side anchors) */
    positionBottom: { type: Number, default: 20, min: 8, max: 64 },
    /** Offset from right edge (right-* positions) */
    positionRight: { type: Number, default: 20, min: 8, max: 64 },
    /** Offset from left edge (left-* positions) */
    positionLeft: { type: Number, default: 20, min: 8, max: 64 },
    /** Offset from top edge (right-top, left-top) */
    positionTop: { type: Number, default: 20, min: 8, max: 64 },
    inputPlaceholder: { type: String, default: 'Type a message…', maxlength: 120 },
    /** Shown while waiting for the API reply */
    thinkingLabel: { type: String, default: 'Thinking…', maxlength: 80 },
    /** When false, the widget is not rendered site-wide */
    widgetEnabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('ChatbotSettings', ChatbotSettingsSchema);
