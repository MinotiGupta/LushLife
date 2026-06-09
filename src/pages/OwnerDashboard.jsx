import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SALONS } from '../data/salons.js';
import { LayoutDashboard, CalendarDays, TrendingUp, Zap, Plus, Edit, Eye } from 'lucide-react';

// Seed bookings for Studio 9 demo
const DEMO_BOOKINGS = [
  { id: 'GLW-HYD-41201', customer: 'Priya Reddy', service: 'Bridal Makeup (Full Package)', stylist: 'Meenakshi R.', time: '10:00 AM', status: 'confirmed', amount: 28000 },
  { id: 'GLW-HYD-41202', customer: 'Kavitha M.', service: 'Silk Saree Updo', stylist: 'Meenakshi R.', time: '2:00 PM', status: 'confirmed', amount: 3500 },
  { id: 'GLW-HYD-41203', customer: 'Ananya B.', service: 'HD Facial + Cleanup', stylist: 'Anjali S.', time: '11:00 AM', status: 'completed', amount: 2200 },
  { id: 'GLW-HYD-41204', customer: 'Trisha P.', service: 'Advanced Balayage', stylist: 'Priya K.', time: '3:00 PM', status: 'pending', amount: 7500 },
  { id: 'GLW-HYD-41205', customer: 'Divya L.', service: 'Hair Cut + Blow Dry', stylist: 'Priya K.', time: '5:00 PM', status: 'confirmed', amount: 800 },
  { id: 'GLW-HYD-41206', customer: 'Sunita R.', service: 'Keratin Treatment', stylist: 'Anjali S.', time: '6:30 PM', status: 'pending', amount: 5500 },
];

const STATS = [
  { label: "Today's Bookings", value: 6, sub: '↑ 2 from yesterday', icon: '📅' },
  { label: "Revenue Today", value: '₹47,500', sub: '↑ 32% vs last week', icon: '💰' },
  { label: 'Avg Rating', value: '4.8 ★', sub: 'Based on 312 reviews', icon: '⭐' },
  { label: 'Profile Views', value: '284', sub: 'This week on GlowMap', icon: '👁️' },
];

