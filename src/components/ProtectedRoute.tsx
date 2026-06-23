import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import type { UserRole } from '../types/index.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, profile } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};