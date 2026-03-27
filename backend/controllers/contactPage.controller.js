const ContactPage = require('../models/contactPage.model');
const ContactInquiry = require('../models/contactInquiry.model');

async function getOrCreatePage() {
  let doc = await ContactPage.findOne();
  if (!doc) {
    doc = await ContactPage.create({});
  }
  return doc;
}

/**
 * GET /api/contact/page — public
 */
async function getContactPage(req, res) {
  try {
    const doc = await getOrCreatePage();
    const o = doc.toObject();
    delete o.__v;
    return res.json(o);
  } catch (err) {
    console.error('getContactPage:', err);
    return res.status(500).json({ message: 'Failed to load contact page' });
  }
}

function sanitizePageBody(body) {
  const b = body || {};
  const out = {};
  if (b.pageTitle != null) out.pageTitle = String(b.pageTitle).trim().slice(0, 120);
  if (b.introText != null) out.introText = String(b.introText).slice(0, 2000);
  if (b.displayEmail != null) out.displayEmail = String(b.displayEmail).trim().slice(0, 200);
  if (b.displayPhone != null) out.displayPhone = String(b.displayPhone).trim().slice(0, 80);
  if (b.address != null) out.address = String(b.address).slice(0, 500);
  if (b.officeHours != null) out.officeHours = String(b.officeHours).slice(0, 500);
  if (b.testimonialQuote != null) out.testimonialQuote = String(b.testimonialQuote).slice(0, 800);
  if (b.testimonialAuthor != null) out.testimonialAuthor = String(b.testimonialAuthor).trim().slice(0, 120);
  return out;
}

/**
 * PUT /api/contact/page — admin / management / superuser / TPO
 */
async function updateContactPage(req, res) {
  try {
    await getOrCreatePage();
    const patch = sanitizePageBody(req.body);
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    const updated = await ContactPage.findOneAndUpdate({}, { $set: patch }, { new: true, runValidators: true });
    const o = updated.toObject();
    delete o.__v;
    return res.json(o);
  } catch (err) {
    console.error('updateContactPage:', err);
    return res.status(500).json({ message: 'Failed to save contact page' });
  }
}

/**
 * POST /api/contact/inquiry — public (form submit)
 */
async function postContactInquiry(req, res) {
  try {
    const { name, email, phone, subject, message } = req.body || {};
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (String(message).trim().length < 10) {
      return res.status(400).json({ message: 'Message must be at least 10 characters' });
    }
    if (!/\S+@\S+\.\S+/.test(String(email))) {
      return res.status(400).json({ message: 'Invalid email' });
    }
    await ContactInquiry.create({
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      subject: String(subject).trim(),
      message: String(message).trim(),
    });
    return res.status(201).json({ ok: true, message: 'Message received' });
  } catch (err) {
    console.error('postContactInquiry:', err);
    return res.status(500).json({ message: 'Could not send message' });
  }
}

/** For chatbot rule + tool execution — returns live email/phone from DB */
async function getContactTextForChatbot() {
  try {
    const doc = await getOrCreatePage();
    return [`Email: ${doc.displayEmail}`, `Phone: ${doc.displayPhone}`].join('\n');
  } catch (err) {
    console.error('getContactTextForChatbot:', err);
    const { executeChatbotFunction } = require('../services/chatbotFunctions');
    return executeChatbotFunction('get_contact_info');
  }
}

module.exports = {
  getContactPage,
  updateContactPage,
  postContactInquiry,
  getContactTextForChatbot,
};
