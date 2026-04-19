const express = require('express');
const { getQuizzes, getQuizById, seedQuizzes, createQuiz } = require('../controllers/quizzes');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getQuizzes);
router.post('/seed', seedQuizzes);   // MUST be before /:id
router.get('/:id', getQuizById);
router.post('/', protect, createQuiz);

module.exports = router;
