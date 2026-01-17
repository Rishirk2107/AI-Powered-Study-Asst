const express = require('express');
const multer = require('multer');
const { uploadQuizPDF, submitQuizAttempt, generateQuizFromPrompt } = require('../controllers/quizController');

const router = express.Router();

const upload = multer();

router.post('/upload', upload.single('file'), uploadQuizPDF);
router.post('/submit', submitQuizAttempt);
router.post('/from-prompt', generateQuizFromPrompt);

module.exports = router;
