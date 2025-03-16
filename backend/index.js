const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const songs = require('./songs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


app.get('/generate-snippet', async (req, res) => {
  try {
    const currentSong = songs[Math.floor(Math.random() * songs.length)];
    const songTitle = currentSong.split(' - ')[0];

    // ✅ Use 'gemini-1.5-pro' or 'gemini-pro' based on the listModels output
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Generate 2-4 lines of lyrics inspired by the song "${songTitle}". Do NOT mention the song title directly.`;

    const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      });
      
      console.log('Result:', JSON.stringify(result, null, 2)); // ✅ Log the whole response
      
      const snippet = result.response.candidates[0].content.parts[0].text;
      

    res.json({ snippet,currentSong });
  } catch (error) {
    console.error('Error generating snippet:', error.message);
    res.status(500).json({ error: 'Failed to generate snippet' });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
