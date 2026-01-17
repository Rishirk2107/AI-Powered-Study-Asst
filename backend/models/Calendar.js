const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  topic: { type: String, required: true },
  duration: { type: Number, required: true },
  details: { type: String },
  subtopics: { type: [String], default: [] },
  completed: { type: Boolean, default: false },
  delayed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
