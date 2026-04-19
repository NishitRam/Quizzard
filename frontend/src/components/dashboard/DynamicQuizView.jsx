import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useQuiz } from '../../context/QuizContext';
import axios from 'axios'; // Still used for external if needed, but we'll use 'api' for internal

const API_BASE = 'http://localhost:5000/api';
const TIMER_PER_Q = 30;

const TOPIC_META = {
  mongodb:  { label: 'MongoDB',         icon: '🍃', color: '#10b981', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  express:  { label: 'Express.js',      icon: '⚡', color: '#6b7280', gradient: 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)' },
  react:    { label: 'React.js',        icon: '⚛️', color: '#3b82f6', gradient: 'linear-gradient(135deg, #0984e3 0%, #00cec9 100%)' },
  node:     { label: 'Node.js',         icon: '🟢', color: '#10b981', gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' },
  js:       { label: 'JavaScript',      icon: '🟨', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
  sql:      { label: 'SQL & Databases', icon: '🗄️', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', creator: 'Nishant' },
  mern:     { label: 'Full MERN Stack', icon: '🧙‍♂️', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', creator: 'Wizard' },
};

function getGradeInfo(pct) {
  if (pct >= 90) return { label: 'Legendary Master', emoji: '👑', color: '#10b981', bg: 'rgba(16,185,129,0.12)' };
  if (pct >= 70) return { label: 'Skilled Wizard',   emoji: '🧙‍♂️', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' };
  if (pct >= 50) return { label: 'Apprentice',       emoji: '🌱', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  return             { label: 'Keep Practicing',     emoji: '📖', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
}

export default function DynamicQuizView({ topic = 'mern', difficulty = 'medium', amount = 10, providedQuestions = null, onBack }) {
  const { addQuizResult } = useQuiz();
  const meta = TOPIC_META[topic] || TOPIC_META['mern'];

  const [questions,    setQuestions]    = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score,        setScore]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [finished,     setFinished]     = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [isAnswered,   setIsAnswered]   = useState(false);
  const [timeLeft,     setTimeLeft]     = useState(TIMER_PER_Q);
  const [feedbackType, setFeedbackType] = useState(null); // 'correct' | 'wrong'
  const [reviewMode,   setReviewMode]   = useState(false);
  const [answers,      setAnswers]      = useState([]); // history for review
  const [startTime,    setStartTime]    = useState(null);

  const fetchQuestions = async () => {
    setLoading(true); setError(null); setFinished(false);
    setCurrentIndex(0); setScore(0); setSelected(null);
    setIsAnswered(false); setTimeLeft(TIMER_PER_Q); setFeedbackType(null);
    setAnswers([]); setReviewMode(false); setStartTime(Date.now());
    if (providedQuestions && providedQuestions.length > 0) {
      setQuestions(providedQuestions);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/quiz', { params: { topic, difficulty, amount } });
      if (res.data.success && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
      } else {
        throw new Error('No questions found for this topic.');
      }
    } catch (err) {
      setError('Could not summon questions. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, [topic, difficulty, amount, providedQuestions]);

  // Timer
  useEffect(() => {
    if (loading || error || finished || isAnswered) return;
    if (timeLeft === 0) { handleAnswer(null); return; }
    const id = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, loading, error, finished, isAnswered]);

  const handleAnswer = (opt) => {
    if (isAnswered) return;
    const q = questions[currentIndex];
    const correct = opt === q.correctAnswer;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    setSelected(opt);
    setIsAnswered(true);
    setFeedbackType(correct ? 'correct' : 'wrong');
    setAnswers(prev => [...prev, { question: q.question, selected: opt, correct: q.correctAnswer, isCorrect: correct, options: q.options }]);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(p => p + 1);
        setSelected(null); setIsAnswered(false);
        setTimeLeft(TIMER_PER_Q); setFeedbackType(null);
      } else {
        const pct = Math.round((newScore / questions.length) * 100);
        const timeTakenSec = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(timeTakenSec / 60);
        const secs = timeTakenSec % 60;
        
        addQuizResult({
          topic: meta.label, icon: meta.icon, color: meta.color,
          score: pct, totalQuestions: questions.length, correctAnswers: newScore,
          timeTaken: `${mins}m ${secs}s`
        });
        setFinished(true);
      }
    }, 1600);
  };

  const cssStyles = (
    <style>{`
      .dqv-player { max-width: 820px; margin: 0 auto; padding: 0.5rem 0; }

      .dqv-player-header {
        display: flex; align-items: center; justify-content: space-between; 
        margin-bottom: 1.5rem; gap: 1rem;
      }
      .dqv-back-btn {
        background: var(--border-light); border: none; color: var(--text-muted);
        padding: 0.5rem 1rem; border-radius: 10px; font-weight: 700;
        cursor: pointer; transition: 0.2s; font-size: 0.9rem;
      }
      .dqv-back-btn:hover { background: var(--border-strong); color: var(--text-main); }
      .dqv-topic-pill {
        color: white; padding: 0.5rem 1.25rem; border-radius: 20px;
        font-weight: 800; font-size: 0.9rem; display: flex; flex-direction: column; align-items: center;
      }
      .dqv-creator-hint { font-size: 0.65rem; opacity: 0.8; font-weight: 500; margin-top: -2px; }
      .dqv-timer {
        padding: 0.5rem 1rem; border-radius: 10px; font-weight: 900;
        font-size: 1rem; transition: 0.3s; min-width: 70px; text-align: center;
      }

      .dqv-progress-wrap { margin-bottom: 1.5rem; }
      .dqv-progress-track {
        height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;
      }
      .dqv-progress-fill { height: 100%; transition: width 0.5s ease; border-radius: 4px; }
      .dqv-progress-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 700; }

      .dqv-question { padding: 2.5rem; }
      .dqv-difficulty-badge {
        display: inline-block; padding: 0.3rem 0.9rem; border-radius: 20px;
        font-size: 0.7rem; font-weight: 900; letter-spacing: 1px; margin-bottom: 1.5rem;
        background: var(--bg-app); text-transform: uppercase;
      }
      .dqv-difficulty-badge[data-level="easy"] { color: #10b981; }
      .dqv-difficulty-badge[data-level="medium"] { color: #f59e0b; }
      .dqv-difficulty-badge[data-level="hard"] { color: #ef4444; }

      .dqv-question-text {
        font-family: 'Fredoka', sans-serif; font-size: 1.6rem; 
        color: var(--text-main); line-height: 1.4; margin-bottom: 2rem;
      }
      .dqv-options { display: flex; flex-direction: column; gap: 0.85rem; }
      .dqv-option {
        display: flex; align-items: center; gap: 1rem; padding: 1.1rem 1.25rem;
        border: 2px solid var(--border-light); border-radius: 14px;
        background: var(--bg-app); cursor: pointer; transition: 0.25s; text-align: left;
        position: relative;
      }
      .dqv-option:hover:not(:disabled) {
        transform: translateX(4px); border-color: var(--primary);
        background: var(--accent-soft);
      }
      .dqv-opt-idx {
        width: 36px; height: 36px; border-radius: 10px; background: var(--bg-card);
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; color: var(--primary); flex-shrink: 0; font-size: 0.9rem;
      }
      .dqv-opt-text { font-size: 0.95rem; font-weight: 600; color: var(--text-main); flex: 1; }
      .dqv-state-icon { font-size: 1.1rem; }

      .dqv-option.correct { border-color: #10b981; background: rgba(16,185,129,0.08); }
      .dqv-option.correct .dqv-opt-idx { background: #10b981; color: white; }
      .dqv-option.wrong { border-color: #ef4444; background: rgba(239,68,68,0.08); }
      .dqv-option.wrong .dqv-opt-idx { background: #ef4444; color: white; }
      .dqv-option.muted { opacity: 0.45; }

      .dqv-feedback {
        position: fixed; top: 80px; right: 2rem; padding: 1rem 2rem;
        border-radius: 14px; font-weight: 800; font-family: 'Fredoka', sans-serif;
        font-size: 1rem; z-index: 999; animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .dqv-feedback.correct { background: #10b981; color: white; box-shadow: 0 8px 25px rgba(16,185,129,0.4); }
      .dqv-feedback.wrong { background: #f59e0b; color: white; box-shadow: 0 8px 25px rgba(245,158,11,0.4); }
      @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } }

      /* Loading */
      .dqv-loading {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        min-height: 400px; text-align: center; color: var(--text-main);
      }
      .dqv-loading-orb {
        width: 90px; height: 90px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 2.5rem; margin-bottom: 1.5rem;
        animation: pulse 2s infinite;
        box-shadow: 0 0 30px rgba(102,126,234,0.3);
      }
      .dqv-loading h3 { font-family: 'Fredoka', sans-serif; font-size: 1.5rem; margin-bottom: 0.5rem; }
      .dqv-loading p { color: var(--text-muted); margin-bottom: 1.5rem; }
      .dqv-loading-bar { width: 200px; height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
      .dqv-loading-fill { height: 100%; background: var(--primary); animation: loadFill 1.5s infinite ease-in-out; transform-origin: left; }
      @keyframes loadFill { 0% { transform: scaleX(0) translateX(0); } 50% { transform: scaleX(1) translateX(0); } 100% { transform: scaleX(0) translateX(200px); } }
      @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }

      /* Error */
      .dqv-error { max-width: 500px; margin: 3rem auto; padding: 3rem; text-align: center; }
      .dqv-error-icon { font-size: 3rem; margin-bottom: 1rem; }
      .dqv-error h3 { font-family: 'Fredoka', sans-serif; font-size: 1.5rem; color: var(--text-main); margin-bottom: 0.5rem; }
      .dqv-error p { color: var(--text-muted); margin-bottom: 2rem; }
      .dqv-error-actions { display: flex; gap: 1rem; justify-content: center; }

      /* Results */
      .dqv-results { max-width: 600px; margin: 0 auto; }
      .dqv-results-card { overflow: hidden; }
      .dqv-results-top {
        padding: 3rem 2rem 2.5rem; color: white; text-align: center;
      }
      .dqv-results-topic { font-weight: 800; font-size: 0.95rem; opacity: 0.85; margin-bottom: 1.5rem; }
      .dqv-score-ring {
        width: 150px; height: 150px; position: relative; margin: 0 auto 1.5rem;
      }
      .dqv-score-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
      .ring-bg { fill: none; stroke: rgba(255,255,255,0.2); stroke-width: 8; }
      .ring-fill { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dasharray 1s ease-out; }
      .dqv-score-num {
        position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
        font-family: 'Fredoka', sans-serif; font-size: 2.5rem; font-weight: 800;
      }
      .dqv-grade-badge {
        display: inline-block; padding: 0.5rem 1.5rem; border-radius: 2rem; font-weight: 800; font-size: 1rem;
      }
      .dqv-results-body { padding: 2rem; }
      .dqv-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
      .dqv-stat-box {
        background: var(--bg-app); border-radius: 14px; padding: 1.25rem;
        text-align: center; border: 1px solid var(--border-light);
      }
      .dsb-val { display: block; font-size: 2rem; font-weight: 900; color: var(--text-main); }
      .dsb-key { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; }

      .dqv-review-toggle {
        width: 100%; padding: 0.85rem; background: var(--border-light); border: none;
        border-radius: 12px; font-weight: 700; color: var(--text-main);
        cursor: pointer; margin-bottom: 1rem; transition: 0.2s;
      }
      .dqv-review-toggle:hover { background: var(--border-strong); }

      .dqv-review-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; max-height: 350px; overflow-y: auto; }
      .dqv-review-item {
        display: flex; gap: 1rem; padding: 1rem; border-radius: 12px; border: 1px solid var(--border-light);
      }
      .dqv-review-item.correct { border-color: #10b981; background: rgba(16,185,129,0.06); }
      .dqv-review-item.wrong { border-color: #ef4444; background: rgba(239,68,68,0.06); }
      .dri-num {
        width: 28px; height: 28px; border-radius: 50%; background: var(--border-light);
        display: flex; align-items: center; justify-content: center; font-weight: 800;
        font-size: 0.75rem; flex-shrink: 0; color: var(--text-muted);
      }
      .dri-body { flex: 1; }
      .dri-question { font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.35rem; }
      .dri-answer { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.2rem; }
      .dri-correct { font-size: 0.8rem; color: #10b981; }

      .dqv-result-actions { display: flex; gap: 1rem; margin-top: 1.25rem; }
      .dqv-btn {
        flex: 1; padding: 1rem; border-radius: 12px; border: none;
        font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 800;
        cursor: pointer; transition: 0.3s;
      }
      .dqv-btn.primary { background: var(--primary); color: white; }
      .dqv-btn.primary:hover { opacity: 0.9; transform: translateY(-2px); }
      .dqv-btn.secondary { background: var(--bg-app); color: var(--text-main); border: 2px solid var(--border-light); }
      .dqv-btn.secondary:hover { border-color: var(--primary); color: var(--primary); }
    `}</style>
  );

  // ── Loading State ──
  if (loading) return (
    <div className="dqv-loading">
      {cssStyles}
      <div className="dqv-loading-orb" style={{ background: meta.gradient }}>{meta.icon}</div>
      <h3>Summoning {meta.label} Questions...</h3>
      <p>Consulting the Ancient Scrolls</p>
      <div className="dqv-loading-bar"><div className="dqv-loading-fill" /></div>
    </div>
  );

  // ── Error State ──
  if (error) return (
    <div className="dqv-error premium-card">
      {cssStyles}
      <div className="dqv-error-icon">🔮</div>
      <h3>Magical Interference Detected</h3>
      <p>{error}</p>
      <div className="dqv-error-actions">
        <button className="dqv-btn primary" onClick={fetchQuestions}>🔄 Try Again</button>
        <button className="dqv-btn secondary" onClick={onBack}>← Back to Browse</button>
      </div>
    </div>
  );

  // ── Results State ──
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const grade = getGradeInfo(pct);
    return (
      <div className="dqv-results animate-fade-in">
        {cssStyles}
        <div className="dqv-results-card premium-card">
          <div className="dqv-results-top" style={{ background: meta.gradient }}>
            <div className="dqv-results-topic">{meta.icon} {meta.label}</div>
            <div className="dqv-score-ring">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="ring-bg" />
                <circle cx="50" cy="50" r="42" className="ring-fill"
                  style={{ strokeDasharray: `${(pct / 100) * 264} 264`, stroke: 'white' }} />
              </svg>
              <div className="dqv-score-num">{pct}%</div>
            </div>
            <div className="dqv-grade-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              {grade.emoji} {grade.label}
            </div>
          </div>

          <div className="dqv-results-body">
            <div className="dqv-stats-row">
              <div className="dqv-stat-box">
                <span className="dsb-val">{score}</span>
                <span className="dsb-key">✅ Correct</span>
              </div>
              <div className="dqv-stat-box">
                <span className="dsb-val">{questions.length - score}</span>
                <span className="dsb-key">❌ Wrong</span>
              </div>
              <div className="dqv-stat-box">
                <span className="dsb-val">{questions.length}</span>
                <span className="dsb-key">📝 Total</span>
              </div>
            </div>

            {/* Review Toggle */}
            <button className="dqv-review-toggle" onClick={() => setReviewMode(p => !p)}>
              {reviewMode ? '🙈 Hide Review' : '📋 Review Answers'}
            </button>

            {reviewMode && (
              <div className="dqv-review-list">
                {answers.map((a, i) => (
                  <div key={i} className={`dqv-review-item ${a.isCorrect ? 'correct' : 'wrong'}`}>
                    <div className="dri-num">{i + 1}</div>
                    <div className="dri-body">
                      <p className="dri-question">{a.question}</p>
                      <p className="dri-answer">
                        {a.isCorrect ? '✅' : '❌'} Your answer: <b>{a.selected || 'Timed out'}</b>
                      </p>
                      {!a.isCorrect && <p className="dri-correct">✅ Correct: <b>{a.correct}</b></p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="dqv-result-actions">
              <button className="dqv-btn primary" onClick={fetchQuestions}>🔄 Play Again</button>
              <button className="dqv-btn secondary" onClick={onBack}>← Browse Topics</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!questions[currentIndex]) return null;
  const q = questions[currentIndex];
  const progressPct = ((currentIndex + 1) / questions.length) * 100;
  const timerColor = timeLeft > 10 ? 'var(--primary)' : '#ef4444';
  const timerBg = timeLeft > 10 ? 'var(--accent-soft)' : 'rgba(239,68,68,0.12)';

  return (
    <div className="dqv-player animate-fade-in">
      {cssStyles}
      {/* Header */}
      <div className="dqv-player-header">
        <button className="dqv-back-btn" onClick={onBack}>
          ← Browse
        </button>
        <div className="dqv-topic-pill" style={{ background: meta.gradient }}>
          {meta.icon} {meta.label}
          {meta.creator && <span className="dqv-creator-hint">By {meta.creator}</span>}
        </div>
        <div className="dqv-timer" style={{ color: timerColor, background: timerBg }}>
          ⏳ {timeLeft}s
        </div>
      </div>

      {/* Progress */}
      <div className="dqv-progress-wrap">
        <div className="dqv-progress-track">
          <div className="dqv-progress-fill"
            style={{ width: `${progressPct}%`, background: meta.gradient }} />
        </div>
        <span className="dqv-progress-label">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Question Card */}
      <div className="dqv-question premium-card">
        <div className="dqv-difficulty-badge" data-level={q.difficulty?.toLowerCase() || 'medium'}>
          {q.difficulty || 'Medium'}
        </div>
        <h2 className="dqv-question-text">{q.question}</h2>

        <div className="dqv-options">
          {q.options.map((opt, idx) => {
            let cls = 'dqv-option';
            if (isAnswered) {
              if (opt === q.correctAnswer) cls += ' correct';
              else if (opt === selected) cls += ' wrong';
              else cls += ' muted';
            }
            return (
              <button
                key={idx}
                className={cls}
                onClick={() => handleAnswer(opt)}
                disabled={isAnswered}
              >
                <span className="dqv-opt-idx">{String.fromCharCode(65 + idx)}</span>
                <span className="dqv-opt-text">{opt}</span>
                {isAnswered && opt === q.correctAnswer && <span className="dqv-state-icon">✅</span>}
                {isAnswered && opt === selected && opt !== q.correctAnswer && <span className="dqv-state-icon">❌</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackType && (
        <div className={`dqv-feedback ${feedbackType}`}>
          {feedbackType === 'correct' ? '🔥 Correct! +10 XP' : '💡 Incorrect — keep going!'}
        </div>
      )}

    </div>
  );
}
