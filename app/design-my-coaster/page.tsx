'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import DesignTool from '@/components/DesignTool';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/utils/supabase/client';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function DesignMyCoaster() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [designImageUrl, setDesignImageUrl] = useState<string | null>(null);
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    if (!designImageUrl) {
      toast.error('Please upload a design image first');
      return;
    }

    setLoading(true);
    try {
      // Get the custom coaster product
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', 'custom-coaster')
        .single();

      if (productError) throw productError;
      if (!product) throw new Error('Custom coaster product not found');

      // Get the current user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        toast.error('Please sign in to add items to cart');
        router.push('/login');
        return;
      }

      // Create a unique filename for this design
      const timestamp = Date.now();
      const fileName = `${session.user.id}/coaster-design-${timestamp}.png`;

      // Download the current design image
      const response = await fetch(designImageUrl);
      const blob = await response.blob();

      // Upload the design image to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('designs')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true // This will overwrite any existing file with the same name
        });

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('designs')
        .getPublicUrl(fileName);

      // Create a modified product object that won't affect stock
      const customProduct = {
        ...product,
        quantity: 1000, // Set a high quantity to prevent stock issues
        is_custom: true, // Flag to indicate this is a custom product
        design_image_url: publicUrl // Use the new public URL
      };

      // Add to cart using the client-side cart
      addItem(customProduct);
      toast.success('Added to cart!');
      router.push('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error adding to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push('/products')}
        className="text-primary hover:text-hover-primary mb-8"
      >
        ← Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h1 className="text-4xl font-bold text-secondary font-cooper-std">Design Your Custom Coaster</h1>
          <p className="text-gray-600 mb-8">
            Upload your image and customize your coaster design. Your design will be printed on a high-quality coaster.
          </p>

          <DesignTool onDesignUpdate={setDesignImageUrl} />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-secondary font-cooper-std">Product Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Top quality with cork backing for a professional finish</li>
                <li>9cm x 9cm size</li>
                <li>Full-color printing</li>
                <li>3mm MDF + 1mm Cork + Glossy top layer</li>
                <li>Perfect for home or office use</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Price</h3>
              <p className="text-2xl font-bold text-primary">£15.00</p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-hover-primary transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding to Cart...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 