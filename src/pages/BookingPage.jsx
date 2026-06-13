import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getSalonById } from '../data/salons.js';
import { Check, ChevronRight } from 'lucide-react';

const STEP_LABELS = ['Service', 'Stylist', 'Date & Time', 'Confirm'];

const DAYS = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];
const UNAVAILABLE = [2, 5, 8]; // indices of unavailable times

function generateBookingId() {
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `GLW-HYD-${num}`;
}

function launchConfetti() {
  import('canvas-confetti').then(confetti => {
    confetti.default({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C2185B', '#D4AF37', '#9E7B8B', '#fff'],
    });
    setTimeout(() => {
      confetti.default({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#C2185B', '#D4AF37'],
      });
      confetti.default({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#C2185B', '#D4AF37'],
      });
    }, 300);
  });
}

export default function BookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const salon = getSalonById(id);

  const preSelectedService = searchParams.get('service');

  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState({
    service: preSelectedService ? salon?.services.find(s => s.name === preSelectedService) : null,
    stylist: null,
    day: 0,
    time: null,
    name: '',
    phone: '',
    email: '',
  });
  const [bookingId, setBookingId] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (preSelectedService && salon) {
      const svc = salon.services.find(s => s.name === preSelectedService);
      if (svc) {
        setBooking(prev => ({ ...prev, service: svc }));
        setStep(1); // Skip to stylist selection
      }
    }
  }, []);

  if (!salon) return null;

  const handleConfirm = () => {
    const id = generateBookingId();
    setBookingId(id);
    setConfirmed(true);
    setTimeout(launchConfetti, 200);
  };

  const canProceed = () => {
    if (step === 0) return !!booking.service;
    if (step === 1) return true; // Stylist optional
    if (step === 2) return booking.time !== null;
    if (step === 3) return booking.name && booking.phone && booking.email;
    return false;
  };

  if (confirmed) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="booking-card" style={{ textAlign: 'center' }}>
          <div className="confirmation-screen">
            <div className="confirmation-icon">✅</div>

            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
              Booking Confirmed! 🎉
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Your appointment has been reserved at {salon.name}
            </p>

            <div className="booking-id">{bookingId}</div>

            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: 20, textAlign: 'left', margin: '20px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Salon</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{salon.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Service</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{booking.service?.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Date & Time</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{DAYS[booking.day]}, {booking.time}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Stylist</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{booking.stylist?.name || 'Any Available'}</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--rose-pale)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: 'var(--rose-dark)' }}>
                📧 Confirmation sent to <strong>{booking.email}</strong><br />
                📱 We'll also send a reminder to <strong>+91 {booking.phone}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Appointment+at+${encodeURIComponent(salon.name)}&details=Booking+ID:+${bookingId}+|+${booking.service?.name}&location=${encodeURIComponent(salon.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ textDecoration: 'none', justifyContent: 'center' }}
              >
                📅 Add to Google Calendar
              </a>
              <button onClick={() => navigate(`/salon/${salon.id}`)} className="btn-secondary">
                Back to Salon Profile
              </button>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', padding: '40px 24px' }}>
      {/* Step Indicators */}
      <div className="booking-steps" style={{ maxWidth: 560, margin: '0 auto 32px' }}>
        {STEP_LABELS.map((label, i) => (
          <>
            <div className="booking-step-indicator" key={label}>
              <div className={`booking-step-circle ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <div className="booking-step-label">{label}</div>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`booking-step-connector ${i < step ? 'done' : ''}`} key={`con-${i}`}></div>
            )}
          </>
        ))}
      </div>

      <div className="booking-card">
        {/* Salon Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', marginBottom: 28 }}>
          <img src={salon.coverPhoto} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{salon.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>📍 {salon.locality} · ⭐ {salon.rating}</div>
          </div>
        </div>

        {/* ====== STEP 0: SERVICE ====== */}
        {step === 0 && (
          <>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>Select a Service</h3>
            {salon.services.map((svc, i) => (
              <div
                key={i}
                className={`service-option ${booking.service?.name === svc.name ? 'selected' : ''}`}
                onClick={() => setBooking(prev => ({ ...prev, service: svc }))}
                id={`service-opt-${i}`}
              >
                <div>
                  <div className="service-option-name">{svc.name}</div>
                  <div className="service-option-meta">{svc.duration} {svc.aiRecommended && '· ⚡ AI Recommended'}</div>
                </div>
                <div className="service-option-price">₹{svc.price.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </>
        )}

        {/* ====== STEP 1: STYLIST ====== */}
        {step === 1 && (
          <>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>Choose Your Stylist</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Optional — skip to let us assign the best available stylist</p>
            <div className="stylist-grid">
              <div
                className={`stylist-card ${!booking.stylist ? 'selected' : ''}`}
                onClick={() => setBooking(prev => ({ ...prev, stylist: null }))}
              >
                <div className="stylist-avatar" style={{ background: 'var(--border)' }}>🎲</div>
                <div className="stylist-name">Any Available</div>
                <div className="stylist-specialty">Best match for your service</div>
              </div>
              {salon.stylists.map((stylist, i) => (
                <div
                  key={i}
                  className={`stylist-card ${booking.stylist?.name === stylist.name ? 'selected' : ''}`}
                  onClick={() => setBooking(prev => ({ ...prev, stylist }))}
                  id={`stylist-opt-${i}`}
                >
                  <div className="stylist-avatar">{stylist.emoji}</div>
                  <div className="stylist-name">{stylist.name}</div>
                  <div className="stylist-specialty">{stylist.specialty}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ====== STEP 2: DATE & TIME ====== */}
        {step === 2 && (
          <>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>Pick a Date & Time</h3>

            {/* Day picker */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.6 }}>Select Day</div>
              <div className="slot-grid">
                {DAYS.map((day, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  return (
                    <div key={day} className="slot-day">
                      <div className="slot-day-name">{day.slice(0, 3)}</div>
                      <div
                        className={`slot-day-num ${booking.day === i ? 'active' : ''}`}
                        onClick={() => setBooking(prev => ({ ...prev, day: i, time: null }))}
                        id={`day-${i}`}
                      >
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time picker */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.6 }}>Select Time</div>
              <div className="time-slots">
                {TIMES.map((time, i) => {
                  const unavail = UNAVAILABLE.includes(i);
                  return (
                    <div
                      key={time}
                      className={`time-slot ${unavail ? 'unavailable' : booking.time === time ? 'selected' : ''}`}
                      onClick={() => !unavail && setBooking(prev => ({ ...prev, time }))}
                      id={`time-${i}`}
                    >
                      {time}
                      {unavail && <span style={{ display: 'block', fontSize: 9, marginTop: 2 }}>Booked</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ====== STEP 3: CONFIRM ====== */}
        {step === 3 && (
          <>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>Your Details</h3>

            {/* Summary */}
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14 }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Service:</span><br /><strong>{booking.service?.name}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Price:</span><br /><strong style={{ color: 'var(--rose)' }}>₹{booking.service?.price.toLocaleString('en-IN')}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Stylist:</span><br /><strong>{booking.stylist?.name || 'Any Available'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Slot:</span><br /><strong>{DAYS[booking.day]}, {booking.time}</strong></div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="input-name">Full Name</label>
              <input
                id="input-name"
                type="text"
                className="form-input"
                placeholder="Eg: Priya Reddy"
                value={booking.name}
                onChange={(e) => setBooking(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="input-phone">Phone Number</label>
              <input
                id="input-phone"
                type="tel"
                className="form-input"
                placeholder="Eg: 98480 12345"
                value={booking.phone}
                onChange={(e) => setBooking(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="input-email">Email Address</label>
              <input
                id="input-email"
                type="email"
                className="form-input"
                placeholder="Eg: priya@gmail.com"
                value={booking.email}
                onChange={(e) => setBooking(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary"
              style={{ flex: step === 3 ? '0 0 auto' : 1 }}
            >
              ← Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={!canProceed()}
              id="next-step-btn"
            >
              {step === 1 && !booking.stylist ? 'Skip — Any Stylist' : `Continue →`}
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={!canProceed()}
              id="confirm-booking-btn"
            >
              🎉 Confirm Booking
            </button>
          )}
        </div>

        {step === 3 && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
            No payment needed now · Free cancellation up to 2 hours before · Instant confirmation email
          </p>
        )}
      </div>
    </div>
  );
}
