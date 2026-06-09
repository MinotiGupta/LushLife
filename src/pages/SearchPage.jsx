import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SALONS, LOCALITIES, getMatchColor } from '../data/salons.js';
import SalonCard from '../components/search/SalonCard.jsx';
import { X } from 'lucide-react';

const SORT_OPTIONS = ['AI Match', 'Rating', 'Price: Low to High', 'Price: High to Low'];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    locality: searchParams.get('locality') || '',
    category: searchParams.get('category') || '',
    maxBudget: 50000,
    openNow: false,
    walkins: false,
    priceBand: '',
  });
  const [sort, setSort] = useState('Rating');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const filtered = SALONS.filter(salon => {
    if (filters.locality && salon.locality !== filters.locality) return false;
    if (filters.openNow && !salon.openNow) return false;
    if (filters.walkins && !salon.tags.some(t => t.toLowerCase().includes('walk'))) return false;
    if (filters.priceBand && salon.priceBand !== filters.priceBand) return false;
    if (salon.priceFrom > filters.maxBudget) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = salon.name.toLowerCase().includes(q);
      const matchLocality = salon.locality.toLowerCase().includes(q);
      const matchService = salon.services.some(s => s.name.toLowerCase().includes(q));
      const matchTag = salon.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchLocality && !matchService && !matchTag) return false;
    }
    if (filters.category && salon.category !== filters.category) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'AI Match') return b.matchScore - a.matchScore;
    if (sort === 'Rating') return b.rating - a.rating;
    if (sort === 'Price: Low to High') return a.priceFrom - b.priceFrom;
    if (sort === 'Price: High to Low') return b.priceFrom - a.priceFrom;
    return 0;
  });

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
  };

  return (
    <div className="search-layout">
      {/* ==================
          FILTER SIDEBAR
          ================== */}
      <aside className="filter-sidebar hide-mobile">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '1px' }}>Filters</span>
          {(filters.locality || filters.category || filters.openNow || filters.walkins || filters.priceBand) && (
            <button
              onClick={() => setFilters({ locality: '', category: '', maxBudget: 50000, openNow: false, walkins: false, priceBand: '' })}
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
                className={`filter-chip ${filters.locality === loc ? 'active' : ''}`}
                onClick={() => setFilter('locality', loc)}
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
            {[['women', '👩 Women'], ['men', '👨 Men'], ['kids', '👧 Kids']].map(([val, label]) => (
              <button
                key={val}
                className={`filter-chip ${filters.category === val ? 'active' : ''}`}
                onClick={() => setFilter('category', val)}
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
            {[['budget', '₹ Budget'], ['mid', '₹₹ Mid'], ['premium', '₹₹₹ Premium']].map(([val, label]) => (
              <button
                key={val}
                className={`filter-chip ${filters.priceBand === val ? 'active' : ''}`}
                onClick={() => setFilter('priceBand', val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Slider */}
        <div className="filter-section">
          <div className="filter-title">Max Budget: ₹{(filters.maxBudget / 1000).toFixed(0)}K</div>
          <input
            type="range"
            min={200}
            max={50000}
            step={500}
            value={filters.maxBudget}
            onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: parseInt(e.target.value) }))}
            className="budget-range"
            id="budget-slider"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            <span>₹200</span><span>₹50,000</span>
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
            <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> salons{filters.category ? ` for ${filters.category === 'women' ? 'Women' : filters.category === 'men' ? 'Men' : 'Kids'}` : ''}{filters.locality ? ` in ${filters.locality}` : ''}
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
        {(filters.locality || filters.category || filters.openNow || filters.walkins) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {filters.locality && (
              <span className="tag" style={{ cursor: 'pointer' }} onClick={() => setFilter('locality', filters.locality)}>
                {filters.locality} ×
              </span>
            )}
            {filters.category && (
              <span className="tag" style={{ cursor: 'pointer' }} onClick={() => setFilter('category', filters.category)}>
                {filters.category === 'women' ? '👩 Women' : filters.category === 'men' ? '👨 Men' : '👧 Kids'} ×
              </span>
            )}
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
              onClick={() => { setFilters({ locality: '', service: '', maxBudget: 50000, openNow: false, walkins: false, priceBand: '' }); setSearchQuery(''); }}
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
