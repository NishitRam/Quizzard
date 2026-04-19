import React, { useState } from 'react';

const TOPICS = [
  {
    id: 'mongodb',
    label: 'MongoDB',
    icon: '🍃',
    description: 'Documents, BSON, aggregation pipelines, Mongoose ODM, and NoSQL design patterns.',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    shadow: 'rgba(17, 153, 142, 0.35)',
    tags: ['NoSQL', 'BSON', 'Mongoose'],
    questions: '14+'
  },
  {
    id: 'express',
    label: 'Express.js',
    icon: '⚡',
    description: 'Routing, middleware, REST APIs, error handling, and backend architecture.',
    gradient: 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)',
    shadow: 'rgba(99, 110, 114, 0.35)',
    tags: ['REST', 'Middleware', 'Routing'],
    questions: '13+'
  },
  {
    id: 'react',
    label: 'React.js',
    icon: '⚛️',
    description: 'Hooks, Virtual DOM, state management, component patterns, and performance.',
    gradient: 'linear-gradient(135deg, #0984e3 0%, #00cec9 100%)',
    shadow: 'rgba(9, 132, 227, 0.35)',
    tags: ['Hooks', 'JSX', 'Context API'],
    questions: '14+'
  },
  {
    id: 'node',
    label: 'Node.js',
    icon: '🟢',
    description: 'Event loop, async I/O, streams, npm, and server-side JavaScript fundamentals.',
    gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
    shadow: 'rgba(0, 176, 155, 0.35)',
    tags: ['Event Loop', 'Streams', 'NPM'],
    questions: '13+'
  },
  {
    id: 'js',
    label: 'JavaScript',
    icon: '🟨',
    description: 'ES6+, closures, Promises, prototypes, and modern JS patterns.',
    gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    shadow: 'rgba(247, 151, 30, 0.35)',
    tags: ['ES6+', 'Async', 'Closures'],
    questions: '14+'
  },
  {
    id: 'sql',
    label: 'SQL & Databases',
    icon: '🗄️',
    description: 'Queries, JOINs, normalization, indexing, and relational database design.',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    shadow: 'rgba(236, 72, 153, 0.35)',
    tags: ['SQL', 'JOINs', 'ACID'],
    questions: '14+',
    creator: 'Nishant'
  },
  {
    id: 'mern',
    label: 'Full MERN Stack',
    icon: '🧙‍♂️',
    description: 'Mixed questions from all four technologies. The ultimate MERN challenge.',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    shadow: 'rgba(102, 126, 234, 0.35)',
    tags: ['All Topics', 'Mixed', 'Challenge'],
    questions: '60+'
  }
];

const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy',   icon: '🌱', color: '#10b981', desc: 'Build your foundation' },
  { id: 'medium', label: 'Medium', icon: '🔥', color: '#f59e0b', desc: 'Prove your skills' },
  { id: 'hard',   label: 'Hard',   icon: '💀', color: '#ef4444', desc: 'Expert level depth' },
  { id: 'all',    label: 'Mixed',  icon: '🎲', color: '#8b5cf6', desc: 'All difficulties' }
];

const AMOUNTS = [5, 10, 15, 20];

