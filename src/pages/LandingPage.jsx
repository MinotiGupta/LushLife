import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/search', { replace: true });
    }
  }, [user, navigate]);

  const [mode, setMode] = useState('landing'); // landing | login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 700)); // simulate network
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/search', { replace: true });
    } else {
      setError(result.error);
    }
  };

  const handleGuestLogin = () => {
    const result = login('demo@glowmap.in', 'demo');
    if (result.success) navigate('/search', { replace: true });
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="landing-root">
      {/* ========================
          LEFT PANEL — Brand
          ======================== */}
      <div className="landing-left">
        <div className="landing-left-inner">
          {/* Logo */}
          <div className="landing-logo">
            <span className="landing-logo-icon">✨</span>
            <span className="landing-logo-text">GlowMap</span>
          </div>

          <div className="landing-tagline">
            Find your perfect<br />
            Hyderabad salon<br />
            <span className="landing-tagline-accent">in 60 seconds.</span>
          </div>

          <p className="landing-desc">
            AI-powered matching across 20 verified salons — bridal, hair, skincare, nails. No scrolling, no guessing.
          </p>

          {/* Feature pills */}
          <div className="landing-features">
            {[
              ['⚡', 'AI Stylist Quiz'],
              ['📸', 'Photo Style Tags'],
              ['💬', 'Salon Chatbot'],
              ['📅', 'Instant Booking'],
            ].map(([icon, label]) => (
              <div key={label} className="landing-feature-pill">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="landing-testimonial">
            <div className="landing-testimonial-text">
              "Found my bridal salon in 2 minutes. The AI quiz actually understood what I needed."
            </div>
            <div className="landing-testimonial-author">— Priya R., Banjara Hills bride 2026</div>
          </div>
        </div>
      </div>

      {/* ========================
          RIGHT PANEL — Auth
          ======================== */}
      <div className="landing-right">
        <div className="landing-form-card">

          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode !== 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
              id="tab-login"
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setError(''); }}
              id="tab-signup"
            >
              Create Account
            </button>
          </div>

          {mode !== 'signup' ? (
            /* ====== LOGIN FORM ====== */
            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-form-title">Welcome back</div>
              <div className="auth-form-sub">Sign in to view bookings & get AI matches</div>

              {/* Demo hint */}
              <div className="demo-hint-box">
                <div className="demo-hint-label">⚡ Demo accounts — click to fill</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {[
                    ['priya@gmail.com', 'priya123', 'Priya'],
                    ['kavitha@gmail.com', 'kavi123', 'Kavitha'],
                    ['demo@glowmap.in', 'demo', 'Ananya'],
                  ].map(([e, p, n]) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => handleDemoFill(e, p)}
                      className="demo-fill-btn"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="priya@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 14 }}
                id="login-submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>

              <div className="auth-divider"><span>or</span></div>

              <button
                type="button"
                onClick={handleGuestLogin}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 13 }}
                id="guest-btn"
              >
                Continue as Guest
              </button>
            </form>

          ) : (
            /* ====== SIGNUP FORM (visual only for demo) ====== */
            <form onSubmit={(e) => { e.preventDefault(); handleDemoFill('demo@glowmap.in', 'demo'); setMode('login'); }} className="auth-form">
              <div className="auth-form-title">Create account</div>
              <div className="auth-form-sub">Join thousands of Hyderabad women on GlowMap</div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">Full Name</label>
                <input id="signup-name" type="text" className="form-input" placeholder="Ananya Sharma" value={name} onChange={e => setName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">Email</label>
                <input id="signup-email" type="email" className="form-input" placeholder="you@email.com" required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-phone">Phone</label>
                <input id="signup-phone" type="tel" className="form-input" placeholder="98480 XXXXX" required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">Password</label>
                <input id="signup-password" type="password" className="form-input" placeholder="Min. 8 characters" required />
              </div>

              <div className="demo-hint-box" style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 12 }}>⚡ Demo: Signing up will log you in as the demo user (Ananya Sharma)</span>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 14 }} id="signup-submit">
                Create Account →
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20, lineHeight: 1.6 }}>
            By continuing you agree to GlowMap's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
