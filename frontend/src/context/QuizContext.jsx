import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// ─── Create Context ───────────────────────────────────────────
const QuizContext = createContext();

// ─── Custom Hook ──────────────────────────────────────────────
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

// ─── Helper: read user from localStorage ──────────────────────
const getUserFromStorage = () => {
  try {
    const saved = localStorage.getItem('quizzardUser');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// ─── Provider ─────────────────────────────────────────────────
export const QuizProvider = ({ children }) => {

  // ── User (null when logged out) ──
  const [user, setUser] = useState(() => getUserFromStorage());

  // ── Quiz History ──
  const [quizHistory, setQuizHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('quizzardHistory');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // ── User Stats ──
  const [userStats, setUserStats] = useState(() => {
    try {
      const saved = localStorage.getItem('quizzardStats');
      return saved ? JSON.parse(saved) : {
        totalQuizzes: 0,
        totalScore: 0,
        streak: 0,
        rank: 0,
        lastQuizDate: null
      };
    } catch {
      return { totalQuizzes: 0, totalScore: 0, streak: 0, rank: 0, lastQuizDate: null };
    }
  });

  // ── Current Quiz being played ──
  const [currentQuiz, setCurrentQuiz] = useState(null);

  // ── Leaderboard ──
  const [leaderboard, setLeaderboard] = useState(() => {
    try {
      const saved = localStorage.getItem('quizzardLeaderboard');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── All DB Quizzes from backend ──
  const [quizzes, setQuizzes] = useState([]);
  const [dbHistory, setDbHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── User's created quizzes ──
  const [createdQuizzes, setCreatedQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem('quizzardCreated');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // ── Theme State ──
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('quizzardTheme') || 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quizzardTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // ── Listen for storage changes (login from another component) ──
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = getUserFromStorage();
      setUser(storedUser);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ─── Data Fetching ───────────────────────────────────────────
  
  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/quizzes');
      if (res.data.success) {
        setQuizzes(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch quizzes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (localStorage.getItem('quizzardToken')) {
      try {
        const res = await api.get('/users/me/stats');
        if (res.data.success) {
          setUserStats(res.data.data);
        }
        
        // Fetch History
        const histRes = await api.get('/users/me/history');
        if (histRes.data.success) {
          setDbHistory(histRes.data.data);
        }

        // Fetch Notifications
        const notifRes = await api.get('/users/me/notifications');
        if (notifRes.data.success) {
          setNotifications(notifRes.data.data);
        }
      } catch (err) {
        console.warn('Could not fetch user data:', err.message);
      }
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.post(`/users/me/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.warn('Could not mark notification read:', err.message);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      // Optimistic local update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      // Backend sync
      await api.post('/users/me/notifications/read-all');
    } catch (err) {
      console.warn('Could not mark all notifications read:', err.message);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/users/leaderboard');
      if (res.data.success && res.data.data.length > 0) {
        setLeaderboard(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch leaderboard:', err.message);
    }
  };

  const refreshAllData = () => {
    fetchQuizzes();
    fetchStats();
    fetchLeaderboard();
  };

  // Initial fetch and fetch on user change
  useEffect(() => {
    refreshAllData();
  }, [user]);

  // ─── Authentication Actions ───────────────────────────────────

  const login = (userData, token) => {
    localStorage.setItem('quizzardToken', token);
    localStorage.setItem('quizzardUser', JSON.stringify(userData));
    setUser(userData);
    // Fetch stats immediately for this user
    fetchStats();
  };

  const logout = () => {
    localStorage.removeItem('quizzardToken');
    localStorage.removeItem('quizzardUser');
    localStorage.removeItem('quizzardStats');
    localStorage.removeItem('quizzardHistory');
    setUser(null);
    setUserStats({ totalQuizzes: 0, totalScore: 0, streak: 0, rank: 0, lastQuizDate: null });
    setQuizHistory([]);
    setCreatedQuizzes([]);
    // Reset to landing
    window.location.hash = 'landing';
  };

  // ── Persist state to localStorage ──
  useEffect(() => {
    if (user) {
      localStorage.setItem('quizzardUser', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('quizzardHistory', JSON.stringify(quizHistory));
  }, [quizHistory]);

  useEffect(() => {
    localStorage.setItem('quizzardStats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('quizzardLeaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem('quizzardCreated', JSON.stringify(createdQuizzes));
  }, [createdQuizzes]);

  // ─────────────────────────────────────────────────────────────
  // Add a completed quiz to history and update stats
  // ─────────────────────────────────────────────────────────────
  const addQuizResult = (quizData) => {
    const newResult = {
      id: Date.now(),
      topic: quizData.topic,
      icon: quizData.icon || '📝',
      color: quizData.color || '#667eea',
      score: quizData.score,          // already a percentage (0-100)
      totalQuestions: quizData.totalQuestions,
      correctAnswers: quizData.correctAnswers,
      date: new Date().toISOString(),
      timeTaken: quizData.timeTaken,
      passed: quizData.score >= 60    // percentage ≥ 60 = pass
    };

    setQuizHistory(prev => [newResult, ...prev]);

    // Update local stats
    setUserStats(prev => ({
      totalQuizzes: prev.totalQuizzes + 1,
      totalScore: prev.totalScore + quizData.score,
      streak: calculateStreak([newResult, ...quizHistory]),
      rank: calculateRank(prev.totalScore + quizData.score),
      lastQuizDate: new Date().toISOString()
    }));

    // Update local leaderboard
    updateLeaderboard(quizData.score);

    // POST to backend
    if (localStorage.getItem('quizzardToken')) {
      api.post('/users/update-score', {
        score: quizData.score,
        topic: quizData.topic,
        totalQuestions: quizData.totalQuestions,
        correctAnswers: quizData.correctAnswers
      })
      .then(() => fetchStats()) // Refresh all data from DB
      .catch(err => console.warn('Backend score update failed:', err.message));
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────

  const calculateStreak = (history) => {
    if (!history || history.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < history.length; i++) {
      const quizDate = new Date(history[i].date);
      quizDate.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor((today - quizDate) / (1000 * 60 * 60 * 24));
      if (dayDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const calculateRank = (totalScore) => {
    const sorted = [...leaderboard, { score: totalScore }]
      .sort((a, b) => b.score - a.score);
    return sorted.findIndex(item => item.score === totalScore) + 1;
  };

  const updateLeaderboard = (newScore) => {
    const userId = user?._id || user?.id || 'local-user';
    const userName = user?.fullName || user?.name || 'You';
    
    setLeaderboard(prev => {
      const userIndex = prev.findIndex(e => (e.id === userId || e.name === userName));
      
      let newList;
      if (userIndex !== -1) {
        newList = prev.map((e, i) => i === userIndex 
          ? { ...e, score: e.score + newScore, quizzes: e.quizzes + 1 }
          : e
        );
      } else {
        newList = [...prev, { id: userId, name: userName, score: newScore, quizzes: 1 }];
      }
      
      return newList
        .sort((a, b) => b.score - a.score)
        .map((e, i) => ({ ...e, rank: i + 1 }));
    });
  };

  // ─── User actions ─────────────────────────────────────────────

  // Update user profile fields
  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  // Full reset
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.removeItem('quizzardHistory');
      localStorage.removeItem('quizzardStats');
      localStorage.removeItem('quizzardLeaderboard');
      localStorage.removeItem('quizzardCreated');

      setQuizHistory([]);
      setUserStats({ totalQuizzes: 0, totalScore: 0, streak: 0, rank: 0, lastQuizDate: null });
      setLeaderboard([
        { id: 1, name: 'CodeMaster', score: 850, quizzes: 45, rank: 1 },
        { id: 2, name: 'ReactPro',   score: 820, quizzes: 42, rank: 2 },
        { id: 3, name: 'NodeNinja',  score: 800, quizzes: 40, rank: 3 }
      ]);
      setCreatedQuizzes([]);
    }
  };

  // Add a locally-created quiz (before it's on the backend)
  const addCreatedQuiz = (quizData) => {
    const newQuiz = {
      id: Date.now(),
      ...quizData,
      author: user?.fullName || user?.name || 'Wizard',
      createdAt: new Date().toISOString(),
      attempts: 0,
      rating: 0
    };
    setCreatedQuizzes(prev => [newQuiz, ...prev]);
    return newQuiz;
  };

  // ─── Getters ─────────────────────────────────────────────────

  const getStats = () => {
    const historyData = dbHistory.length > 0 ? dbHistory : quizHistory;
    const totalCompleted = historyData.length;
    const totalPassed = historyData.filter(q => q.passed).length;
    const averageScore = totalCompleted > 0
      ? Math.round(historyData.reduce((acc, q) => acc + q.score, 0) / totalCompleted)
      : 0;
    const passRate = totalCompleted > 0
      ? Math.round((totalPassed / totalCompleted) * 100)
      : 0;

    return {
      totalCompleted,
      totalPassed,
      averageScore,
      passRate,
      streak: userStats?.streak || 0,
      rank: userStats?.rank || 0
    };
  };

  const getQuizzesByTopic = (topic) =>
    (dbHistory.length > 0 ? dbHistory : quizHistory).filter(q => q.topic.toLowerCase() === topic.toLowerCase());

  const getRecentQuizzes = (limit = 5) =>
    (dbHistory.length > 0 ? dbHistory : quizHistory).slice(0, limit);

  // ─── Context Value ────────────────────────────────────────────
  const value = {
    // State
    user,
    quizHistory,
    userStats,
    currentQuiz,
    leaderboard,
    createdQuizzes,
    quizzes,
    dbHistory,
    notifications,
    loading,
    theme,

    // Actions
    login,
    logout,
    refreshAllData,
    toggleTheme,
    setUser: updateUser,
    setCurrentQuiz,
    addQuizResult,
    addCreatedQuiz,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllData,

    // Getters
    getStats,
    getQuizzesByTopic,
    getRecentQuizzes
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export default QuizContext;
