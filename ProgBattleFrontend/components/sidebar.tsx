'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/lib/site';
import clsx from 'clsx';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useUser } from '@/Context/UserContext';
import { logout } from '@/lib/logout';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser } = useUser();

  const handleLogout = async () => {
    await logout(setUser);
    router.push('/login');
    toast.success('Logged out successfully', {
      description: 'You have been logged out. See you next time!',
    });
  };

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for mobile */}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-gray-900 text-white shadow-lg transition-transform duration-300 z-40 w-64',
          {
            'translate-x-0': isOpen,
            '-translate-x-full': !isOpen,
            'md:translate-x-0': true, // Always visible on desktop
          }
        )}
      >
        <div className="p-4 font-bold text-2xl border-b border-gray-700">
          {siteConfig.name}
        </div>

        <nav className="flex flex-col flex-1 p-4 space-y-2 overflow-y-auto">
          {siteConfig.sidebarItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)} // Auto-close on click (mobile)
                className={clsx(
                  'block px-4 py-2 rounded transition-all duration-200',
                  {
                    'bg-gray-700 text-white': isActive,
                    'hover:bg-gray-800 hover:text-white text-gray-300': !isActive,
                  }
                )}
              >
                {item.title}
              </Link>
            );
          })}

          {user ? (
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 mt-4 rounded bg-red-600 hover:bg-red-700 transition-all"
            >
              🔓 Logout
            </button>
          ) : <Link
          href="/login"
          className="w-full text-left px-4 py-2 mt-4 rounded bg-blue-600 hover:bg-blue-700 transition-all"
        >
          🔓 Login
        </Link>}
        </nav>

        <div className="p-4 text-sm text-gray-500 border-t border-gray-700">
          {siteConfig.description}
        </div>
      </aside>
    </>
  );
}
