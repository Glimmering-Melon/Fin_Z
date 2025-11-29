import { Link, usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';
import Sidebar from '@/Components/Sidebar';
import UserMenu from '@/Components/UserMenu';
import type { SharedData } from '@/types';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { auth } = usePage<SharedData>().props;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-black px-4 lg:px-6">
          {/* Mobile menu button */}
          <button
            type="button"
            className="text-gray-400 hover:text-gray-300 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          {/* Logo for mobile */}
          <Link href="/dashboard" className="flex items-center lg:hidden">
            <img src="/images/logo.png" alt="Fin-Z" className="h-10" />
          </Link>

          {/* User Menu */}
          <div className="ml-auto">
            <UserMenu user={auth.user} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-black p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
