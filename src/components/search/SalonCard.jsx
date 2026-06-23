import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Phone, ShieldCheck, Clock } from 'lucide-react';

/**
 * SalonCard
 * ─────────
 * Displays a single salon listing card with:
 *  - Thumbnail image (with fallback)
 *  - Open / Closed badge
 *  - Verified ✓ badge
 *  - Business name, locality, category
 *  - Star rating + review count
 *  - Phone number (clickable tel: link)
 *  - Service chips (max 3 + "+X more")
 *  - Price band label
 */

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80";

const PRICE_BAND_LABELS = {
  budget: "₹ Budget",
  mid: "₹₹ Mid-range",
  premium: "₹₹₹ Premium",
};

function StarRating({ rating, count }) {
  if (!rating) return null;
  const filled = Math.round(rating);
  return (
    <div className="salon-card-stars" aria-label={`${rating} out of 5 stars, ${count} reviews`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={13}
          fill={n <= filled ? "var(--accent)" : "none"}
          color={n <= filled ? "var(--accent)" : "var(--border)"}
          strokeWidth={1.5}
        />
      ))}
      <span className="salon-card-star-score">{rating.toFixed(1)}</span>
      {count > 0 && (
        <span className="salon-card-star-count">({count.toLocaleString("en-IN")} reviews)</span>
      )}
    </div>
  );
}

function ServiceChips({ services }) {
  if (!services || services.length === 0) return null;
  const MAX_SHOW = 3;
  const shown = services.slice(0, MAX_SHOW);
  const extra = services.length - MAX_SHOW;
  return (
    <div className="salon-card-services" aria-label="Services offered">
      {shown.map((svc, i) => (
        <span key={i} className="tag" style={{ fontSize: 11 }}>
          {typeof svc === "string" ? svc : svc.name}
        </span>
      ))}
      {extra > 0 && (
        <span className="tag" style={{ fontSize: 11, opacity: 0.7 }}>
          +{extra} more
        </span>
      )}
    </div>
  );
}

function SalonCard({ salon }) {
  const navigate = useNavigate();

  const imageUrl = salon.thumbnail_url || salon.coverPhoto || FALLBACK_IMAGE;
  const isOpen = salon.is_open_now ?? salon.openNow;
  const rating = salon.rating_avg ?? salon.rating ?? null;
  const reviewCount = salon.review_count ?? salon.reviewCount ?? 0;
  const phone = salon.phone_number || salon.phone || null;
  const locality = salon.locality || "Hyderabad";
  const priceBand = salon.price_band || salon.priceBand;
  const services = salon.services || [];
  const isVerified = salon.is_verified ?? false;

  const handleClick = () => navigate(`/salon/${salon.id || salon._id}`);

  const handlePhoneClick = (e) => {
    e.stopPropagation(); // Don't navigate to salon page
  };

  return (
    <div
      className="salon-card glass-panel"
      onClick={handleClick}
      id={`salon-card-${salon.id || salon._id}`}
      role="article"
      aria-label={`${salon.name} salon in ${locality}`}
      style={{ transformStyle: "preserve-3d", transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)", cursor: "pointer" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / rect.height) * -5;
        const rotateY = ((x - rect.width / 2) / rect.width) * 5;
        e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      }}
    >
      {/* ── Image ─────────────────────────────────────────────── */}
      <div className="salon-card-image">
        <img
          src={imageUrl}
          alt={`${salon.name} salon`}
          loading="lazy"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />

        {/* Open / Closed badge */}
        {isOpen === true && (
          <div className="salon-card-open" role="status" aria-label="Open now">
            <Clock size={10} strokeWidth={2} /> Open Now
          </div>
        )}
        {isOpen === false && (
          <div
            className="salon-card-open"
            style={{ background: "rgba(239,68,68,0.85)", color: "white" }}
            role="status"
            aria-label="Closed"
          >
            Closed
          </div>
        )}

        {/* Verified badge */}
        {isVerified && (
          <div className="salon-card-verified" aria-label="Verified listing">
            <ShieldCheck size={12} strokeWidth={2} />
            Verified
          </div>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="salon-card-body">
        {/* Name */}
        <div className="salon-card-name">{salon.name}</div>

        {/* Locality */}
        <div className="salon-card-locality">
          <MapPin size={12} strokeWidth={1.8} />
          {locality}, Hyderabad
        </div>

        {/* Rating */}
        {rating && (
          <StarRating rating={rating} count={reviewCount} />
        )}

        {/* Service chips */}
        <ServiceChips services={services} />

        {/* Footer row: price + phone */}
        <div className="salon-card-meta">
          {priceBand && (
            <div className="salon-card-price" aria-label={`Price range: ${PRICE_BAND_LABELS[priceBand]}`}>
              {PRICE_BAND_LABELS[priceBand] || priceBand}
            </div>
          )}

          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="salon-card-phone"
              onClick={handlePhoneClick}
              aria-label={`Call ${salon.name} at ${phone}`}
            >
              <Phone size={11} strokeWidth={2} />
              {phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalonCard;
