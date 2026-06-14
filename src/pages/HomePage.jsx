import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import SalonCard from '../components/search/SalonCard.jsx';
import { SALONS, LOCALITIES } from '../data/salons.js';

const TRENDING = SALONS.filter(s => s.rating >= 4.6).slice(0, 6);

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* ========================
          HERO SECTION
          ======================== */}
      <section className="hero-section">
        <div className="hero-bg-orb hero-bg-orb-1"></div>
        <div className="hero-bg-orb hero-bg-orb-2"></div>
        <div className="hero-bg-orb hero-bg-orb-3"></div>

        <div className="hero-content">
          <div className="hero-eyebrow">
            <Sparkles size={14} />
            AI-Powered Salon Discovery · Hyderabad
          </div>

          <h1 className="hero-title">
            Find Your Perfect<br />
            <span className="highlight">Hyderabad Salon</span><br />
            in 60 Seconds
          </h1>

          <p className="hero-subtitle">
            GlowMap's AI assistant listens to what you need and shows the best salons
            for your hair, occasion, budget, and location — with real match percentages.
          </p>

          {/* Locality Quick Chips */}
          <div className="locality-chips">
            {LOCALITIES.slice(0, 8).map(loc => (
              <button
                key={loc}
                className="locality-chip"
                onClick={() => navigate(`/search?locality=${encodeURIComponent(loc)}`)}
                id={`locality-${loc.replace(' ', '-')}`}
              >
                📍 {loc}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">20+</span>
              <span className="hero-stat-label">Verified Salons</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">6</span>
              <span className="hero-stat-label">AI Touchpoints</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">60s</span>
              <span className="hero-stat-label">Avg Booking Time</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">4.6★</span>
              <span className="hero-stat-label">Avg Salon Rating</span>
            </div>
          </div>
        </div>
      </section>

      <section className="how-section">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', paddingBottom: 36 }}>
          <div style={{ maxWidth: 620 }}>
            <div className="section-eyebrow">Ready to find your salon?</div>
            <h2 className="section-title">Browse salons or get an AI match</h2>
            <p className="section-subtitle">
              All salons are shown below with ratings, price, location and services. Click Get AI Match if you want the system to ask your preferences and suggest the best salons.
            </p>
          </div>

          <button onClick={() => navigate('/ai-match')} className="btn-primary" style={{ minWidth: 220, padding: '16px 32px' }}>
            Get AI Match
          </button>
        </div>
      </section>

      {/* ========================
          SALON LIST
          ======================== */}
      <section className="trending-section">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">All Salons</div>
            <h2 className="section-title">Hyderabad's Verified Salon Partners</h2>
            <p className="section-subtitle">
              Browse every salon in the directory. The cards show location, rating, starting price and service tags.
            </p>
          </div>

          <div className="trending-grid">
            {SALONS.map(salon => (
              <SalonCard key={salon.id} salon={salon} showMatch={false} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================
          HOW IT WORKS
          ======================== */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">How GlowMap Works</div>
            <h2 className="section-title">From Quiz to Chair in 3 Minutes</h2>
            <p className="section-subtitle">
              No more scrolling through generic lists. Our AI understands YOU.
            </p>
          </div>

          <div className="how-steps">
            <div className="how-step">
              <div className="how-step-number">01</div>
              <div className="how-step-title">Tell Us About You</div>
              <p className="how-step-desc">
                Take our 4-question AI quiz. Hair type, occasion, budget, and preferred locality. Takes under 30 seconds.
              </p>
            </div>
            <div className="how-step">
              <div className="how-step-number">02</div>
              <div className="how-step-title">AI Finds Your Match</div>
              <p className="how-step-desc">
                Our AI evaluates 20 Hyderabad salons and streams personalised reasons why each matches your specific needs.
              </p>
            </div>
            <div className="how-step">
              <div className="how-step-number">03</div>
              <div className="how-step-title">Book in 60 Seconds</div>
              <p className="how-step-desc">
                Browse AI-tagged photos, chat with our salon assistant, pick your slot, and get a confirmed booking ID.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================
          TRENDING SALONS
          ======================== */}
      <section className="trending-section">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Trending in Hyderabad</div>
            <h2 className="section-title">Highest Rated Salons This Month</h2>
            <p className="section-subtitle">
              AI-verified reviews · Real Hyderabad customers · Genuine ratings
            </p>
          </div>

          <div className="trending-grid">
            {TRENDING.map(salon => (
              <SalonCard key={salon.id} salon={salon} showMatch={false} />
            ))}
          </div>

        </div>
      </section>

      {/* ========================
          AI FEATURES STRIP
          ======================== */}
      <section style={{
        background: 'var(--gradient-hero)',
        padding: '64px 24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow" style={{ color: 'var(--gold-light)' }}>AI at Every Touchpoint</div>
            <h2 className="section-title" style={{ color: 'white' }}>6 Ways AI Powers Your Experience</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { icon: '🎯', title: 'AI Stylist Quiz', desc: 'Personalized salon matching in 4 questions with streaming AI reasoning' },
              { icon: '🏆', title: 'Match Score Badges', desc: 'Every salon rated with a personalized match % just for you' },
              { icon: '📸', title: 'Vision Photo Tags', desc: 'AI analyzes every portfolio photo for style, technique, and occasion' },
              { icon: '💬', title: 'Salon AI Chatbot', desc: 'Ask any question about services, availability, or specializations' },
              { icon: '💭', title: 'Review Sentiment', desc: '3-word AI summaries from real customer reviews — clean, fast, honest' },
              { icon: '📊', title: 'Owner AI Insights', desc: 'Salon owners get AI-powered demand insights and booking optimization tips' },
            ].map(feat => (
              <div key={feat.title} style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{feat.icon}</div>
                <h4 style={{ color: 'white', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>{feat.title}</h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================
          LOCALITIES SECTION
          ======================== */}
      <section style={{ padding: '64px 24px', background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Browse by Area</div>
            <h2 className="section-title">Hyderabad's Best Salon Areas</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {LOCALITIES.map(loc => (
              <button
                key={loc}
                onClick={() => navigate(`/search?locality=${encodeURIComponent(loc)}`)}
                style={{
                  padding: '20px 16px',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--rose)';
                  e.currentTarget.style.background = 'var(--rose-pale)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                id={`loc-btn-${loc.replace(' ', '-')}`}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>📍</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{loc}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {SALONS.filter(s => s.locality === loc).length} salons
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        padding: '64px 24px',
        background: 'linear-gradient(135deg, var(--rose-pale) 0%, var(--gold-pale) 100%)',
        textAlign: 'center'
      }}>
        <div className="section-eyebrow">Ready to Glow?</div>
        <h2 className="section-title" style={{ marginBottom: 16 }}>
          Find Your Perfect Hyderabad Salon Today
        </h2>
        <p className="section-subtitle" style={{ marginBottom: 32 }}>
          Join thousands of Hyderabad women who found their favourite salon on GlowMap.
        </p>
        <button onClick={() => navigate('/search')} className="btn-primary" style={{ padding: '16px 40px', fontSize: 17 }}>
          <Sparkles size={18} />
          Start AI Matching — Free
        </button>
      </section>

      <FloatingChatbot isHome={true} />
    </div>
  );
}
