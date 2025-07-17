'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import Todo from '@/components/Todo';
import { useTheme } from '@/contexts/ThemeContext';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function TodosPage() {
  return <Todo />;
} 