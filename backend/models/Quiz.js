const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String }
});

const QuizSchema = new mongoose.Schema({
  subject: { type: String, required: true }, // e.g. "MongoDB", "React", "Node.js", "Express.js" (unique removed for custom quizzes)
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  iconColor: { type: String, default: '#4ade80' },
  authorName: { type: String, default: 'Quizzard DB' },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: [QuestionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);
