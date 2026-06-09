import { useNavigate } from 'react-router-dom';
import { SALONS, getMatchColor } from '../../data/salons.js';
import { MapPin, Star, Clock } from 'lucide-react';

function SalonCard({ salon, showMatch = true }) {
  const navigate = useNavigate();
  const matchColor = getMatchColor(salon.computedScore || salon.matchScore);

  return (
    <div className="salon-card" onClick={() => navigate(`/salon/${salon.id}`)} id={`salon-card-${salon.id}`}>
      {/* Image */}
      <div className="salon-card-image">
        <img
          src={salon.coverPhoto}
          alt={salon.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80`;
          }}
        />

        {/* Open/Closed badge */}
        {salon.openNow && (
          <div className="salon-card-open">Open Now</div>
        )}

        {/* AI Match Badge */}
        {showMatch && (
          <div className="salon-card-match">
            <div className={`ai-badge ${matchColor}`} style={{ fontSize: 12, padding: '4px 10px' }}>
              {salon.computedScore || salon.matchScore}% Match
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="salon-card-body">
        <div className="salon-card-name">{salon.name}</div>
        <div className="salon-card-locality">
          <MapPin size={13} />
          {salon.locality}
        </div>

        <div className="salon-card-meta">
          <div className="salon-card-rating">
            <span style={{ color: 'var(--gold)' }}>★</span>
            <span>{salon.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}>
              ({salon.reviewCount})
            </span>
          </div>
          <div className="salon-card-price">
            From <strong>₹{salon.priceFrom.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {salon.tags.slice(0, 2).map(tag => (
            <span key={tag} className="tag" style={{ fontSize: 11 }}>{tag}</span>
          ))}
        </div>

        {/* AI Reason */}
        {(salon.computedReason || salon.matchReason) && showMatch && (
          <div className="salon-card-ai-reason">
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <span style={{ fontSize: 11 }}>⚡</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Why AI Matched You
              </span>
            </div>
            <div className="salon-card-ai-reason-text">
              {salon.computedReason || salon.matchReason}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalonCard;
