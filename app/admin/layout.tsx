'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/utils/supabase/client';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        redirect('/login');
      } else {
        setUser({ email: user.email || '' });
      }
    };

    checkUser();
  }, []);

  if (!user) {
    return null; // or a loading spinner
  }

  return <AdminLayout user={user}>{children}</AdminLayout>;
} 