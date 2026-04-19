import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useQuiz } from '../../context/QuizContext';

export default function MagicShuffle({ onStartMagic }) {
  const { refreshAllData } = useQuiz();
  const [topic, setTopic] = useState('react');
  const [amount, setAmount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [availableTopics, setAvailableTopics] = useState([
    { id: 'mongodb', name: 'MongoDB' },
    { id: 'express', name: 'Express.js' },
    { id: 'react', name: 'React' },
    { id: 'node', name: 'Node.js' },
    { id: 'javascript', name: 'JavaScript' }
  ]);

  // Fetch topics from backend on mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get('/trivia/topics');
        if (res.data.success && res.data.topics) {
          // Flatten and format topics
          const formatted = res.data.topics.map(t => ({
            id: t.id,
            name: t.id.charAt(0).toUpperCase() + t.id.slice(1)
          }));
          setAvailableTopics(formatted);
          if (formatted.length > 0) setTopic(formatted[0].id);
        }
      } catch (err) {
        console.warn('Could not fetch dynamic topics, using fallbacks.');
      } finally {
        setTopicsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setPreviewQuestions([]);
    setSaveStatus('');

    try {
      const res = await api.get(`/trivia?topic=${topic}&amount=${amount}&difficulty=${difficulty}`);
      if (res.data.success && res.data.questions.length > 0) {
        setPreviewQuestions(res.data.questions);
      } else {
        setError('The Magic failed to summon questions. Try a different topic.');
      }
    } catch (err) {
      setError('Connection to the Magic Realm failed. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToQuizzes = async () => {
    if (previewQuestions.length === 0) return;
    setLoading(true);
    setSaveStatus('Casting Persistence Spell...');

    try {
      const topicName = availableTopics.find(t => t.id === topic)?.name || topic;
      
      // Map frontend difficulties to backend schema enums
      const difficultyMap = {
        'easy': 'Beginner',
        'medium': 'Intermediate',
        'hard': 'Advanced'
      };

      const res = await api.post('/quizzes', {
        title: `Magic: ${topicName} Masterclass`,
        description: `Indefinite knowledge quest generated via Magic Shuffle scaling with your ambition.`,
        category: topicName,
        difficulty: difficultyMap[difficulty] || 'Intermediate',
        questions: previewQuestions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.options[q.correct],
          explanation: q.explanation || `The correct answer is: ${q.options[q.correct]}`
        }))
      });

      if (res.data.success) {
        setSaveStatus('✨ Quiz permanently added to the Ledger!');
        refreshAllData();
        setPreviewQuestions([]);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save to the Ledger. Check your connection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayNow = () => {
    if (previewQuestions.length === 0) return;
    
    // Map to DynamicQuizView expected format
    const mappedQuestions = previewQuestions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.options[q.correct]
    }));

    if (typeof onStartMagic === 'function') {
      onStartMagic({ 
        topic: topic, 
        difficulty: difficulty, 
        amount: previewQuestions.length,
        providedQuestions: mappedQuestions
      });
    }
  };

  return (
    <div className="magic-shuffle-container">
      <div className="magic-header">
        <h2 className="magic-title">Magic Shuffle ✨</h2>
        <p className="magic-subtitle">Summon quizzes instantly from the Magic APIs based on your custom requirements.</p>
      </div>

      <div className="magic-controls-card">
        <div className="control-group">
          <label>Topic Realm</label>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="magic-select" disabled={topicsLoading}>
            {availableTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="control-group">
          <label>Question Count</label>
          <input 
            type="number" 
            min="1" 
            max="20" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            className="magic-input"
          />
        </div>

        <div className="control-group">
          <label>Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="magic-select">
            <option value="easy">Easy (Apprentice)</option>
            <option value="medium">Medium (Wizard)</option>
            <option value="hard">Hard (Archmage)</option>
          </select>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading} 
          className="magic-gen-btn"
        >
          {loading ? 'Summoning...' : 'Generate Magic Preview'}
        </button>
      </div>

      {error && <div className="magic-error">{error}</div>}
      {saveStatus && <div className="magic-success">{saveStatus}</div>}

      {previewQuestions.length > 0 && (
        <div className="summoned-card-wrapper animate-fade-in">
          <div className="magic-summoned-card">
            <div className="magic-card-glow"></div>
            <div className="magic-card-inner">
              <div className="magic-card-icon">🔮</div>
              <div className="magic-card-content">
                <div className="magic-card-tag">MAGIC SUMMON COMPLETE</div>
                <h3>{availableTopics.find(t => t.id === topic)?.name || topic} Knowledge Quest</h3>
                <div className="magic-card-meta">
                  <div className="meta-badge"><span>⚡</span> {amount} Questions</div>
                  <div className="meta-badge pulse"><span>🛡️</span> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</div>
                </div>
                <p className="magic-card-desc">
                  Your magic has summoned a unique set of challenges from the trivia realm. 
                  The answers are hidden within the veil. Start now to prove your mastery!
                </p>
                <div className="magic-card-actions">
                  <button onClick={handlePlayNow} className="magic-primary-btn">
                    <span>⚡</span> Play This Quiz
                  </button>
                  <button onClick={handleSaveToQuizzes} className="magic-secondary-btn">
                    <span>✨</span> Save to Ledger
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .magic-shuffle-container {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .magic-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .magic-title {
          font-family: 'Fredoka', sans-serif;
          font-size: 2.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .magic-subtitle {
          color: #a0aec0;
          font-size: 1.1rem;
        }

        .magic-controls-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          align-items: flex-end;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-group label {
          font-size: 0.9rem;
          color: #cbd5e0;
          font-weight: 500;
        }

        .magic-select, .magic-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.75rem;
          border-radius: 10px;
          color: white;
          font-family: inherit;
          outline: none;
          transition: border-color 0.3s;
        }

        .magic-select option {
          background: #2d3748;
          color: white;
        }

        .magic-select:focus, .magic-input:focus {
          border-color: #667eea;
        }

        .magic-gen-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }

        .magic-gen-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .magic-gen-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .magic-error {
          background: rgba(229, 62, 62, 0.1);
          border: 1px solid #e53e3e;
          color: #fc8181;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 2rem;
          text-align: center;
        }

        .magic-success {
          background: rgba(72, 187, 120, 0.1);
          border: 1px solid #48bb78;
          color: #68d391;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 2rem;
          text-align: center;
          animation: slideUp 0.3s ease;
        }

        /* ── Summoned Card ── */
        .summoned-card-wrapper {
          padding: 1rem 0;
        }
        .magic-summoned-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .magic-summoned-card:hover {
          transform: translateY(-5px);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .magic-card-glow {
          position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          animation: rotateGlow 10s linear infinite;
        }
        @keyframes rotateGlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .magic-card-inner {
          position: relative; padding: 3rem; display: flex; gap: 2rem; align-items: center;
        }
        .magic-card-icon {
          font-size: 4rem; background: rgba(255, 255, 255, 0.05);
          width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;
          border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.1);
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .magic-card-content { flex: 1; }
        .magic-card-tag {
          font-size: 0.7rem; font-weight: 800; color: #a855f7; letter-spacing: 2px;
          margin-bottom: 0.75rem; text-transform: uppercase;
        }
        .magic-card-content h3 {
          font-size: 1.8rem; font-weight: 800; color: white; margin-bottom: 1rem;
          font-family: 'Fredoka', sans-serif;
        }
        .magic-card-meta { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .meta-badge {
          display: flex; align-items: center; gap: 0.5rem; background: rgba(255, 255, 255, 0.05);
          padding: 0.5rem 1rem; border-radius: 12px; font-size: 0.9rem; font-weight: 700;
          color: #cbd5e0; border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .meta-badge span { font-size: 1.1rem; }
        .meta-badge.pulse { border-color: rgba(99, 102, 241, 0.3); animation: borderPulse 2s infinite; }
        @keyframes borderPulse {
          0%, 100% { border-color: rgba(99, 102, 241, 0.3); }
          50% { border-color: rgba(99, 102, 241, 0.8); }
        }

        .magic-card-desc {
          color: #a0aec0; line-height: 1.6; margin-bottom: 2rem; max-width: 600px;
        }

        .magic-card-actions { display: flex; gap: 1rem; }
        .magic-primary-btn, .magic-secondary-btn {
          border: none; padding: 1rem 2rem; border-radius: 16px; font-weight: 800;
          cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 0.75rem;
          font-size: 1rem;
        }
        .magic-primary-btn {
          background: linear-gradient(135deg, #6366f1, #a855f7); color: white;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
        .magic-primary-btn:hover { transform: scale(1.05); filter: brightness(1.1); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5); }
        
        .magic-secondary-btn {
          background: rgba(255, 255, 255, 0.05); color: white; border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .magic-secondary-btn:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); }

        .animate-fade-in { animation: globalFadeIn 0.5s ease; }
        @keyframes globalFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .magic-card-inner { flex-direction: column; text-align: center; padding: 2rem; }
          .magic-card-meta { justify-content: center; }
          .magic-card-actions { flex-direction: column; }
          .magic-card-icon { width: 100px; height: 100px; font-size: 3rem; }
        }
      `}</style>
    </div>
  );
}
