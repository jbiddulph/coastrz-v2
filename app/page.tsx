'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Product } from '@/types/types';
import PublicProducts from '@/components/PublicProducts';
import { useTheme } from '@/contexts/ThemeContext';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Coastrz</h1>
        <p className="text-gray-600">Custom Coasters</p>
        <p className="text-sm text-gray-500 mt-4">App is running!</p>
      </div>
    </div>
  )
} 