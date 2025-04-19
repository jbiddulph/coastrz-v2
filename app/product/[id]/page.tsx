'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ChevronLeftIcon, ShareIcon } from '@heroicons/react/24/solid';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import ImageCarousel from '@/components/ImageCarousel';
import Link from 'next/link';
import { Product, ProductImage } from '@/types/types';

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addItem } = useCart();
  const supabase = createClient();

  useEffect(() => {
    fetchProduct();
    fetchProductImages();
  }, [params.id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return;
    }

    setProduct(data);
    setLoading(false);
  };

  const fetchProductImages = async () => {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', params.id)
      .order('display_order');

    if (error) {
      console.error('Error fetching product images:', error);
      return;
    }

    setImages(data || []);
  };

  const fetchRelatedProducts = async (currentProduct: Product) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .neq('id', currentProduct.id)
      .eq('gender', currentProduct.gender)
      .order('created_at', { ascending: false })
      .limit(4);

    if (!error && data) {
      setRelatedProducts(data);
    }
  };

  useEffect(() => {
    if (product) {
      fetchRelatedProducts(product);
    }
  }, [product]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || 'Check out this product',
          text: product?.description || 'Great product from our store',
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
      toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-neutral rounded-lg mb-8"></div>
            <div className="h-8 bg-neutral rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-neutral rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-neutral rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg-main">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-secondary-light">
            Product not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-secondary hover:text-primary mb-8 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="relative">
            <ImageCarousel 
              images={images} 
              mainImage={product.image_url}
            />
          </div>

          {/* Product Details */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-4xl font-bold text-secondary font-cooper-std">{product.name}</h1>
              <button
                onClick={handleShare}
                className="p-2 text-secondary hover:text-primary transition-colors"
                title="Share product"
              >
                <ShareIcon className="h-6 w-6" />
              </button>
            </div>
            
            <p className="text-2xl font-bold text-primary mb-6">£{product.cost.toFixed(2)}</p>
            
            <div className="prose prose-lg text-secondary-light mb-8">
              {product.description}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              {product.size && (
                <div>
                  <h3 className="text-sm font-medium text-secondary mb-1">Size</h3>
                  <p className="text-lg text-secondary-light">{product.size}</p>
                </div>
              )}
              {product.color && (
                <div>
                  <h3 className="text-sm font-medium text-secondary mb-1">Color</h3>
                  <p className="text-lg text-secondary-light">{product.color}</p>
                </div>
              )}
              {product.gender && (
                <div>
                  <h3 className="text-sm font-medium text-secondary mb-1">Gender</h3>
                  <p className="text-lg text-secondary-light capitalize">{product.gender}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 mb-8">
              <div className="w-24">
                <label className="block text-sm font-medium text-secondary mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                  className="w-full p-2 border border-secondary-border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-primary text-white rounded-lg hover:bg-hover-primary transition-colors text-lg font-medium"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-secondary mb-8 font-cooper-std">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.id}`}
                  className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative">
                    <img
                      src={relatedProduct.image_url || '/placeholder.png'}
                      alt={relatedProduct.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-secondary mb-2">{relatedProduct.name}</h3>
                    <p className="text-primary font-bold">£{relatedProduct.cost.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 