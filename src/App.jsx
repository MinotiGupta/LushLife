import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import LandingPage from './pages/LandingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import AIChatbotPage from './pages/AIChatbotPage.jsx';
import SalonProfilePage from './pages/SalonProfilePage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import './index.css';

// Wrapper so we can read location inside BrowserRouter
function AppInner() {
  const location = useLocation();
  const hideChromeOn = ['/'];
  const hideChrome = hideChromeOn.includes(location.pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideChrome && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/ai-match" element={<AIChatbotPage />} />
          <Route path="/salon/:id" element={<SalonProfilePage />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/dashboard" element={<OwnerDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>—</div>
              <h2 style={{ marginBottom: 8 }}>Page Not Found</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Let's get you back on track.</p>
              <a href="/search" className="btn-primary" style={{ textDecoration: 'none' }}>Browse Salons</a>
            </div>
          } />
        </Routes>
      </main>
      {!hideChrome && !location.pathname.startsWith('/salon/') && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
