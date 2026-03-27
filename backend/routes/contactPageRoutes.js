const express = require('express');
const authenticateToken = require('../middleware/auth.middleware');
const requireAdminManagementOrTpo = require('../middleware/requireAdminManagementOrTpo.middleware');
const {
  getContactPage,
  updateContactPage,
  postContactInquiry,
} = require('../controllers/contactPage.controller');

const router = express.Router();

router.get('/page', getContactPage);
router.post('/inquiry', postContactInquiry);
router.put('/page', authenticateToken, requireAdminManagementOrTpo, updateContactPage);

module.exports = router;
