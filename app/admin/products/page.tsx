'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Product } from '@/types/types';
import AddProductForm from '@/components/AddProductForm';
import Products from '@/components/Products';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// Define admin emails here (same as profile page)
const ADMIN_EMAILS = [
  process.env.ADMIN_USER, // Add your email here
  'admin@example.com',
];

export default function ProductsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      
      // Check if user is admin based on email
      const userEmail = user.email ?? '';
      const isAdmin = userEmail === process.env.NEXT_PUBLIC_EMAIL_USER;
      
      if (!isAdmin) {
        router.replace('/profile');
        return;
      }
      
      setUserId(user.id);
      setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading) return <div className="p-8">Loading...</div>;

  return <Products userId={userId} />;
} 