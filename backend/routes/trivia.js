const express = require('express');
const router = express.Router();

// ─────────────────────────────────────────────
// Topic → API mapping configuration
// ─────────────────────────────────────────────
const TOPIC_CONFIG = {
  // QuizAPI.io tags (programming-specific)
  mongodb:    { source: 'quizapi', tag: 'MongoDB',    fallbackCategory: 18 },
  express:    { source: 'quizapi', tag: 'JavaScript', fallbackCategory: 18 },
  react:      { source: 'quizapi', tag: 'React',      fallbackCategory: 18 },
  node:       { source: 'quizapi', tag: 'NodeJS',     fallbackCategory: 18 },
  javascript: { source: 'quizapi', tag: 'JavaScript', fallbackCategory: 18 },
  html:       { source: 'quizapi', tag: 'HTML',       fallbackCategory: 18 },
  docker:     { source: 'quizapi', tag: 'Docker',     fallbackCategory: 18 },
  linux:      { source: 'quizapi', tag: 'Linux',      fallbackCategory: 18 },
  sql:        { source: 'quizapi', tag: 'SQL',        fallbackCategory: 18 },
  devops:     { source: 'quizapi', tag: 'DevOps',     fallbackCategory: 18 },
  // Open Trivia DB categories (general knowledge)
  computers:  { source: 'opentdb', category: 18 },
  math:       { source: 'opentdb', category: 19 },
  science:    { source: 'opentdb', category: 17 },
  general:    { source: 'opentdb', category: 9  },
  history:    { source: 'opentdb', category: 23 },
  geography:  { source: 'opentdb', category: 22 },
  sports:     { source: 'opentdb', category: 21 },
  videogames: { source: 'opentdb', category: 15 },
};

// ─────────────────────────────────────────────
// Normalize QuizAPI response → standard format
// ─────────────────────────────────────────────
function normalizeQuizAPI(data) {
  return data
    .map((q, idx) => {
      // QuizAPI answers come as { answer_a, answer_b, ... }
      const answerKeys = ['answer_a', 'answer_b', 'answer_c', 'answer_d', 'answer_e', 'answer_f'];
      const correctKeys = ['answer_a_correct', 'answer_b_correct', 'answer_c_correct', 'answer_d_correct', 'answer_e_correct', 'answer_f_correct'];

      const options = [];
      let correctIndex = 0;

      answerKeys.forEach((key, i) => {
        if (q.answers[key]) {
          if (q.correct_answers[correctKeys[i]] === 'true') {
            correctIndex = options.length;
          }
          options.push(q.answers[key]);
        }
      });

      // Skip questions with fewer than 2 options
      if (options.length < 2) return null;

      return {
        id: idx + 1,
        question: q.question,
        options,
        correct: correctIndex,
        explanation: q.explanation || `The correct answer is: ${options[correctIndex]}`,
      };
    })
    .filter(Boolean);
}

// ─────────────────────────────────────────────
// Normalize Open Trivia DB response → standard format
// ─────────────────────────────────────────────
function normalizeOpenTDB(data) {
  return data.map((q, idx) => {
    // Decode HTML entities
    const decode = (str) =>
      str
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&eacute;/g, 'é')
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"');

    const incorrect = q.incorrect_answers.map(decode);
    const correct = decode(q.correct_answer);

    // Shuffle correct answer into random position
    const options = [...incorrect];
    const correctIndex = Math.floor(Math.random() * (options.length + 1));
    options.splice(correctIndex, 0, correct);

    return {
      id: idx + 1,
      question: decode(q.question),
      options,
      correct: correctIndex,
      explanation: `The correct answer is: ${correct}`,
      difficulty: q.difficulty,
    };
  });
}

// ─────────────────────────────────────────────
// GET /api/trivia?topic=react&amount=10&difficulty=medium
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { topic = 'general', amount = 10, difficulty } = req.query;
  const topicKey = topic.toLowerCase();
  const config = TOPIC_CONFIG[topicKey];

  if (!config) {
    return res.status(400).json({
      success: false,
      error: `Unknown topic: "${topic}". Available: ${Object.keys(TOPIC_CONFIG).join(', ')}`,
    });
  }

  const count = Math.min(Math.max(parseInt(amount) || 10, 1), 20);

  try {
    let questions = [];

    // ── Try QuizAPI first (for programming topics) ──
    if (config.source === 'quizapi' && process.env.QUIZ_API_KEY) {
      try {
        const apiKey = process.env.QUIZ_API_KEY;
        let url = `https://quizapi.io/api/v1/questions?apiKey=${apiKey}&tags=${config.tag}&limit=${count}`;
        if (difficulty) url += `&difficulty=${difficulty}`;

        console.log(`🔮 Fetching from QuizAPI: tag=${config.tag}, limit=${count}`);
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          questions = normalizeQuizAPI(data);
          console.log(`✅ QuizAPI returned ${questions.length} questions`);
        } else {
          console.warn(`⚠️ QuizAPI responded with status ${response.status}`);
        }
      } catch (err) {
        console.warn(`⚠️ QuizAPI fetch failed: ${err.message}`);
      }
    }

    // ── Fallback to Open Trivia DB ──
    if (questions.length < 2) {
      try {
        const cat = config.category || config.fallbackCategory || 18;
        let url = `https://opentdb.com/api.php?amount=${count}&category=${cat}&type=multiple`;
        if (difficulty) url += `&difficulty=${difficulty}`;

        console.log(`🌐 Falling back to OpenTDB: category=${cat}, amount=${count}`);
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          if (data.response_code === 0 && data.results) {
            questions = normalizeOpenTDB(data.results);
            console.log(`✅ OpenTDB returned ${questions.length} questions`);
          }
        }
      } catch (err) {
        console.warn(`⚠️ OpenTDB fetch failed: ${err.message}`);
      }
    }

    // ── Return results ──
    if (questions.length > 0) {
      return res.json({
        success: true,
        source: questions.length > 0 ? 'api' : 'fallback',
        topic: topicKey,
        count: questions.length,
        questions,
      });
    }

    // If both APIs failed, return empty with message
    return res.json({
      success: true,
      source: 'fallback',
      topic: topicKey,
      count: 0,
      questions: [],
      message: 'External APIs unavailable. Use local fallback questions.',
    });
  } catch (err) {
    console.error('❌ Trivia route error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch questions' });
  }
});

// ── GET /api/trivia/topics — list available topics ──
router.get('/topics', (req, res) => {
  const topics = Object.entries(TOPIC_CONFIG).map(([key, config]) => ({
    id: key,
    source: config.source,
    tag: config.tag || null,
    category: config.category || config.fallbackCategory || null,
  }));
  res.json({ success: true, topics });
});

module.exports = router;
