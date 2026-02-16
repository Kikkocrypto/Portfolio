import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminGuard } from '@/components/RoleGuard';
import { AdminLayout } from '@/components/AdminLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { AuditLogsPage } from '@/pages/AuditLogsPage';
import { BlogListPage } from '@/pages/BlogListPage';
import { BlogEditPage } from '@/pages/BlogEditPage';
import { BlogCreatePage } from '@/pages/BlogCreatePage';

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
              <AdminLayout />
            </AdminGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="posts" element={<BlogListPage />} />
        <Route path="posts/new" element={<BlogCreatePage />} />
        <Route path="posts/:id/edit" element={<BlogEditPage />} />
      </Route>
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
