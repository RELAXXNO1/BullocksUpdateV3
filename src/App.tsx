import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { StoreContentProvider } from './contexts/StoreContentContext';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components with descriptive chunk names
const AdminLayout = lazy(() => import(/* webpackChunkName: "admin-layout" */ './components/layouts/AdminLayout'));
const StoreLayout = lazy(() => import(/* webpackChunkName: "store-layout" */ './components/layouts/StoreLayout'));
const StorePage = lazy(() => import(/* webpackChunkName: "store-page" */ './pages/store/StorePage'));

// Auth Pages
const Login = lazy(() => import(/* webpackChunkName: "auth-login" */ './pages/auth/Login'));
const Signup = lazy(() => import(/* webpackChunkName: "auth-signup" */ './pages/auth/Signup'));

// Admin Pages
const AdminDashboard = lazy(() => import(/* webpackChunkName: "admin-dashboard" */ './pages/admin/Dashboard'));
const AdminProducts = lazy(() => import(/* webpackChunkName: "admin-products" */ './pages/admin/Products'));
const AdminLogin = lazy(() => import(/* webpackChunkName: "admin-login" */ './pages/admin/Login'));
const StoreContentEditor = lazy(() => import(/* webpackChunkName: "store-content-editor" */ './pages/admin/StoreContentEditor'));
const ProtectedRoute = lazy(() => import(/* webpackChunkName: "protected-route" */ './components/ProtectedRoute'));

// Legal Pages
const PrivacyPolicy = lazy(() => import(/* webpackChunkName: "privacy-policy" */ './pages/PrivacyPolicy'));
const THCACompliance = lazy(() => import(/* webpackChunkName: "thca-compliance" */ './pages/THCACompliance'));
const TermsOfService = lazy(() => import(/* webpackChunkName: "terms-of-service" */ './pages/TermsOfService'));

export default function App() {
  return (
    <ErrorBoundary>
      <StoreContentProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Store Routes */}
            <Route path="/" element={<StoreLayout />}>
              <Route index element={<StorePage />} />
              
              {/* Legal Pages */}
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="thca-compliance" element={<THCACompliance />} />
              <Route path="terms" element={<TermsOfService />} />
            </Route>
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminLogin />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="products"
                element={
                  <ProtectedRoute>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="store-content"
                element={
                  <ProtectedRoute>
                    <StoreContentEditor />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </StoreContentProvider>
    </ErrorBoundary>
  );
}