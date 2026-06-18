import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FloatingChatbot from '../components/home/FloatingChatbot.jsx';
import { MapPin, Star, Clock, Phone, MessageCircle, Send, ChevronDown, ExternalLink, Check } from 'lucide-react';

export default function SalonProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showMatchReason, setShowMatchReason] = useState(false);

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const res = await fetch(`/api/salons/${id}`);
        if (res.ok) {
          const data = await res.json();
          setSalon({
            id: data._id || data.id,
            name: data.name,
            locality: data.locality,
            description: data.description,
            coverPhoto: data.photos && data.photos.length > 0 ? data.photos[0].url : 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
            address: `${data.locality}, Hyderabad`,
            rating: data.rating_avg || 4.0,
            reviewCount: data.review_count || 0,
            openNow: data.is_active,
            hours: "10:00 AM - 8:00 PM",
            tags: data.photos && data.photos.length > 0 ? data.photos[0].ai_tags : ['salon'],
            matchScore: 92,
            matchReason: "This salon matches your 'everyday' needs perfectly with expert stylists for your profile.",
            phone: data.phone || "N/A",
            sentiment: data.sentiment_summary || "clean, professional, quick",
            address: data.address || `${data.locality}, Hyderabad`,
            photos: (data.photos || []).map(p => ({ url: p.url, tags: p.ai_tags || [] })),
            services: (data.services || []).map(s => ({
              name: s.name,
              duration: `${s.duration_min} mins`,
              price: s.price
            })),
            stylists: (data.stylists || []).map(st => ({
              emoji: "👩‍🦱",
              name: st.name,
              specialty: st.bio || "Stylist"
            })),
            reviews: (data.google_reviews || []).map(r => ({
              name: r.author || "Anonymous",
              rating: r.rating || 5,
              date: r.time || "recently",
              text: r.text || "Great experience!",
              verified: true,
              profilePhoto: r.profile_photo || ""
            }))
          });
        }
      } catch (err) {
        console.error("Failed to fetch salon profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalon();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px 24px' }}><h2>Loading...</h2></div>;
  }

  if (!salon) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <h2>Salon not found</h2>
        <button onClick={() => navigate('/search')} className="btn-primary" style={{ marginTop: 16 }}>Back to Search</button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* ========================
          PROFILE HERO
          ======================== */}
      <div className="profile-hero">
        <img src={salon.coverPhoto} alt={salon.name} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80'; }} />
        <div className="profile-hero-overlay"></div>
        <div className="profile-hero-content">
          <div className="container">
            {/* Breadcrumb */}
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8, cursor: 'pointer' }}>
              <span onClick={() => navigate('/search')} style={{ textDecoration: 'underline' }}>Salons</span>
              <span> / </span>
              <span onClick={() => navigate(`/search?locality=${salon.locality}`)} style={{ textDecoration: 'underline' }}>{salon.locality}</span>
              <span> / </span>
              <span>{salon.name}</span>
            </div>

            <div className="profile-hero-name">{salon.name}</div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                <MapPin size={14} />
                {salon.address}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                <Star size={14} fill="#D4AF37" color="#D4AF37" />
                <strong>{salon.rating}</strong>
                <span style={{ opacity: 0.7 }}>({salon.reviewCount} reviews)</span>
              </div>
              {salon.openNow && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4ade80', fontSize: 14, fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                  Open Now · {salon.hours}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================
          MAIN LAYOUT
          ======================== */}
      <div className="profile-layout">
        {/* LEFT: Main Content */}
        <div>
          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {salon.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>

          {/* AI Match Explanation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, maxWidth: 700 }}>
            <button
              type="button"
              onClick={() => setShowMatchReason(prev => !prev)}
              className="btn-secondary"
              style={{ alignSelf: 'flex-start' }}
            >
              ⚡ AI Match {salon.matchScore}%
            </button>
            {showMatchReason && (
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Why this match?</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {salon.matchReason}
                </div>
              </div>
            )}
          </div>



          {/* Description */}
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 32 }}>
            {salon.description}
          </p>

          {/* ========================
              PHOTO GALLERY + AI TAGS
              ======================== */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)' }}>Portfolio</h3>
            </div>

            <div className="photo-gallery">
              {salon.photos.map((photo, i) => (
                <div key={i} className="gallery-item" onClick={() => setSelectedPhoto(photo)}>
                  <img
                    src={photo.url}
                    alt={`${salon.name} portfolio ${i + 1}`}
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=60'; }}
                  />
                  <div className="gallery-ai-tags">
                    {photo.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="gallery-ai-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================
              TABS: SERVICES / STYLISTS / REVIEWS
              ======================== */}
          <div style={{ borderBottom: '2px solid var(--border)', marginBottom: 24, display: 'flex', gap: 0 }}>
            {['services', 'stylists', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                  color: activeTab === tab ? 'var(--rose)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab ? '2px solid var(--rose)' : '2px solid transparent',
                  marginBottom: -2, textTransform: 'capitalize',
                }}
                id={`tab-${tab}`}
              >
                {tab === 'services' ? '✂️ Services' : tab === 'stylists' ? '👩‍🦱 Stylists' : '⭐ Reviews'}
              </button>
            ))}
          </div>

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="info-card" style={{ padding: 0, overflow: 'hidden', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {salon.services.map((svc, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{svc.name}</div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{svc.duration}</td>
                      <td><span className="service-price">₹{svc.price.toLocaleString('en-IN')}</span></td>
                      <td>
                        <button
                          onClick={() => navigate(`/booking/${salon.id}?service=${encodeURIComponent(svc.name)}`)}
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: 12 }}
                        >
                          Book
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stylists Tab */}
          {activeTab === 'stylists' && (
            <div>
              <div className="stylist-grid">
                {salon.stylists.map((stylist, i) => (
                  <div key={i} className="stylist-card">
                    <div className="stylist-avatar">{stylist.emoji}</div>
                    <div className="stylist-name">{stylist.name}</div>
                    <div className="stylist-specialty">{stylist.specialty}</div>
                  </div>
                ))}
                <div className="stylist-card">
                  <div className="stylist-avatar" style={{ background: 'var(--border)' }}>🎲</div>
                  <div className="stylist-name">Any Available</div>
                  <div className="stylist-specialty">Surprise me!</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
                All stylists at {salon.name} are certified professionals with 3+ years experience.
              </p>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              {/* Rating Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, padding: '20px', background: 'var(--bg)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 48, fontWeight: 700, color: 'var(--text)' }}>{salon.rating}</div>
                  <div style={{ color: 'var(--gold)', fontSize: 20, margin: '4px 0' }}>★★★★★</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{salon.reviewCount} reviews</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 20 }}>5★</span>
                    <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: '78%', height: '100%', background: 'var(--gold)', borderRadius: 4 }}></div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>78%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 20 }}>4★</span>
                    <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: '18%', height: '100%', background: '#f0c040', borderRadius: 4 }}></div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>18%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 20 }}>3★</span>
                    <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: '4%', height: '100%', background: '#d0d0d0', borderRadius: 4 }}></div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>4%</span>
                  </div>
                </div>
              </div>

              {/* AI Sentiment */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--rose-pale)', borderRadius: 'var(--radius-full)', marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚡ AI Summary:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13 }}>{salon.sentiment}</span>
              </div>

              {/* Reviews */}
              {salon.reviews.map((review, i) => (
                <div key={i} className="review-card">
                  <div className="review-header">
                    <div>
                      <div className="reviewer-name">{review.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <div className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                        {review.verified && <span className="verified-badge"><Check size={10} /> Verified Booking</span>}
                      </div>
                    </div>
                    <div className="reviewer-date">{review.date}</div>
                  </div>
                  <div className="review-text">{review.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Book CTA */}
        <div>
          <FloatingChatbot salon={salon} />

          {/* Info Card */}
          <div className="info-card" style={{ padding: 20, marginBottom: 20 }}>
            <h4 style={{ marginBottom: 16, fontFamily: 'var(--font-heading)' }}>Salon Info</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <MapPin size={16} color="var(--rose)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14, color: 'var(--text)' }}>{salon.address}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Clock size={16} color="var(--rose)" />
                <span style={{ fontSize: 14 }}>{salon.hours}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Phone size={16} color="var(--rose)" />
                <span style={{ fontSize: 14 }}>+91 {salon.phone}</span>
              </div>
            </div>

            {/* Map Embed Placeholder */}
            <div className="salon-map-placeholder" style={{ marginTop: 16 }}>
              <span style={{ fontSize: 28 }}>🗺️</span>
              <span>{salon.locality}, Hyderabad</span>
            </div>
          </div>


        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 600, width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <img src={selectedPhoto.url} alt="" style={{ width: '100%', display: 'block' }} />
            <div style={{ background: '#1A0A10', padding: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {selectedPhoto.tags.map(tag => (
                <span key={tag} className="gallery-ai-tag" style={{ fontSize: 12 }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Book Button */}
      <div className="floating-book-button">
        <button
          onClick={() => navigate(`/booking/${salon.id}`)}
          className="btn-primary"
          style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}
        >
          Book Now →
        </button>
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @media (max-width: 900px) {
          .sticky-book-bar { padding: 12px 16px; }
        }
      `}</style>
    </div>
  );
}
