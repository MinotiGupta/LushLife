import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, MapPin, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    let timeoutId;
    if (profileOpen) {
      timeoutId = setTimeout(() => {
        setProfileOpen(false);
      }, 20000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [profileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search)}`);
    } else {
      navigate('/search');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={user ? '/search' : '/'} className="navbar-logo">
          <img src="/favicon.svg" alt="LushLife Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          <span className="navbar-logo-text">LushLife</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400, display: 'flex' }}>
          <div className="search-bar" style={{ flex: 1, padding: '6px 16px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        {/* Nav Links */}
        <ul className="navbar-links hide-mobile">
          <li><Link to="/search">Explore</Link></li>
          <li><Link to="/search?category=women">Women</Link></li>
          <li><Link to="/search?category=men">Men</Link></li>
          <li><Link to="/search?category=kids">Kids</Link></li>
        </ul>

        {/* Right side — auth state aware */}
        <div className="navbar-cta" style={{ position: 'relative' }}>
          {user ? (
            /* Logged-in user avatar + dropdown */
            <>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="user-avatar-btn"
                id="user-avatar-btn"
                aria-label="Profile menu"
              >
                <User size={16} />
                <span className="user-avatar-name hide-mobile">{user.name.split(' ')[0]}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▾</span>
              </button>

              {profileOpen && (
                <>
                  <div
                    onClick={() => setProfileOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  />
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} color="var(--text-muted)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                    </div>
                    <div className="profile-dropdown-divider" />
                    <button
                      onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                      className="profile-dropdown-item"
                      id="goto-profile"
                    >
                      <User size={13} /> My Profile & Bookings
                    </button>

                    <div className="profile-dropdown-divider" />
                    <button
                      onClick={handleLogout}
                      className="profile-dropdown-item"
                      style={{ color: '#DC2626' }}
                      id="navbar-logout"
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            /* Not logged in */
            <Link to="/" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          className="mobile-menu-btn"
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'white', borderTop: '1px solid var(--border-light)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16
        }}>
          <Link to="/search" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500, fontSize: 14 }} onClick={() => setMenuOpen(false)}>Explore Salons</Link>
          <Link to="/search?category=women" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500, fontSize: 14 }} onClick={() => setMenuOpen(false)}>Women</Link>
          <Link to="/search?category=men" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500, fontSize: 14 }} onClick={() => setMenuOpen(false)}>Men</Link>
          <Link to="/search?category=kids" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500, fontSize: 14 }} onClick={() => setMenuOpen(false)}>Kids</Link>
          {user && (
            <Link to="/profile" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500, fontSize: 14 }} onClick={() => setMenuOpen(false)}>My Profile</Link>
          )}
          {user && (
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontWeight: 600, textAlign: 'left', fontSize: 14, fontFamily: 'var(--font-mono)', padding: 0 }}>
              Sign Out
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          form { display: none !important; }
          .user-avatar-name { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
