'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { XCircleIcon, ArrowUpIcon, ArrowDownIcon, StarIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { ProductImage } from '@/types/types';

interface ProductImageManagerProps {
  productId: string;
}

export default function ProductImageManager({ productId }: ProductImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order');

    if (error) {
      toast.error('Error loading images');
      return;
    }

    setImages(data || []);
  };

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${productId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      // Add to product_images table
      const { error: dbError } = await supabase
        .from('product_images')
        .insert([
          {
            product_id: productId,
            image_url: publicUrl,
            display_order: images.length,
            is_primary: images.length === 0 // First image is primary by default
          }
        ]);

      if (dbError) throw dbError;

      toast.success('Image uploaded successfully');
      fetchImages();
    } catch (error) {
      toast.error('Error uploading image');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    await uploadImage(e.target.files[0]);
    e.target.value = ''; // Reset input
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Delete from storage
      const filePath = imageUrl.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('products')
          .remove([`products/${productId}/${filePath}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast.success('Image deleted successfully');
      fetchImages();
    } catch (error) {
      toast.error('Error deleting image');
      console.error('Delete error:', error);
    }
  };

  const updateDisplayOrder = async (imageId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .update({ display_order: newOrder })
        .eq('id', imageId);

      if (error) throw error;

      fetchImages();
    } catch (error) {
      toast.error('Error updating image order');
      console.error('Update error:', error);
    }
  };

  const setPrimaryImage = async (imageId: string) => {
    try {
      // First, set all images as non-primary
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);

      // Then set the selected image as primary
      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) throw error;

      toast.success('Primary image updated');
      fetchImages();
    } catch (error) {
      toast.error('Error updating primary image');
      console.error('Update error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-secondary">Product Images</h3>
        <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-hover-primary transition-colors">
          <span>{uploading ? 'Uploading...' : 'Add Image'}</span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={image.id} className="relative group">
            <div className="aspect-square relative border rounded-lg overflow-hidden">
              <img
                src={image.image_url}
                alt="Product"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {image.is_primary && (
                <div className="absolute top-2 left-2 bg-yellow-400 rounded-full p-1" title="Primary Image">
                  <StarIcon className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                {index + 1}
              </div>
            </div>

            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              {!image.is_primary && (
                <button
                  onClick={() => setPrimaryImage(image.id)}
                  className="p-1 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-colors"
                  title="Set as primary image"
                >
                  <StarIcon className="h-5 w-5 text-white" />
                </button>
              )}
              {index > 0 && (
                <button
                  onClick={() => updateDisplayOrder(image.id, image.display_order - 1)}
                  className="p-1 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Move up in order"
                >
                  <ArrowUpIcon className="h-5 w-5 text-gray-600" />
                </button>
              )}
              {index < images.length - 1 && (
                <button
                  onClick={() => updateDisplayOrder(image.id, image.display_order + 1)}
                  className="p-1 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Move down in order"
                >
                  <ArrowDownIcon className="h-5 w-5 text-gray-600" />
                </button>
              )}
              <button
                onClick={() => deleteImage(image.id, image.image_url)}
                className="p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                title="Delete image"
              >
                <XCircleIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-8 text-secondary-light">
          No images uploaded yet
        </div>
      )}
    </div>
  );
} 