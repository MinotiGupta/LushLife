import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * ProtectedRoute — wraps a page element with role-based access control.
 *
 * Props:
 *   element     — the JSX to render if access is granted
 *   role        — required role: 'customer' | 'owner' | undefined (any logged-in user)
 *   redirectTo  — where to send unauthorised users (default: '/')
 */
export default function ProtectedRoute({ element, role, redirectTo = '/' }) {
  const { user } = useAuth();

  // Not logged in at all → send to login page
  if (!user) return <Navigate to="/" replace />;

  // Logged in but wrong role → redirect based on their actual role
  if (role && user.role !== role) {
    if (user.role === 'owner') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/search" replace />;
  }

  return element;
}
