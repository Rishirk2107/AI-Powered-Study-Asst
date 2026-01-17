const mongoose = require('mongoose');
const Counter = require('./Counter');

const scheduleSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  topic: { type: String, required: true },
  duration: { type: Number, required: true },
  details: { type: String },
  subtopics: { type: [String], default: [] },
  completed: { type: Boolean, default: false },
  delayed: { type: Boolean, default: false }
});

scheduleSchema.pre('save', async function (next) {
  const doc = this;

  if (doc.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: 'scheduleId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    doc.id = counter.seq;
  }

  next();
});

scheduleSchema.pre('insertMany', async function (next, docs) {
  try {
    for (const doc of docs) {
      const counter = await Counter.findOneAndUpdate(
        { id: 'scheduleId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      doc.id = counter.seq;
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
