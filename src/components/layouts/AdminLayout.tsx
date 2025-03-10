import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminHeader from '../admin/AdminHeader';
import LoadingSpinner from '../LoadingSpinner';
import FloatingSidebar from '../admin/FloatingSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  console.log('AdminLayout rendered', { location });
  return (
    <div className="min-h-screen bg-dark-500 flex flex-col" style={{ minHeight: '100vh' }}>
      <AdminHeader />
      <div className="flex-1 flex relative">
        <FloatingSidebar />
        <main className="flex-1 p-3 sm:p-6 ml-0 md:ml-20 transition-all duration-300 z-10">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
