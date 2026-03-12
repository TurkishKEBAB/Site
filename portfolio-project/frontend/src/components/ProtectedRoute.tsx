import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { useLanguage } from '../contexts/LanguageContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const t = {
  tr: {
    loginRequired: 'Bu sayfayi goruntulemek icin giris yapmalisiniz.',
    accountInactive: 'Hesabiniz aktif degil. Lutfen yonetici ile iletisime gecin.',
    noPermission: 'Bu sayfaya erisim yetkiniz yok.',
    authenticating: 'Kimlik dogrulaniyor...',
  },
  en: {
    loginRequired: 'You must log in to view this page.',
    accountInactive: 'Your account is inactive. Please contact an administrator.',
    noPermission: 'You do not have permission to access this page.',
    authenticating: 'Authenticating...',
  },
} as const;

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = t[language === 'en' ? 'en' : 'tr'];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      showToast('error', text.loginRequired);

      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);

      return () => clearTimeout(timer);
    }

    if (!isLoading && isAuthenticated && user && !user.is_active) {
      showToast('warning', text.accountInactive);
    }

    if (!isLoading && isAuthenticated && requireAdmin && !isAdmin) {
      showToast('error', text.noPermission);
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, isAdmin, requireAdmin, user, showToast, navigate, text]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p>{text.authenticating}</p>
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
