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
        {salon.openNow === true && (
          <div className="salon-card-open">Open Now</div>
        )}
        {salon.openNow === false && (
          <div className="salon-card-open" style={{ background: 'var(--rose)', color: 'white' }}>Closed</div>
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


      </div>
    </div>
  );
}

export default SalonCard;
