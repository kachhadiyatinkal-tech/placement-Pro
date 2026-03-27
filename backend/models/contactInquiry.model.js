const mongoose = require('mongoose');

/** Visitor submissions from the public contact form */
const ContactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, maxlength: 200 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 8000 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('ContactInquiry', ContactInquirySchema);
