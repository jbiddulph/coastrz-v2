'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Product } from '@/types/types';
import PublicProducts from '@/components/PublicProducts';
import { useTheme } from '@/contexts/ThemeContext';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  return <PublicProducts />;
} 