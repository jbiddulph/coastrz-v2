import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { ProductImage, ImageFile } from '@/types/types';
import CategorySelect from '@/components/ui/CategorySelect';

interface AddProductFormProps {
  userId: string | null;
  onClose: () => void;
  onProductAdded: () => void;
}

export default function AddProductForm({ userId, onClose, onProductAdded }: AddProductFormProps) {
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [cost, setCost] = useState('');
  const [images, setImages] = useState<ImageFile[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        isPrimary: index === 0 // First image is primary by default
      }));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview); // Clean up preview URL
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    setImages(newImages);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return null;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return null;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!allowedExtensions.includes(fileExt)) {
        toast.error('Please upload a valid image file (jpg, jpeg, png, gif, webp)');
        return null;
      }

      // Create a unique file name
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Error uploading image: ${uploadError.message}`);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading image');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      // Upload all images
      const uploadedImages: { url: string; isPrimary: boolean }[] = [];
      for (const image of images) {
        const imageUrl = await uploadImage(image.file);
        if (imageUrl) {
          uploadedImages.push({
            url: imageUrl,
            isPrimary: image.isPrimary
          });
        }
      }

      if (uploadedImages.length === 0) {
        toast.error('At least one image is required');
        return;
      }

      // Insert the product first
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          user_id: userId,
          name,
          description,
          category_id: categoryId,
          size: size || null,
          color: color || null,
          cost: parseFloat(cost),
          quantity: 1,
          min_quantity: 1,
          image_url: uploadedImages.find(img => img.isPrimary)?.url || uploadedImages[0].url
        }])
        .select()
        .single();

      if (productError) throw productError;

      // Insert product images
      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(
          uploadedImages.map((img, index) => ({
            product_id: product.id,
            image_url: img.url,
            display_order: index + 1,
            is_primary: img.isPrimary
          }))
        );

      if (imagesError) throw imagesError;

      toast.success('Product added successfully!');
      onProductAdded();
      onClose();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error adding product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="z-50 fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-neutral rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-secondary">Add New Product</h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary p-1 rounded-full hover:bg-primary-light transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-2 text-secondary">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-bg-main border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-secondary placeholder-secondary-light"
            />
          </div>

          <div>
            <label className="block mb-2 text-secondary">Category *</label>
            <CategorySelect
              value={categoryId}
              onChange={setCategoryId}
              required
              className="w-full px-4 py-2 bg-bg-main border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-secondary"
            />
          </div>

          <div>
            <label className="block mb-2 text-secondary">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-2 bg-bg-main border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-secondary placeholder-secondary-light"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-secondary">Size</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-4 py-2 bg-bg-main border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-secondary placeholder-secondary-light"
              />
            </div>

            <div>
              <label className="block mb-2 text-secondary">Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-4 py-2 bg-bg-main border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-secondary placeholder-secondary-light"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-secondary">Cost *</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2 bg-bg-main border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-secondary placeholder-secondary-light"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-secondary">Product Images *</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="w-full px-4 py-2 bg-bg-main border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-secondary"
            />
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className={`w-full h-32 object-cover rounded-lg ${
                        img.isPrimary ? 'ring-2 ring-primary' : ''
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        className="p-2 bg-primary text-white rounded-full hover:bg-hover-primary"
                        title="Set as primary image"
                      >
                        ★
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-2 bg-secondary text-white rounded-full hover:bg-hover-danger"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-neutral rounded-lg hover:bg-hover-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-secondary text-neutral rounded-lg hover:bg-hover-danger focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 