const express = require('express');
const ChatLog = require('../models/ChatLog');
const ChatbotSettings = require('../models/chatbotSettings.model');
const authenticateToken = require('../middleware/auth.middleware');
const requireAdminOrManagement = require('../middleware/adminOrManagement.middleware');
const { postChat } = require('../controllers/chatbotChat.controller');

const router = express.Router();

const HEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
const LAUNCHER_POSITIONS = new Set([
  'right-bottom',
  'right-middle',
  'right-top',
  'left-bottom',
  'left-middle',
  'left-top',
  'center',
]);

/** Ensure a single settings document exists and return it as a plain object. */
async function getOrCreateSettings() {
  let doc = await ChatbotSettings.findOne();
  if (!doc) {
    doc = await ChatbotSettings.create({});
  }
  return doc;
}

function normalizeHexField(value, fieldLabel) {
  const c = String(value).trim();
  if (!HEX.test(c)) throw new Error(`${fieldLabel} must be a #RGB or #RRGGBB hex value`);
  return c.length === 4 ? expandShortHex(c) : c;
}

function sanitizeSettingsBody(body) {
  const out = {};
  if (body.chatbotIcon != null) out.chatbotIcon = String(body.chatbotIcon).trim();
  if (body.title != null) out.title = String(body.title).trim().slice(0, 100);
  if (body.welcomeMessage != null) out.welcomeMessage = String(body.welcomeMessage).slice(0, 2000);
  if (body.primaryColor != null) out.primaryColor = normalizeHexField(body.primaryColor, 'primaryColor');
  if (body.secondaryColor != null) out.secondaryColor = normalizeHexField(body.secondaryColor, 'secondaryColor');
  if (body.chatBgColor != null) out.chatBgColor = normalizeHexField(body.chatBgColor, 'chatBgColor');
  if (body.launcherSize != null) {
    const n = Number(body.launcherSize);
    if (Number.isFinite(n)) out.launcherSize = Math.min(80, Math.max(48, Math.round(n)));
  }
  if (body.panelWidth != null) {
    const n = Number(body.panelWidth);
    if (Number.isFinite(n)) out.panelWidth = Math.min(480, Math.max(280, Math.round(n)));
  }
  if (body.panelHeight != null) {
    const n = Number(body.panelHeight);
    if (Number.isFinite(n)) out.panelHeight = Math.min(640, Math.max(320, Math.round(n)));
  }
  if (body.positionBottom != null) {
    const n = Number(body.positionBottom);
    if (Number.isFinite(n)) out.positionBottom = Math.min(64, Math.max(8, Math.round(n)));
  }
  if (body.positionRight != null) {
    const n = Number(body.positionRight);
    if (Number.isFinite(n)) out.positionRight = Math.min(64, Math.max(8, Math.round(n)));
  }
  if (body.positionLeft != null) {
    const n = Number(body.positionLeft);
    if (Number.isFinite(n)) out.positionLeft = Math.min(64, Math.max(8, Math.round(n)));
  }
  if (body.positionTop != null) {
    const n = Number(body.positionTop);
    if (Number.isFinite(n)) out.positionTop = Math.min(64, Math.max(8, Math.round(n)));
  }
  if (body.launcherPosition != null) {
    const p = String(body.launcherPosition).trim();
    if (!LAUNCHER_POSITIONS.has(p)) throw new Error('Invalid launcherPosition');
    out.launcherPosition = p;
  }
  if (body.inputPlaceholder != null) out.inputPlaceholder = String(body.inputPlaceholder).slice(0, 120);
  if (body.thinkingLabel != null) out.thinkingLabel = String(body.thinkingLabel).slice(0, 80);
  if (body.widgetEnabled != null) out.widgetEnabled = Boolean(body.widgetEnabled);
  return out;
}

function expandShortHex(short) {
  const h = short.slice(1);
  if (h.length !== 3) return short;
  return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
}

/**
 * GET /api/chatbot/settings
 * Public — used by the widget on every page (no auth).
 */
router.get('/settings', async (req, res) => {
  try {
    const doc = await getOrCreateSettings();
    const o = doc.toObject();
    delete o.__v;
    return res.json(o);
  } catch (err) {
    console.error('chatbot GET /settings:', err);
    return res.status(500).json({ message: 'Failed to load chatbot settings' });
  }
});

/**
 * PUT /api/chatbot/settings
 * Admin / management only — updates the singleton document.
 */
router.put('/settings', authenticateToken, requireAdminOrManagement, async (req, res) => {
  try {
    const patch = sanitizeSettingsBody(req.body || {});
    await getOrCreateSettings();
    const updated = await ChatbotSettings.findOneAndUpdate(
      {},
      { $set: patch },
      { new: true, runValidators: true },
    );
    const o = updated.toObject();
    delete o.__v;
    return res.json(o);
  } catch (err) {
    console.error('chatbot PUT /settings:', err);
    const msg = err.message || 'Failed to save settings';
    const badInput =
      (/primaryColor|secondaryColor|chatBgColor/.test(msg) && msg.includes('must be a')) ||
      msg.includes('launcherPosition');
    return res.status(badInput ? 400 : 500).json({ message: badInput ? msg : 'Failed to save settings' });
  }
});

/**
 * POST /api/chatbot/chat
 * Body: { message: string }
 * Returns: { reply: string, actions: Action[] }
 *
 * Rule-based intents run first; otherwise Google Gemini with function calling.
 */
router.post('/chat', postChat);

module.exports = router;
