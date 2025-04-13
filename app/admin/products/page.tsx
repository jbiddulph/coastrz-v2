'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Products from '@/components/Products';

export default function ProductsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  return <Products userId={userId} />;
} 