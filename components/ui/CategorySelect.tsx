import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export default function CategorySelect({ value, onChange, required = false, className = '' }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <select disabled className={className}>
        <option>Loading categories...</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={className}
    >
      <option value="">Select a category</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
} 