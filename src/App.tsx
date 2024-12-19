import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { StoreContentProvider } from './contexts/StoreContentContext';
import { ChatProvider } from './contexts/ChatContext';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { DEFAULT_CATEGORIES } from './constants/categories';
import React, { useEffect } from 'react';
import initializeFirestoreCollections from './lib/firestore-setup';
import PreRollsPage from './pages/store/PreRollsPage';
import MushroomsPage from './pages/store/MushroomsPage';
import LightersPage from './pages/store/LightersPage';
import { CartProvider } from './contexts/CartContext';
import { CartToggleProvider } from './contexts/CartToggleContext';

// Lazy load components with descriptive chunk names
const AdminLayout = lazy(() => import(/* webpackChunkName: "admin-layout" */ './components/layouts/AdminLayout'));
const StoreLayout = lazy(() => import(/* webpackChunkName: "store-layout" */ './components/layouts/StoreLayout'));
const StorePage = lazy(() => import(/* webpackChunkName: "store-page" */ './pages/store/StorePage'));

// Dynamically import category pages based on DEFAULT_CATEGORIES
const categoryPages: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'thca-flower': lazy(() => import(/* webpackChunkName: "thca-flower-page" */ './pages/store/THCAFlowerPage')),
  'pre-rolls': lazy(() => import(/* webpackChunkName: "pre-rolls-page" */ './pages/store/PreRollsPage')),
  'edibles': lazy(() => import(/* webpackChunkName: "edibles-page" */ './pages/store/EdiblesPage')),
  'mushrooms': lazy(() => import(/* webpackChunkName: "mushrooms-page" */ './pages/store/MushroomsPage')),
  'vapes-disposables': lazy(() => import(/* webpackChunkName: "vapes-page" */ './pages/store/VapesPage')),
  'glass-pipes': lazy(() => import(/* webpackChunkName: "glass-pipes-page" */ './pages/store/GlassAndPipesPage')),
  'tobacco-products': lazy(() => import(/* webpackChunkName: "tobacco-page" */ './pages/store/TobaccoPage')),
  'lighters-torches': lazy(() => import(/* webpackChunkName: "lighters-page" */ './pages/store/LightersPage'))
};

// Auth Pages
const Login = lazy(() => import(/* webpackChunkName: "auth-login" */ './pages/auth/Login'));
const Signup = lazy(() => import(/* webpackChunkName: "auth-signup" */ './pages/auth/Signup'));
const AccountManagement = lazy(() => import(/* webpackChunkName: "auth-account" */ './pages/auth/AccountManagement'));

// Admin Pages
const AdminDashboard = lazy(() => import(/* webpackChunkName: "admin-dashboard" */ './pages/admin/Dashboard'));
const AdminProducts = lazy(() => import(/* webpackChunkName: "admin-products" */ './pages/admin/Products'));
const StoreContentEditor = lazy(() => import(/* webpackChunkName: "store-content-editor" */ './pages/admin/StoreContentEditor'));
const PhotoBank = lazy(() => import(/* webpackChunkName: "admin-photo-bank" */ './pages/admin/PhotoBank'));
const ProtectedRoute = lazy(() => import(/* webpackChunkName: "protected-route" */ './components/ProtectedRoute'));
const Orders = lazy(() => import(/* webpackChunkName: "admin-orders" */ './pages/admin/Orders'));
const PromoManager = lazy(() => import(/* webpackChunkName: "admin-promo-manager" */ './pages/admin/PromoManager'));

// Legal Pages
const PrivacyPolicy = lazy(() => import(/* webpackChunkName: "privacy-policy" */ './pages/PrivacyPolicy'));
const THCACompliance = lazy(() => import(/* webpackChunkName: "thca-compliance" */ './pages/THCACompliance'));
const TermsOfService = lazy(() => import(/* webpackChunkName: "terms-of-service" */ './pages/TermsOfService'));

export default function App() {
  useEffect(() => {
    initializeFirestoreCollections();
  }, []);

  return (
    <ErrorBoundary>
      <ChatProvider>
        <StoreContentProvider>
          <CartProvider>
            <CartToggleProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <div className="dark">
                  <Routes>
                    {/* Store Routes */}
                    <Route path="/" element={<StoreLayout />}>
                      <Route index element={<StorePage />} />
                      
                      {/* Dynamically generate category routes */}
                      {DEFAULT_CATEGORIES.map((category) => (
                        <Route 
                          key={category.slug} 
                          path={category.slug} 
                          element={React.createElement(categoryPages[category.slug] || StorePage)}
                        />
                      ))}
                      
                      {/* New category routes */}
                      <Route path="pre-rolls" element={<PreRollsPage />} />
                      <Route path="mushrooms" element={<MushroomsPage />} />
                      <Route path="lighters-torches" element={<LightersPage />} />
                      
                      {/* Legal Pages */}
                      <Route path="privacy" element={<PrivacyPolicy />} />
                      <Route path="thca-compliance" element={<THCACompliance />} />
                      <Route path="terms" element={<TermsOfService />} />
                    </Route>
                    
                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/account" element={<AccountManagement />} />

                    {/* Admin Routes */}
                    <Route 
                      path="admin" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="store-content" element={<StoreContentEditor />} />
                      <Route path="photo-bank" element={<PhotoBank />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="promo-manager" element={<PromoManager />} />
                    </Route>

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </Suspense>
            </CartToggleProvider>
          </CartProvider>
        </StoreContentProvider>
      </ChatProvider>
    </ErrorBoundary>
  );
}
