const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  topic: { type: String, required: true },
  duration: { type: Number, required: true }
});

const calendarSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  entries: [scheduleSchema]
});

module.exports = mongoose.model('Calendar', calendarSchema);
