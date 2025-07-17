'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';


export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setUser(user);

      // Check if user is admin based on email
      const userEmail = user.email ?? '';
      const isAdmin = userEmail === process.env.NEXT_PUBLIC_EMAIL_USER;
      
      if (!isAdmin) {
        router.replace('/profile');
        return;
      }
      
      setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-4 font-cooper-std">My Profile (Admin)</h1>
      {user && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <p className="mt-1 text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">User ID</label>
            <p className="mt-1 text-gray-900">{user.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Last Sign In</label>
            <p className="mt-1 text-gray-900">
              {new Date(user.last_sign_in_at).toLocaleString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Role</label>
            <p className="mt-1 text-gray-900">Admin</p>
          </div>
        </div>
      )}
    </div>
  );
} 