import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Placeholder user — replace with real DB calls later
const MOCK_USERS = [
  { email: 'SMN@gmail.com', password: 'password', name: 'SMN', phone: '', avatar: '🌺', memberSince: 'June 2026', role: 'customer' },
  { email: 'owner@studio9.com', password: 'password', name: 'Studio 9 Owner', phone: '', avatar: '🏢', memberSince: 'June 2026', role: 'owner' },
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

  const register = (name, email, password) => {
    // Check if email already taken
    const exists = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    // Create the new user
    const now = new Date();
    const monthYear = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    const newUser = { email, password, name, phone: '', avatar: '🌺', memberSince: monthYear, role: 'customer' };
    MOCK_USERS.push(newUser);
    // Log them in immediately
    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    localStorage.setItem('glowmap_user', JSON.stringify(safeUser));
    return { success: true, user: safeUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('glowmap_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
