import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminGuard } from '@/components/RoleGuard';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';

function AppRoutes() {
  const { setUnauthorized } = useAuthContext();

  useEffect(() => {
    const handleGlobalError = (e: PromiseRejectionEvent) => {
      e.reason?.status === 401 && setUnauthorized();
    };
    window.addEventListener('unhandledrejection', handleGlobalError);
    return () => window.removeEventListener('unhandledrejection', handleGlobalError);
  }, [setUnauthorized]);

  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminGuard>
              <DashboardPage />
            </AdminGuard>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
