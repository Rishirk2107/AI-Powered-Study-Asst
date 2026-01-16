const dotenv = require('dotenv');

// Load environment variables FIRST, before any other requires
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const authMiddleware = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const materialRoutes = require('./routes/materialRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const chatRoutes = require('./routes/chatRoutes');
const quizRoutes = require('./routes/quizRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

// Initialize cron jobs
require('./cronSchedule');

// Log env var to confirm it was loaded
console.log('[Server] GENAI_API_BASE_URL:', process.env.GENAI_API_BASE_URL || '(not set)');

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://ai.rishinex.tech",
      "https://rishinex.tech",
      "https://apsa.py.rishinex.tech"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// // 🔴 THIS IS CRITICAL
// app.options("/*", cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});


app.use('/api/auth', authRoutes);

app.use('/api/materials', authMiddleware, materialRoutes);
app.use('/api/flashcards', authMiddleware, flashcardRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/quiz', authMiddleware, quizRoutes);
app.use('/api/schedule', authMiddleware, scheduleRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(process.env.PORT, () =>
        console.log(`Server running on port ${process.env.PORT}`)
    );
});
