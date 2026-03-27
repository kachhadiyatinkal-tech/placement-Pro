const mongoose = require('mongoose');

const practiceTestResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    categoryBreakdown: {
        aptitude: { score: Number, total: Number },
        reasoning: { score: Number, total: Number },
        verbal: { score: Number, total: Number }
    },
    strongAreas: [String],
    weakAreas: [String],
    aiFeedback: { type: String },
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PracticeTestResult', practiceTestResultSchema);
