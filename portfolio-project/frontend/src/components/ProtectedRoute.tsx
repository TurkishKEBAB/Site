import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      showToast('error', 'Bu sayfayı görüntülemek için giriş yapmalısınız.');

      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);

      return () => clearTimeout(timer);
    }

    if (!isLoading && isAuthenticated && user && !user.is_active) {
      showToast('warning', 'Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.');
    }

    if (!isLoading && isAuthenticated && requireAdmin && !isAdmin) {
      showToast('error', 'Bu sayfaya erişim yetkiniz yok.');
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, isAdmin, requireAdmin, user, showToast, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Kimlik doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
