import { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminHeader from '../admin/AdminHeader';
import LoadingSpinner from '../LoadingSpinner';
import FloatingSidebar from '../admin/FloatingSidebar';

export default function AdminLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <FloatingSidebar onToggle={setIsSidebarExpanded} />
      <div
        className="flex flex-col transition-all duration-300 ease-in-out"
        style={{ marginLeft: isSidebarExpanded ? 256 : 72 }}
      >
        <AdminHeader />
        <main className="flex-1 p-6">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
