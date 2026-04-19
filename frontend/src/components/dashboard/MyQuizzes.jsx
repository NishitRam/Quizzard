import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';

export default function MyQuizzes({ onRetry, onPlayCreated }) {
  const { quizHistory, quizzes, setCurrentQuiz, user } = useQuiz();
  const [filter, setFilter] = useState('all'); // 'all', 'passed', 'failed', 'created'

  const handleRetry = (quiz) => {
    if (onRetry) {
      onRetry(quiz.topic, quiz.totalQuestions || 10);
    }
  };

  const filteredQuizzes = filter === 'all' 
    ? quizHistory 
    : filter === 'passed'
    ? quizHistory.filter(q => q.passed)
    : filter === 'created'
    ? quizzes.filter(q => (q.author || q.authorName) && (q.author === user?.id || q.author === user?._id || q.authorName === user?.fullName))
    : quizHistory.filter(q => !q.passed);

  const totalCompleted = quizHistory.length;
  const totalPassed = quizHistory.filter(q => q.passed).length;
  const totalCreated = quizzes.filter(q => (q.author || q.authorName) && (q.author === user?.id || q.author === user?._id || q.authorName === user?.fullName)).length;
  const averageScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((acc, q) => acc + q.score, 0) / quizHistory.length)
    : 0;

  return (
    <div className="my-quizzes-container animate-fade-in">
      <div className="my-quizzes-header">
        <h1 className="page-title text-gradient">📚 My Quizzes</h1>
        <p className="page-subtitle">Track your learning progress and review past scrolls.</p>
      </div>

      {/* Stats Overview */}
      <div className="quiz-stats-grid">
        <div className="quiz-stat-card premium-card">
          <div className="stat-icon-box purple">📝</div>
          <div className="stat-details">
            <div className="stat-number">{totalCompleted}</div>
            <div className="stat-text">Total Completed</div>
          </div>
        </div>
        <div className="quiz-stat-card premium-card">
          <div className="stat-icon-box green">✨</div>
          <div className="stat-details">
            <div className="stat-number">{totalCreated}</div>
            <div className="stat-text">Quizzes Created</div>
          </div>
        </div>
        <div className="quiz-stat-card premium-card">
          <div className="stat-icon-box orange">📊</div>
          <div className="stat-details">
            <div className="stat-number">{averageScore}%</div>
            <div className="stat-text">Average Score</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs-container premium-card">
        <button 
          className={`filter-tab-pill ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({quizHistory.length})
        </button>
        <button 
          className={`filter-tab-pill ${filter === 'passed' ? 'active' : ''}`}
          onClick={() => setFilter('passed')}
        >
          Passed ({quizHistory.filter(q => q.passed).length})
        </button>
        <button 
          className={`filter-tab-pill ${filter === 'failed' ? 'active' : ''}`}
          onClick={() => setFilter('failed')}
        >
          Failed ({quizHistory.filter(q => !q.passed).length})
        </button>
        <button 
          className={`filter-tab-pill ${filter === 'created' ? 'active' : ''}`}
          onClick={() => setFilter('created')}
        >
          Created by Me ({totalCreated})
        </button>
      </div>

      {/* Quiz History List */}
      <div className="quiz-history-list">
        {filteredQuizzes.map((item, idx) => {
          const isCreatedView = filter === 'created';
          const quiz = isCreatedView ? item : item; // For naming convention

          return isCreatedView ? (
            <div key={quiz._id || idx} className="quiz-history-card premium-card created-view">
              <div className="history-icon-circle" style={{ background: `rgba(16, 185, 129, 0.15)`, color: '#10b981' }}>
                ✨
              </div>
              <div className="history-content-main">
                <div className="history-topic-title">{quiz.title}</div>
                <div className="history-meta-row">
                  <span className="history-meta-item">📝 {quiz.questions?.length} Questions</span>
                  <span className="history-meta-divider">•</span>
                  <span className="history-meta-item">🏷️ {quiz.subject}</span>
                </div>
              </div>
              <div className="history-action-side">
                <div className="history-score-badge auto-width" style={{background: 'var(--border-light)', color: 'var(--text-main)', fontSize: '0.9rem', width: 'auto' }}>
                  {quiz.difficulty || 'Custom'}
                </div>
                <button 
                  className="minimal-history-btn" 
                  style={{ background: 'var(--primary)', color: 'white' }}
                  onClick={() => {
                    if (onPlayCreated) {
                      const mappedQuestions = quiz.questions?.map(q => ({
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer
                      }));
                      let subjectStr = typeof quiz.subject === 'string' ? quiz.subject : 'Custom';
                      
                      onPlayCreated({
                        topic: subjectStr.toLowerCase().replace(/[^a-z0-9]/g, ''),
                        difficulty: quiz.difficulty?.toLowerCase() || 'medium',
                        amount: mappedQuestions?.length || 10,
                        providedQuestions: mappedQuestions
                      });
                    }
                  }}
                >
                  ▶ Play
                </button>
              </div>
            </div>
          ) : (
            <div key={quiz.id || idx} className="quiz-history-card premium-card">
              <div className="history-icon-circle" style={{ background: `${quiz.color || '#8b5cf6'}20`, color: quiz.color || '#8b5cf6' }}>
                {quiz.icon || '📝'}
              </div>
              <div className="history-content-main">
                <div className="history-topic-title">{quiz.topic}</div>
                <div className="history-meta-row">
                  <span className="history-meta-item">🎯 {quiz.correctAnswers}/{quiz.totalQuestions}</span>
                  <span className="history-meta-divider">•</span>
                  <span className="history-meta-item">⏱️ {quiz.timeTaken || '2m'}</span>
                  <span className="history-meta-divider">•</span>
                  <span className="history-meta-item">📅 {new Date(quiz.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="history-action-side">
                <div className={`history-score-badge ${quiz.passed ? 'passed' : 'failed'}`}>
                  {quiz.score}%
                </div>
                <button className="minimal-history-btn" onClick={() => handleRetry(quiz)}>
                  🔄 Retry
                </button>
              </div>
            </div>
          );
        })}


        {filteredQuizzes.length === 0 && (
          <div className="empty-history premium-card">
            <div className="empty-history-icon">📜</div>
            <h3>No records found</h3>
            <p>Your library is waiting for its first entry.</p>
          </div>
        )}
      </div>

      <style>{`
        .my-quizzes-container { padding: 1rem 0; width: 100%; }

        .my-quizzes-header { margin-bottom: 2.5rem; }
        .page-title { font-size: 2.5rem; font-family: 'Fredoka', sans-serif; margin-bottom: 0.4rem; }
        .page-subtitle { color: var(--text-muted); font-size: 1.1rem; }

        .quiz-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .quiz-stat-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; }
        .stat-icon-box {
          width: 50px; height: 50px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; font-size: 24px;
        }
        .stat-icon-box.purple { background: rgba(102, 126, 234, 0.15); color: #667eea; }
        .stat-icon-box.green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .stat-icon-box.orange { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .stat-number { font-size: 1.75rem; font-weight: 800; color: var(--text-main); }
        .stat-text { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

        .filter-tabs-container {
          display: flex; gap: 0.75rem; padding: 0.75rem; margin-bottom: 2rem; width: fit-content;
        }
        .filter-tab-pill {
          padding: 0.6rem 1.25rem; border-radius: 10px; font-weight: 700; font-size: 0.9rem;
          color: var(--text-muted); cursor: pointer; transition: 0.3s;
        }
        .filter-tab-pill:hover { background: var(--bg-app); color: var(--text-main); }
        .filter-tab-pill.active { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2); }

        .quiz-history-list { display: flex; flex-direction: column; gap: 1rem; }
        .quiz-history-card { padding: 1.25rem 2rem; display: flex; align-items: center; gap: 1.5rem; transition: 0.3s; }
        .quiz-history-card:hover { transform: translateX(8px); }

        .history-icon-circle {
          width: 55px; height: 55px; border-radius: 15px;
          display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0;
        }
        .history-content-main { flex: 1; }
        .history-topic-title { font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
        .history-meta-row { display: flex; align-items: center; gap: 1rem; color: var(--text-muted); font-size: 0.85rem; }
        .history-meta-divider { opacity: 0.3; }

        .history-action-side { display: flex; align-items: center; gap: 1.5rem; }
        .history-score-badge {
          font-family: 'Fredoka', sans-serif; font-size: 1.5rem; font-weight: 800;
          padding: 0.4rem 1rem; border-radius: 12px; min-width: 70px; text-align: center;
        }
        .history-score-badge.passed { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .history-score-badge.failed { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .history-score-badge.auto-width { min-width: unset; padding: 0.5rem 1rem; }
        .minimal-history-btn {
          background: var(--bg-app); color: var(--text-main); padding: 0.6rem 1rem;
          border-radius: 10px; font-weight: 700; font-size: 0.85rem; transition: 0.3s;
        }
        .minimal-history-btn:hover { background: var(--border-strong); transform: scale(1.05); }

        .empty-history { padding: 4rem 2rem; text-align: center; color: var(--text-muted); }
        .empty-history-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.4; }
        .empty-history h3 { font-size: 1.5rem; color: var(--text-main); margin-bottom: 0.5rem; }
      `}</style>
    </div>
  );
}
