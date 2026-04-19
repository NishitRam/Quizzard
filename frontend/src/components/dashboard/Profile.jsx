import React, { useState, useRef } from 'react';
import { useQuiz } from '../../context/QuizContext';
import api from '../../services/api';

export default function Profile() {
  const { user, setUser, getStats, theme, toggleTheme } = useQuiz();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef();

  const stats = getStats();

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image too large. Max 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        uploadAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (base64) => {
    setIsLoading(true);
    try {
      const res = await api.put('/auth/update-avatar', { avatar: base64 });
      if (res.data.success) {
        setUser(res.data.user);
        setMessage({ type: 'success', text: 'Avatar updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update avatar.' });
    } finally {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/auth/update-profile', { fullName });
      if (res.data.success) {
        setUser(res.data.user);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Update failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-grid">
        {/* Left Column: Public Identity */}
        <div className="profile-card identity-card premium-card">
          <div className="avatar-section">
            <div className="avatar-frame" onClick={handleAvatarClick}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">{user?.fullName?.charAt(0) || 'W'}</div>
              )}
              <div className="avatar-overlay">
                <span>📷 Change</span>
              </div>
              {isLoading && <div className="avatar-loader">✨</div>}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <h2 className="profile-name-display">{user?.fullName}</h2>
            <p className="profile-email-display">{user?.email}</p>
            <div className="profile-badges">
              <span className="p-badge">Rank #{stats.rank || '—'}</span>
              <span className="p-badge streak-badge">🔥 {stats.streak} Day Streak</span>
            </div>
          </div>

          <div className="identity-footer">
            <p className="join-date">Member since {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Right Column: Settings & Stats */}
        <div className="profile-main-content">
          <div className="settings-card premium-card">
            <div className="card-header-p">
              <h3>Personal Details</h3>
              {!isEditing ? (
                <button className="edit-toggle-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
              ) : (
                <button className="edit-toggle-btn cancel" onClick={() => setIsEditing(false)}>Cancel</button>
              )}
            </div>

            {message.text && (
              <div className={`profile-msg ${message.type}`}>
                {message.type === 'success' ? '✅' : '❌'} {message.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group-p">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  disabled={!isEditing}
                  placeholder="Your magical name"
                />
              </div>
              <div className="form-group-p">
                <label>Email Address</label>
                <input type="email" value={user?.email} disabled placeholder="Your scroll address" />
                <span className="input-hint">Email cannot be changed by mortals.</span>
              </div>
              
              {isEditing && (
                <button type="submit" className="save-profile-btn" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Magical Details'}
                </button>
              )}
            </form>

            <div className="card-header-p" style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
              <h3>App Preferences</h3>
            </div>
            <div className="form-group-p">
              <label>Theme Mode</label>
              <div className="theme-toggle-wrapper">
                <div className="theme-status">
                  {theme === 'dark' ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}
                </div>
                <button type="button" onClick={toggleTheme} className="theme-toggle-btn">
                  Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          </div>

          <div className="stats-performance-grid">
            <div className="perf-card premium-card">
              <div className="perf-icon">🎯</div>
              <div className="perf-info">
                <h4>Completion</h4>
                <div className="perf-val">{stats.totalCompleted}</div>
                <span>Total Quizzes</span>
              </div>
            </div>
            <div className="perf-card premium-card">
              <div className="perf-icon">📈</div>
              <div className="perf-info">
                <h4>Average Score</h4>
                <div className="perf-val">{stats.averageScore}%</div>
                <div className="mini-progress">
                  <div className="mp-fill" style={{ width: `${stats.averageScore}%` }} />
                </div>
              </div>
            </div>
            <div className="perf-card premium-card">
              <div className="perf-icon">🛡️</div>
              <div className="perf-info">
                <h4>Pass Rate</h4>
                <div className="perf-val">{stats.passRate}%</div>
                <span>Successful Quests</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-container { padding: 1rem 0; width: 100%; transition: 0.3s; }
        .profile-grid { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; align-items: start; }

        .identity-card { padding: 3rem 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .avatar-section { width: 100%; }
        .avatar-frame { 
          width: 150px; height: 150px; margin: 0 auto 1.5rem; border-radius: 50%; 
          position: relative; cursor: pointer; border: 4px solid var(--primary); 
          padding: 5px; background: var(--bg-card); transition: 0.3s; overflow: hidden;
        }
        .avatar-frame:hover { transform: scale(1.05); }
        .avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .avatar-placeholder { width: 100%; height: 100%; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 4rem; font-weight: 800; }
        .avatar-overlay { 
          position: absolute; inset: 0; background: rgba(0,0,0,0.4); opacity: 0; 
          transition: 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;
        }
        .avatar-frame:hover .avatar-overlay { opacity: 1; }
        .avatar-loader { position: absolute; inset: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; font-size: 2rem; animation: spin 1s infinite linear; }
        
        .profile-name-display { font-family: 'Fredoka', sans-serif; font-size: 1.75rem; color: var(--text-main); margin-bottom: 0.25rem; }
        .profile-email-display { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; }
        .profile-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
        .p-badge { background: var(--border-light); color: var(--text-main); padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
        .streak-badge { background: var(--danger-soft); color: var(--danger); border: 1px solid var(--danger-pale); }

        .identity-footer { margin-top: 2rem; width: 100%; border-top: 1px solid var(--border-light); padding-top: 1.5rem; }
        .join-date { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }

        .profile-main-content { display: flex; flex-direction: column; gap: 2rem; }
        .settings-card { padding: 2.5rem; }
        .card-header-p { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .card-header-p h3 { font-family: 'Fredoka', sans-serif; font-size: 1.4rem; }
        .edit-toggle-btn { background: var(--accent-soft); color: var(--accent); border: none; padding: 0.5rem 1.25rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .edit-toggle-btn.cancel { background: var(--border-light); color: var(--text-muted); }

        .profile-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-group-p { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group-p label { font-size: 0.8rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
        .form-group-p input { 
          padding: 0.8rem 1rem; border-radius: 12px; border: 2px solid var(--border-light); 
          background: var(--bg-app); color: var(--text-main); font-family: inherit; font-weight: 600;
        }
        .form-group-p input:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-group-p input:focus:not(:disabled) { border-color: var(--primary); outline: none; background: var(--bg-card); }
        .input-hint { font-size: 0.7rem; color: var(--text-muted); font-style: italic; }

        .save-profile-btn { 
          margin-top: 1rem; background: var(--primary); color: white; border: none; 
          padding: 1rem; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s;
        }
        .save-profile-btn:hover { opacity: 0.9; transform: translateY(-2px); }

        .theme-toggle-wrapper { display: flex; align-items: center; justify-content: space-between; background: var(--bg-app); padding: 1rem; border-radius: 12px; border: 2px solid var(--border-light); }
        .theme-status { font-weight: 700; color: var(--text-main); }
        .theme-toggle-btn { background: var(--bg-card); border: 2px solid var(--primary); color: var(--text-main); border-radius: 8px; padding: 0.5rem 1rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .theme-toggle-btn:hover { background: var(--primary); color: white; }

        .profile-msg { padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem; font-weight: 700; font-size: 0.9rem; }
        .profile-msg.success { background: var(--success-soft); color: var(--success); }
        .profile-msg.error { background: var(--danger-soft); color: var(--danger); }

        .stats-performance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
        .perf-card { padding: 1.5rem; display: flex; items-center; gap: 1rem; }
        .perf-icon { font-size: 2rem; background: var(--bg-app); width: 60px; height: 60px; border-radius: 15px; display: flex; align-items: center; justify-content: center; }
        .perf-info h4 { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.25rem; font-weight: 800; }
        .perf-val { font-size: 1.8rem; font-weight: 900; color: var(--text-main); line-height: 1; margin-bottom: 0.5rem; }
        .perf-info span { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
        
        .mini-progress { width: 100%; height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
        .mp-fill { height: 100%; background: var(--primary); transition: width 1s ease-out; }

        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr; }
          .identity-card { width: 100%; }
        }
      `}</style>
    </div>
  );
}
