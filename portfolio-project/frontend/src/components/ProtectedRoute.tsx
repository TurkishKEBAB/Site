import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // If finished loading and not authenticated, show error message
    if (!isLoading && !isAuthenticated) {
      showToast('error', 'Bu sayfayı görüntülemek için giriş yapmalısınız.');
      
      // Navigate to login after a short delay
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);

      return () => clearTimeout(timer);
    }

    // If authenticated but not an admin (for admin routes)
    if (!isLoading && isAuthenticated && user && !user.is_active) {
      showToast('warning', 'Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.');
    }
  }, [isLoading, isAuthenticated, user, showToast, navigate]);

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

  return <>{children}</>;
};

export default ProtectedRoute;
