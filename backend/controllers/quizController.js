const { v4: uuidv4 } = require('uuid');
const { uploadFileToCloudinary } = require('../utils/cloudinaryUpload');
const axiosInstance = require('../utils/axiosInstance');
const Quiz = require('../models/Quiz');

exports.uploadQuizPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const uniqueName = uuidv4();
    const fileExtension = require('path').extname(req.file.originalname);
    const newFileName = `${uniqueName}${fileExtension}`;

    const cloudinaryResponse = await uploadFileToCloudinary(req.file.buffer, newFileName);
    const fileUrl = cloudinaryResponse.secure_url;

    const response = await axiosInstance.post('/api/quizbot/', {
      Path: fileUrl
    });

    const questions = response.data;

    if (!Array.isArray(questions)) {
      return res.status(500).json({ error: 'Invalid quiz format received from AI' });
    }

    const userId = req.user.userId;

    const quiz = await Quiz.create({
      userId,
      fileName: req.file.originalname,
      fileUrl,
      questions
    });

    res.json({ quizId: quiz._id, questions: quiz.questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Quiz generation failed' });
  }
};

exports.generateQuizFromPrompt = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.userId;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const response = await axiosInstance.post('/api/quizbot/text', {
      prompt
    });

    const questions = response.data;

    if (!Array.isArray(questions)) {
      return res.status(500).json({ error: 'Invalid quiz format received from AI' });
    }

    const quiz = await Quiz.create({
      userId,
      fileName: null,
      fileUrl: null,
      questions
    });

    res.json({ quizId: quiz._id, questions: quiz.questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Quiz generation from prompt failed' });
  }
};

exports.submitQuizAttempt = async (req, res) => {
  try {
    const { quizId, answers, durationSeconds } = req.body;
    const userId = req.user.userId;

    if (!quizId) {
      return res.status(400).json({ error: 'quizId is required' });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers must be an array' });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quiz.userId !== userId) {
      return res.status(403).json({ error: 'You are not allowed to submit this quiz' });
    }

    const totalQuestions = quiz.questions.length;

    let score = 0;

    const processedAnswers = quiz.questions.map((question, index) => {
      const incoming = answers.find(a => a.questionIndex === index);
      const isSkipped = !incoming || !!incoming.is_skipped;
      const selectedOption = !isSkipped && incoming.selectedOption ? incoming.selectedOption : null;
      const isCorrect = !isSkipped && selectedOption === question.answer;

      if (isCorrect) {
        score += 1;
      }

      return {
        questionIndex: index,
        selectedOption,
        isSkipped,
        isCorrect
      };
    });

    const accuracy = totalQuestions > 0 ? score / totalQuestions : 0;

    quiz.attempts.push({
      userId,
      answers: processedAnswers,
      score,
      accuracy,
      durationSeconds: typeof durationSeconds === 'number' ? durationSeconds : undefined
    });

    await quiz.save();

    res.json({
      score,
      totalQuestions,
      accuracy
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Quiz submission failed' });
  }
};
