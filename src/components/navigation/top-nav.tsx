import React from 'react';
import { UserMenu } from './user-menu';

const TopNav = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
      <div className="h-full flex items-center justify-between px-6">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <span className="sr-only">Notifications</span>
            <span className="text-xl">🔔</span>
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default TopNav;
