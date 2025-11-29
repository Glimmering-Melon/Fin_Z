import { Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import type { User } from '@/types';

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    router.post('/logout');
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User button */}
      <button
        type="button"
        className="flex items-center gap-3 rounded-lg p-2 text-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-medium text-white">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full" />
          ) : (
            getInitials(user.name)
          )}
        </div>

        {/* User info - hidden on mobile */}
        <div className="hidden text-left md:block">
          <p className="font-medium text-white">{user.name}</p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>

        {/* Dropdown icon */}
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg border border-gray-800 bg-black shadow-lg">
          <div className="py-1">
            {/* User info - visible on mobile */}
            <div className="border-b border-gray-800 px-4 py-3 md:hidden">
              <p className="font-medium text-white">{user.name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>

            {/* Profile link */}
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-900"
              onClick={() => setIsOpen(false)}
            >
              <svg
                className="mr-3 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-800" />

            {/* Logout button */}
            <button
              type="button"
              className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-900"
              onClick={handleLogout}
            >
              <svg
                className="mr-3 h-5 w-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
