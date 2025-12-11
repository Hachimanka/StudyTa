import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Lazy init function to ensure env vars are loaded
const getAIModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  return genAI.getGenerativeModel({ model: modelName });
};

// POST /api/ai
router.post("/", async (req, res) => {
  try {
    // Debug log for env
    console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Not Set');
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "No prompt provided" });

    const model = getAIModel();
    const result = await model.generateContent(prompt);
    let reply = "";
    try {
      reply = result?.response?.text?.() || "";
    } catch (e) {
      console.error("Gemini response parse error:", e);
      reply = "[Error: Could not parse Gemini response]";
    }
    if (!reply) reply = "[Error: No reply from Gemini AI]";
    res.json({ reply });
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "AI request failed", details: err?.message || err });
  }
});

// POST /api/ai/generate-questions
router.post("/generate-questions", async (req, res) => {
  try {
    const { text, mode, count } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const numQuestions = typeof count === 'number' && count > 0 ? count : 5;

    let prompt = "";
    if (mode === "multipleChoice") {
      prompt = `Generate ${numQuestions} multiple choice questions based on the following text. Return ONLY a JSON object with a "questions" array. Each question should have "question", "options" (array of 4 strings), "answer" (the correct string from options), and "explanation". Text: ${text.substring(0, 3000)}`;
    } else if (mode === "trueFalse") {
      prompt = `Generate ${numQuestions} true/false questions based on the following text. Return ONLY a JSON object with a "questions" array. Each question should have "question", "answer" (boolean true or false), and "explanation". Text: ${text.substring(0, 3000)}`;
    } else if (mode === "flashcards") {
      prompt = `Generate ${numQuestions} flashcards based on the following text. Return ONLY a JSON object with a "questions" array. Each item should have "front" (term/question) and "back" (definition/answer). Text: ${text.substring(0, 3000)}`;
    } else {
      return res.status(400).json({ error: "Invalid mode" });
    }

    const model = getAIModel();
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up markdown code blocks if present
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const json = JSON.parse(jsonStr);
    
    res.json(json);

  } catch (err) {
    console.error("AI Generate Questions Error:", err);
    res.status(500).json({ error: "Failed to generate questions", details: err.message });
  }
});

export default router;
