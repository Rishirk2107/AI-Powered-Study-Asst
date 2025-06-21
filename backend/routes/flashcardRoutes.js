const express = require('express');
const router = express.Router();
const { getFlashcards } = require('../controllers/flashcardController');

router.get('/', getFlashcards);

module.exports = router;
