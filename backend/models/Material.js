const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  username: String,
  file_id: String,
  file_name: String,
  upload_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Material', materialSchema);
