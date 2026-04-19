import React, { useState } from 'react';
import api from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.error) setStatus({ ...status, error: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      const res = await api.post('/contact', formData);
      if (res.data.success) {
        setStatus({ loading: false, success: true, error: '' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: err.response?.data?.error || 'Failed to send message. Try again later.' 
      });
    }
  };

  return (
    <div className="contact-page-p animate-fade-in">
      {/* Background Magic */}
      <div className="contact-bg-elements">
        <div className="c-orb c-orb-1"></div>
        <div className="c-orb c-orb-2"></div>
      </div>

      <div className="container-p contact-flex-p">
        <div className="contact-info-p">
          <div className="hero-pill-badge">
            <span className="pill-icon">✨</span>
            <span>Reach the Archmage</span>
          </div>
          <h1 className="contact-h1-p">Get in <span className="text-gradient">Touch</span></h1>
          <p className="contact-desc-p">
            Have a question about your magical learning journey? 
            Our guild masters are ready to assist you.
          </p>
          <div className="contact-meta-p">
            <div className="cm-item">📍 The Citadel, Quizzard Isle</div>
            <div className="cm-item">✉️ support@quizzard.io</div>
            <div className="cm-item">🐦 @QuizzardGuild</div>
          </div>
        </div>

        <div className="contact-form-p">
          <div className="premium-card glass-morphism contact-box-p">
            {status.success ? (
              <div className="contact-success-state">
                <div className="sc-icon">🔮</div>
                <h3>Spell Cast Successfully!</h3>
                <p>Your message has been whisked away to our grand guild.</p>
                <button className="p-btn primary" onClick={() => setStatus({ ...status, success: false })}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="p-contact-form-main" onSubmit={handleSubmit}>
                {status.error && <div className="error-alert-p">{status.error}</div>}
                
                <div className="input-group-p">
                  <label>Wizard Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Merlin the Blue"
                    required 
                  />
                </div>

                <div className="input-group-p">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="merlin@camelot.io"
                    required 
                  />
                </div>

                <div className="input-group-p">
                  <label>Regarding...</label>
                  <input 
                    type="text" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="New Quiz Idea"
                    required 
                  />
                </div>

                <div className="input-group-p">
                  <label>Message Scroll</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your magical missive here..."
                    rows="4"
                    required 
                  ></textarea>
                </div>

                <button type="submit" className="p-btn prim-cta" disabled={status.loading}>
                  {status.loading ? 'Casting Spell...' : 'Send Message ✨'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .contact-page-p {
          min-height: 90vh;
          width: 100%;
          position: relative;
          padding: 120px 0 80px;
          overflow: hidden;
          background: var(--bg-app);
        }

        .contact-bg-elements { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .c-orb { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.1; animation: floatC 15s infinite alternate; }
        .c-orb-1 { width: 400px; height: 400px; background: var(--primary); top: -10%; left: -5%; }
        .c-orb-2 { width: 350px; height: 350px; background: var(--secondary); bottom: -10%; right: -5%; animation-delay: -5s; }

        @keyframes floatC { from { transform: translate(0,0); } to { transform: translate(40px, 40px); } }

        .container-p { max-width: 1200px; margin: 0 auto; padding: 0 2rem; position: relative; z-index: 1; }
        .contact-flex-p { display: grid; grid-template-columns: 1fr 1.2fr; gap: 5rem; align-items: center; }

        .hero-pill-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--accent-soft); color: var(--accent); padding: 0.5rem 1.25rem; border-radius: 2rem; font-weight: 700; font-size: 0.85rem; margin-bottom: 1.5rem; }
        .contact-h1-p { font-family: 'Fredoka', sans-serif; font-size: 3.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 1.5rem; }
        .contact-desc-p { font-size: 1.2rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 3rem; max-width: 450px; }

        .contact-meta-p { display: flex; flex-direction: column; gap: 1rem; }
        .cm-item { font-weight: 700; color: var(--text-main); font-size: 1rem; }

        .contact-box-p { padding: 3rem; }
        .p-contact-form-main { display: flex; flex-direction: column; gap: 1.5rem; }
        .input-group-p { display: flex; flex-direction: column; gap: 0.5rem; }
        .input-group-p label { font-size: 0.85rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .input-group-p input, .input-group-p textarea {
          background: var(--bg-app); border: 2px solid var(--border-light); padding: 1rem; border-radius: 1rem;
          color: var(--text-main); font-family: inherit; font-size: 1rem; outline: none; transition: 0.3s;
        }
        .input-group-p input:focus, .input-group-p textarea:focus { border-color: var(--primary); background: var(--bg-card); }

        .p-btn { border: none; border-radius: 1rem; font-family: 'Fredoka', sans-serif; font-weight: 800; cursor: pointer; transition: 0.3s; }
        .p-btn.prim-cta { background: var(--primary); color: white; padding: 1.1rem; width: 100%; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3); }
        .p-btn.prim-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.4); }

        .contact-success-state { text-align: center; }
        .sc-icon { font-size: 4rem; margin-bottom: 1.5rem; }
        .error-alert-p { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 1rem; border-radius: 1rem; font-size: 0.9rem; font-weight: 700; }

        @media (max-width: 900px) {
          .contact-flex-p { grid-template-columns: 1fr; text-align: center; }
          .contact-info-p { display: flex; flex-direction: column; align-items: center; }
          .contact-h1-p { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
}
