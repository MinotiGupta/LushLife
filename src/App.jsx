import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import AIChatbotPage from './pages/AIChatbotPage.jsx';
import SalonProfilePage from './pages/SalonProfilePage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import './index.css';

import { useEffect } from 'react';

function CursorSpotlight() {
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return <div className="cursor-spotlight" />;
}

// Wrapper so we can read location inside BrowserRouter
function AppInner() {
  const location = useLocation();
  const hideChromeOn = ['/'];
  const hideChrome = hideChromeOn.includes(location.pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CursorSpotlight />
      {!hideChrome && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public: only for guests. Logged-in users are redirected by role. */}
          <Route path="/" element={<LandingPage />} />

          {/* Customer-only routes */}
          <Route path="/home" element={<ProtectedRoute role="customer" element={<HomePage />} />} />
          <Route path="/search" element={<ProtectedRoute role="customer" element={<SearchPage />} />} />
          <Route path="/ai-match" element={<ProtectedRoute role="customer" element={<AIChatbotPage />} />} />
          <Route path="/salon/:id" element={<ProtectedRoute role="customer" element={<SalonProfilePage />} />} />
          <Route path="/booking/:id" element={<ProtectedRoute role="customer" element={<BookingPage />} />} />
          <Route path="/profile" element={<ProtectedRoute role="customer" element={<ProfilePage />} />} />

          {/* Owner-only route */}
          <Route path="/dashboard" element={<ProtectedRoute role="owner" element={<OwnerDashboard />} />} />

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
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
