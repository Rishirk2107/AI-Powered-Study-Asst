const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Counter = require('./Counter');

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  username: String,
  email: { type: String, unique: true },
  password: String
});

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  if (user.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    user.userId = counter.seq;
  }

  next();
});

module.exports = mongoose.model('User', userSchema);
