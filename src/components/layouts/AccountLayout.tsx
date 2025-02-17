import React from 'react';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex relative">
        <main className="flex-grow px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
