const express = require('express');
const authenticateToken = require('../middleware/auth.middleware');
const {
  applyToJob,
  getStudentApplications,
  getJobApplicants,
  updateApplicationStatus,
} = require('../controllers/applicationController');

const router = express.Router();

router.post('/apply/:jobId', authenticateToken, applyToJob);
router.get('/student', authenticateToken, getStudentApplications);
router.get('/job/:jobId', authenticateToken, getJobApplicants);
router.put('/:applicationId/status', authenticateToken, updateApplicationStatus);

module.exports = router;
