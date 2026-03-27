const { GoogleGenerativeAI } = require('@google/generative-ai');

async function getPracticeTestFeedback(score, total, accuracy, strongAreas, weakAreas) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "AI Feedback is currently unavailable (API key not set).";

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      As a career coach for a college placement platform, provide a short, encouraging, and useful feedback for a student who just finished a practice test.
      
      Results:
      - Score: ${score}/${total}
      - Accuracy: ${accuracy}%
      - Strong Areas: ${strongAreas.join(', ') || 'N/A'}
      - Weak Areas: ${weakAreas.join(', ') || 'None identified yet'}

      Keep the response under 100 words. Focus on how to improve the weak areas.
    `;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Gemini feedback error:", error);
        return "Great job completing the test! Keep practicing to improve your speed and accuracy in weak areas.";
    }
}

module.exports = { getPracticeTestFeedback };
