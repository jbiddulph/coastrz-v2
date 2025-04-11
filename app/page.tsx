'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import Todo from '../components/Todo';
import Products from '../components/Products';
import Auth from '../components/Auth';

export default function Home() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState<'todos' | 'products'>('todos');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main style={{ minHeight: '100vh', padding: '2.5rem 0' }}>
      <Toaster position="top-center" />
      {!session ? (
        <Auth />
      ) : (
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center', 
            marginBottom: '1rem',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setActiveTab('todos')}
                className={`button ${activeTab === 'todos' ? '' : 'secondary'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`button ${activeTab === 'products' ? '' : 'secondary'}`}
              >
                Products
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#666' }}>
                {session.user.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="button danger"
              >
                Sign Out
              </button>
            </div>
          </div>
          {activeTab === 'todos' ? <Todo /> : <Products />}
        </div>
      )}
    </main>
  );
} 