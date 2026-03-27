const express = require('express');
const authenticateToken = require('../middleware/auth.middleware');
const {
  applyToJob,
  getStudentApplications,
  getJobApplicants,
  updateApplicationStatus,
  scheduleInterview,
  uploadOfferLetterEndpoint,
  respondToOffer,
} = require('../controllers/applicationController');
const uploadOfferLetter = require('../config/MulterOfferLetter');

const router = express.Router();

router.post('/apply/:jobId', authenticateToken, applyToJob);
router.get('/student', authenticateToken, getStudentApplications);
router.get('/job/:jobId', authenticateToken, getJobApplicants);
router.put('/status/:applicationId', authenticateToken, updateApplicationStatus);
router.put('/schedule-interview/:id', authenticateToken, scheduleInterview);
router.put('/upload-offer/:id', authenticateToken, uploadOfferLetter.single('offerLetter'), uploadOfferLetterEndpoint);
router.put('/respond-offer/:id', authenticateToken, respondToOffer);

module.exports = router;
