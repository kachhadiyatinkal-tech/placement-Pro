const PracticeQuestion = require('../models/practiceQuestion.model');
const PracticeTestResult = require('../models/practiceTestResult.model');
const { getPracticeTestFeedback } = require('../services/practiceTestAI.service');

const getQuestions = async (req, res) => {
    try {
        const { category, limit = 10 } = req.query;
        const filter = category ? { category } : {};

        // Fetch random questions
        const questions = await PracticeQuestion.aggregate([
            { $match: filter },
            { $sample: { size: parseInt(limit) } }
        ]);

        if (questions.length === 0) {
            return res.status(404).json({ msg: 'No questions found for this category.' });
        }

        // Hide correct answers for the frontend test
        const sanitized = questions.map(q => {
            const { correctAnswer, ...rest } = q;
            return rest;
        });

        return res.status(200).json({ questions: sanitized });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server Error' });
    }
};

const submitTest = async (req, res) => {
    try {
        const { userId, answers } = req.body; // answers: [{ questionId, selectedOption }]

        if (!answers || answers.length === 0) {
            return res.status(400).json({ msg: 'No answers provided.' });
        }

        const questionIds = answers.map(a => a.questionId);
        const questions = await PracticeQuestion.find({ _id: { $in: questionIds } });

        let score = 0;
        const categoryStats = {
            Aptitude: { score: 0, total: 0 },
            Reasoning: { score: 0, total: 0 },
            Verbal: { score: 0, total: 0 }
        };

        answers.forEach(ans => {
            const q = questions.find(question => question._id.toString() === ans.questionId);
            if (q) {
                categoryStats[q.category].total++;
                if (q.correctAnswer === ans.selectedOption) {
                    score++;
                    categoryStats[q.category].score++;
                }
            }
        });

        const totalQuestions = answers.length;
        const accuracy = (score / totalQuestions) * 100;

        const strongAreas = [];
        const weakAreas = [];

        Object.keys(categoryStats).forEach(cat => {
            const stats = categoryStats[cat];
            if (stats.total > 0) {
                const catAccuracy = (stats.score / stats.total) * 100;
                if (catAccuracy >= 70) strongAreas.push(cat);
                else if (catAccuracy < 40) weakAreas.push(cat);
            }
        });

        // AI Feedback
        const aiFeedback = await getPracticeTestFeedback(score, totalQuestions, accuracy.toFixed(1), strongAreas, weakAreas);

        const result = new PracticeTestResult({
            userId,
            score,
            totalQuestions,
            accuracy: accuracy.toFixed(2),
            categoryBreakdown: {
                aptitude: categoryStats.Aptitude,
                reasoning: categoryStats.Reasoning,
                verbal: categoryStats.Verbal
            },
            strongAreas,
            weakAreas,
            aiFeedback
        });

        await result.save();
        return res.status(201).json({ result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server Error' });
    }
};

const getResultsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const results = await PracticeTestResult.find({ userId }).sort({ submittedAt: -1 });
        return res.status(200).json({ results });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server Error' });
    }
};

// Seed questions if DB is empty
const seedQuestions = async (req, res) => {
    try {
        const count = await PracticeQuestion.countDocuments();
        if (count > 0) return res.json({ msg: 'DB already has questions.' });

        const initial = [
            { question: "What is 15% of 200?", options: ["20", "30", "40", "50"], correctAnswer: "30", category: "Aptitude", difficulty: "Easy" },
            { question: "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are Lazzies?", options: ["True", "False", "Partially True", "Cannot be determined"], correctAnswer: "True", category: "Reasoning", difficulty: "Medium" },
            { question: "Which word is a synonym for 'Abundant'?", options: ["Scant", "Plentiful", "Rare", "Ugly"], correctAnswer: "Plentiful", category: "Verbal", difficulty: "Easy" },
            { question: "Find the next number in the series: 2, 6, 12, 20, ?", options: ["28", "30", "32", "34"], correctAnswer: "30", category: "Aptitude", difficulty: "Medium" },
            { question: "Identify the correctly spelled word:", options: ["Accomodate", "Acommodate", "Accommodate", "Accomodait"], correctAnswer: "Accommodate", category: "Verbal", difficulty: "Medium" }
        ];

        await PracticeQuestion.insertMany(initial);
        return res.json({ msg: 'Seeded 5 initial questions.' });
    } catch (err) {
        return res.status(500).json({ msg: 'Seed Error' });
    }
};

module.exports = {
    getQuestions,
    submitTest,
    getResultsByUser,
    seedQuestions
};
