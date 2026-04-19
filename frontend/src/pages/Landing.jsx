import React, { useState } from 'react';
import api from '../services/api';

export default function Landing() {
  const [email, setEmail] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [isCasting, setIsCasting] = useState(false);

  const handleGetStarted = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsCasting(true);
    try {
      const res = await api.post('/auth/check-email', { email });
      const mode = res.data.exists ? 'login' : 'signup';
      window.location.hash = `auth?email=${encodeURIComponent(email)}&mode=${mode}`;
    } catch (err) {
      window.location.hash = `auth?email=${encodeURIComponent(email)}&mode=signup`;
    } finally {
      setIsCasting(false);
    }
  };

  return (
    <div className="landing-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background-premium">
          <div className="gradient-sphere gs-1"></div>
          <div className="gradient-sphere gs-2"></div>
          <div className="gradient-sphere gs-3"></div>
        </div>
        
        <div className="container-premium hero-flex">
          <div className="hero-content">
            <div className="hero-pill-badge">
              <span className="pill-icon">✨</span>
              <span>The Future of Learning is Magical</span>
            </div>
            
            <h1 className="hero-title-main">
              Master Anything with
              <span className="text-gradient"> AI-Powered Quizzes</span>
            </h1>
            
            <p className="hero-description-text">
              Transform your learning journey with Quizzard. 
              Real-time tracking, global leaderboards, and a premium experience tailored for modern learners.
            </p>
            
            <form className="hero-cta-form" onSubmit={handleGetStarted}>
              <div className="hero-input-wrapper">
                <input 
                  type="email" 
                  placeholder="wizard@quizzard.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="hero-email-input"
                  required
                />
                <button type="submit" className="hero-cta-btn" disabled={isCasting}>
                  {isCasting ? 'Searching...' : 'Launch Quest →'}
                </button>
              </div>
            </form>
            
            <div className="hero-social-proof">
              <div className="proof-avatars">
                <div className="avatar">👤</div>
                <div className="avatar">👤</div>
                <div className="avatar">👤</div>
              </div>
              <p>Joined by <strong>10,000+</strong> knowledge seekers this week</p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="premium-card glass-morphism floating-card">
              <div className="card-inner-quiz">
                <div className="quiz-header-mock">
                  <span className="quiz-tag">COMPUTER SCIENCE</span>
                  <span className="quiz-timer-mock">⏱️ 08:45</span>
                </div>
                <h2 className="quiz-q-mock">What is the Time Complexity of a Binary Search Algorithm?</h2>
                <div className="quiz-options-mock">
                  <div className="option-mock">O(n)</div>
                  <div className="option-mock active">O(log n) ✓</div>
                  <div className="option-mock">O(n²)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-grid-section" id="features">
        <div className="container-premium">
          <div className="section-head-center">
            <span className="section-tag">ABILITIES</span>
            <h2 className="section-h2">Unlock Your Potential</h2>
          </div>

          <div className="features-row-grid">
            {[
              { icon: '🎯', title: 'Smart Logic', desc: 'Questions that adapt to your knowledge levels dynamically.' },
              { icon: '📊', title: 'Deep Analytics', desc: 'Detailed breakdown of your strengths and weaknesses.' },
              { icon: '🏆', title: 'Global Guild', desc: 'Compete in world rankings and earn legendary badges.' },
              { icon: '⚡', title: 'Instant Cast', desc: 'Zero-latency feedback on every answer you provide.' }
            ].map((f, i) => (
              <div key={i} className="feature-item-card premium-card">
                <div className="f-icon-box">{f.icon}</div>
                <h3 className="f-title">{f.title}</h3>
                <p className="f-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-premium-section" id="pricing">
        <div className="container-premium">
          <div className="section-head-center">
            <span className="section-tag">LEVELS</span>
            <h2 className="section-h2">Choose Your Rank</h2>
          </div>

          <div className="pricing-flex">
            <div className="price-card premium-card">
              <div className="p-header">
                <h3>Apprentice</h3>
                <div className="p-amount">Free</div>
              </div>
              <ul className="p-features">
                <li>3 Daily Quizzes</li>
                <li>Global Leaderboard</li>
                <li>Community Access</li>
              </ul>
              <button className="p-btn secondary" onClick={() => window.location.hash = 'register'}>Beginner Path</button>
            </div>

            <div className="price-card premium-card featured-price">
              <div className="featured-tag">MOST ELITE</div>
              <div className="p-header">
                <h3>Grandmaster</h3>
                <div className="p-amount">$0<span>/mo</span></div>
              </div>
              <p className="magic-hint">Free during early access! ✨</p>
              <ul className="p-features">
                <li>Unlimited Quizzes</li>
                <li>Custom Quiz Builder</li>
                <li>Personal Mentor AI</li>
                <li>No Interruption</li>
              </ul>
              <button className="p-btn primary" onClick={() => window.location.hash = 'register'}>Claim Grandmaster</button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-premium-section" id="contact">
        <div className="container-premium">
          <div className="contact-layout-grid">
            <div className="contact-info-side">
              <h2 className="section-h2">Need Assistance?</h2>
              <p>Our Archmages are always ready to help you on your quest. Send us a magical bird!</p>
              <div className="contact-details">
                <div className="c-item">📍 The Citadel, Quizzard Isle</div>
                <div className="c-item">✉️ archmage@quizzard.io</div>
              </div>
            </div>

            <div className="contact-form-side">
              <div className="premium-card contact-form-box">
                {contactSuccess ? (
                  <div className="success-state-contact">
                    <span className="success-emoji">🔮</span>
                    <h3>Message Sent!</h3>
                    <p>Expect a response from our guild soon.</p>
                    <button className="reset-btn-p" onClick={() => setContactSuccess(false)}>Send Again</button>
                  </div>
                ) : (
                  <form className="p-contact-form" onSubmit={(e) => {
                    e.preventDefault();
                    setIsCasting(true);
                    const formData = new FormData(e.target);
                    const data = Object.fromEntries(formData.entries());
                    api.post('/contact', data)
                      .then(res => {
                        if (res.data.success) {
                          setContactSuccess(true);
                          e.target.reset();
                        }
                      })
                      .catch((err) => {
                        const errMsg = err.response?.data?.error || 'Failed to send message. Please check your connection.';
                        alert(errMsg);
                      })
                      .finally(() => setIsCasting(false));
                  }}>
                    <input type="text" name="name" placeholder="Full Name" required />
                    <input type="email" name="email" placeholder="Email Address" required />
                    <textarea name="message" placeholder="Your Message" rows="5" required></textarea>
                    <button type="submit" className="p-submit-btn" disabled={isCasting}>
                      {isCasting ? 'Casting Spell...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-premium">
        <div className="container-premium f-inner">
          <div className="f-logo">
            <span className="logo-text-f">Quizzard</span>
            <p>Mastering knowledge, one quiz at a time.</p>
          </div>
          <div className="f-links">
            <div className="f-col">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="f-col">
              <h4>Support</h4>
              <a href="#contact">Contact</a>
              <a href="/faq">FAQ</a>
            </div>
          </div>
        </div>
        <div className="f-bottom">
          <p>© 2026 Quizzard Guild. Built with magic in Bengaluru.</p>
        </div>
      </footer>

      <style>{`
        .landing-page { background: var(--bg-app); width: 100%; transition: 0.3s; }

        .container-premium { max-width: 1200px; margin: 0 auto; padding: 0 2rem; position: relative; }

        /* Hero */
        .hero-section { min-height: 90vh; position: relative; padding: 120px 0 80px; overflow: hidden; }
        .hero-background-premium { position: absolute; inset: 0; z-index: 0; }
        .gradient-sphere { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.15; animation: orbit 20s infinite linear; }
        .gs-1 { width: 500px; height: 500px; background: var(--primary); top: -10%; left: -5%; }
        .gs-2 { width: 400px; height: 400px; background: var(--secondary); bottom: -10%; right: -5%; animation-delay: -10s; }
        .gs-3 { width: 300px; height: 300px; background: #f093fb; top: 40%; right: 20%; animation-delay: -5s; }

        @keyframes orbit { from { transform: rotate(0deg) translateX(50px) rotate(0deg); } to { transform: rotate(360deg) translateX(50px) rotate(-360deg); } }

        .hero-flex { display: grid; grid-template-columns: 1.2fr 1fr; gap: 4rem; align-items: center; }
        .hero-pill-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--accent-soft); color: var(--accent); padding: 0.5rem 1.25rem; border-radius: 2rem; font-weight: 700; font-size: 0.85rem; margin-bottom: 2rem; }
        .hero-title-main { font-family: 'Fredoka', sans-serif; font-size: 4rem; font-weight: 800; color: var(--text-main); line-height: 1.1; margin-bottom: 1.5rem; }
        .hero-description-text { font-size: 1.25rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 2.5rem; }

        .hero-cta-form { margin-bottom: 3rem; }
        .hero-input-wrapper { display: flex; gap: 1rem; background: var(--bg-card); padding: 0.5rem; border-radius: 1.25rem; border: 1px solid var(--border-light); box-shadow: var(--shadow-md); }
        .hero-email-input { flex: 1; border: none; background: transparent; padding: 0 1rem; font-family: inherit; font-size: 1rem; color: var(--text-main); outline: none; }
        .hero-cta-btn { background: var(--primary); color: white; border: none; padding: 0.85rem 1.75rem; border-radius: 1rem; font-weight: 700; font-family: 'Fredoka', sans-serif; cursor: pointer; transition: 0.3s; }
        .hero-cta-btn:hover { opacity: 0.9; transform: translateX(5px); }

        .hero-social-proof { display: flex; align-items: center; gap: 1rem; }
        .proof-avatars { display: flex; }
        .avatar { width: 35px; height: 35px; border-radius: 50%; background: var(--border-strong); border: 2px solid var(--bg-app); display: flex; align-items: center; justify-content: center; margin-left: -10px; }
        .avatar:first-child { margin-left: 0; }
        .hero-social-proof p { font-size: 0.9rem; color: var(--text-muted); }

        .hero-visual { display: flex; justify-content: center; }
        .floating-card { width: 400px; padding: 2.5rem; animation: floatY 6s infinite ease-in-out; }
        @keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
        .quiz-header-mock { display: flex; justify-content: space-between; margin-bottom: 1.5rem; font-weight: 800; font-size: 0.8rem; }
        .quiz-tag { color: var(--accent); }
        .quiz-q-mock { font-family: 'Fredoka', sans-serif; font-size: 1.5rem; color: var(--text-main); margin-bottom: 2rem; }
        .quiz-options-mock { display: flex; flex-direction: column; gap: 0.75rem; }
        .option-mock { padding: 1rem; border-radius: 1rem; border: 2px solid var(--border-light); font-weight: 700; color: var(--text-muted); transition: 0.3s; }
        .option-mock.active { border-color: #10b981; background: rgba(16, 185, 129, 0.1); color: #10b981; }

        /* Sections General */
        section { padding: 100px 0; }
        .section-tag { color: var(--primary); font-weight: 800; font-size: 0.85rem; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 1rem; }
        .section-h2 { font-family: 'Fredoka', sans-serif; font-size: 3rem; color: var(--text-main); margin-bottom: 3rem; }
        .section-head-center { text-align: center; }

        /* Features */
        .features-row-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
        .feature-item-card { padding: 2.5rem; transition: 0.3s; }
        .feature-item-card:hover { transform: translateY(-10px); }
        .f-icon-box { font-size: 3rem; margin-bottom: 1.5rem; }
        .f-title { font-family: 'Fredoka', sans-serif; font-size: 1.5rem; color: var(--text-main); margin-bottom: 1rem; }
        .f-desc { color: var(--text-muted); line-height: 1.6; }

        /* Pricing */
        .pricing-flex { display: flex; justify-content: center; gap: 2.5rem; flex-wrap: wrap; margin-top: 2rem; }
        .price-card { width: 350px; padding: 3rem 2.5rem; text-align: center; position: relative; }
        .featured-price { border: 2.5px solid var(--primary); box-shadow: 0 20px 50px rgba(var(--primary-rgb), 0.15); }
        .featured-tag { position: absolute; top: 0; left: 50%; transform: translate(-50%, -50%); background: var(--primary); color: white; padding: 0.5rem 1.5rem; border-radius: 2rem; font-weight: 800; font-size: 0.75rem; }
        .p-header h3 { font-family: 'Fredoka', sans-serif; font-size: 1.75rem; color: var(--text-main); margin-bottom: 1rem; }
        .p-amount { font-size: 3.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 1.5rem; }
        .p-amount span { font-size: 1.25rem; color: var(--text-muted); }
        .magic-hint { color: var(--accent); font-weight: 700; margin-bottom: 2rem; font-size: 0.9rem; }
        .p-features { list-style: none; padding: 0; margin: 0 0 2.5rem; text-align: left; }
        .p-features li { padding: 0.75rem 0; color: var(--text-muted); border-bottom: 1px solid var(--border-light); font-weight: 600; }
        .p-features li:last-child { border: none; }
        .p-btn { width: 100%; padding: 1rem; border-radius: 1rem; border: none; font-weight: 800; font-family: 'Fredoka', sans-serif; cursor: pointer; transition: 0.3s; font-size: 1.1rem; }
        .p-btn.primary { background: var(--primary); color: white; }
        .p-btn.secondary { background: var(--accent-soft); color: var(--accent); }

        /* Contact */
        .contact-layout-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 5rem; align-items: flex-start; }
        .contact-info-side p { color: var(--text-muted); font-size: 1.1rem; line-height: 1.7; margin-bottom: 2rem; }
        .contact-details { display: flex; flex-direction: column; gap: 1rem; }
        .c-item { font-weight: 700; color: var(--text-main); }
        .contact-form-box { padding: 3rem; }
        .p-contact-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .p-contact-form input, .p-contact-form textarea { background: var(--bg-app); border: 2px solid var(--border-light); padding: 1rem; border-radius: 1rem; color: var(--text-main); font-family: inherit; outline: none; transition: 0.3s; }
        .p-contact-form input:focus, .p-contact-form textarea:focus { border-color: var(--primary); }
        .p-submit-btn { background: var(--primary); color: white; border: none; padding: 1.1rem; border-radius: 1rem; font-weight: 800; font-family: 'Fredoka', sans-serif; cursor: pointer; }
        .success-state-contact { text-align: center; }
        .success-emoji { font-size: 4rem; display: block; margin-bottom: 1rem; }

        /* Footer */
        .footer-premium { background: var(--bg-card); padding-top: 80px; border-top: 1px solid var(--border-light); }
        .f-inner { display: flex; justify-content: space-between; padding-bottom: 50px; }
        .logo-text-f { font-family: 'Fredoka', sans-serif; font-size: 2rem; font-weight: 800; background: var(--text-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .f-logo p { color: var(--text-muted); margin-top: 1rem; font-weight: 500; }
        .f-links { display: flex; gap: 5rem; }
        .f-col h4 { font-family: 'Fredoka', sans-serif; color: var(--text-main); margin-bottom: 1.5rem; }
        .f-col a { display: block; text-decoration: none; color: var(--text-muted); margin-bottom: 0.75rem; font-weight: 600; transition: 0.3s; }
        .f-col a:hover { color: var(--primary); }
        .f-bottom { padding: 1.5rem; border-top: 1px solid var(--border-light); text-align: center; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; }

        @media (max-width: 968px) {
          .hero-flex { grid-template-columns: 1fr; text-align: center; }
          .hero-content { margin: 0 auto; }
          .hero-input-wrapper { flex-direction: column; background: transparent; border: none; box-shadow: none; padding: 0; }
          .hero-email-input { background: var(--bg-card); border: 1px solid var(--border-light); padding: 1rem; border-radius: 1rem; margin-bottom: 1rem; }
          .contact-layout-grid { grid-template-columns: 1fr; }
          .hero-title-main { font-size: 3rem; }
        }
      `}</style>
    </div>
  );
}
