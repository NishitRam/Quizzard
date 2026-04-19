import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import QuizPlayer from './pages/QuizPlayer'
import QuizPage from './pages/QuizPage'
import Contact from './pages/Contact'
import Navbar from './components/common/Navbar'
import { QuizProvider, useQuiz } from './context/QuizContext'

function AppContent() {
  const { theme } = useQuiz();
  const [currentPage, setCurrentPage] = useState(() => {
    let h = window.location.hash.replace('#', '');
    h = h.split('?')[0];
    if (h === 'register' || h === 'login') return 'auth';
    if (h.startsWith('quiz/')) return { type: 'dynamic-quiz', raw: window.location.hash.replace('#', '') };
    return h || 'landing';
  });

  useEffect(() => {
    const updatePage = () => {
      let h = window.location.hash.replace('#', '');
      h = h.split('?')[0];
      if (h === 'register' || h === 'login') {
        setCurrentPage('auth');
      } else if (h.startsWith('quiz/')) {
        setCurrentPage({ type: 'dynamic-quiz', raw: window.location.hash.replace('#', '') });
      } else {
        setCurrentPage(h || 'landing');
      }
    };

    window.addEventListener('hashchange', updatePage);
    return () => window.removeEventListener('hashchange', updatePage);
  }, []);

  const renderPage = () => {
    if (currentPage && typeof currentPage === 'object' && currentPage.type === 'dynamic-quiz') {
      return <QuizPage routeRaw={currentPage.raw} />;
    }
    switch (currentPage) {
      case 'auth': return <Auth />;
      case 'dashboard':
      case 'quiz':
      case 'browse':
      case 'myquizzes':
      case 'leaderboard':
      case 'create':
      case 'profile':
      case 'magic_shuffle':
        return <Dashboard initialView={currentPage} />;
      case 'webdev-quiz': return <QuizPage />;
      case 'contact': return <Contact />;
      default: return <Landing />;
    }
  };

  const isDashboardView = ['dashboard', 'quiz', 'browse', 'myquizzes', 'leaderboard', 'create', 'profile', 'magic_shuffle'].includes(typeof currentPage === 'string' ? currentPage : '');
  const isFullPageQuiz = currentPage?.type === 'dynamic-quiz';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className={`app-root ${theme}`}>
      {!isFullPageQuiz && !isDashboardView && <Navbar />}
      <main className={`content-area ${isDashboardView ? 'dashboard-layout' : ''}`}>
        {renderPage()}
      </main>
      <style>{`
        .app-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-app);
          color: var(--text-main);
          transition: background-color 0.3s, color 0.3s;
        }
        .content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .content-area.dashboard-layout {
          height: 100vh;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <QuizProvider>
      <AppContent />
    </QuizProvider>
  );
}

export default App
