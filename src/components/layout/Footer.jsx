import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div className="navbar-logo-icon" style={{ width: 32, height: 32, fontSize: 14 }}>✨</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'white' }}>
                GlowMap
              </span>
            </div>
            <p>Hyderabad's AI-powered salon discovery platform. Find your perfect match in under 3 minutes.</p>
            <div className="ai-powered-badge" style={{ marginTop: 16 }}>
              ⚡ AI Powered by Claude
            </div>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Discover</div>
            <ul>
              <li><Link to="/search">All Salons</Link></li>
              <li><Link to="/search?service=bridal">Bridal Salons</Link></li>
              <li><Link to="/search?locality=Banjara Hills">Banjara Hills</Link></li>
              <li><Link to="/search?locality=Gachibowli">Gachibowli</Link></li>
              <li><Link to="/search?locality=Jubilee Hills">Jubilee Hills</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Categories</div>
            <ul>
              <li><Link to="/search?category=women">👩 Women Salons</Link></li>
              <li><Link to="/search?category=men">👨 Men's Grooming</Link></li>
              <li><Link to="/search?category=kids">👧 Kids Salons</Link></li>
              <li><Link to="/search">All Salons</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Hyderabad</div>
            <ul>
              <li><Link to="/search?locality=Madhapur">Madhapur</Link></li>
              <li><Link to="/search?locality=HiTech City">HiTech City</Link></li>
              <li><Link to="/search?locality=Kondapur">Kondapur</Link></li>
              <li><Link to="/search?locality=Secunderabad">Secunderabad</Link></li>
              <li><Link to="/search?locality=Ameerpet">Ameerpet</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 GlowMap · SuperXgen AI Buildathon 2026 · Hyderabad 🇮🇳</p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
