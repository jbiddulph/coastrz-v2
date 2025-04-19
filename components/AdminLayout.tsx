'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiPackage, FiCheckSquare, FiUser, FiLogOut } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: {
    email: string;
  } | null;
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const menuItems = [
    { path: '/admin/products', label: 'Products', icon: FiPackage },
    { path: '/admin/orders', label: 'Orders', icon: FiCheckSquare },
    { path: '/admin/todos', label: 'Todos', icon: FiCheckSquare },
  ];

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Top Navigation Bar */}
      <nav className="bg-neutral shadow-sm fixed w-full z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {sidebarOpen ? (
                  <HiX className="h-6 w-6" />
                ) : (
                  <HiMenu className="h-6 w-6" />
                )}
              </button>
              <div className="ml-4 text-xl font-semibold text-secondary">Admin Dashboard</div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/admin/profile"
                className="text-secondary hover:text-primary p-2 rounded-full hover:bg-primary-light"
              >
                <FiUser size={20} />
              </Link>
              <button
                onClick={handleLogout}
                className="text-secondary hover:text-primary p-2 rounded-full hover:bg-primary-light"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-neutral transition-transform duration-300 ease-in-out z-40 pt-16 shadow-lg`}>
        <nav className="mt-5 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md mb-1
                  ${pathname === item.path
                    ? 'bg-primary-light text-primary'
                    : 'text-secondary hover:bg-primary-light hover:text-primary'
                  }`}
              >
                <Icon className="mr-4 h-6 w-6" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} pt-16`}>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 