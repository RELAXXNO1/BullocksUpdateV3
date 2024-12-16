import { Outlet } from 'react-router-dom';
import StoreHeader from '../store/StoreHeader';
import StoreFooter from '../store/StoreFooter';
import AgeVerification from '../AgeVerification';
import CategorySidebar from '../store/CategorySidebar';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function StoreLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const portalRef = useRef(document.createElement('div'));

  useEffect(() => {
    const portalElement = portalRef.current;
    document.body.appendChild(portalElement);
    return () => {
      document.body.removeChild(portalElement);
    };
  }, []);


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AgeVerification />
      <StoreHeader />
      <div className="flex-grow flex relative">
        <button
          onClick={toggleSidebar}
          className="absolute top-2 left-2 bg-teal-600 rounded-full p-2 hover:bg-teal-700 transition-colors z-30 text-white"
        >
          Categories
        </button>
        <main className="flex-grow">
          <Outlet />
        </main>
      </div>
      {createPortal(
        <CategorySidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />,
        portalRef.current
      )}
      <StoreFooter />
    </div>
  );
}
