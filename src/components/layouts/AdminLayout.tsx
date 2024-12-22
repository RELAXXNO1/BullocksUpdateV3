import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminHeader from '../admin/AdminHeader';
import AdminSidebar from '../admin/AdminSidebar';
import LoadingSpinner from '../LoadingSpinner';

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-dark-500 flex flex-col">
      <AdminHeader />
      <div className="flex-1 flex relative">
        <AdminSidebar />
        <main className="flex-1 p-3 sm:p-6 ml-0 md:ml-20 transition-all duration-300">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet key={location.pathname} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}