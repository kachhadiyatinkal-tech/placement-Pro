const mongoose = require('mongoose');

const practiceQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    category: {
        type: String,
        enum: ['Aptitude', 'Reasoning', 'Verbal'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    explanation: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PracticeQuestion', practiceQuestionSchema);
