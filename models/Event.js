// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: String,
  date: Date,
  description: String,
  image: String, // ✅ Add image field for Cloudinary URL
  emailReminderSent: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Event', eventSchema);
