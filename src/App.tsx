import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { StoreContentProvider } from './contexts/StoreContentContext';
import { ChatProvider } from './contexts/ChatContext';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { DEFAULT_CATEGORIES } from './constants/categories';
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import PreRollsPage from './pages/store/PreRollsPage';
import MushroomsPage from './pages/store/MushroomsPage';
import LightersPage from './pages/store/LightersPage';
import { CartProvider } from './contexts/CartContext';
import { CartToggleProvider } from './contexts/CartToggleContext';
import adminRoutes from './config/adminRoutes';
import THCAPopupModal from './components/store/THCAPopupModal';
import Portal from './components/Portal';
import OrderConfirmationPage from './pages/store/OrderConfirmationPage';
import PointsForJointsPage from './pages/store/PointsForJointsPage';
import { useAuth, AuthContext } from './hooks/useAuth'; // Import AuthContext and useAuth

// Lazy load components with descriptive chunk names
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
const AccountDetailsPage = lazy(() => import(/* webpackChunkName: "auth-account-details" */ './pages/auth/AccountDetails'));
const OrdersPage = lazy(() => import(/* webpackChunkName: "auth-orders" */ './pages/auth/OrdersPage'));


// Legal Pages
const PrivacyPolicy = lazy(() => import(/* webpackChunkName: "privacy-policy" */ './pages/PrivacyPolicy'));
const THCACompliance = lazy(() => import(/* webpackChunkName: "thca-compliance" */ './pages/THCACompliance'));
const TermsOfService = lazy(() => import(/* webpackChunkName: "terms-of-service" */ './pages/TermsOfService'));

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const auth = useAuth(); // Get auth values

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <ChatProvider>
        <StoreContentProvider>
          <CartProvider>
            <CartToggleProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <div className="dark drop-shadow-[0_0_8px_theme(colors.teal.500)]">
                  <AuthContext.Provider value={auth}> {/* Provide AuthContext value */}
                    <Routes>
                      <Route path="/" element={<StoreLayout />}>
                        <Route index element={<StorePage />} />
                        {DEFAULT_CATEGORIES.map((category) => (
                          <Route 
                            key={category.slug}
                            path={category.slug} 
                            element={React.createElement(categoryPages[category.slug] || StorePage)}
                          />
                        ))}
                        <Route path="pre-rolls" element={<PreRollsPage />} />
                        <Route path="mushrooms" element={<MushroomsPage />} />
                        <Route path="lighters-torches" element={<LightersPage />} />
                        <Route path="privacy" element={<PrivacyPolicy />} />
                        <Route path="thca-compliance" element={<THCACompliance />} />
                        <Route path="terms" element={<TermsOfService />} />
                        <Route path="order" element={React.createElement(lazy(() => import('./pages/store/OrderPage')))} />
                        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                        <Route path="/points-for-joints" element={<PointsForJointsPage />} />
                      </Route>
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/account" element={<AccountDetailsPage />} />
                      <Route path="/account/orders" element={<OrdersPage />} />
                      {adminRoutes.map((route) => (
                        <Route key={route.path} path={route.path} element={route.element}>
                          {route.children?.map((childRoute) => (
                            <Route key={childRoute.path} path={childRoute.path} element={childRoute.element} index={childRoute.index} />
                          ))}
                        </Route>
                      ))}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </AuthContext.Provider>
                </div>
                  {showModal && (
                    <Portal>
                      <THCAPopupModal
                        onClose={() => setShowModal(false)}
                        videoPath="/video/Whiteboard Animation THCA.mp4"
                      />
                    </Portal>
                  )}
              </Suspense>
            </CartToggleProvider>
          </CartProvider>
        </StoreContentProvider>
      </ChatProvider>
    </ErrorBoundary>
  );
}
