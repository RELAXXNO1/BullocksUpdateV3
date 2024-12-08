import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminHeader from '../admin/AdminHeader';
import AdminSidebar from '../admin/AdminSidebar';
import LoadingSpinner from '../LoadingSpinner';

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-dark-500">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 relative">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet key={location.pathname} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}