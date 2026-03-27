const multer = require('multer');
const path = require('path');
const fs = require('fs');

const noticeAttachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/noticeAttachments/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const uploadNoticeAttachments = multer({
  storage: noticeAttachmentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|png|jpg|jpeg|gif|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /application\/pdf|image\/png|image\/jpe?g|image\/gif|image\/webp/.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    return cb(new Error('Only PDF and image files are allowed.'));
  },
});

module.exports = uploadNoticeAttachments;
