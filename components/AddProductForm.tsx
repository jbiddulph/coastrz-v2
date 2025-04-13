import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

interface AddProductFormProps {
  userId: string | null;
  onClose: () => void;
  onProductAdded: () => void;
}

export default function AddProductForm({ userId, onClose, onProductAdded }: AddProductFormProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unisex' | ''>('');
  const [cost, setCost] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
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
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
        if (!imageUrl) return;
      }

      const { error } = await supabase
        .from('products')
        .insert([{
          user_id: userId,
          name,
          description,
          size: size || null,
          color: color || null,
          gender: gender || null,
          cost: parseFloat(cost),
          image_url: imageUrl
        }]);

      if (error) throw error;

      toast.success('Product added successfully!');
      onProductAdded();
      onClose();
    } catch (error) {
      toast.error('Error adding product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-neutral rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-secondary">Add New Product</h2>
        
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
            <label className="block mb-2 text-secondary">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-2 bg-bg-main border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-secondary placeholder-secondary-light min-h-[100px]"
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
              <label className="block mb-2 text-secondary">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'unisex' | '')}
                className="w-full px-4 py-2 bg-bg-main border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-secondary"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

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
            <label className="block mb-2 text-secondary">Product Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full px-4 py-2 bg-bg-main border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-secondary"
            />
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