import { useNavigate } from 'react-router-dom';
import { SALONS, getMatchColor } from '../../data/salons.js';
import { MapPin, Star, Clock } from 'lucide-react';

function SalonCard({ salon, showMatch = true }) {
  const navigate = useNavigate();
  const matchColor = getMatchColor(salon.computedScore || salon.matchScore);

  return (
    <div className="salon-card glass-panel" 
         onClick={() => navigate(`/salon/${salon.id}`)} 
         id={`salon-card-${salon.id}`}
         style={{ transformStyle: 'preserve-3d', transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)' }}
         onMouseMove={(e) => {
           const rect = e.currentTarget.getBoundingClientRect();
           const x = e.clientX - rect.left;
           const y = e.clientY - rect.top;
           const centerX = rect.width / 2;
           const centerY = rect.height / 2;
           const rotateX = ((y - centerY) / centerY) * -5;
           const rotateY = ((x - centerX) / centerX) * 5;
           e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
         }}
         onMouseLeave={(e) => {
           e.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
         }}
    >
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
