const express = require('express');
const router = express.Router();
const {
    getQuestions,
    submitTest,
    getResultsByUser,
    seedQuestions
} = require('../controllers/practiceTest.controller');
const authenticateToken = require('../middleware/auth.middleware');

// Public or seed
router.get('/seed', seedQuestions);

// Protected routes for taking & viewing tests
router.get('/questions', getQuestions);
router.post('/submit', authenticateToken, submitTest);
router.get('/results/:userId', authenticateToken, getResultsByUser);

module.exports = router;
