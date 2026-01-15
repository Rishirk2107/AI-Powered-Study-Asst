const express = require('express');
const { uploadFile, askQuestion } = require('../controllers/chatController');
const multer = require('multer');
const path = require('path');

const router = express.Router();


// Use memory storage for multer
const upload = multer();

router.post('/upload', upload.single('file'), uploadFile);
router.post('/ask', askQuestion);

module.exports = router;
