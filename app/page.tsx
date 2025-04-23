'use client';

import PublicProducts from '@/components/PublicProducts';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-background py-8">
        <PublicProducts />
      </div>
    </>
  );
} 