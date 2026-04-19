import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useQuiz } from '../context/QuizContext';

const API_BASE = 'http://localhost:5000/api';

// Topic metadata for the results card
const TOPIC_META = {
  mongodb:  { label: 'MongoDB',         icon: '🍃', color: '#11998e' },
  express:  { label: 'Express.js',      icon: '⚡', color: '#636e72' },
  react:    { label: 'React.js',        icon: '⚛️', color: '#0984e3' },
  node:     { label: 'Node.js',         icon: '🟢', color: '#00b09b' },
  js:       { label: 'JavaScript',      icon: '🟨', color: '#f7971e' },
  sql:      { label: 'SQL & Databases', icon: '🗄️', color: '#ec4899' },
  mern:     { label: 'Full MERN Stack', icon: '🧙‍♂️', color: '#667eea' },
  'web-dev-challenge': { label: 'Web Dev Challenge', icon: '🌐', color: '#667eea' }
};

const TIMER_PER_Q = 30; // seconds per question

/**
 * Quiz Component — Dynamic MERN Quiz Player
 */
export default function Quiz({ topic = 'mern', difficulty = 'medium', amount = 10 }) {
  const { addQuizResult } = useQuiz();

  // ── Quiz data state ──
  const [questions,     setQuestions]     = useState([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [score,         setScore]         = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [quizFinished,  setQuizFinished]  = useState(false);

  // ── Interaction state ──
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered,     setIsAnswered]     = useState(false);
  const [timeLeft,       setTimeLeft]       = useState(TIMER_PER_Q);
  const [feedback,       setFeedback]       = useState(null); // 'correct' | 'incorrect'

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    setQuizFinished(false);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(TIMER_PER_Q);
    setFeedback(null);

    try {
      const res = await axios.get(`${API_BASE}/quiz`, {
        params: { topic, difficulty, amount }
      });

      if (res.data.success && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
      } else {
        throw new Error('No questions returned from the server.');
      }
    } catch (err) {
      console.error('Quiz fetch error:', err);
      setError('Failed to summon questions. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [topic, difficulty, amount]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (loading || error || quizFinished || isAnswered) return;
    if (timeLeft === 0) {
      handleAnswer(null);
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, loading, error, quizFinished, isAnswered]);

  const handleAnswer = (option) => {
    if (isAnswered) return;

    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correctAnswer;

    setSelectedOption(option);
    setIsAnswered(true);
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsAnswered(false);
        setSelectedOption(null);
        setTimeLeft(TIMER_PER_Q);
        setFeedback(null);
      } else {
        handleFinish(newScore);
      }
    }, 1800);
  };

  const handleFinish = (finalScore) => {
    setQuizFinished(true);
    const percentage = Math.round((finalScore / questions.length) * 100);
    const meta = TOPIC_META[topic] || TOPIC_META['mern'];

    addQuizResult({
      topic: meta.label,
      icon: meta.icon,
      color: meta.color,
      score: percentage,
      totalQuestions: questions.length,
      correctAnswers: finalScore,
      timeTaken: `${Math.round(questions.length * TIMER_PER_Q / 60)} min`
    });
  };

  if (loading) return (
    <div className="quiz-loader-premium">
      <div className="wizard-aura">✨</div>
      <p>Consulting the Ancient Scrolls...</p>
      <div className="progress-bar-loading">
        <div className="pb-fill"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="quiz-error-premium">
      <div className="error-orb">🔮</div>
      <h3>Magical Interference Detected</h3>
      <p>{error}</p>
      <button onClick={fetchQuestions} className="p-retry-btn">Try Re-Casting</button>
    </div>
  );

  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const meta = TOPIC_META[topic] || TOPIC_META['mern'];
    const grade =
      percentage >= 90 ? { label: 'Legendary Master 👑', color: '#10b981' } :
      percentage >= 70 ? { label: 'Skilled Wizard 🧙‍♂️', color: '#3b82f6' } :
      percentage >= 50 ? { label: 'Growing Apprentice 🌱', color: '#f59e0b' } :
                         { label: 'Keep Practicing 📖', color: '#ef4444' };

    return (
      <div className="quiz-results-premium animate-fade-in">
        <div className="results-card-p premium-card">
          <div className="results-badge-p" style={{ background: `${meta.color}20`, color: meta.color }}>
            {meta.icon} {meta.label}
          </div>
          
          <div className="results-visual-p">
            <svg viewBox="0 0 100 100" className="circular-progress-p">
              <circle cx="50" cy="50" r="45" className="cp-bg" />
              <circle cx="50" cy="50" r="45" className="cp-fill" style={{
                stroke: grade.color,
                strokeDasharray: `${(percentage / 100) * 283} 283`
              }} />
            </svg>
            <div className="score-number-p">{percentage}%</div>
          </div>

          <h2 className="grade-label-p" style={{ color: grade.color }}>{grade.label}</h2>

          <div className="stats-row-p">
            <div className="stat-box-p">
              <span className="s-val">{score}</span>
              <span className="s-key">Correct</span>
            </div>
            <div className="stat-box-p">
              <span className="s-val">{questions.length - score}</span>
              <span className="s-key">Incorrect</span>
            </div>
            <div className="stat-box-p">
              <span className="s-val">{questions.length}</span>
              <span className="s-key">Total</span>
            </div>
          </div>

          <div className="actions-row-p">
            <button onClick={fetchQuestions} className="p-btn primary">🔄 Try Again</button>
            <button onClick={() => window.location.hash = 'dashboard'} className="p-btn secondary">🏠 Guild House</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const progressPct = ((currentIndex + 1) / questions.length) * 100;
  const timerPct    = (timeLeft / TIMER_PER_Q) * 100;
  const timerColor  = timeLeft > 10 ? 'var(--primary)' : '#ef4444';
  const meta        = TOPIC_META[topic] || TOPIC_META['mern'];

  return (
    <div className="quiz-player-premium">
      <div className="player-header">
        <div className="player-topic-box">
          <span className="t-icon">{meta.icon}</span>
          <span className="t-name">{meta.label}</span>
        </div>
        <div className="player-progress-box">
          Quest {currentIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="master-progress-track">
        <div className="mp-fill" style={{ width: `${progressPct}%`, background: meta.color }}></div>
      </div>

      <div className="question-theater premium-card">
        <div className="theater-top">
          <div className="difficulty-pill" data-level={currentQ.difficulty}>
            {currentQ.difficulty.toUpperCase()}
          </div>
          <div className="timer-pill" style={{ color: timerColor }}>
            <span className="timer-icon">⏳</span>
            {timeLeft}s
          </div>
        </div>

        <h3 className="question-display">{currentQ.question}</h3>

        <div className="options-grid">
          {currentQ.options.map((opt, idx) => {
            let state = '';
            if (isAnswered) {
              if (opt === currentQ.correctAnswer) state = 'correct';
              else if (opt === selectedOption) state = 'wrong';
              else state = 'muted';
            }
            return (
              <button
                key={idx}
                className={`option-tile ${state}`}
                onClick={() => handleAnswer(opt)}
                disabled={isAnswered}
              >
                <div className="option-index">{String.fromCharCode(65 + idx)}</div>
                <div className="option-content">{opt}</div>
                {state === 'correct' && <div className="state-icon">✅</div>}
                {state === 'wrong' && <div className="state-icon">❌</div>}
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className={`feedback-overlay-p ${feedback}`}>
          {feedback === 'correct' ? 'EXCELLENT! +10 XP' : 'OOF! WRONG SCROLL'}
        </div>
      )}

      <style>{`
        .quiz-player-premium { max-width: 850px; margin: 0 auto; padding: 2rem 1.5rem; }

        .player-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .player-topic-box { display: flex; align-items: center; gap: 0.75rem; font-weight: 800; color: var(--text-main); }
        .player-progress-box { color: var(--text-muted); font-weight: 700; font-size: 0.9rem; }

        .master-progress-track { height: 8px; background: var(--bg-card); border-radius: 4px; overflow: hidden; margin-bottom: 2rem; border: 1px solid var(--border-light); }
        .mp-fill { height: 100%; transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }

        .question-theater { padding: 3rem; position: relative; }
        .theater-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        
        .difficulty-pill { padding: 0.4rem 1rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 900; letter-spacing: 1px; background: var(--bg-app); }
        .difficulty-pill[data-level="easy"] { color: #10b981; }
        .difficulty-pill[data-level="medium"] { color: #f59e0b; }
        .difficulty-pill[data-level="hard"] { color: #ef4444; }

        .timer-pill { font-weight: 900; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; }

        .question-display { font-family: 'Fredoka', sans-serif; font-size: 1.8rem; color: var(--text-main); margin-bottom: 2.5rem; line-height: 1.3; }

        .options-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        .option-tile { 
          display: flex; align-items: center; padding: 1.25rem; border-radius: 1.25rem; background: var(--bg-app); 
          border: 2px solid var(--border-light); cursor: pointer; transition: 0.3s; text-align: left; position: relative;
        }
        .option-tile:hover:not(:disabled) { transform: translateY(-3px) scale(1.01); border-color: var(--primary); box-shadow: var(--shadow-sm); }
        
        .option-index { width: 40px; height: 40px; background: var(--bg-card); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary); margin-right: 1.5rem; flex-shrink: 0; }
        .option-content { font-size: 1rem; font-weight: 700; color: var(--text-main); flex: 1; }

        .option-tile.correct { border-color: #10b981; background: rgba(16, 185, 129, 0.1); }
        .option-tile.wrong { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        .option-tile.muted { opacity: 0.5; }

        .state-icon { font-size: 1.25rem; margin-left: 1rem; }

        .feedback-overlay-p { position: fixed; top: 20%; left: 50%; transform: translateX(-50%); padding: 1rem 3rem; border-radius: 3rem; color: white; font-weight: 900; font-family: 'Fredoka', sans-serif; z-index: 1000; animation: popUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes popUp { from { opacity: 0; transform: translate(-50%, 50px); } }
        .feedback-overlay-p.correct { background: #10b981; box-shadow: 0 0 30px rgba(16, 185, 129, 0.5); }
        .feedback-overlay-p.incorrect { background: #ef4444; box-shadow: 0 0 30px rgba(239, 68, 68, 0.5); }

        /* Loader */
        .quiz-loader-premium { min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-main); }
        .wizard-aura { font-size: 4rem; animation: pulseMagic 2s infinite; margin-bottom: 2rem; }
        @keyframes pulseMagic { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px var(--primary)); } 50% { transform: scale(1.2); filter: drop-shadow(0 0 20px var(--primary)); } }
        .progress-bar-loading { width: 200px; height: 6px; background: var(--bg-card); border-radius: 3px; overflow: hidden; margin-top: 1.5rem; }
        .pb-fill { width: 100%; height: 100%; background: var(--primary); animation: loadFill 2s infinite linear; transform-origin: left; }
        @keyframes loadFill { from { transform: scaleX(0); } to { transform: scaleX(1); } }

        /* Results Card */
        .results-card-p { max-width: 500px; margin: 3rem auto; padding: 3rem; text-align: center; }
        .results-badge-p { display: inline-block; padding: 0.5rem 1.5rem; border-radius: 2rem; font-weight: 800; margin-bottom: 2rem; }
        .results-visual-p { position: relative; width: 180px; height: 180px; margin: 0 auto 2rem; }
        .circular-progress-p { width: 100%; height: 100%; transform: rotate(-90deg); }
        .cp-bg { fill: none; stroke: var(--bg-app); stroke-width: 8; }
        .cp-fill { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dasharray 1s ease-out; }
        .score-number-p { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Fredoka', sans-serif; font-size: 2.5rem; font-weight: 800; color: var(--text-main); }
        .grade-label-p { font-family: 'Fredoka', sans-serif; font-size: 1.75rem; margin-bottom: 2rem; }

        .stats-row-p { display: flex; gap: 1rem; margin-bottom: 2.5rem; background: var(--bg-app); padding: 1.5rem; border-radius: 1.5rem; }
        .stat-box-p { flex: 1; display: flex; flex-direction: column; }
        .s-val { font-size: 1.5rem; font-weight: 800; color: var(--text-main); }
        .s-key { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }

        .actions-row-p { display: flex; gap: 1rem; }
        .p-btn { flex: 1; padding: 1rem; border-radius: 1rem; border: none; font-family: 'Fredoka', sans-serif; font-weight: 800; cursor: pointer; transition: 0.3s; }
        .p-btn.primary { background: var(--primary); color: white; }
        .p-btn.secondary { background: var(--bg-app); color: var(--text-main); border: 2px solid var(--border-light); }
      `}</style>
    </div>
  );
}
