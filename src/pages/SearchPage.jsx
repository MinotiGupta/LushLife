import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import SalonCard from '../components/search/SalonCard.jsx';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const PAGE_SIZE = 25;

/**
 * Formats a UTC ISO date string into "X minutes/hours/days ago".
 */
function timeAgo(isoString) {
  if (!isoString) return null;
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

// ── Rating slider component ──────────────────────────────────────────────────
function RatingSlider({ value, onChange }) {
  return (
    <div className="filter-section">
      <div className="filter-title">
        Minimum Rating
        {value > 0 && (
          <span style={{ fontWeight: 400, marginLeft: 8, color: "var(--accent)" }}>
            ★ {value.toFixed(1)}+
          </span>
        )}
      </div>
      <input
        id="rating-slider"
        type="range"
        min={0}
        max={5}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%",
          accentColor: "var(--accent)",
          cursor: "pointer",
          marginTop: 8,
        }}
        aria-label={`Minimum rating: ${value}`}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
        <span>Any</span>
        <span>5★ only</span>
      </div>
    </div>
  );
}

// ── Toggle switch component ──────────────────────────────────────────────────
function ToggleFilter({ id, label, checked, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
      <label htmlFor={id} style={{ fontSize: 13, cursor: "pointer", userSelect: "none" }}>
        {label}
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          border: "none",
          background: checked ? "var(--accent)" : "var(--border)",
          cursor: "pointer",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
        aria-label={label}
      >
        <span style={{
          position: "absolute",
          top: 3,
          left: checked ? 20 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "white",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}

// ── Pagination controls ──────────────────────────────────────────────────────
function Pagination({ page, hasMore, onPrev, onNext, loading }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 32, paddingBottom: 32 }}>
      <button
        className="btn-primary"
        onClick={onPrev}
        disabled={page <= 1 || loading}
        style={{ opacity: page <= 1 ? 0.4 : 1, display: "flex", alignItems: "center", gap: 6, padding: "10px 20px" }}
        id="pagination-prev"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} /> Previous
      </button>
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Page {page}</span>
      <button
        className="btn-primary"
        onClick={onNext}
        disabled={!hasMore || loading}
        style={{ opacity: !hasMore ? 0.4 : 1, display: "flex", alignItems: "center", gap: 6, padding: "10px 20px" }}
        id="pagination-next"
        aria-label="Next page"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ── Main SearchPage ──────────────────────────────────────────────────────────
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Filter state ────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    locality: searchParams.get("locality") ? [searchParams.get("locality")] : [],
    priceBand: [],
    ratingMin: 0,
    verifiedOnly: false,
    openNow: false,
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");

  // ── Data state ───────────────────────────────────────────────────────────
  const [salonsData, setSalonsData] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Debounce search
  const searchDebounce = useRef(null);

  // ── Fetch localities on mount ────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/salons/localities")
      .then((r) => r.json())
      .then((data) => setLocalities(Array.isArray(data) ? data : []))
      .catch(() => setLocalities([]));

    fetch("/api/salons/sync-status")
      .then((r) => r.json())
      .then((data) => setLastSynced(data.last_scraped || null))
      .catch(() => setLastSynced(null));
  }, []);

  // ── Fetch salons whenever filters/page change ────────────────────────────
  const fetchSalons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("page_size", PAGE_SIZE);

      filters.locality.forEach((loc) => params.append("locality", loc));
      filters.priceBand.forEach((pb) => params.append("price_band", pb));
      if (filters.ratingMin > 0) params.set("rating_min", filters.ratingMin);
      if (filters.verifiedOnly) params.set("verified_only", "true");
      if (filters.openNow) params.set("open_now", "true");
      if (searchQuery) params.set("q", searchQuery);

      const res = await fetch(`/api/salons?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSalonsData(data);
        setHasMore(data.length === PAGE_SIZE);
      } else {
        setSalonsData([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to fetch salons:", err);
      setSalonsData([]);
      setHasMore(false);
    }
    setLoading(false);
  }, [filters, searchQuery, page]);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleArrayFilter = (key, value) => {
    setPage(1);
    setFilters((prev) => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    // Debounce: auto-search after 600ms pause
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setPage(1);
      setSearchQuery(val.trim());
    }, 600);
  };

  const clearAllFilters = () => {
    setPage(1);
    setSearchInput("");
    setSearchQuery("");
    setFilters({ locality: [], priceBand: [], ratingMin: 0, verifiedOnly: false, openNow: false });
    setSearchParams({});
  };

  const hasActiveFilters =
    filters.locality.length > 0 ||
    filters.priceBand.length > 0 ||
    filters.ratingMin > 0 ||
    filters.verifiedOnly ||
    filters.openNow ||
    searchQuery;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Sync status banner ──────────────────────────────────── */}
      {lastSynced && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--text-muted)",
            padding: "8px 0 0 0",
            marginBottom: 4,
          }}
          aria-live="polite"
        >
          <RefreshCw size={12} strokeWidth={1.8} />
          Last synced from Google Places: <strong>{timeAgo(lastSynced)}</strong>
        </div>
      )}

      {/* ── Search bar ──────────────────────────────────────────── */}
      <form
        onSubmit={handleSearchSubmit}
        style={{ marginBottom: 20, display: "flex", gap: 10 }}
        role="search"
        aria-label="Search salons"
      >
        <div style={{ flex: 1, position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            id="salon-search"
            type="search"
            className="form-input"
            placeholder="Search by name, service, locality…"
            value={searchInput}
            onChange={handleSearchInput}
            style={{ paddingLeft: 40, borderRadius: 16 }}
            aria-label="Search salons by name, service or locality"
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: "12px 20px", borderRadius: 16 }}
          aria-label="Search"
        >
          Search
        </button>
      </form>

      <div className="search-layout">
        {/* ── Filter Sidebar ──────────────────────────────────────── */}
        <aside className="filter-sidebar hide-mobile" aria-label="Filters">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: 6 }}>
              <SlidersHorizontal size={14} /> Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                id="clear-filters"
                aria-label="Clear all filters"
              >
                <X size={12} /> Clear All
              </button>
            )}
          </div>

          {/* Locality */}
          <div className="filter-section">
            <div className="filter-title">Locality</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
              {localities.length === 0 ? (
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Loading…</span>
              ) : (
                localities.map((loc) => (
                  <button
                    key={loc}
                    className={`filter-chip ${filters.locality.includes(loc) ? "active" : ""}`}
                    onClick={() => toggleArrayFilter("locality", loc)}
                    id={`filter-loc-${loc.replace(/ /g, "-")}`}
                    aria-pressed={filters.locality.includes(loc)}
                  >
                    {loc}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Price Band */}
          <div className="filter-section">
            <div className="filter-title">Price Range</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
              {[
                ["budget", "₹ Budget"],
                ["mid", "₹₹ Mid"],
                ["premium", "₹₹₹ Premium"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  className={`filter-chip ${filters.priceBand.includes(val) ? "active" : ""}`}
                  onClick={() => toggleArrayFilter("priceBand", val)}
                  id={`filter-price-${val}`}
                  aria-pressed={filters.priceBand.includes(val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <RatingSlider
            value={filters.ratingMin}
            onChange={(v) => { setPage(1); setFilters((p) => ({ ...p, ratingMin: v })); }}
          />

          {/* Toggles */}
          <div className="filter-section">
            <ToggleFilter
              id="filter-verified"
              label="✓ Verified Only"
              checked={filters.verifiedOnly}
              onChange={(v) => { setPage(1); setFilters((p) => ({ ...p, verifiedOnly: v })); }}
            />
            <ToggleFilter
              id="filter-open-now"
              label="🟢 Open Now"
              checked={filters.openNow}
              onChange={(v) => { setPage(1); setFilters((p) => ({ ...p, openNow: v })); }}
            />
          </div>
        </aside>

        {/* ── Results area ─────────────────────────────────────────── */}
        <div>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {loading ? (
                "Loading…"
              ) : (
                <>
                  <strong style={{ color: "var(--text)" }}>{salonsData.length}</strong>
                  {hasMore ? "+" : ""} salons found
                  {filters.locality.length > 0 && ` in ${filters.locality.join(", ")}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }} role="list" aria-label="Active filters">
              {filters.locality.map((loc) => (
                <span key={loc} className="tag" style={{ cursor: "pointer" }} onClick={() => toggleArrayFilter("locality", loc)} role="listitem">
                  {loc} ×
                </span>
              ))}
              {filters.priceBand.map((pb) => (
                <span key={pb} className="tag" style={{ cursor: "pointer" }} onClick={() => toggleArrayFilter("priceBand", pb)} role="listitem">
                  {pb === "budget" ? "₹ Budget" : pb === "mid" ? "₹₹ Mid" : "₹₹₹ Premium"} ×
                </span>
              ))}
              {filters.ratingMin > 0 && (
                <span className="tag" style={{ cursor: "pointer" }} onClick={() => { setPage(1); setFilters((p) => ({ ...p, ratingMin: 0 })); }} role="listitem">
                  ★ {filters.ratingMin}+ ×
                </span>
              )}
              {filters.verifiedOnly && (
                <span className="tag" style={{ cursor: "pointer" }} onClick={() => { setPage(1); setFilters((p) => ({ ...p, verifiedOnly: false })); }} role="listitem">
                  Verified Only ×
                </span>
              )}
              {filters.openNow && (
                <span className="tag" style={{ cursor: "pointer" }} onClick={() => { setPage(1); setFilters((p) => ({ ...p, openNow: false })); }} role="listitem">
                  Open Now ×
                </span>
              )}
              {searchQuery && (
                <span className="tag" style={{ cursor: "pointer" }} onClick={() => { setPage(1); setSearchQuery(""); setSearchInput(""); }} role="listitem">
                  "{searchQuery}" ×
                </span>
              )}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="salon-grid" aria-busy="true" aria-label="Loading salons">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="salon-card glass-panel"
                  style={{ minHeight: 280, opacity: 0.5, animation: "pulse 1.5s infinite" }}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}

          {/* Results grid */}
          {!loading && salonsData.length > 0 && (
            <div className="salon-grid" role="list" aria-label="Salon listings">
              {salonsData.map((salon) => (
                <SalonCard
                  key={salon._id || salon.id}
                  salon={{ ...salon, id: salon._id || salon.id }}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && salonsData.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px" }} role="status">
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ marginBottom: 8 }}>No salons found</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: 14 }}>
                Try adjusting your filters or search query
              </p>
              <button onClick={clearAllFilters} className="btn-primary" id="clear-filters-empty">
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {!loading && salonsData.length > 0 && (
            <Pagination
              page={page}
              hasMore={hasMore}
              onPrev={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
              onNext={() => { setPage((p) => p + 1); window.scrollTo(0, 0); }}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
