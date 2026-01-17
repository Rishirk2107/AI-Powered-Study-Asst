const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedOption: { type: String, default: null },
    isSkipped: { type: Boolean, required: true },
    isCorrect: { type: Boolean, required: true }
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, required: true },
    accuracy: { type: Number, required: true }
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], default: [] },
    answer: { type: String, required: true }
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema({
  userId: { type: Number, required: true, index: true },
  fileName: { type: String },
  fileUrl: { type: String },
  questions: { type: [questionSchema], default: [] },
  attempts: { type: [attemptSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);