const AI_INSIGHTS = [
  {
    title: 'Your Sunday afternoon slots are unfilled — consider a last-minute deal',
    action: 'Create Deal',
    applied: false,
  },
  {
    title: '"Bridal Makeup" is trending in Banjara Hills this week. Your listing ranks #1 — boost it!',
    action: 'Boost Listing',
    applied: false,
  },
  {
    title: 'You\'ve had 3 cancellations this month on Mondays — consider a Monday-only discount',
    action: 'Create Monday Offer',
    applied: false,
  },
];

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const salon = SALONS[0]; // Studio 9 as demo owner
  const [activeInsight, setActiveInsight] = useState(0);
  const [appliedInsights, setAppliedInsights] = useState({});
  const [activeTab, setActiveTab] = useState('bookings');

  const handleApplyInsight = (i) => {
    setAppliedInsights(prev => ({ ...prev, [i]: true }));
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--gradient-hero)', padding: '40px 24px 32px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ padding: '4px 12px', background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 'var(--radius-full)', fontSize: 12, color: 'var(--gold-light)', fontWeight: 700 }}>
              ⚡ OWNER DASHBOARD
            </div>
          </div>
          <div className="dashboard-greeting" style={{ color: 'white' }}>
            Good evening, <span style={{ color: 'var(--gold-light)' }}>Studio 9</span> 👋
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 8 }}>
            Monday, 9 June 2026 · Your listing is live on GlowMap ·
            <button onClick={() => navigate('/salon/salon-01')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-light)', textDecoration: 'underline', fontSize: 14 }}>
              View Public Profile →
            </button>
          </p>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* ========================
            STATS GRID
            ======================== */}
        <div className="dashboard-stats">
          {STATS.map((stat, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
              <div className="stat-card-label">{stat.label}</div>
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-sub">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ========================
            AI INSIGHT CARD
            ======================== */}
        <div className="ai-insight-card" style={{ marginBottom: 32 }}>
          <div className="ai-insight-label">
            <span>⚡</span>
            <span>AI Insights — Powered by Claude</span>
          </div>

          <div className="ai-insight-text">
            {AI_INSIGHTS[activeInsight].title}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {!appliedInsights[activeInsight] ? (
              <button
                onClick={() => handleApplyInsight(activeInsight)}
                className="btn-gold"
                id="apply-insight-btn"
              >
                ✓ {AI_INSIGHTS[activeInsight].action}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 'var(--radius-full)', color: '#4ade80', fontSize: 14, fontWeight: 700 }}>
                ✓ Applied!
              </div>
            )}
            <button className="btn-secondary" style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.3)' }}
              onClick={() => setActiveInsight((activeInsight + 1) % AI_INSIGHTS.length)}>
              Next Insight →
            </button>
          </div>
        </div>

        {/* ========================
            TABS
            ======================== */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 20 }}>
          {[
            { id: 'bookings', label: '📅 Today\'s Bookings' },
            { id: 'services', label: '✂️ Services' },
            { id: 'analytics', label: '📊 Analytics' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                color: activeTab === tab.id ? 'var(--rose)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--rose)' : '2px solid transparent',
                marginBottom: -2,
              }}
              id={`dash-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================
            BOOKINGS TABLE
            ======================== */}
        {activeTab === 'bookings' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h4 style={{ fontFamily: 'var(--font-heading)' }}>Today's Appointments — 9 June 2026</h4>
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                <Plus size={14} /> Add Slot
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Stylist</th>
                    <th>Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_BOOKINGS.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{b.id}</td>
                      <td style={{ fontWeight: 600 }}>{b.customer}</td>
                      <td style={{ maxWidth: 160 }}>{b.service}</td>
                      <td>{b.stylist}</td>
                      <td style={{ fontWeight: 600 }}>{b.time}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--rose)', fontWeight: 700 }}>₹{b.amount.toLocaleString('en-IN')}</td>
                      <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>6 appointments today</span>
              <span style={{ fontWeight: 700, color: 'var(--rose)', fontFamily: 'var(--font-mono)' }}>
                Total: ₹{DEMO_BOOKINGS.reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN')}
              </span>
            </div>
          </>
        )}

        {/* ========================
            SERVICES TAB
            ======================== */}
        {activeTab === 'services' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontFamily: 'var(--font-heading)' }}>Your Services</h4>
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                <Plus size={14} /> Add Service
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salon.services.map((svc, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{svc.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{svc.duration}</td>
                      <td><span className="service-price">₹{svc.price.toLocaleString('en-IN')}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)' }}>
                            <Edit size={12} style={{ display: 'inline', marginRight: 4 }} />Edit Price
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ========================
            ANALYTICS TAB
            ======================== */}
        {activeTab === 'analytics' && (
          <>
            <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>Performance Analytics</h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'This Week Revenue', value: '₹1,84,000', change: '+32%', up: true },
                { label: 'Bookings This Week', value: '28', change: '+8 vs last week', up: true },
                { label: 'Profile Views', value: '1,240', change: '+47% from GlowMap AI', up: true },
                { label: 'Avg Booking Value', value: '₹6,571', change: '↑ ₹800 vs last month', up: true },
              ].map((item, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-card-label">{item.label}</div>
                  <div className="stat-card-value" style={{ fontSize: 22 }}>{item.value}</div>
                  <div className="stat-card-sub" style={{ color: item.up ? '#16A34A' : 'var(--rose)' }}>{item.change}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Most Popular Services (This Month)</div>
              {[
                { name: 'Bridal Makeup (Full Package)', bookings: 14, pct: 90 },
                { name: 'Silk Saree Updo', bookings: 22, pct: 75 },
                { name: 'Advanced Balayage', bookings: 18, pct: 60 },
                { name: 'Hair Cut + Blow Dry', bookings: 31, pct: 45 },
                { name: 'HD Facial + Cleanup', bookings: 12, pct: 30 },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.bookings} bookings</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', background: 'var(--gradient-rose)', borderRadius: 4 }}></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
