const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Case = require('./models/Case');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 Connected to MongoDB Compass successfully!"))
  .catch((err) => console.log("🔴 Database connection error:", err));

app.get('/api/case', async (req, res) => {
  try {
    const activeCase = await Case.findOne();
    res.json(activeCase);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch case data." });
  }
});

app.post('/api/interrogate', async (req, res) => {
  const { question } = req.body;

  try {
    const caseData = await Case.findOne();
    if (!caseData) return res.status(404).json({ answer: "No active case found." });

    const promptText = `
You are Detective Chronos, an elite AI Lead Investigator.
Use strictly the following MongoDB Ground Truth evidence to answer the user's question:

CASE TITLE: ${caseData.title}
DESCRIPTION: ${caseData.description}

SUSPECTS:
${JSON.stringify(caseData.suspects, null, 2)}

EVIDENCE FOUND AT SCENE:
${JSON.stringify(caseData.evidence, null, 2)}

RULES:
1. Stay strictly in character as a sharp crime detective.
2. Base your reasoning standard ONLY on the evidence provided above. Never invent facts.
3. Be analytical, precise, and encouraging to the assistant detective user.

User Question: ${question}
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Using gemini-3.5-flash-lite for instant, zero-congestion availability
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await apiResponse.json();

    if (data.error) {
      console.error("🔴 Gemini API Error:", data.error);
      return res.json({ answer: `API Error: ${data.error.message}` });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return res.json({ answer: "Detective Chronos received an empty response." });
    }

    res.json({ answer: aiText });
  } catch (err) {
    console.error("🔴 Server Exception:", err);
    res.status(500).json({ answer: `Server exception: ${err.message}` });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AI Interrogation Room Backend active on http://localhost:${PORT}`);
});