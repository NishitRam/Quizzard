import React, { useState, useEffect, useRef } from 'react';
import QuizPlayer from './QuizPlayer';
import MyQuizzes from '../components/dashboard/MyQuizzes';
import CreateQuiz from '../components/dashboard/CreateQuiz';
import BrowseQuizzes from '../components/dashboard/BrowseQuizzes';
import MagicShuffle from '../components/dashboard/MagicShuffle';
import DynamicQuizView from '../components/dashboard/DynamicQuizView';
import ReportsDashboard from '../components/dashboard/ReportsDashboard';
import Profile from '../components/dashboard/Profile';
import { useQuiz } from '../context/QuizContext';

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ currentView, navigateTo, onLogout }) => {
  const menuItems = [
    { id: 'dashboard',  label: 'Home' },
    { id: 'quiz',       label: 'Take Quiz' },
    { id: 'magic_shuffle', label: 'Magic Shuffle' },
    { id: 'myquizzes',  label: 'My Quizzes' },
    { id: 'leaderboard',label: 'Leaderboard' },
    { id: 'create',     label: 'Create Quiz' },
    { id: 'profile',    label: 'Profile' },
  ];

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  return (
    <aside className="premium-sidebar">
      <div className="sidebar-brand" onClick={() => navigateTo('dashboard')}>
        <div className="brand-logo">Q</div>
        <span className="brand-name">Quizzard</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`nav-item ${currentView === item.id || (currentView === 'browse' && item.id === 'quiz') || (currentView === 'dynamic_quiz' && item.id === 'quiz') ? 'active' : ''}`}
          >
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

// ─── Header ──────────────────────────────────────────────────────────────────
const Header = ({ user, notifications, markRead, markAllRead, onPublish, theme, toggleTheme, onLogout }) => {
  const [showNotif,   setShowNotif]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef   = useRef();
  const profileRef = useRef();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Helper for notification icons and types
  const getNotifMeta = (msg) => {
    const text = msg.toLowerCase();
    if (text.includes('welcome') || text.includes('magic')) return { icon: '🧙', color: '#8b5cf6' };
    if (text.includes('pass') || text.includes('score') || text.includes('achieve')) return { icon: '🏆', color: '#f59e0b' };
    if (text.includes('new quiz') || text.includes('published')) return { icon: '⚡', color: '#ef4444' };
    return { icon: '✨', color: '#6366f1' };
  };

  // Grouping logic
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = {
    Today: [],
    Yesterday: [],
    Earlier: []
  };

  notifications.forEach(n => {
    const d = new Date(n.createdAt);
    if (d >= today) groups.Today.push(n);
    else if (d >= yesterday) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  });

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1>Welcome back, {user?.fullName?.split(' ')[0] || 'Wizard'}! 👋</h1>
        <p>Your magic grows stronger with every quiz.</p>
      </div>
      <div className="header-right">
        <button className="theme-toggle-dashboard" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <button className="publish-quiz-btn" onClick={onPublish}>
          <span>+</span> Create Quiz
        </button>

        {/* Notifications */}
        <div className="notif-wrapper" ref={notifRef}>
          <button className={`icon-btn ${unreadCount > 0 ? 'has-unread' : ''}`} onClick={() => setShowNotif(!showNotif)}>
            🔔
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          {showNotif && (
            <div className="notif-dropdown premium-card animate-slide-down">
              <div className="notif-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-btn" onClick={() => { markAllRead(); setShowNotif(false); }}>
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="notif-list-modern">
                {notifications.length > 0 ? Object.entries(groups).map(([label, items]) => (
                  items.length > 0 && (
                    <div key={label} className="notif-group">
                      <div className="notif-group-label">{label}</div>
                      {items.map(n => {
                        const meta = getNotifMeta(n.message);
                        return (
                          <div 
                            key={n._id} 
                            className={`notif-item-modern ${!n.read ? 'unread' : ''}`} 
                            onClick={() => { markRead(n._id); setShowNotif(false); }}
                          >
                            <div className="notif-icon-circle" style={{ background: `${meta.color}15`, color: meta.color }}>
                              {meta.icon}
                            </div>
                            <div className="notif-content-modern">
                              <p>{n.message}</p>
                              <span className="notif-time">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {!n.read && <div className="unread-dot" style={{ background: meta.color }}></div>}
                          </div>
                        );
                      })}
                    </div>
                  )
                )) : (
                  <div className="notif-empty-state">
                    <div className="empty-notif-icon">✨</div>
                    <p>All caught up!</p>
                    <span>No new magical messages</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="profile-wrapper" ref={profileRef}>
          <button className="avatar-btn" onClick={() => setShowProfile(!showProfile)}>
            {user?.avatar
              ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'12px' }} />
              : (user?.fullName?.charAt(0) || 'W')
            }
          </button>
          {showProfile && (
            <div className="profile-dropdown premium-card">
              <div className="profile-info">
                <strong>{user?.fullName}</strong>
                <span>{user?.email}</span>
              </div>
              <button onClick={() => { window.location.hash = 'profile'; setShowProfile(false); }}>👤 My Profile</button>
              <button className="logout-item" onClick={onLogout}>🚪 Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, onClick }) => (
  <div className={`stat-card premium-card ${onClick ? 'clickable-stat' : ''}`} style={{ '--accent-color': color }} onClick={onClick}>
    <div className="stat-icon" style={{ background: color }}>{icon}</div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </div>
);

// ─── Quick Quiz Launcher ─────────────────────────────────────────────────────
const QUICK_TOPICS = [
  { id: 'react',   label: 'React',      icon: '⚛️', g: 'linear-gradient(135deg,#0984e3,#00cec9)' },
  { id: 'node',    label: 'Node.js',    icon: '🟢', g: 'linear-gradient(135deg,#00b09b,#96c93d)' },
  { id: 'mongodb', label: 'MongoDB',    icon: '🍃', g: 'linear-gradient(135deg,#11998e,#38ef7d)' },
  { id: 'js',      label: 'JavaScript', icon: '🟨', g: 'linear-gradient(135deg,#f7971e,#ffd200)' },
  { id: 'sql',     label: 'SQL',        icon: '🗄️', g: 'linear-gradient(135deg,#ec4899,#8b5cf6)' },
  { id: 'mern',    label: 'Full MERN',  icon: '🧙‍♂️', g: 'linear-gradient(135deg,#667eea,#764ba2)' },
];

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ initialView = 'dashboard' }) {
  const {
    user, getStats, quizzes, leaderboard, loading, theme, toggleTheme,
    setCurrentQuiz, dbHistory, notifications, markNotificationRead, markAllNotificationsRead, logout
  } = useQuiz();

  const [currentView,  setCurrentView]  = useState(initialView);
  const [quizConfig,   setQuizConfig]   = useState(null); // { topic, difficulty, amount }

  useEffect(() => { setCurrentView(initialView); }, [initialView]);

  useEffect(() => {
    if (!user && !loading) window.location.hash = 'auth';
  }, [user, loading]);

  if (!user) return null;

  const stats = getStats();

  const navigateTo = (view) => {
    if (view !== 'dynamic_quiz') setQuizConfig(null);
    const hashMap = { 
      dashboard: 'dashboard', 
      quiz: 'quiz', 
      magic_shuffle: 'magic_shuffle',
      myquizzes: 'myquizzes', 
      leaderboard: 'leaderboard', 
      create: 'create', 
      profile: 'profile', 
      browse: 'browse' 
    };
    if (hashMap[view]) window.location.hash = hashMap[view];
    setCurrentView(view);
  };

  const launchDynamicQuiz = (config) => {
    setQuizConfig(config);
    setCurrentView('dynamic_quiz');
  };

  const getSubjectColor = (s = '') => {
    s = s.toLowerCase();
    if (s.includes('mongo')) return '#10b981';
    if (s.includes('react')) return '#3b82f6';
    if (s.includes('node'))  return '#4ade80';
    if (s.includes('express')) return '#6366f1';
    if (s.includes('sql'))   return '#ec4899';
    if (s.includes('js') || s.includes('javascript')) return '#f59e0b';
    return '#8b5cf6';
  };

  const topicToQuizId = (subject = '') => {
    const s = subject.toLowerCase();
    if (s.includes('mongo'))   return 'mongodb';
    if (s.includes('react'))   return 'react';
    if (s.includes('node'))    return 'node';
    if (s.includes('express')) return 'express';
    if (s.includes('sql'))     return 'sql';
    if (s.includes('js') || s.includes('javascript')) return 'js';
    return 'mern';
  };

  // ── Views ──
  const renderView = () => {
    switch (currentView) {

      case 'quiz':
      case 'browse':
        return (
          <BrowseQuizzes
            onStartQuiz={(config) => launchDynamicQuiz(config)}
          />
        );

      case 'dynamic_quiz':
        return quizConfig ? (
          <DynamicQuizView
            topic={quizConfig.topic}
            difficulty={quizConfig.difficulty}
            amount={quizConfig.amount}
            providedQuestions={quizConfig.providedQuestions}
            onBack={() => navigateTo(quizConfig.fromView || 'quiz')}
          />
        ) : null;

      case 'magic_shuffle':
        return (
          <div className="magic-shuffle-wrapper animate-fade-in">
            <MagicShuffle onStartMagic={(config) => launchDynamicQuiz({ ...config, fromView: 'magic_shuffle' })} />
          </div>
        );

      case 'quiz_active':
        return <QuizPlayer onBack={() => navigateTo('dashboard')} />;

      case 'myquizzes':
        return (
          <MyQuizzes 
            onRetry={(topic, amount) => launchDynamicQuiz({ topic: topicToQuizId(topic), difficulty: 'medium', amount: amount || 10, fromView: 'myquizzes' })} 
            onPlayCreated={(config) => launchDynamicQuiz({ ...config, fromView: 'myquizzes' })} 
          />
        );

      case 'create':
        return <CreateQuiz />;

      case 'leaderboard':
        return <ReportsDashboard />;

      case 'profile':
        return <Profile />;

      default:
        return (
          <div className="dashboard-overview animate-fade-in">

            {/* Stats Grid */}
            <div className="stats-grid">
              <StatCard label="Quizzes Completed" value={stats.totalCompleted}          icon="📚" color="#6366f1" onClick={() => navigateTo('myquizzes')} />
              <StatCard label="Average Score"      value={`${stats.averageScore}%`}     icon="⭐" color="#f59e0b" />
              <StatCard label="Day Streak"          value={`${stats.streak} days`}       icon="🔥" color="#ef4444" />
              <StatCard label="Global Rank"         value={`#${stats.rank || '—'}`}      icon="🏅" color="#10b981" onClick={() => navigateTo('leaderboard')} />
            </div>

            {/* Quick Play Strip */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="text-gradient">⚡ Quick Play</h2>
                <button className="view-all-btn" onClick={() => navigateTo('quiz')}>Browse All →</button>
              </div>
              <div className="quick-play-strip">
                {QUICK_TOPICS.map(t => (
                  <button
                    key={t.id}
                    className="quick-topic-btn"
                    style={{ '--qt-bg': t.g }}
                    onClick={() => launchDynamicQuiz({ topic: t.id, difficulty: 'medium', amount: 10 })}
                  >
                    <span className="qt-icon">{t.icon}</span>
                    <span className="qt-label">{t.label}</span>
                    <span className="qt-cta">Play →</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Community Quizzes */}
            {quizzes.length > 0 && (
              <section className="dashboard-section">
                <div className="section-header">
                  <h2 className="text-gradient">🌐 Community Quizzes</h2>
                  <button className="view-all-btn" onClick={() => navigateTo('myquizzes')}>View All →</button>
                </div>
                <div className="quiz-grid">
                  {quizzes.filter(q => q.questions?.length > 1).slice(0, 4).map(q => (
                    <div
                      key={q._id}
                      className="quiz-card-premium premium-card"
                      onClick={() => {
                        // Map community quiz questions to the standard format
                        const mappedQuestions = q.questions?.map(questionData => ({
                          question: questionData.question,
                          options: questionData.options,
                          correctAnswer: questionData.correctAnswer
                        }));

                        launchDynamicQuiz({ 
                          topic: topicToQuizId(q.subject), 
                          difficulty: q.difficulty?.toLowerCase() || 'medium', 
                          amount: Math.min(q.questions?.length || 10, 10),
                          providedQuestions: mappedQuestions,
                          fromView: 'dashboard'
                        });
                      }}
                    >
                      <div className="quiz-card-head">
                        <span className="subject-tag" style={{ background: getSubjectColor(q.subject) }}>{q.subject}</span>
                        <div className="quiz-logo-circle">⚡</div>
                      </div>
                      <div className="quiz-card-body">
                        <h4>{q.title}</h4>
                        <p className="quiz-desc">{q.description}</p>
                        <div className="quiz-author-info">
                          <span className="author-icon">👤</span>
                          <span className="author-name">By {q.authorName || 'Community Wizard'}</span>
                        </div>
                      </div>
                      <div className="quiz-card-footer">
                        <span className="q-count">{q.questions?.length || 0} questions</span>
                        <button className="start-quiz-btn">Play Now ⚡</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Activity */}
            <section className="dashboard-section activity-section">
              <h2 className="text-gradient">📊 Recent Activity</h2>
              <div className="activity-list premium-card">
                {dbHistory.length > 0 ? dbHistory.map((item, i) => (
                  <div key={i} className="activity-item">
                    <div className={`activity-status-icon ${item.passed ? 'passed' : 'failed'}`}>
                      {item.passed ? '✅' : '❌'}
                    </div>
                    <div className="activity-details">
                      <h4>{item.topic}</h4>
                      <div className="activity-meta">
                        <span className={`score-chip ${item.passed ? 'pass' : 'fail'}`}>{item.score}%</span>
                        <span className="dot">•</span>
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                      className="minimal-retry-btn" 
                      onClick={() => launchDynamicQuiz({ 
                        topic: topicToQuizId(item.topic), 
                        difficulty: 'medium', 
                        amount: item.totalQuestions || 10, 
                        fromView: 'dashboard' 
                      })}
                    >
                      Retry →
                    </button>
                  </div>
                )) : (
                  <div className="empty-activity">
                    <div className="empty-icon">🚀</div>
                    <p>No recent activity yet. Start your journey!</p>
                    <button className="cta-start-btn" onClick={() => navigateTo('quiz')}>Take your first quiz</button>
                  </div>
                )}
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="premium-dashboard">
      <Sidebar currentView={currentView} navigateTo={navigateTo} onLogout={logout} />
      <main className="dashboard-main">
        <Header
          user={user}
          notifications={notifications}
          markRead={markNotificationRead}
          markAllRead={markAllNotificationsRead}
          onPublish={() => navigateTo('create')}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={logout}
        />
        <div className="dashboard-content-scroll">
          {renderView()}
        </div>
      </main>

      <style>{`
        /* ── Layout ── */
        .premium-dashboard {
          display: flex; height: 100vh;
          background: var(--bg-app); font-family: 'Outfit', sans-serif;
          overflow: hidden; transition: background 0.3s;
        }

        /* ── Sidebar ── */
        .premium-sidebar {
          width: 260px; background: var(--bg-sidebar); display: flex;
          flex-direction: column; height: 100vh; flex-shrink: 0;
          z-index: 100; box-shadow: 4px 0 20px rgba(0,0,0,0.1); transition: 0.3s;
        }
        .sidebar-brand {
          padding: 1.75rem 1.5rem; display: flex; align-items: center; gap: 0.85rem;
          cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .brand-logo {
          width: 38px; height: 38px; background: white; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; color: var(--accent); font-size: 1.3rem; flex-shrink: 0;
        }
        .brand-name { font-family: 'Fredoka', sans-serif; font-size: 1.5rem; font-weight: 700; color: white; }
        .sidebar-nav { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
        .nav-item {
          display: flex; align-items: center; gap: 0.9rem; padding: 0.85rem 1.25rem;
          border: none; background: none; color: rgba(255,255,255,0.6); border-radius: 12px;
          cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: all 0.2s; width: 100%; text-align: left;
        }
        .nav-item:hover { background: rgba(255,255,255,0.08); color: white; transform: translateX(2px); }
        .nav-item.active { background: white; color: var(--accent); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .nav-icon { font-size: 1.15rem; width: 24px; text-align: center; }
        .sidebar-footer { padding: 1.25rem 0.75rem; border-top: 1px solid rgba(255,255,255,0.08); }
        .sidebar-logout-btn {
          display: flex; align-items: center; gap: 0.9rem; width: 100%; padding: 0.85rem 1.25rem;
          background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer;
          border-radius: 12px; font-weight: 600; transition: 0.2s; font-size: 0.95rem;
        }
        .sidebar-logout-btn:hover { background: rgba(239,68,68,0.15); color: #ef4444; }

        /* ── Header ── */
        .dashboard-main { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
        .dashboard-header {
          padding: 1.1rem 2.5rem;
          background: var(--bg-navbar); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-light);
          display: flex; justify-content: space-between; align-items: center;
          z-index: 90; transition: 0.3s; flex-shrink: 0;
        }
        .header-left h1 { font-family: 'Fredoka', sans-serif; font-size: 1.5rem; color: var(--text-main); margin-bottom: 2px; }
        .header-left p { color: var(--text-muted); font-size: 0.85rem; }
        .header-right { display: flex; align-items: center; gap: 1rem; }
        .theme-toggle-dashboard {
          font-size: 1.1rem; width: 38px; height: 38px; border-radius: 10px;
          background: var(--border-light); border: none; cursor: pointer; transition: 0.2s;
        }
        .theme-toggle-dashboard:hover { transform: scale(1.1); }
        .publish-quiz-btn {
          background: var(--primary); color: white; border: none; padding: 0.6rem 1.25rem;
          border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s;
          display: flex; align-items: center; gap: 6px; font-size: 0.9rem;
        }
        .publish-quiz-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .icon-btn {
          background: var(--border-light); border: none; width: 38px; height: 38px;
          border-radius: 10px; font-size: 1rem; cursor: pointer; position: relative;
          display: flex; align-items: center; justify-content: center; transition: 0.2s;
        }
        .icon-btn:hover { background: var(--border-strong); }
        .notif-badge {
          position: absolute; top: -5px; right: -5px; background: #ef4444; color: white;
          width: 17px; height: 17px; border-radius: 50%; font-size: 0.6rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .avatar-btn {
          width: 38px; height: 38px; border-radius: 12px; background: var(--primary); color: white;
          border: none; font-weight: 900; font-size: 1rem; cursor: pointer; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .notif-wrapper, .profile-wrapper { position: relative; }
        .notif-dropdown, .profile-dropdown {
          position: absolute; right: 0; top: calc(100% + 10px); z-index: 1000;
          min-width: 280px; box-shadow: var(--shadow-lg, 0 20px 40px rgba(0,0,0,0.15));
          animation: dropDown 0.2s ease;
        }
        @keyframes dropDown { from { opacity:0; transform: translateY(-8px); } }
        .profile-dropdown { min-width: 200px; }
        .notif-header, .profile-info {
          padding: 1rem 1.25rem; font-weight: 800; border-bottom: 1px solid var(--border-light);
          color: var(--text-main); font-size: 0.9rem;
        }
        .profile-info strong { display: block; color: var(--text-main); font-size: 0.95rem; }
        .profile-info span { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
        .notif-item { padding: 0.9rem 1.25rem; border-bottom: 1px solid var(--border-light); cursor: pointer; transition: 0.2s; }
        .notif-item:hover { background: var(--border-light); }
        .notif-item.unread { background: var(--accent-soft); border-left: 3px solid var(--accent); }
        .notif-item p { font-size: 0.85rem; color: var(--text-main); margin-bottom: 3px; }
        .notif-item span { font-size: 0.7rem; color: var(--text-muted); }
        .notif-empty { padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem; }
        .profile-dropdown button {
          width: 100%; padding: 0.85rem 1.25rem; text-align: left; background: none; border: none;
          cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: 0.2s; color: var(--text-main);
        }
        .profile-dropdown button:hover { background: var(--border-light); color: var(--primary); }
        .logout-item { color: #ef4444 !important; }

        /* ── Content ── */
        .dashboard-content-scroll { padding: 2rem 2.5rem; overflow-y: auto; flex: 1; }

        /* ── Stats ── */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
        .stat-card { padding: 1.5rem; display: flex; align-items: center; gap: 1rem; }
        .clickable-stat { cursor: pointer; transition: 0.25s; }
        .clickable-stat:hover { transform: translateY(-3px); }
        .stat-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: white; flex-shrink: 0; }
        .stat-info h3 { font-size: 1.6rem; font-weight: 900; color: var(--text-main); margin-bottom: 2px; font-family: 'Fredoka', sans-serif; }
        .stat-info p { color: var(--text-muted); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        /* ── Quick Play ── */
        .quick-play-strip { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
        .quick-topic-btn {
          background: var(--qt-bg); color: white; border: none; border-radius: 16px;
          padding: 1.25rem 1rem; cursor: pointer; transition: 0.3s;
          display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .quick-topic-btn:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 12px 25px rgba(0,0,0,0.18); }
        .qt-icon { font-size: 2rem; }
        .qt-label { font-weight: 800; font-size: 0.9rem; }
        .qt-cta { font-size: 0.7rem; opacity: 0.8; font-weight: 700; }

        /* ── Notifications Modern ── */
        .notif-dropdown {
          width: 340px; right: 0; top: 110%; padding: 0.5rem;
          border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(25px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        .notif-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .notif-header h3 { font-size: 1.1rem; color: white; margin: 0; }
        .mark-all-btn { 
          background: none; border: none; color: var(--accent); font-size: 0.8rem;
          cursor: pointer; font-weight: 600; opacity: 0.8; transition: 0.2s;
        }
        .mark-all-btn:hover { opacity: 1; text-decoration: underline; }

        .notif-list-modern { max-height: 400px; overflow-y: auto; padding: 0.5rem; }
        .notif-group-label {
          font-size: 0.75rem; font-weight: 800; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 1px; padding: 1.25rem 0.5rem 0.75rem;
        }
        .notif-item-modern {
          display: flex; gap: 1rem; padding: 0.85rem; border-radius: 12px;
          cursor: pointer; transition: 0.2s; position: relative; margin-bottom: 0.25rem;
        }
        .notif-item-modern:hover { background: rgba(255,255,255,0.05); }
        .notif-item-modern.unread { background: rgba(99,102,241,0.05); }
        
        .notif-icon-circle {
          width: 40px; height: 40px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;
        }
        .notif-content-modern { flex: 1; }
        .notif-content-modern p { font-size: 0.9rem; color: var(--text-main); margin-bottom: 0.25rem; line-height: 1.4; }
        .notif-time { font-size: 0.75rem; color: var(--text-muted); }

        .unread-dot {
          width: 8px; height: 8px; border-radius: 50%; position: absolute;
          right: 1rem; top: 1.25rem;
        }

        .notif-empty-state {
          padding: 3rem 1rem; text-align: center;
        }
        .empty-notif-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .notif-empty-state p { color: white; font-weight: 700; font-size: 1rem; margin-bottom: 0.25rem; }
        .notif-empty-state span { color: var(--text-muted); font-size: 0.85rem; }

        .icon-btn.has-unread { animation: ring 4s infinite; }
        @keyframes ring {
          0% { transform: rotate(0); }
          1% { transform: rotate(30deg); }
          3% { transform: rotate(-28deg); }
          5% { transform: rotate(34deg); }
          7% { transform: rotate(-32deg); }
          9% { transform: rotate(30deg); }
          11% { transform: rotate(-28deg); }
          13% { transform: rotate(26deg); }
          15% { transform: rotate(-24deg); }
          17% { transform: rotate(22deg); }
          19% { transform: rotate(-20deg); }
          21% { transform: rotate(18deg); }
          23% { transform: rotate(-16deg); }
          25% { transform: rotate(14deg); }
          27% { transform: rotate(-12deg); }
          29% { transform: rotate(10deg); }
          31% { transform: rotate(-8deg); }
          33% { transform: rotate(6deg); }
          35% { transform: rotate(-4deg); }
          37% { transform: rotate(2deg); }
          39% { transform: rotate(-1deg); }
          41% { transform: rotate(1deg); }
          43% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }

        .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Profile ── */
        .dashboard-section { margin-bottom: 2.5rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .section-header h2 { font-family: 'Fredoka', sans-serif; font-size: 1.4rem; }
        .view-all-btn { color: var(--primary); font-weight: 700; font-size: 0.85rem; background: none; border: none; cursor: pointer; transition: 0.2s; }
        .view-all-btn:hover { opacity: 0.75; }

        /* ── Quiz Cards ── */
        .quiz-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.25rem; }
        .quiz-card-premium { padding: 1.5rem; cursor: pointer; display: flex; flex-direction: column; transition: 0.25s; }
        .quiz-card-premium:hover { transform: translateY(-4px); }
        .quiz-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .subject-tag { padding: 3px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 900; color: white; text-transform: uppercase; letter-spacing: 0.3px; }
        .quiz-logo-circle { width: 30px; height: 30px; background: var(--bg-app); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .quiz-card-premium h4 { font-size: 1rem; color: var(--text-main); margin-bottom: 0.5rem; line-height: 1.4; font-weight: 700; }
        .quiz-desc { color: var(--text-muted); font-size: 0.82rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .quiz-author-info { display: flex; align-items: center; gap: 5px; margin-top: 0.6rem; font-size: 0.75rem; color: var(--text-muted); }
        .author-name { font-weight: 700; color: var(--primary); }
        .quiz-card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-light); margin-top: auto; }
        .q-count { color: var(--text-muted); font-size: 0.75rem; font-weight: 700; }
        .start-quiz-btn { background: var(--accent-soft); color: var(--accent); padding: 5px 12px; border-radius: 8px; font-weight: 800; font-size: 0.78rem; transition: 0.2s; border: none; cursor: pointer; }
        .quiz-card-premium:hover .start-quiz-btn { background: var(--accent); color: white; }

        /* ── Activity ── */
        .activity-list { overflow: hidden; }
        .activity-item { padding: 1.1rem 1.5rem; display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border-light); transition: 0.2s; }
        .activity-item:last-child { border-bottom: none; }
        .activity-item:hover { background: var(--border-light); }
        .activity-status-icon { font-size: 1.2rem; }
        .activity-details { flex: 1; }
        .activity-details h4 { color: var(--text-main); font-size: 0.9rem; margin-bottom: 3px; font-weight: 700; }
        .activity-meta { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.78rem; }
        .score-chip { padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 0.72rem; }
        .score-chip.pass { background: rgba(16,185,129,0.12); color: #10b981; }
        .score-chip.fail { background: rgba(239,68,68,0.12); color: #ef4444; }
        .dot { font-size: 6px; opacity: 0.4; }
        .minimal-retry-btn { color: var(--primary); font-weight: 700; font-size: 0.82rem; background: none; border: none; cursor: pointer; transition: 0.2s; white-space: nowrap; }
        .minimal-retry-btn:hover { opacity: 0.75; }
        .empty-activity { padding: 3rem 2rem; text-align: center; color: var(--text-muted); }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.6; }
        .cta-start-btn { margin-top: 1.25rem; background: var(--primary); color: white; padding: 0.75rem 1.75rem; border-radius: 12px; font-weight: 700; transition: 0.2s; border: none; cursor: pointer; }
        .cta-start-btn:hover { opacity: 0.9; transform: translateY(-2px); }

        /* ── Leaderboard ── */
        .leaderboard-container { max-width: 750px; }
        .lb-top-bar { margin-bottom: 1.75rem; }
        .lb-top-bar h2 { font-family: 'Fredoka', sans-serif; font-size: 1.75rem; margin-bottom: 4px; }
        .leaderboard-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .lb-row { padding: 1rem 1.5rem; display: flex; align-items: center; gap: 1rem; border-radius: 14px; transition: 0.2s; }
        .lb-row:hover { transform: translateX(4px); }
        .lb-row-me { border: 2px solid var(--primary) !important; background: var(--accent-soft) !important; }
        .lb-rank { width: 42px; font-weight: 900; font-size: 1.1rem; text-align: center; flex-shrink: 0; }
        .lb-rank-top1 { color: #f59e0b; }
        .lb-rank-top2 { color: #94a3b8; }
        .lb-rank-top3 { color: #cd7c2f; }
        .lb-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; flex-shrink: 0; }
        .lb-name { font-weight: 700; color: var(--text-main); flex: 1; font-size: 0.95rem; }
        .lb-score-bar-wrap { width: 120px; height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
        .lb-score-bar { height: 100%; background: var(--primary); border-radius: 3px; transition: width 1s ease; }
        .lb-pts { font-weight: 800; color: var(--text-main); font-size: 0.9rem; min-width: 60px; text-align: right; }
        .empty-state-card { padding: 3rem; text-align: center; }
        .empty-state-card h3 { font-family: 'Fredoka', sans-serif; font-size: 1.3rem; color: var(--text-main); margin-bottom: 0.5rem; }
        .empty-state-card p { color: var(--text-muted); margin-bottom: 1.5rem; }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .premium-sidebar { width: 70px; }
          .brand-name, .nav-label, .sidebar-logout-btn .nav-label { display: none; }
          .sidebar-brand { justify-content: center; padding: 1.5rem 0; }
          .nav-item { justify-content: center; padding: 0.85rem; }
          .dashboard-content-scroll { padding: 1.5rem; }
          .dashboard-header { padding: 1rem 1.5rem; }
        }
        @media (max-width: 768px) {
          .premium-sidebar { display: none; }
          .quick-play-strip { grid-template-columns: repeat(3, 1fr); }
          .dashboard-header { padding: 1rem; }
        }

        .full-view-container { width: 100%; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
