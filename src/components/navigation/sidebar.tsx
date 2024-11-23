import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/posts', label: 'Posts', icon: '📝' },
    { href: '/schedule', label: 'Schedule', icon: '📅' },
    { href: '/analytics', label: 'Analytics', icon: '📈' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-white h-screen fixed left-0 border-r border-gray-200">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-8">Appractic</h1>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
