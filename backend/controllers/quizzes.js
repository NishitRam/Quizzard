const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');
const db = require('../utils/dataHandler');
const { writeData } = require('../utils/localDB');

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public
exports.getQuizzes = async (req, res) => {
  try {
    let quizzes = await db.find(Quiz, 'quizzes');

    // AUTO-SEED: If nothing found, try to seed automatically
    if (quizzes.length === 0) {
      console.log('🌱 No quizzes found. Triggering auto-seed...');
      const seedResult = await exports.seedQuizzesInternal();
      quizzes = seedResult.data;
    }

    return res.status(200).json({ 
      success: true, 
      count: quizzes.length, 
      data: quizzes,
      source: mongoose.connection.readyState === 1 ? 'cloud' : 'Local Ledger'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single quiz by ID
// @route   GET /api/quizzes/:id
// @access  Public
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await db.findById(Quiz, 'quizzes', req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    // Transform into standardized question format
    const formattedQuestions = quiz.questions.map((q, index) => ({
      id: index + 1,
      question: q.questionText,
      options: q.options,
      correct: q.options.indexOf(q.correctAnswer) !== -1 ? q.options.indexOf(q.correctAnswer) : 0,
      explanation: q.explanation || ''
    }));

    res.status(200).json({ 
      success: true, 
      data: {
        ...(quiz._doc || quiz),
        formattedQuestions
      } 
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new Quiz
// @route   POST /api/quizzes
// @access  Private
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, category, questions, difficulty } = req.body;
    
    if(!title || !category || !questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const quizData = {
      subject: category,
      title,
      description,
      difficulty: difficulty || 'Intermediate',
      authorName: req.user.fullName || 'Awesome Wizard',
      authorId: req.user._id || req.user.id,
      questions: questions.map(q => ({
        questionText: q.question,
        options: q.options,
        correctAnswer: q.options[q.correctAnswer] || q.correctAnswer,
        explanation: q.explanation || 'No explanation provided.'
      }))
    };

    const newQuiz = await db.create(Quiz, 'quizzes', quizData);
    
    return res.status(201).json({ 
      success: true, 
      data: newQuiz, 
      source: mongoose.connection.readyState === 1 ? 'cloud' : 'Local Ledger' 
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Internal seeding logic shared between route and auto-seed
exports.seedQuizzesInternal = async () => {
  const seedData = [
    {
      subject: 'MongoDB',
      title: 'MongoDB Fundamentals',
      description: 'Master the document database.',
      difficulty: 'Intermediate',
      questions: [
        { questionText: 'Standard insert method?', options: ['insertOne', 'add', 'push'], correctAnswer: 'insertOne' }
      ]
    },
    {
      subject: 'React',
      title: 'React Hooks',
      description: 'Functional component mastery.',
      difficulty: 'Advanced',
      questions: [
        { questionText: 'Mutable value hook?', options: ['useRef', 'useState'], correctAnswer: 'useRef' }
      ]
    }
  ];

  const isOnline = mongoose.connection.readyState === 1;

  if (isOnline) {
    await Quiz.deleteMany({});
    const quizzes = await Quiz.insertMany(seedData);
    // Sync local DB with seeded data (Plain Objects only)
    await writeData('quizzes', quizzes.map(q => q.toObject ? q.toObject() : q));
    return { success: true, count: quizzes.length, data: quizzes };
  } else {
    const localSeed = seedData.map((q, i) => ({
      _id: `q_seed_${i}`,
      ...q,
      createdAt: new Date().toISOString()
    }));
    await writeData('quizzes', localSeed);
    return { success: true, count: localSeed.length, data: localSeed };
  }
};

exports.seedQuizzes = async (req, res) => {
  try {
    const result = await exports.seedQuizzesInternal();
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
