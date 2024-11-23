"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showAside, setShowAside] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Calendar", href: "/calendar" },
    { name: "Posts", href: "/posts" },
    { name: "Media", href: "/media" },
    { name: "Services", href: "/services" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <div className="flex flex-row h-screen min-h-full bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed xl:relative h-full z-40 transition-transform ease-in-out duration-200 bg-white shadow-lg w-64 ${
          showAside ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Appractic
          </Link>
        </div>
        <div className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <main className="w-full xl:ml-64 flex flex-col overflow-y-auto">
        {/* Top header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b">
          <button
            onClick={() => setShowAside(!showAside)}
            className="xl:hidden text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Page content */}
        <div className="p-8 flex-grow">{children}</div>
      </main>

      {/* Overlay for mobile sidebar */}
      {showAside && (
        <div
          className="fixed inset-0 z-30 transform transition-all xl:hidden"
          onClick={() => setShowAside(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-50" />
        </div>
      )}
    </div>
  );
}
