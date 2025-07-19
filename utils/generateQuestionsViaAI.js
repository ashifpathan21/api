const aiService = require("./ai.service");

async function generateQuestionsViaAI({
  topic,
  difficulty,
  numberOfQuestions,
  questionType,
}) {
  const prompt = `
You are a smart EdTech AI generator.

Generate ${numberOfQuestions} ${
    questionType === "MIXED" ? "" : questionType
  } questions 
on the topic of "${topic}" with ${difficulty} difficulty.

Each question should follow this JSON format:

{
  "questionText": "Question here?",
  "questionType": "MCQ" | "NUMERIC" | "WRITTEN",
  "options": ["option1", "option2", "option3", "option4"], // for MCQ only
  "correctOptionIndex": 0, // for MCQ only
  "correctAnswer": "Correct answer (for NUMERIC/WRITTEN)",
  "aiFeedback": "Feedback if answer is written (WRITTEN only)",
  "points": 2
}

Output a JSON array of ${numberOfQuestions} questions only. No extra commentary or markdown formatting.
`;

  const raw = await aiService(prompt);

  // Remove markdown backticks if present
  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
   // console.error("❌ Failed to parse AI response:", err);
    //console.log("⚠️ Raw response:", raw);
    return [];
  }
}

module.exports = generateQuestionsViaAI;
