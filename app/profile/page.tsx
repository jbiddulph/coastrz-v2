"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }
        
        setUser(session.user);
        
        // Check if user is admin based on email
        const userEmail = session.user.email ?? '';
        const adminStatus = userEmail === process.env.NEXT_PUBLIC_EMAIL_USER;
        setIsAdmin(adminStatus);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="p-8">Loading...</div>;

  if (!user) return <div className="p-8">User not found.</div>;

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow mt-8">
      {isAdmin && (
        <button
          onClick={() => router.push('/admin/products')}
          className="mb-6 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
        >
          Go to Admin Dashboard
        </button>
      )}
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-2"><strong>Email:</strong> {user.email}</div>
      <div className="mb-2"><strong>User ID:</strong> {user.id}</div>
      <div className="mb-2"><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</div>
      <div className="mb-2"><strong>Role:</strong> {isAdmin ? 'Admin' : 'User'}</div>
      
      {isAdmin && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2 className="font-semibold mb-2">Admin Privileges</h2>
          <ul className="list-disc ml-6">
            <li>Manage products</li>
            <li>View and manage orders</li>
            <li>Access admin dashboard</li>
          </ul>
        </div>
      )}
      
      <button
        onClick={handleLogout}
        className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
      >
        Log out
      </button>
    </div>
  );
} 