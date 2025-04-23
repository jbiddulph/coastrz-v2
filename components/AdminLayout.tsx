'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiPackage, FiCheckSquare, FiUser, FiLogOut } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import AdminSidebar from '@/app/components/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: { email: string } | null;
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
} 