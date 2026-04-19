import React, { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';

export default function QuizPlayer({ onBack }) {
  const { addQuizResult, currentQuiz, setCurrentQuiz } = useQuiz();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  // Format the current quiz questions for the UI
  const quiz = React.useMemo(() => {
    if (!currentQuiz) return null;
    return {
      ...currentQuiz,
      questions: (currentQuiz.questions || []).map((q, idx) => ({
        id: idx + 1,
        question: q.questionText || q.question || '',
        options: q.options || [],
        correct: q.options ? q.options.indexOf(q.correctAnswer) : (q.correct || 0),
        explanation: q.explanation || 'The arcane scrolls do not elaborate, but this is the truth.'
      }))
    };
  }, [currentQuiz]);

  const startQuiz = () => {
    setCurrentQuestion(0);
    setCorrectCount(0);
    setAnsweredQuestions([]);
    setQuizComplete(false);
    setTimer(30);
    setTimerActive(true);
  };

  useEffect(() => {
    if (currentQuiz && !quizComplete && answeredQuestions.length === 0) {
      startQuiz();
    }
  }, [currentQuiz]);

  useEffect(() => {
    let interval;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && timerActive) {
      handleTimeout();
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const handleAnswerSelect = (answerIndex) => {
    if (showExplanation || !quiz) return;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    setTimerActive(false);

    const isCorrect = answerIndex === quiz.questions[currentQuestion].correct;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    setAnsweredQuestions(prev => [...prev, {
      question: currentQuestion,
      selected: answerIndex,
      correct: quiz.questions[currentQuestion].correct,
      isCorrect
    }]);
  };

  const handleTimeout = () => {
    if (!quiz || showExplanation) return;
    setShowExplanation(true);
    setTimerActive(false);
    setSelectedAnswer(null);

    setAnsweredQuestions(prev => [...prev, {
      question: currentQuestion,
      selected: null,
      correct: quiz.questions[currentQuestion].correct,
      isCorrect: false
    }]);
  };

  const nextQuestion = () => {
    if (!quiz) return;

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimer(30);
      setTimerActive(true);
    } else {
      const finalCorrect = answeredQuestions.filter(q => q.isCorrect).length;
      const totalQuestions = quiz.questions.length;
      const percentage = Math.round((finalCorrect / totalQuestions) * 100);

      const totalSeconds = totalQuestions * 30; // Approximation
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      addQuizResult({
        topic: quiz.title || quiz.subject || 'Quiz',
        icon: '📝',
        color: quiz.iconColor || '#667eea',
        score: percentage,
        totalQuestions,
        correctAnswers: finalCorrect,
        timeTaken: `${minutes}:${seconds.toString().padStart(2, '0')}`
      });

      setQuizComplete(true);
      setTimerActive(false);
    }
  };

  const quitQuiz = () => {
    setCurrentQuiz(null);
    if (typeof onBack === 'function') {
      onBack();
    } else {
      window.location.hash = 'dashboard';
    }
  };

  if (!quiz) {
    return (
      <div className="quiz-selection-page">
        <div className="selection-content">
          <h1>No Quiz Selected</h1>
          <p>Please return to the dashboard and pick a challenge!</p>
          <button className="back-home-btn" onClick={quitQuiz}>← Back to Dashboard</button>
        </div>
        <style>{`
          .quiz-selection-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Outfit', sans-serif;
            color: white;
            text-align: center;
          }
          .back-home-btn {
            margin-top: 2rem;
            padding: 1rem 2rem;
            background: white;
            color: #667eea;
            border: none;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  if (quizComplete) {
    const finalCorrect = answeredQuestions.filter(q => q.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((finalCorrect / totalQuestions) * 100);
    const passed = percentage >= 60;

    return (
      <div className="quiz-result-page">
        <div className="result-card">
          <div className={`status-icon ${passed ? 'pass' : 'fail'}`}>
            {passed ? '🎉' : '📚'}
          </div>
          <h2>{passed ? 'Magical Success!' : 'Keep Studying!'}</h2>
          <div className="stats-container">
            <div className="stat-circle">
              <span className="percent">{percentage}%</span>
              <span className="label">Final Score</span>
            </div>
            <div className="stat-details">
              <div className="detail">
                <span className="val">{finalCorrect}/{totalQuestions}</span>
                <span className="lab">Correct Answers</span>
              </div>
              <div className="detail">
                <span className="val">{totalQuestions * 30}s</span>
                <span className="lab">Time Spent</span>
              </div>
            </div>
          </div>
          <div className="result-buttons">
            <button className="replay-btn" onClick={startQuiz}>Try Again</button>
            <button className="finish-btn" onClick={quitQuiz}>Dashboard</button>
          </div>
        </div>
        <style>{`
          .quiz-result-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            font-family: 'Outfit', sans-serif;
          }
          .result-card {
            background: white;
            padding: 3rem;
            border-radius: 30px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.2);
          }
          .status-icon { font-size: 60px; margin-bottom: 1rem; }
          .stats-container { margin: 2rem 0; display: flex; flex-direction: column; gap: 2rem; }
          .stat-circle { 
            width: 150px; height: 150px; border: 8px solid #667eea; border-radius: 50%; 
            margin: 0 auto; display: flex; flex-direction: column; justify-content: center;
          }
          .stat-circle .percent { font-size: 36px; font-weight: 700; color: #2d3748; }
          .stat-details { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          .detail .val { display: block; font-size: 20px; font-weight: 700; color: #667eea; }
          .detail .lab { font-size: 12px; color: #718096; text-transform: uppercase; }
          .result-buttons { display: flex; gap: 1rem; }
          .result-buttons button { flex: 1; padding: 1rem; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; }
          .replay-btn { background: #667eea; color: white; }
          .finish-btn { background: #edf2f7; color: #2d3748; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="quiz-player-page">
      <div className="player-box">
        <header className="player-header">
          <button className="quit-btn" onClick={quitQuiz}>← Back to Dashboard</button>
          <div className="progress">Q{currentQuestion + 1} of {quiz.questions.length}</div>
          <div className={`timer ${timer <= 10 ? 'urgent' : ''}`}>⏱️ {timer}s</div>
        </header>

        <div className="progress-track">
          <div className="fill" style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}></div>
        </div>

        <section className="question-area">
          <h3>{question.question}</h3>
          <div className="options-list">
            {question.options.map((opt, idx) => {
              const checked = selectedAnswer === idx;
              const right = idx === question.correct;
              let state = '';
              if (showExplanation) {
                if (right) state = 'correct';
                else if (checked) state = 'wrong';
                else state = 'muted';
              } else if (checked) {
                state = 'selected';
              }

              return (
                <button 
                  key={idx} 
                  className={`option-item ${state}`}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={showExplanation}
                >
                  <span className="index">{String.fromCharCode(65+idx)}</span>
                  <span className="text">{opt}</span>
                </button>
              );
            })}
          </div>
        </section>

        {showExplanation && (
          <div className="explanation-panel">
            <p><strong>💡 Explanation:</strong> {question.explanation}</p>
            <button className="continue-btn" onClick={nextQuestion}>
              {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .quiz-player-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Outfit', sans-serif;
        }
        .player-box {
          background: white;
          border-radius: 25px;
          padding: 2.5rem;
          width: 100%;
          max-width: 700px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .player-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .quit-btn { background: #f7fafc; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; }
        .timer { font-weight: 700; color: #48bb78; }
        .timer.urgent { color: #f56565; animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0.5; } }
        .progress-track { height: 6px; background: #edf2f7; border-radius: 10px; margin-bottom: 2rem; overflow: hidden; }
        .progress-track .fill { height: 100%; background: #667eea; transition: 0.3s; }
        .question-area h3 { font-size: 24px; color: #2d3748; margin-bottom: 2rem; }
        .options-list { display: flex; flex-direction: column; gap: 1rem; }
        .option-item { 
          display: flex; align-items: center; gap: 1rem; padding: 1.25rem; 
          border: 2px solid #edf2f7; border-radius: 15px; background: white; 
          cursor: pointer; transition: 0.2s; text-align: left;
        }
        .option-item .index { 
          width: 35px; height: 35px; background: #667eea; color: white; 
          border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;
        }
        .option-item.selected { border-color: #667eea; background: #f0f4ff; }
        .option-item.correct { border-color: #48bb78; background: #f0fff4; }
        .option-item.wrong { border-color: #f56565; background: #fff5f5; }
        .option-item.muted { opacity: 0.6; }
        .explanation-panel { margin-top: 2rem; padding: 1.5rem; background: #f7fafc; border-radius: 15px; border-left: 5px solid #667eea; }
        .continue-btn { 
          margin-top: 1rem; width: 100%; padding: 1rem; background: #667eea; 
          color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;
        }
      `}</style>
    </div>
  );
}
