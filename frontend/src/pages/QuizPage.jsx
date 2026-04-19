import React from 'react';
import Quiz from '../components/Quiz';

/**
 * QuizPage — Parses the dynamic hash route and launches the Quiz.
 *
 * Route format: #quiz/{topic}?difficulty={d}&amount={n}
 *   e.g. #quiz/react?difficulty=hard&amount=10
 *
 * Props:
 *   routeRaw  (string) — raw hash without '#', e.g. "quiz/react?difficulty=hard&amount=10"
 *             If absent, defaults to a general MERN mixed quiz.
 */
export default function QuizPage({ routeRaw }) {
  // Parse topic, difficulty, amount from the route string
  let topic      = 'mern';
  let difficulty = 'medium';
  let amount     = 10;

  if (routeRaw) {
    // Strip leading "quiz/"
    const withoutPrefix = routeRaw.replace(/^quiz\//, '');
    const [topicPart, queryPart] = withoutPrefix.split('?');

    topic = topicPart || 'mern';

    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      difficulty   = params.get('difficulty') || 'medium';
      amount       = parseInt(params.get('amount')) || 10;
    }
  }

  const topicLabel = {
    mongodb: 'MongoDB',
    express: 'Express.js',
    react:   'React.js',
    node:    'Node.js',
    js:      'JavaScript',
    sql:     'SQL & Databases',
    mern:    'Full MERN Stack'
  }[topic] || 'MERN Stack';

  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <div className="quiz-page-wrapper">

      {/* Page Header */}
      <div className="quiz-page-header">
        <button
          className="back-to-browse"
          onClick={() => { window.location.hash = 'browse'; }}
        >
          ← Back to Topics
        </button>
        <div className="header-meta">
          <h1 className="header-title">{topicLabel} Challenge ⚡</h1>
          <p className="header-subtitle">{diffLabel} difficulty · {amount} questions · 30s per question</p>
        </div>
      </div>

      {/* Quiz Component */}
      <main className="quiz-main">
        <Quiz topic={topic} difficulty={difficulty} amount={amount} />
      </main>

      <style>{`
        .quiz-page-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #1a202c 100%);
          padding: 2rem 1rem 4rem;
          color: white;
        }

        .quiz-page-header {
          max-width: 780px;
          margin: 0 auto 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .back-to-browse {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 0.5rem 1.1rem;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: background 0.2s;
          white-space: nowrap;
          font-family: 'Outfit', sans-serif;
        }
        .back-to-browse:hover { background: rgba(255,255,255,0.18); }

        .header-title {
          font-family: 'Fredoka', sans-serif;
          font-size: 2rem;
          margin: 0;
          background: linear-gradient(to right, #667eea, #f093fb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-subtitle {
          color: rgba(255,255,255,0.6);
          font-size: 0.9rem;
          margin: 0.25rem 0 0;
        }

        .quiz-main {
          animation: slideIn 0.5s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .header-title { font-size: 1.5rem; }
          .quiz-page-wrapper { padding: 1.5rem 0.75rem 3rem; }
        }
      `}</style>
    </div>
  );
}
