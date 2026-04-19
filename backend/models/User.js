const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: false, // Optional for social auth users
    minlength: 8,
    select: false,
  },
  googleId: String,
  githubId: String,
  avatar: {
    type: String,
    default: ''
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // Game Stats
  totalScore: { type: Number, default: 0 },
  weeklyScore: { type: Number, default: 0 },
  quizzesCompleted: { type: Number, default: 0 },
  highestStreak: { type: Number, default: 0 },
  lastQuizDate: { type: Date },
  // Detailed History
  history: [{
    topic: String,
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    passed: Boolean,
    date: { type: Date, default: Date.now }
  }],
  // Notifications
  notifications: [{
    message: String,
    type: { type: String, enum: ['success', 'info', 'warning'], default: 'info' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
