const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

// 📌 Creates Gemini model instance with or without system instructions
function getModel(type = "default") {
  if (type === "review") {
    return genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `
You are an AI assistant designed to help users navigate and interact with an EdTech platform.

Your role is to:
- Answer user queries
- Guide to sections (courses, enroll, account, etc.)
- Provide helpful, friendly, and concise responses
- Include relevant links (e.g. /courses or /dashboard)

Be interactive and act like a smart helper.
Example:
User: What courses do you offer?
AI: You can explore all our programming, data science, and AI courses here: /courses
`
    });
  }

  // No system instruction — pure prompt based (used for answer evaluation)
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

// 🧠 main service function
async function aiService(prompt, type = "default") {
  const model = getModel(type);
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = aiService;
