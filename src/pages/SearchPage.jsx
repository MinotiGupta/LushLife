import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SALONS, LOCALITIES, getMatchColor } from '../data/salons.js';
import SalonCard from '../components/search/SalonCard.jsx';
import { X } from 'lucide-react';

const SORT_OPTIONS = ['AI Match', 'Rating', 'Price: Low to High', 'Price: High to Low'];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    locality: searchParams.get('locality') ? [searchParams.get('locality')] : [],
    category: searchParams.get('category') ? [searchParams.get('category')] : [],
    openNow: false,
    walkins: false,
    priceBand: [],
  });
  const [sort, setSort] = useState('Rating');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const cat = searchParams.get('category');
    const loc = searchParams.get('locality');
    const q = searchParams.get('q');

    if (searchParams.has('category') || searchParams.has('locality') || searchParams.has('q')) {
      setFilters(prev => ({
        ...prev,
        category: cat ? [cat] : prev.category,
        locality: loc ? [loc] : prev.locality,
      }));
      setSearchQuery(q || '');
    } else if (searchParams.toString() === '') {
      setFilters(prev => ({ ...prev, category: [], locality: [] }));
      setSearchQuery('');
    }
  }, [searchParams]);

  const filtered = SALONS.filter(salon => {
    if (filters.locality.length > 0 && !filters.locality.includes(salon.locality)) return false;
    if (filters.openNow && !salon.openNow) return false;
    if (filters.walkins && !salon.tags.some(t => t.toLowerCase().includes('walk'))) return false;
    if (filters.priceBand.length > 0) {
      const matchPrice = filters.priceBand.some(band => {
        if (band === 'budget' && salon.priceFrom <= 999) return true;
        if (band === 'mid' && salon.priceFrom >= 1000 && salon.priceFrom <= 2999) return true;
        if (band === 'premium' && salon.priceFrom >= 3000) return true;
        return false;
      });
      if (!matchPrice) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = salon.name.toLowerCase().includes(q);
      const matchLocality = salon.locality.toLowerCase().includes(q);
      const matchService = salon.services.some(s => s.name.toLowerCase().includes(q));
      const matchTag = salon.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchLocality && !matchService && !matchTag) return false;
    }
    if (filters.category.length > 0 && !filters.category.includes(salon.category)) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'AI Match') return b.matchScore - a.matchScore;
    if (sort === 'Rating') return b.rating - a.rating;
    if (sort === 'Price: Low to High') return a.priceFrom - b.priceFrom;
    if (sort === 'Price: High to Low') return b.priceFrom - a.priceFrom;
    return 0;
  });

  const setArrayFilter = (key, value) => {
    setFilters(prev => {
      const current = prev[key] || [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  return (
    <div className="search-layout">
      {/* ==================
          FILTER SIDEBAR
          ================== */}
      <aside className="filter-sidebar hide-mobile">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '1px' }}>Filters</span>
          {(filters.locality.length > 0 || filters.category.length > 0 || filters.openNow || filters.walkins || filters.priceBand.length > 0) && (
            <button
              onClick={() => setFilters({ locality: [], category: [], openNow: false, walkins: false, priceBand: [] })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Locality Filter */}
        <div className="filter-section">
          <div className="filter-title">Locality</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
            {LOCALITIES.map(loc => (
              <button
                key={loc}
                className={`filter-chip ${filters.locality.includes(loc) ? 'active' : ''}`}
                onClick={() => setArrayFilter('locality', loc)}
                id={`filter-loc-${loc.replace(' ', '-')}`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="filter-section">
          <div className="filter-title">Category</div>
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
            {[['women', 'Women'], ['men', 'Men'], ['kids', 'Kids']].map(([val, label]) => (
              <button
                key={val}
                className={`filter-chip ${filters.category.includes(val) ? 'active' : ''}`}
                onClick={() => setArrayFilter('category', val)}
                id={`filter-cat-${val}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Band */}
        <div className="filter-section">
          <div className="filter-title">Price Range</div>
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
            {[['budget', '₹0 - ₹999'], ['mid', '₹1,000 - ₹2,999'], ['premium', '₹3,000+']].map(([val, label]) => (
              <button
                key={val}
                className={`filter-chip ${filters.priceBand.includes(val) ? 'active' : ''}`}
                onClick={() => setArrayFilter('priceBand', val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="filter-section">
          <div className="filter-title">Options</div>

          <div className="filter-toggle" onClick={() => setFilters(p => ({ ...p, openNow: !p.openNow }))}>
            <span style={{ fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>Open Now</span>
            <div className={`toggle-switch ${filters.openNow ? 'on' : ''}`} id="toggle-open-now"></div>
          </div>

          <div className="filter-toggle" onClick={() => setFilters(p => ({ ...p, walkins: !p.walkins }))}>
            <span style={{ fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>Walk-ins Welcome</span>
            <div className={`toggle-switch ${filters.walkins ? 'on' : ''}`} id="toggle-walkins"></div>
          </div>
        </div>
      </aside>

      {/* ==================
          RESULTS AREA
          ================== */}
      <div>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> salons{filters.category.length > 0 ? ` for ${filters.category.map(c => c === 'women' ? 'Women' : c === 'men' ? 'Men' : 'Kids').join(', ')}` : ''}{filters.locality.length > 0 ? ` in ${filters.locality.join(', ')}` : ''}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              fontSize: 12, fontFamily: 'var(--font-mono)', cursor: 'pointer', background: 'white', outline: 'none',
              color: 'var(--text)'
            }}
            id="sort-select"
          >
            {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        {/* Active Filters */}
        {(filters.locality.length > 0 || filters.category.length > 0 || filters.openNow || filters.walkins || filters.priceBand.length > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {filters.locality.map(loc => (
              <span key={`loc-${loc}`} className="tag" style={{ cursor: 'pointer' }} onClick={() => setArrayFilter('locality', loc)}>
                {loc} ×
              </span>
            ))}
            {filters.category.map(cat => (
              <span key={`cat-${cat}`} className="tag" style={{ cursor: 'pointer' }} onClick={() => setArrayFilter('category', cat)}>
                {cat === 'women' ? 'Women' : cat === 'men' ? 'Men' : 'Kids'} ×
              </span>
            ))}
            {filters.priceBand.map(pb => (
              <span key={`pb-${pb}`} className="tag" style={{ cursor: 'pointer' }} onClick={() => setArrayFilter('priceBand', pb)}>
                {pb === 'budget' ? '₹0 - ₹999' : pb === 'mid' ? '₹1,000 - ₹2,999' : '₹3,000+'} ×
              </span>
            ))}
            {filters.openNow && (
              <span className="tag" style={{ cursor: 'pointer' }} onClick={() => setFilters(p => ({ ...p, openNow: false }))}>
                Open Now ×
              </span>
            )}
            {filters.walkins && (
              <span className="tag" style={{ cursor: 'pointer' }} onClick={() => setFilters(p => ({ ...p, walkins: false }))}>
                Walk-ins ×
              </span>
            )}
          </div>
        )}

        {/* Grid Results */}
        {filtered.length > 0 ? (
          <div className="salon-grid">
            {filtered.map(salon => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>—</div>
            <h3 style={{ marginBottom: 8 }}>No salons found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Try adjusting your filters or search query</p>
            <button
              onClick={() => { setFilters({ locality: [], category: [], openNow: false, walkins: false, priceBand: [] }); setSearchQuery(''); }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
