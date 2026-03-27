const mongoose = require('mongoose');
const Notice = require('../../models/notice.model');

const SendNotice = async (req, res) => {
  try {
    if (!req.body.receiver_role) var receiver_role = "student";
    else var receiver_role = req.body.receiver_role;

    const sender_role = req.body.sender_role;
    const title = req.body.title;
    const message = req.body.message;
    const sender = new mongoose.Types.ObjectId(req.body.sender);

    const attachments = Array.isArray(req.files)
      ? req.files.map((file) => ({
          filename: file.filename,
          url: `/noticeAttachments/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size,
        }))
      : [];

    await Notice.create({ sender, sender_role, receiver_role, title, message, attachments });
    return res.json({ msg: "Notice Sended Successfully!" });
  } catch (error) {
    console.log('error in notice.controller.js => ', error);
    return res.json({ msg: "Internal Server Error!" });
  }
}

const GetAllNotice = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    return res.json(notices);
  } catch (error) {
    console.log('error in notice.controller.js => ', error);
    return res.json({ msg: "Internal Server Error!" });
  }
}

const GetNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.query.noticeId);
    return res.json(notice);
  } catch (error) {
    console.log('error in notice.controller.js => ', error);
    return res.json({ msg: "Internal Server Error!" });
  }
}

// Get notices by receiver role (student, tpo, management)
const GetNoticesByReceiver = async (req, res) => {
  try {
    let receiver_role = req.query.receiver_role;
    if (!receiver_role) {
      return res.status(400).json({ msg: "receiver_role query is required" });
    }
    const roles = typeof receiver_role === 'string' && receiver_role.includes(',')
      ? receiver_role.split(',').map(r => r.trim())
      : Array.isArray(receiver_role) ? receiver_role : [receiver_role];
    const notices = await Notice.find({ receiver_role: { $in: roles } })
      .sort({ createdAt: -1 })
      .populate('sender', 'first_name email');
    return res.json(notices);
  } catch (error) {
    console.log('error in notice.controller.js GetNoticesByReceiver => ', error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
}

const DeleteNotice = async (req, res) => {
  try {
    if (!req.query.noticeId) return res.json({ msg: "Error while deleting notice!" });
    await Notice.findByIdAndDelete(req?.query?.noticeId);
    return res.json({ msg: "Notice Deleted Successfully!" });
  } catch (error) {
    console.log('error in notice.controller.js => ', error);
    return res.json({ msg: "Internal Server Error!" });
  }
}

const UpdateNotice = async (req, res) => {
  try {
    const noticeId = req.body.noticeId || req.query.noticeId;
    if (!noticeId) return res.status(400).json({ msg: 'noticeId is required' });

    const notice = await Notice.findById(noticeId);
    if (!notice) return res.status(404).json({ msg: 'Notice not found' });

    const diffMs = Date.now() - new Date(notice.createdAt).getTime();
    if (diffMs > 5 * 60 * 1000) {
      return res.status(403).json({ msg: 'Notice can only be updated within 5 minutes.' });
    }

    if (typeof req.body.title === 'string') notice.title = req.body.title;
    if (typeof req.body.message === 'string') notice.message = req.body.message;
    if (typeof req.body.receiver_role === 'string') notice.receiver_role = req.body.receiver_role;
    await notice.save();
    return res.json({ msg: 'Notice updated successfully', notice });
  } catch (error) {
    console.log('error in notice.controller.js UpdateNotice => ', error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
}

module.exports = {
  SendNotice,
  GetAllNotice,
  DeleteNotice,
  GetNotice,
  GetNoticesByReceiver,
  UpdateNotice,
};