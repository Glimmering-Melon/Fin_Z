import { ReactNode, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

interface MainLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const page = usePage();
  const auth = (page.props as any)?.auth || { user: null };
  const url = (page.props as any)?.url || '/';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Heatmap', href: '/heatmap', icon: '🗺️' },
    { name: 'News', href: '/news', icon: '📰' },
    { name: 'Watchlist', href: '/watchlist', icon: '⭐' },
  ];

  const handleLogout = () => {
    router.post('/logout');
  };

  const isActive = (href: string) => {
    if (href === '/') return url === '/';
    return url.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header - White */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Logo + Menu Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg"></div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">FINZOODASH</h1>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stocks..."
                className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            {auth?.user && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {auth.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
            )}
            
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Logout"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Dark */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 w-48 bg-gray-900 text-white z-40 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center px-6 py-3 text-sm font-medium transition-colors
                ${isActive(item.href)
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-48 min-h-screen">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
