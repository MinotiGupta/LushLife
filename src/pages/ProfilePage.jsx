import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getBookingsForUser } from '../data/bookings.js';
import { Calendar, Clock, MapPin, ChevronRight, LogOut, User, Star } from 'lucide-react';

const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',  color: '#111', bg: '#F0F0F0', dot: '#111111' },
  completed: { label: 'Completed', color: '#166534', bg: '#F0FDF4', dot: '#16A34A' },
  cancelled: { label: 'Cancelled', color: '#991B1B', bg: '#FEF2F2', dot: '#DC2626' },
};

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled'];

function BookingCard({ booking, navigate }) {
  const cfg = STATUS_CONFIG[booking.status];

  return (
    <div className="booking-history-card" id={`booking-${booking.id}`}>
      <div className="bh-card-top">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div className="bh-salon-name"
              onClick={() => navigate(`/salon/${booking.salonId}`)}
              style={{ cursor: 'pointer' }}>
              {booking.salonName}
            </div>
            <div className="bh-service">{booking.service}</div>
          </div>
          <span className="bh-status-badge" style={{ color: cfg.color, background: cfg.bg, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', marginRight: 5 }}></span>
            {cfg.label}
          </span>
        </div>

        <div className="bh-meta">
          <div className="bh-meta-item"><MapPin size={12} /> {booking.salonLocality}</div>
          <div className="bh-meta-item"><Calendar size={12} /> {booking.date}</div>
          <div className="bh-meta-item"><Clock size={12} /> {booking.time}</div>
          <div className="bh-meta-item">👤 {booking.stylist}</div>
        </div>
      </div>

      <div className="bh-card-footer">
        <div className="bh-id">{booking.id}</div>
        <div className="bh-amount">₹{booking.amount.toLocaleString('en-IN')}</div>
      </div>

      {booking.status === 'upcoming' && (
        <div className="bh-actions">
          <button
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: 12 }}
            onClick={() => navigate(`/salon/${booking.salonId}`)}
          >
            View Salon →
          </button>
          <button
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: 12, color: '#DC2626', borderColor: '#DC2626' }}
          >
            Cancel
          </button>
        </div>
      )}

      {booking.status === 'completed' && (
        <div className="bh-actions">
          <button
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: 12 }}
            onClick={() => navigate(`/booking/${booking.salonId}`)}
          >
            Book Again
          </button>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={12} /> Write Review
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  const allBookings = getBookingsForUser(user.email);

  const filtered = activeTab === 'All'
    ? allBookings
    : allBookings.filter(b => b.status === activeTab.toLowerCase());

  const counts = {
    All: allBookings.length,
    Upcoming: allBookings.filter(b => b.status === 'upcoming').length,
    Completed: allBookings.filter(b => b.status === 'completed').length,
    Cancelled: allBookings.filter(b => b.status === 'cancelled').length,
  };

  const totalSpent = allBookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.amount, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* ========================
          PROFILE HEADER
          ======================== */}
      <div className="profile-header-card">
        <div className="profile-avatar">{user.avatar}</div>
        <div className="profile-info">
          <div className="profile-name">{user.name}</div>
          <div className="profile-email">{user.email}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
            <div className="profile-stat">
              <span className="profile-stat-val">{counts.Upcoming}</span>
              <span className="profile-stat-label">Upcoming</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-val">{counts.Completed}</span>
              <span className="profile-stat-label">Completed</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-val">₹{totalSpent.toLocaleString('en-IN')}</span>
              <span className="profile-stat-label">Total Spent</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-val">{user.memberSince}</span>
              <span className="profile-stat-label">Member Since</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              background: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            id="logout-btn"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 32, maxWidth: 360, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👋</div>
            <h3 style={{ marginBottom: 8 }}>Sign out?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Your bookings are saved. You can always sign back in.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={handleLogout} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#DC2626', borderColor: '#DC2626' }} id="confirm-logout">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================
          BOOKING HISTORY
          ======================== */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>My Bookings</h2>
          <button onClick={() => navigate('/search')} className="btn-primary" style={{ padding: '8px 18px', fontSize: 12 }}>
            + New Booking
          </button>
        </div>

        {/* Tabs */}
        <div className="booking-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`booking-tab ${activeTab === tab ? 'active' : ''}`}
              id={`booking-tab-${tab.toLowerCase()}`}
            >
              {tab}
              <span className="booking-tab-count">{counts[tab]}</span>
            </button>
          ))}
        </div>

        {/* Booking list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
          {filtered.length > 0 ? (
            filtered.map(booking => (
              <BookingCard key={booking.id} booking={booking} navigate={navigate} />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>—</div>
              <h3 style={{ marginBottom: 8, fontSize: 16 }}>
                {activeTab === 'All' ? 'No Bookings' : `No ${activeTab.toLowerCase()} bookings`}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
                {activeTab === 'Upcoming' ? 'Book a salon to see your upcoming appointments here.' : 'Nothing to show yet.'}
              </p>
              {activeTab === 'Upcoming' && (
                <button onClick={() => navigate('/search')} className="btn-primary">
                  Find a Salon →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
