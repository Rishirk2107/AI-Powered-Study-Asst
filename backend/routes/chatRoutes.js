const express = require('express');
const multer = require('multer');
const { uploadFile, askQuestion } = require('../controllers/chatController');

const router = express.Router();
const upload = multer({ dest: '../uploads/temp/' });

router.post('/upload', upload.single('file'), uploadFile);
router.post('/ask', askQuestion);

module.exports = router;
