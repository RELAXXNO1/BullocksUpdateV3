import { Outlet } from 'react-router-dom';
import StoreHeader from '../store/StoreHeader';
import StoreFooter from '../store/StoreFooter';
import AgeVerification from '../AgeVerification';

export default function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AgeVerification />
      <StoreHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <StoreFooter />
    </div>
  );
}