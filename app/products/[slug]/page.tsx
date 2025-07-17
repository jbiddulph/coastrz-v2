'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import ImageCarousel from '@/components/ImageCarousel';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { Product } from '@/types/types';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (*),
            categories (
              id,
              name,
              slug
            )
          `)
          .eq('slug', params.slug)
          .single();

        if (error) throw error;

        // Redirect to design page if it's a custom coaster
        if (data.slug === 'custom-coaster' || data.is_custom) {
          router.push('/design-my-coaster');
          return;
        }

        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Error loading product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <p>The product you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <ImageCarousel
            images={product.product_images || []}
            mainImage={product.image_url || undefined}
          />
          {product.categories && product.categories[0]?.name && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white rounded-full text-sm">
              {product.categories[0].name}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-bold text-primary mb-6">£{product.cost.toFixed(2)}</p>
          
          <div className="space-y-4 mb-6">
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {product.size && (
                <div>
                  <h2 className="text-sm font-semibold mb-1">Size</h2>
                  <p className="text-gray-600 dark:text-gray-300">{product.size}</p>
                </div>
              )}
              
              {product.color && (
                <div>
                  <h2 className="text-sm font-semibold mb-1">Color</h2>
                  <p className="text-gray-600 dark:text-gray-300">{product.color}</p>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => {
              addItem(product);
              toast.success('Added to cart');
            }}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-hover-primary transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
} 