const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema({
  flid: Number,
  username: String,
  file_id: String,
  file_name: String,
  flash_card: [
    {
      question: String,
      answer: String,
    },
  ],
  tags: [String]
});

module.exports = mongoose.model('Flashcard', FlashcardSchema);
