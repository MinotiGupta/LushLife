import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getMatchColor } from '../data/salons.js';
import SalonCard from '../components/search/SalonCard.jsx';
import { X } from 'lucide-react';

const SORT_OPTIONS = ['Rating', 'Price: Low to High', 'Price: High to Low'];

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
  const [salonsData, setSalonsData] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load localities from mock data
  useEffect(() => {
    import('../data/salons.js').then(module => {
      setLocalities(module.LOCALITIES);
    });
  }, []);

  // Sync params to state
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

  // Load salons from mock data and apply search query & basic filters
  useEffect(() => {
    const loadSalons = async () => {
      setLoading(true);
      try {
        const { SALONS } = await import('../data/salons.js');
        let data = SALONS;

        // Apply locality filter
        if (filters.locality.length > 0) {
          data = data.filter(salon => filters.locality.includes(salon.locality));
        }

        // Apply price band filter
        if (filters.priceBand.length > 0) {
          data = data.filter(salon => filters.priceBand.includes(salon.priceBand));
        }

        // Apply search query
        if (searchQuery) {
          const lowerQ = searchQuery.toLowerCase();
          data = data.filter(salon => 
            salon.name.toLowerCase().includes(lowerQ) ||
            salon.locality.toLowerCase().includes(lowerQ) ||
            salon.services.some(svc => svc.name.toLowerCase().includes(lowerQ))
          );
        }

        setSalonsData(data);
      } catch (err) {
        console.error("Failed to load mock salons", err);
      }
      setLoading(false);
    };

    loadSalons();
  }, [filters.locality, filters.priceBand, searchQuery]);

  // Local filtering for things not handled by backend
  const filtered = salonsData.filter(salon => {
    if (filters.openNow && !salon.openNow) return false;
    if (filters.walkins && !salon.tags.some(t => t.toLowerCase().includes('walk'))) return false;
    if (filters.category.length > 0 && !filters.category.includes(salon.category)) return false;
    return true;
  }).sort((a, b) => {
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
            {localities.length === 0 ? (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading...</span>
            ) : localities.map(loc => (
              <button
                key={loc}
                className={`filter-chip ${filters.locality.includes(loc) ? 'active' : ''}`}
                onClick={() => setArrayFilter('locality', loc)}
                id={`filter-loc-${loc.replace(/ /g, '-')}`}
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
            className="sort-select"
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
