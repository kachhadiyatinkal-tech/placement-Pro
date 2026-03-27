const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authenticateToken = require('../middleware/auth.middleware');
const requireAdminManagementOrTpo = require('../middleware/requireAdminManagementOrTpo.middleware');

// Apply middleware to all routes
router.use(authenticateToken);
router.use(requireAdminManagementOrTpo);

router.get('/overview', analyticsController.getOverview);
router.get('/placement-trends', analyticsController.getPlacementTrends);
router.get('/company-stats', analyticsController.getCompanyStats);
router.get('/branch-stats', analyticsController.getBranchStats);

module.exports = router;
