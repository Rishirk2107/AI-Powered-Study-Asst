const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadQuizPDF } = require('../controllers/quizController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads/temp');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadQuizPDF);

module.exports = router;
