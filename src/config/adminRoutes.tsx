import { lazy } from 'react';
import { RouteObject, Outlet } from 'react-router-dom'; // Import Outlet
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../components/layouts/AdminLayout';

// Import CategoryManager component with correct handling for named export
const CategoryManager = lazy(() => import('../components/admin/CategoryManager').then(module => ({ default: module.CategoryManager })));

const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('../pages/admin/Products'));
const StoreContentEditor = lazy(() => import('../pages/admin/StoreContentEditor'));
const PromoManager = lazy(() => import('../pages/admin/PromoManager'));
const PhotoBank = lazy(() => import('../pages/admin/PhotoBank'));
const Orders = lazy(() => import('../pages/admin/Orders'));
const SupportRequests = lazy(() => import('../pages/admin/SupportRequests'));
const GeminiChatbotPage = lazy(() => import('../pages/admin/GeminiChatbotPage'));
const PointsPanel = lazy(() => import('../components/admin/PointsPanel'));
const PopupManagerPage = lazy(() => import('../pages/admin/PopupManagerPage'));

const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout /> {/* AdminLayout renders its own Outlet */}
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'store-content', element: <StoreContentEditor /> },
      { path: 'support-requests', element: <SupportRequests /> },
      { path: 'photo-bank', element: <PhotoBank /> },
      { path: 'orders', element: <Orders /> },
      { path: 'promo-manager', element: <PromoManager /> },
      { path: 'gemini-chatbot', element: <GeminiChatbotPage /> },
      { path: 'points-panel', element: <PointsPanel /> },
      { path: 'popup-manager', element: <PopupManagerPage /> },
      // Add Category Manager route - updated path to match sidebar
      { path: 'category-manager', element: <CategoryManager /> },
    ],
  },
];

export default adminRoutes;
