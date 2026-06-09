import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Mock users
const MOCK_USERS = [
  { email: 'priya@gmail.com', password: 'priya123', name: 'Priya Reddy', phone: '98480 12345', avatar: '👩', memberSince: 'January 2026' },
  { email: 'kavitha@gmail.com', password: 'kavi123', name: 'Kavitha M.', phone: '90000 54321', avatar: '💁‍♀️', memberSince: 'March 2026' },
  { email: 'demo@glowmap.in', password: 'demo', name: 'Ananya Sharma', phone: '91234 56789', avatar: '🌸', memberSince: 'June 2026' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('glowmap_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = (email, password) => {
    const found = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem('glowmap_user', JSON.stringify(safeUser));
      return { success: true, user: safeUser };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('glowmap_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
