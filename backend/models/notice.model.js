const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  sender_role: { type: String, enum: ['student', 'tpo', 'tpo_admin', 'management', 'management_admin'], required: true },
  receiver_role: { type: String, enum: ['student', 'tpo', 'tpo_admin', 'management', 'management_admin'], required: true },
  title: { type: String },
  message: { type: String, required: true },
  attachments: [
    {
      filename: { type: String },
      url: { type: String },
      mimetype: { type: String },
      size: { type: Number },
    },
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', NoticeSchema,'notices');
