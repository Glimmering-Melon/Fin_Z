import React from 'react';
import { router, usePage } from '@inertiajs/react';

export default function Sidebar() {
  const { auth } = usePage().props as { auth: { user: { name: string; email: string } | null } };

  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      {/* TODO: Responsive sidebar */}
      {/* TODO: Navigation links */}
      
      {/* User menu */}
      {auth.user && (
        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="mb-2">
            <p className="text-sm font-medium">{auth.user.name}</p>
            <p className="text-xs text-gray-400">{auth.user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm bg-red-600 hover:bg-red-700 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
