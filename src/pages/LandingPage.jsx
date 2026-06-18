import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/search', { replace: true });
    }
  }, [user, navigate]);

  const [mode, setMode] = useState('login'); // login | signup
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700)); // simulate network
    const result = register(signupName, signupEmail, signupPassword);
    setLoading(false);
    if (result.success) {
      navigate('/search', { replace: true });
    } else {
      setError(result.error);
    }
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
            <img src="/favicon.svg" alt="LushLife Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span className="landing-logo-text">LushLife</span>
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

              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
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
            </form>

          ) : (
            /* ====== SIGNUP FORM ====== */
            <form onSubmit={handleSignup} className="auth-form">
              <div className="auth-form-title">Create account</div>
              <div className="auth-form-sub">Join thousands of Hyderabad women on LushLife</div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name" type="text" className="form-input"
                  placeholder="Ananya Sharma"
                  value={signupName} onChange={e => setSignupName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">Email</label>
                <input
                  id="signup-email" type="email" className="form-input"
                  placeholder="you@email.com"
                  value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-phone">Phone (optional)</label>
                <input
                  id="signup-phone" type="tel" className="form-input"
                  placeholder="98480 XXXXX"
                  value={signupPhone} onChange={e => setSignupPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">Password</label>
                <input
                  id="signup-password" type="password" className="form-input"
                  placeholder="Min. 6 characters"
                  value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
                <input
                  id="signup-confirm" type="password" className="form-input"
                  placeholder="Re-enter password"
                  value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)}
                  required
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 14 }}
                id="signup-submit"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                Already have an account?{' '}
                <button type="button" onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, padding: 0, textDecoration: 'underline' }}>Sign in</button>
              </p>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20, lineHeight: 1.6 }}>
            By continuing you agree to LushLife's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
