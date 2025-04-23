import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { ProductImage } from '@/types/types';
import { createClient } from '@/utils/supabase/client';

interface ImageCarouselProps {
  images: ProductImage[];
  mainImage?: string;
}

export default function ImageCarousel({ images, mainImage }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const supabase = createClient();
  
  // Sort images by display_order and find primary image
  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
  const primaryImage = sortedImages.find(img => img.is_primary);
  
  // If there's a primary image in the product_images, use that
  // Otherwise, if there's a mainImage prop, create a primary image object for it
  // Finally, if neither exists, just use the sorted images as is
  const allImages = primaryImage 
    ? sortedImages 
    : mainImage 
      ? [{ id: 'main', product_id: '', image_url: mainImage, display_order: 0, is_primary: true }, ...sortedImages]
      : sortedImages;

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/placeholder.png';
    
    // If it's already a full URL (including our Supabase storage URL), return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // If it's a storage path, get the public URL
    const storagePath = imageUrl.startsWith('products/') ? imageUrl : `products/${imageUrl}`;
    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(storagePath);
    
    return data?.publicUrl || '/placeholder.png';
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };

  const previousImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
  };

  if (allImages.length === 0) {
    return (
      <div className="relative pb-[100%]">
        <img
          src="/placeholder.png"
          alt="Product placeholder"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative pb-[100%] group">
      <img
        src={getImageUrl(allImages[currentIndex]?.image_url)}
        alt="Product image"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {allImages.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              previousImage();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-80"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              nextImage();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 