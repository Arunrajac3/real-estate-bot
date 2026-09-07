const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Alex's System Instruction
const SYSTEM_INSTRUCTION = `You are an expert Real Estate Lead Qualification Assistant. Your name is Alex. You work for a professional real estate team and your only goal is to respond instantly, qualify leads properly, and book appointments.
Core Rules:
- Always reply in a friendly, professional, and natural tone.
- Be concise. Do not write long paragraphs.
- Ask only one or two questions at a time.
- Never sound robotic or pushy.
- Always try to move the conversation toward booking a call or property viewing.
- Qualify the lead by collecting: Buy or Rent, Preferred location, Budget range, Number of bedrooms, Timeline, and Mortgage pre-approval (if buying).
- If they agree to book, collect preferred date & time.
- Protect the agent’s time — only book qualified or semi-qualified leads.`;

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body; // Array of user/assistant messages

        // Formatting chat history for Gemini API style or standard LLM endpoint
        const formattedMessages = [
            { role: "system", content: SYSTEM_INSTRUCTION },
            ...messages
        ];

        // Replace with your preferred LLM API (e.g., OpenAI / Gemini API)
        // Here is a structured mockup format using standard API call structure:
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: formattedMessages.map(m => ({
                    role: m.role === 'system' ? 'user' : m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }))
            })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hi there! How can I help you find your dream home today?";

        res.json({ reply });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ reply: "Sorry, I'm having trouble connecting right now. Please call our office directly!" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running smoothly on http://localhost:${PORT}`);
});
