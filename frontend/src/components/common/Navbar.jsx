import React from 'react';
import { useQuiz } from '../../context/QuizContext';

export default function Navbar() {
  const { user, logout } = useQuiz();

  const handleScrollTo = (id) => {
    if (window.location.hash !== '' && window.location.hash !== '#landing') {
      window.location.hash = 'landing';
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="premium-navbar">
      <div className="nav-container-p">
        <div className="nav-brand" onClick={() => {
          window.location.hash = 'landing';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}>
          <div className="brand-orb">✨</div>
          <span className="brand-text">Quizzard</span>
        </div>

        <div className="nav-menu">
          <button onClick={() => {
            window.location.hash = 'landing';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} className="menu-item">Home</button>
          <button onClick={() => handleScrollTo('features')} className="menu-item">Features</button>
          <button onClick={() => handleScrollTo('pricing')} className="menu-item">Pricing</button>
          <button onClick={() => handleScrollTo('contact')} className="menu-item">Contact</button>
        </div>

        <div className="nav-ctrls">
          {user ? (
            <div className="user-pill-group">
              <div className="user-meta-p" onClick={() => window.location.hash = 'dashboard'}>
                <span className="user-n-text">{user.fullName?.split(' ')[0] || 'Wizard'}</span>
                <div className="user-av-mini">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-btn-row">
              <button onClick={() => window.location.hash = 'auth'} className="a-btn-primary login-creative-btn">
                Login
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .premium-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--bg-navbar);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-light);
          padding: 0.8rem 2rem;
          font-family: 'Outfit', sans-serif;
          transition: background 0.3s;
        }

        .nav-container-p {
          max-width: 1300px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-family: 'Fredoka', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
        }
        .brand-orb {
          width: 35px;
          height: 35px;
          background: var(--text-gradient);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          color: white;
          box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);
        }
        .brand-text { background: var(--text-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .nav-menu { display: flex; gap: 2.5rem; }
        .menu-item {
          background: none; border: none; color: var(--text-muted); font-weight: 700; cursor: pointer;
          font-size: 0.95rem; transition: 0.3s;
        }
        .menu-item:hover { color: var(--primary); transform: translateY(-1px); }
        .menu-item.highlight { color: var(--primary); }

        .nav-ctrls { display: flex; gap: 1.5rem; align-items: center; }
        .ctrl-btn {
          width: 40px; height: 40px; border-radius: 12px; background: var(--bg-app);
          border: 1px solid var(--border-light); color: var(--text-main); font-size: 1.25rem;
          cursor: pointer; transition: 0.3s;
        }
        .ctrl-btn:hover { background: var(--bg-card); transform: scale(1.05); }

        .auth-btn-row { display: flex; gap: 1rem; align-items: center; }
        .a-btn-ghost { 
          color: var(--text-main); font-weight: 800; font-size: 0.95rem; border: none; background: none; 
          padding: 0.5rem 1rem; cursor: pointer; transition: 0.3s;
        }
        .a-btn-ghost:hover { color: var(--primary); }
        .a-btn-primary {
          background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem;
          border-radius: 0.75rem; font-weight: 800; font-family: 'Fredoka', sans-serif;
          cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.2);
        }
        .a-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.3); }

        .login-creative-btn {
          display: flex; align-items: center; gap: 0.5rem;
          background: linear-gradient(135deg, var(--primary), #8b5cf6);
          border-radius: 2rem;
          padding: 0.6rem 1.75rem;
          position: relative;
          overflow: hidden;
        }
        .login-creative-btn::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: 0.5s;
        }
        .login-creative-btn:hover::before { left: 100%; }

        .user-pill-group { display: flex; align-items: center; gap: 0.75rem; }
        .user-meta-p {
          display: flex; align-items: center; gap: 0.75rem; background: var(--bg-card);
          padding: 0.25rem 0.25rem 0.25rem 1.25rem; border-radius: 2rem; border: 1px solid var(--border-light);
          cursor: pointer; transition: 0.3s;
        }
        .user-meta-p:hover { border-color: var(--primary); }
        .user-n-text { font-weight: 800; color: var(--text-main); font-size: 0.9rem; }
        .user-av-mini {
          width: 32px; height: 32px; background: var(--primary); color: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem;
        }
        .p-logout-link {
          background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; width: 35px; height: 35px;
          border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: 0.3s; font-size: 1rem;
        }
        .p-logout-link:hover { background: #ef4444; color: white; transform: scale(1.1); }

        @media (max-width: 900px) {
          .nav-menu { display: none; }
        }
      `}</style>
    </nav>
  );
}
