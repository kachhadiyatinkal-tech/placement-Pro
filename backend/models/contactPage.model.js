const mongoose = require('mongoose');

/**
 * Singleton document: public contact page copy + displayed email/phone (managed by admin / TPO).
 */
const ContactPageSchema = new mongoose.Schema(
  {
    pageTitle: { type: String, default: 'How can we help?', trim: true, maxlength: 120 },
    introText: {
      type: String,
      default:
        'Have questions about the placement process? Send us a message and our team will respond as soon as possible.',
      maxlength: 2000,
    },
    displayEmail: { type: String, default: 'support@placementpro.com', trim: true, maxlength: 200 },
    displayPhone: { type: String, default: '+1 (555) 000-0000', trim: true, maxlength: 80 },
    address: { type: String, default: '', maxlength: 500 },
    officeHours: { type: String, default: '', maxlength: 500 },
    testimonialQuote: {
      type: String,
      default:
        'The support team was incredibly helpful in resolving my profile verification issues!',
      maxlength: 800,
    },
    testimonialAuthor: { type: String, default: '— Student, CS Dept', trim: true, maxlength: 120 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('ContactPage', ContactPageSchema);
