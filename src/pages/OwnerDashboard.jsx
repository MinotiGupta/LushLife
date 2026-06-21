import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, TrendingUp, Zap, Plus, Edit, Eye, User, Phone } from 'lucide-react';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [salon, setSalon] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phoneInput, setPhoneInput] = useState('');
  const [updatingPhone, setUpdatingPhone] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { SALONS } = await import('../data/salons.js');
        const { MOCK_BOOKINGS } = await import('../data/bookings.js');
        
        if (SALONS.length > 0) {
          const currentSalon = SALONS[0]; // Just use first salon as mock owner
          setSalon(currentSalon);
          setPhoneInput(currentSalon.phone || '');

          // Find bookings for this salon from all mock users
          const salonBookings = [];
          for (const [email, userBookings] of Object.entries(MOCK_BOOKINGS)) {
            userBookings.forEach(b => {
              if (b.salonId === currentSalon.id) {
                salonBookings.push({
                  id: b.id,
                  customer_name: email,
                  service_name: b.service,
                  stylist_name: b.stylist,
                  date: b.date,
                  time: b.time,
                  status: b.status,
                  amount: b.amount
                });
              }
            });
          }
          // Sort by date (mock simplistic sort: upcoming first, then recent)
          salonBookings.sort((a, b) => (a.status === 'upcoming' ? -1 : 1));
          
          setBookings(salonBookings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);



  const handleUpdatePhone = async () => {
    setUpdatingPhone(true);
    // Mock phone update
    setTimeout(() => {
      setSalon(prev => ({ ...prev, phone: phoneInput }));
      alert('Phone number updated successfully (Mock)!');
      setUpdatingPhone(false);
    }, 600);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px' }}>Loading Dashboard...</div>;
  if (!salon) return <div style={{ textAlign: 'center', padding: '80px' }}>No salons found for this owner.</div>;

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
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, <span style={{ color: 'var(--gold-light)' }}>{salon.name}</span> 👋
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 8 }}>
            Your listing is live in {salon.locality} ·
            <button onClick={() => navigate(`/salon/${salon._id || salon.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-light)', textDecoration: 'underline', fontSize: 14 }}>
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
          <div className="stat-card">
            <div style={{ fontSize: 24, marginBottom: 8 }}>📅</div>
            <div className="stat-card-label">Total Bookings</div>
            <div className="stat-card-value">{bookings.length}</div>
            <div className="stat-card-sub">All time</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 24, marginBottom: 8 }}>💰</div>
            <div className="stat-card-label">Revenue</div>
            <div className="stat-card-value">₹{bookings.reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString('en-IN')}</div>
            <div className="stat-card-sub">All time</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 24, marginBottom: 8 }}>⭐</div>
            <div className="stat-card-label">Avg Rating</div>
            <div className="stat-card-value">{salon.rating} ★</div>
            <div className="stat-card-sub">Based on {salon.reviews?.length || salon.reviewCount} reviews</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 24, marginBottom: 8 }}>👁️</div>
            <div className="stat-card-label">Profile Status</div>
            <div className="stat-card-value">Active</div>
            <div className="stat-card-sub">Listed in {salon.locality}</div>
          </div>
        </div>

        {/* ========================
            TABS
            ======================== */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 20 }}>
          {[
            { id: 'profile', label: '👤 Profile Settings' },
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
            PROFILE TAB
            ======================== */}
        {activeTab === 'profile' && (
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid var(--border)' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 24 }}>Contact Information</h4>
            
            <div className="form-group" style={{ maxWidth: 400 }}>
              <label className="form-label">Phone Number</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  type="tel"
                  className="form-input"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="e.g. 9876543210"
                />
                <button 
                  className="btn-primary" 
                  onClick={handleUpdatePhone}
                  disabled={updatingPhone || phoneInput === salon.phone}
                >
                  {updatingPhone ? 'Saving...' : 'Update'}
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                This phone number will be displayed publicly on your salon profile page.
              </p>
            </div>
          </div>
        )}

        {/* ========================
            BOOKINGS TABLE
            ======================== */}
        {activeTab === 'bookings' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h4 style={{ fontFamily: 'var(--font-heading)' }}>Today's Appointments — {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</h4>
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
                  {bookings.map(b => (
                    <tr key={b._id || b.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{b.confirmation_id || b._id || b.id}</td>
                      <td style={{ fontWeight: 600 }}>{b.customer_name || 'N/A'}</td>
                      <td style={{ maxWidth: 160 }}>{b.service_id || 'N/A'}</td>
                      <td>{b.stylist_id || 'Any Available'}</td>
                      <td style={{ fontWeight: 600 }}>{b.slot_start ? new Date(b.slot_start).toLocaleString() : 'N/A'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--rose)', fontWeight: 700 }}>—</td>
                      <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                        No bookings yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{bookings.length} appointments</span>
              <span style={{ fontWeight: 700, color: 'var(--rose)', fontFamily: 'var(--font-mono)' }}>
                Total: ₹{bookings.reduce((a, b) => a + (b.amount || 0), 0).toLocaleString('en-IN')}
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
                { label: 'Total Revenue', value: `₹${bookings.reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString('en-IN')}`, change: 'Real-time', up: true },
                { label: 'Total Bookings', value: bookings.length, change: 'Real-time', up: true },
                { label: 'Profile Views', value: salon.review_count || 0, change: 'Based on searches', up: true },
                { label: 'Avg Booking Value', value: bookings.length > 0 ? `₹${Math.round(bookings.reduce((sum, b) => sum + (b.amount || 0), 0) / bookings.length).toLocaleString('en-IN')}` : '₹0', change: 'Real-time', up: true },
              ].map((item, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-card-label">{item.label}</div>
                  <div className="stat-card-value" style={{ fontSize: 22 }}>{item.value}</div>
                  <div className="stat-card-sub" style={{ color: item.up ? '#16A34A' : 'var(--rose)' }}>{item.change}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Services Available</div>
              {salon.services.length > 0 ? salon.services.map((svc, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{svc.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>₹{svc.price}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (svc.price / 5000) * 100)}%`, height: '100%', background: 'var(--gradient-rose)', borderRadius: 4 }}></div>
                  </div>
                </div>
              )) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No services added yet.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
