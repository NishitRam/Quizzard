const express = require('express');
const router = express.Router();
const MERN_QUESTIONS = require('../data/mernQuestions');

/**
 * ─────────────────────────────────────────────────────────────
 * Helper: Fisher-Yates Shuffle
 * ─────────────────────────────────────────────────────────────
 */
const shuffle = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * ─────────────────────────────────────────────────────────────
 * GET /api/quiz
 *
 * Fetches dynamic MERN quiz questions from the curated pool.
 *
 * Query Parameters:
 *   @param {string} topic      - 'mongodb' | 'express' | 'react' | 'node' | 'js' | 'mern'
 *   @param {string} difficulty - 'easy' | 'medium' | 'hard' | 'all'
 *   @param {number} amount     - Number of questions (default: 10)
 *
 * Example: GET /api/quiz?topic=react&difficulty=medium&amount=10
 * ─────────────────────────────────────────────────────────────
 */
router.get('/', async (req, res) => {
  try {
    const { topic = 'mern', difficulty = 'all', amount = 10 } = req.query;
    const numAmount = Math.min(Math.max(parseInt(amount) || 10, 1), 20);

    console.log(`📡 Fetching quiz — topic: ${topic}, difficulty: ${difficulty}, amount: ${numAmount}`);

    // 1. Filter by topic
    let pool = topic === 'mern'
      ? MERN_QUESTIONS
      : MERN_QUESTIONS.filter(q => q.topic === topic);

    // 2. Filter by difficulty
    if (difficulty !== 'all') {
      const diffPool = pool.filter(q => q.difficulty === difficulty);
      // Fall back to full topic pool if difficulty filter yields too few
      pool = diffPool.length >= numAmount ? diffPool : pool;
    }

    if (pool.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions found for topic "${topic}" and difficulty "${difficulty}".`
      });
    }

    // 3. Shuffle pool and pick the requested amount
    const shuffled = shuffle(pool).slice(0, numAmount);

    // 4. Shuffle options for each question too
    const questions = shuffled.map(q => ({
      question: q.question,
      options: shuffle(q.options),
      correctAnswer: q.correctAnswer,
      topic: q.topic,
      difficulty: q.difficulty
    }));

    res.json({
      success: true,
      topic,
      difficulty,
      count: questions.length,
      questions
    });

  } catch (err) {
    console.error('❌ Dynamic Quiz Route Error:', err);
    res.status(500).json({
      success: false,
      message: 'The quiz realm is currently unstable.',
      error: err.message
    });
  }
});

/**
 * ─────────────────────────────────────────────────────────────
 * GET /api/quiz/webdev
 *
 * Legacy route kept for backward compat with the old Quiz.jsx
 * Fetches a general MERN mixed quiz (10 questions, mixed diff)
 * ─────────────────────────────────────────────────────────────
 */
router.get('/webdev', async (req, res) => {
  try {
    const shuffled = shuffle(MERN_QUESTIONS).slice(0, 10).map(q => ({
      question: q.question,
      options: shuffle(q.options),
      correctAnswer: q.correctAnswer
    }));

    res.json({ success: true, questions: shuffled });
  } catch (err) {
    console.error('❌ Legacy WebDev Quiz Error:', err);
    res.status(500).json({ success: false, message: 'Backend error.', error: err.message });
  }
});

module.exports = router;
