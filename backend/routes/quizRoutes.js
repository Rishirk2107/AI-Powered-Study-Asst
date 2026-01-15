const express = require('express');
const multer = require('multer');
const { uploadQuizPDF } = require('../controllers/quizController');

const router = express.Router();

// Use memory storage instead of disk storage to avoid local file writes
const upload = multer();

router.post('/upload', upload.single('file'), uploadQuizPDF);

module.exports = router;
