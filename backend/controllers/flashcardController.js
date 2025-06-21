const Flashcard = require('../models/flashCard');

exports.getFlashcards = async (req, res) => {
  const flashcards = await Flashcard.find().sort({ flid: 1 });
  res.json(flashcards);
};
