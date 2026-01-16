const mongoose = require('mongoose');

// New Schedule schema (separate model)
const scheduleSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  topic: { type: String, required: true },
  duration: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  delayed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
