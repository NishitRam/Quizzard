import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useQuiz } from '../context/QuizContext';
import { useGoogleLogin } from '@react-oauth/google';

export default function Auth() {
  const { login } = useQuiz();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [demoToken, setDemoToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const params = new URLSearchParams(hash.split('?')[1]);
      const emailParam = params.get('email');
      const modeParam = params.get('mode');
      const tokenParam = params.get('token');

      if (emailParam) {
        setFormData(prev => ({ ...prev, email: decodeURIComponent(emailParam) }));
      }
      if (modeParam === 'signup') {
        setIsSignUp(true);
      } else if (modeParam === 'login') {
        setIsSignUp(false);
      } else if (modeParam === 'reset' && tokenParam) {
        setIsResetMode(true);
        setDemoToken(tokenParam);
        setMessage({ type: 'info', text: 'Please enter your new password.' });
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (res.data.success) {
        login(res.data.user, res.data.token);
        window.location.hash = 'dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Magical interference?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please provide your email address first.');
      return;
    }
    setIsLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/forgot-password', { email: formData.email });
      if (res.data.success) {
        if (res.data.demoResetToken && res.data.isDemo) {
          setMessage({ type: 'success', text: 'Demo Mode: Reset link generated! Please enter your new password.' });
          setDemoToken(res.data.demoResetToken);
          setIsForgotMode(false);
          setIsResetMode(true);
        } else {
          setMessage({ type: 'success', text: res.data.message || 'Reset link sent to your email.' });
          setTimeout(() => setIsForgotMode(false), 3000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.password) {
      setError('Please provide a new password.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/reset-password', { 
        token: demoToken, 
        password: formData.password 
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Password successfully reset! You can now log in.' });
        setFormData({ ...formData, password: '' });
        setTimeout(() => setIsResetMode(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        login(res.data.user, res.data.token);
        window.location.hash = 'dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. The guild is full?');
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      setMessage({ type: 'info', text: 'Verifying Google credentials...' });

      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const profile = await profileRes.json();
        const res = await api.post('/auth/social-login', {
          email: profile.email,
          fullName: profile.name,
          avatar: profile.picture,
          provider: 'google',
          providerId: profile.sub
        });

        if (res.data.success) {
          setMessage({ type: 'success', text: `Welcome, ${profile.name}!` });
          setTimeout(() => {
            login(res.data.user, res.data.token);
            window.location.hash = 'dashboard';
          }, 1000);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Google authentication failed.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError('Google Sign-In was cancelled or failed.'),
  });

  return (
    <div className="auth-split-layout">
      {/* LEFT SIDE: POSTER */}
      <div className="auth-left-poster">
        <div className="magic-bg-container">
          <div className="gradient-circle gc-1"></div>
          <div className="gradient-circle gc-2"></div>
        </div>
        <div className="poster-content">
          <div className="brand-badge">✨ Quizzard</div>
          <h1 className="poster-title">This is the room.<br/>You should be in it.</h1>
          <h2 className="poster-subtitle">Master anything with<br/>AI-powered quizzes.</h2>
          <button className="poster-link-btn" onClick={() => window.location.hash = 'landing'}>← Return Home</button>
        </div>
      </div>

      {/* RIGHT SIDE: AUTH FORM */}
      <div className="auth-right-form">
        <div className="auth-form-wrapper">
          <div className="auth-brand-mobile" onClick={() => window.location.hash = 'landing'}>
            <span className="logo-emoji">✨</span> Quizzard
          </div>
          
          <h2 className="form-title">
            {isResetMode ? 'Create new password' : isForgotMode ? 'Reset your password' : isSignUp ? 'Create your account' : 'Log in to your account'}
          </h2>

          {error && <div className="error-badge-auth">{error}</div>}
          {message.text && <div className={`profile-msg-auth ${message.type}`}>{message.text}</div>}

          {(!isResetMode && !isForgotMode) && (
            <>
              <button className="social-login-btn" onClick={() => googleLogin()} disabled={isLoading}>
                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.75 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
              <div className="auth-divider"><span>or</span></div>
            </>
          )}

          <form className="main-auth-form" onSubmit={isResetMode ? handleResetPassword : isForgotMode ? handleForgotPassword : isSignUp ? handleSignUp : handleSignIn}>
            {isSignUp && !isResetMode && !isForgotMode && (
              <input type="text" name="fullName" placeholder="Full Name" className="auth-input-field" value={formData.fullName} onChange={handleChange} required />
            )}
            
            {!isResetMode && (
              <input type="email" name="email" placeholder="Email address" className="auth-input-field" value={formData.email} onChange={handleChange} required />
            )}
            
            {(!isForgotMode || isResetMode) && (
              <div className="password-input-wrapper">
                <input type="password" name="password" placeholder="Password" className="auth-input-field" value={formData.password} onChange={handleChange} required />
                {!isSignUp && !isForgotMode && !isResetMode && (
                  <button type="button" className="forgot-pwd-link" onClick={() => { setIsForgotMode(true); setError(''); setMessage({type:'',text:''}); }}>
                    Forgot your password?
                  </button>
                )}
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
            
            {isForgotMode && !isResetMode && (
              <button type="button" className="auth-submit-btn secondary" onClick={() => setIsForgotMode(false)}>Cancel reset</button>
            )}
            {isResetMode && (
               <button type="button" className="auth-submit-btn secondary" onClick={() => setIsResetMode(false)}>Cancel reset</button>
            )}
          </form>

          {(!isForgotMode && !isResetMode) && (
            <div className="auth-toggle-link">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage({type:'',text:''}); }}>
                {isSignUp ? 'Log in' : 'Sign up'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .auth-split-layout {
          flex: 1;
          width: 100%;
          display: flex;
          background: var(--bg-app);
          overflow: hidden;
        }

        /* ─── LEFT POSTER ─── */
        .auth-left-poster {
          flex: 1.2;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          background: #0f111a;
          color: white;
          overflow: hidden;
        }

        .magic-bg-container {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .gradient-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.2;
          animation: circleFloat 20s infinite alternate;
        }
        .gc-1 { width: 600px; height: 600px; background: var(--primary); top: -20%; left: -20%; }
        .gc-2 { width: 500px; height: 500px; background: var(--accent); bottom: -20%; right: -20%; animation-delay: -5s; }

        @keyframes circleFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, 50px) scale(1.1); }
        }

        .poster-content {
          position: relative;
          z-index: 2;
          max-width: 500px;
          text-align: left;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Fredoka', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 3rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1.2rem;
          border-radius: 2rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .poster-title {
          font-family: 'Fredoka', sans-serif;
          font-size: 3.5rem;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          font-weight: 800;
        }
        
        .poster-subtitle {
          font-family: 'Outfit', sans-serif;
          font-size: 1.8rem;
          line-height: 1.2;
          font-weight: 700;
          background: var(--text-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 3rem;
        }

        .poster-link-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: background 0.3s;
        }
        .poster-link-btn:hover { background: var(--primary-hover); }

        /* ─── RIGHT FORM ─── */
        .auth-right-form {
          flex: 1;
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          z-index: 10;
        }

        .auth-brand-mobile {
          display: none;
          font-family: 'Fredoka', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 2rem;
          color: var(--text-main);
          cursor: pointer;
        }

        .auth-form-wrapper {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
        }

        .form-title {
          font-family: 'Fredoka', sans-serif;
          font-size: 2rem;
          color: var(--text-main);
          margin-bottom: 2rem;
          font-weight: 700;
          text-align: center;
        }

        .social-login-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: transparent;
          border: 1px solid var(--border-light);
          padding: 0.85rem;
          border-radius: 0.5rem;
          color: var(--text-main);
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: 0.2s ease;
          margin-bottom: 1.5rem;
        }
        .social-login-btn:hover {
          background: rgba(var(--primary-rgb), 0.05);
          border-color: var(--primary);
        }

        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-light);
        }
        .auth-divider span {
          padding: 0 1rem;
        }

        .main-auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .auth-input-field {
          width: 100%;
          background: var(--bg-app);
          border: 1px solid var(--border-light);
          padding: 1rem;
          border-radius: 0.5rem;
          color: var(--text-main);
          font-size: 1rem;
          font-family: 'Outfit', sans-serif;
          transition: border-color 0.2s;
        }
        .auth-input-field:focus {
          outline: none;
          border-color: var(--primary);
        }

        .password-input-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        .forgot-pwd-link {
          align-self: flex-start;
          margin-top: 0.5rem;
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .auth-submit-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 0.5rem;
          font-weight: 700;
          font-size: 1rem;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: background 0.3s;
          margin-top: 0.5rem;
        }
        .auth-submit-btn:hover:not(:disabled) {
          background: #7755ee;
        }
        .auth-submit-btn.secondary {
          background: transparent;
          color: var(--text-main);
          border: 1px solid var(--border-light);
          margin-top: 0;
        }
        .auth-submit-btn.secondary:hover {
          background: var(--bg-app);
        }

        .auth-toggle-link {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .auth-toggle-link button {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0;
          margin-left: 0.25rem;
        }
        .auth-toggle-link button:hover {
          text-decoration: underline;
        }

        .error-badge-auth {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 0.85rem;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }
        .profile-msg-auth {
          padding: 0.85rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .profile-msg-auth.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .profile-msg-auth.info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

        @media (max-width: 900px) {
          .auth-split-layout { flex-direction: column; }
          .auth-left-poster { display: none; }
          .auth-right-form { flex: 1; padding: 2rem 1.5rem; }
          .auth-brand-mobile { display: block; }
        }
      `}</style>
    </div>
  );
}