export default function BrowseQuizzes({ onStartQuiz }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [amount, setAmount] = useState(10);
  const [showModal, setShowModal] = useState(false);

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    setShowModal(true);
  };

  const handleStartQuiz = () => {
    if (!selectedTopic) return;
    setShowModal(false);
    // Call the callback — don't change hash directly
    if (typeof onStartQuiz === 'function') {
      onStartQuiz({ topic: selectedTopic.id, difficulty, amount });
    }
  };

  return (
    <div className="browse-container animate-fade-in">

      {/* ── Header ── */}
      <div className="browse-header">
        <div className="browse-header-text">
          <h1 className="browse-title text-gradient">🔍 Browse Quiz Topics</h1>
          <p className="browse-subtitle">Choose your battleground. Set your difficulty. Prove your mastery.</p>
        </div>
        <div className="browse-stats">
          <div className="stat-pill">🧠 {TOPICS.length} Topics</div>
          <div className="stat-pill">📝 100+ Questions</div>
          <div className="stat-pill">🏆 MERN + SQL</div>
        </div>
      </div>

      {/* ── Topic Cards Grid ── */}
      <div className="topics-grid">
        {TOPICS.map(topic => (
          <div
            key={topic.id}
            className="topic-card-premium premium-card"
            style={{ '--topic-shadow': topic.shadow }}
            onClick={() => handleTopicClick(topic)}
          >
            <div className="topic-card-accent" style={{ background: topic.gradient }} />
            <div className="topic-card-body">
              <div className="topic-icon-large">{topic.icon}</div>
              <h3 className="topic-label-premium">{topic.label}</h3>
              <p className="topic-description-premium">{topic.description}</p>
              <div className="topic-tags-flex">
                {topic.tags.map(tag => (
                  <span key={tag} className="small-tag">{tag}</span>
                ))}
              </div>
              {topic.creator && (
                <div className="topic-creator-tag">
                  👤 Community Quiz
                </div>
              )}
            </div>
            <div className="topic-card-footer">
              <span className="topic-q-count">{topic.questions} questions</span>
              <button className="topic-launch-btn" style={{ background: topic.gradient }}>
                Start →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Configuration Modal ── */}
      {showModal && selectedTopic && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card-premium premium-card" onClick={e => e.stopPropagation()}>

            <div className="modal-header-premium" style={{ background: selectedTopic.gradient }}>
              <div className="modal-icon-glow">{selectedTopic.icon}</div>
              <div>
                <h2 className="modal-title-text">{selectedTopic.label} Quiz</h2>
                <p className="modal-subtitle-text">Configure your challenge</p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body-premium">
              <div className="config-section-box">
                <h4 className="config-title">⚡ Select Difficulty</h4>
                <div className="diff-selection-grid">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.id}
                      className={`premium-diff-btn ${difficulty === d.id ? 'active' : ''}`}
                      style={{ '--diff-color': d.color }}
                      onClick={() => setDifficulty(d.id)}
                    >
                      <span className="p-diff-icon">{d.icon}</span>
                      <span className="p-diff-label">{d.label}</span>
                      <span className="p-diff-desc">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="config-section-box">
                <h4 className="config-title">📝 Question Count</h4>
                <div className="amount-selection-flex">
                  {AMOUNTS.map(n => (
                    <button
                      key={n}
                      className={`premium-amount-btn ${amount === n ? 'active' : ''}`}
                      onClick={() => setAmount(n)}
                    >
                      {n}
                      <span>Qs</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="modal-final-btn"
                style={{ background: selectedTopic.gradient }}
                onClick={handleStartQuiz}
              >
                🚀 Launch Challenge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Magic Shuffle CTA ── */}
      <div className="magic-shuffle-cta premium-card" onClick={() => (window.location.hash = 'magic_shuffle')}>
        <div className="m-cta-icon">✨</div>
        <div className="m-cta-text">
          <h3>Try Magic Shuffle</h3>
          <p>Can't find what you need? Generate a custom challenge using our AI Magic APIs.</p>
        </div>
        <button className="m-cta-btn">Summon AI Quiz →</button>
      </div>

      <style>{`
        .browse-container { padding: 0.5rem 0; width: 100%; display: flex; flex-direction: column; gap: 2.5rem; }
        
        .magic-shuffle-cta {
          display: flex; align-items: center; gap: 1.5rem; padding: 2rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 2px dashed var(--border-strong); cursor: pointer; transition: 0.3s;
          margin-top: 1rem;
        }
        .magic-shuffle-cta:hover { transform: scale(1.01); background: var(--accent-soft); border-color: var(--accent); }
        .m-cta-icon { font-size: 3rem; animation: pulse 2s infinite; }
        .m-cta-text { flex: 1; }
        .m-cta-text h3 { font-family: 'Fredoka', sans-serif; font-size: 1.5rem; margin-bottom: 0.25rem; color: var(--text-main); }
        .m-cta-text p { color: var(--text-muted); font-size: 0.95rem; }
        .m-cta-btn { background: var(--primary); color: white; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 800; border: none; cursor: pointer; }
        
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

        .browse-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2.5rem;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .browse-title { font-size: 2rem; font-family: 'Fredoka', sans-serif; margin-bottom: 0.5rem; }
        .browse-subtitle { color: var(--text-muted); font-size: 1rem; }
        .browse-stats { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .stat-pill {
          background: var(--bg-card);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-main);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-light);
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 1.5rem;
        }

        .topic-card-premium {
          position: relative;
          padding: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: 0.3s;
          cursor: pointer;
        }
        .topic-card-premium:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px var(--topic-shadow, rgba(0,0,0,0.2));
        }
        .topic-card-accent {
          height: 5px;
          width: 100%;
          flex-shrink: 0;
        }
        .topic-card-body {
          padding: 1.75rem 1.75rem 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .topic-icon-large { font-size: 3rem; line-height: 1; }
        .topic-label-premium {
          font-family: 'Fredoka', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .topic-description-premium {
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.6;
          flex: 1;
        }
        .topic-tags-flex { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .small-tag {
          background: var(--accent-soft);
          color: var(--accent);
          padding: 0.25rem 0.7rem;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.3px;
        }
        .topic-creator-tag {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .topic-card-footer {
          padding: 1rem 1.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-light);
          margin-top: 0.5rem;
        }
        .topic-q-count { font-size: 0.8rem; color: var(--text-muted); font-weight: 700; }
        .topic-launch-btn {
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: 0.3s;
        }
        .topic-card-premium:hover .topic-launch-btn { transform: scale(1.05); }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.2s ease;
        }
        .modal-card-premium {
          width: 100%; max-width: 520px; overflow: hidden; border: none;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-header-premium {
          padding: 2rem 2rem 1.75rem; color: white;
          display: flex; align-items: center; gap: 1.25rem; position: relative;
        }
        .modal-icon-glow { font-size: 2.75rem; text-shadow: 0 0 20px rgba(255,255,255,0.4); }
        .modal-title-text { font-family: 'Fredoka', sans-serif; font-size: 1.7rem; margin-bottom: 2px; }
        .modal-subtitle-text { opacity: 0.8; font-size: 0.85rem; }
        .modal-close-btn {
          position: absolute; top: 1.25rem; right: 1.25rem;
          background: rgba(255,255,255,0.2); width: 32px; height: 32px;
          border-radius: 50%; color: white; font-weight: 800; cursor: pointer;
          border: none; font-size: 0.85rem; transition: 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .modal-close-btn:hover { background: rgba(255,255,255,0.35); }

        .modal-body-premium { padding: 2rem; display: flex; flex-direction: column; gap: 1.75rem; }
        .config-title {
          font-size: 0.75rem; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 1rem; font-weight: 800;
        }

        .diff-selection-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
        .premium-diff-btn {
          padding: 0.85rem 0.5rem;
          border: 2px solid var(--border-light);
          background: var(--bg-app);
          border-radius: 12px; cursor: pointer; transition: 0.25s;
          display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
        }
        .premium-diff-btn:hover { border-color: var(--diff-color); transform: translateY(-2px); }
        .premium-diff-btn.active {
          border-color: var(--diff-color);
          background: color-mix(in srgb, var(--diff-color) 12%, var(--bg-app));
        }
        .premium-diff-btn .p-diff-icon { font-size: 1.3rem; }
        .premium-diff-btn .p-diff-label { font-size: 0.75rem; font-weight: 800; color: var(--text-main); }
        .premium-diff-btn .p-diff-desc { font-size: 0.6rem; color: var(--text-muted); text-align: center; }

        .amount-selection-flex { display: flex; gap: 0.75rem; }
        .premium-amount-btn {
          flex: 1; padding: 0.85rem 0.5rem;
          border: 2px solid var(--border-light); background: var(--bg-app);
          border-radius: 12px; font-weight: 800; color: var(--text-main);
          cursor: pointer; transition: 0.25s; font-size: 1.1rem;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
        }
        .premium-amount-btn span { font-size: 0.6rem; font-weight: 700; color: var(--text-muted); }
        .premium-amount-btn:hover { border-color: var(--primary); transform: translateY(-2px); }
        .premium-amount-btn.active {
          border-color: var(--primary); background: var(--accent-soft); color: var(--primary);
        }
        .premium-amount-btn.active span { color: var(--primary); }

        .modal-final-btn {
          padding: 1.1rem; border-radius: 14px; border: none; color: white;
          font-size: 1.1rem; font-weight: 800; cursor: pointer;
          font-family: 'Fredoka', sans-serif;
          box-shadow: 0 8px 25px rgba(0,0,0,0.12); transition: 0.3s;
          letter-spacing: 0.3px;
        }
        .modal-final-btn:hover { transform: translateY(-3px); box-shadow: 0 14px 35px rgba(0,0,0,0.2); }

        @media (max-width: 768px) {
          .browse-header { flex-direction: column; }
          .diff-selection-grid { grid-template-columns: repeat(2, 1fr); }
          .topics-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
