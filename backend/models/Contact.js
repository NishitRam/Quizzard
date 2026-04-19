const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  subject: {
    type: String,
    default: 'General Inquiry'
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  storedVia: {
    type: String,
    default: 'Cloud'
  },
  timestamp: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  bufferCommands: false // Disable buffering to prevent clear timeout errors
});

module.exports = mongoose.model('Contact', ContactSchema);
