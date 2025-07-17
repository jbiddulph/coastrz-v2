'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Auth from '@/components/Auth';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/admin/products');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/admin/products');
      }
    });

    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-bg-main py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2 font-cooper-std">Welcome Back</h1>
          <p className="text-secondary-light">Please sign in to access your account.</p>
        </div>
        <div className="bg-bg-main border border-secondary-border rounded-lg shadow-sm p-6">
          <Auth />
        </div>
      </div>
    </main>
  );
} 