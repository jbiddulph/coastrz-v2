import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  size?: string;
  color?: string;
  gender?: 'male' | 'female' | 'unisex';
  cost: number;
  image_url?: string;
  user_id: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unisex' | ''>('');
  const [cost, setCost] = useState('');
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchProducts();
      }
    });
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error fetching products');
      return;
    }

    setProducts(data || []);
  };

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

      console.log('Generated public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading image');
      return null;
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName('');
    setDescription('');
    setSize('');
    setColor('');
    setGender('');
    setCost('');
    setImage(null);
  };

  // Set form fields for editing
  const setEditForm = (product: Product) => {
    setName(product.name);
    setDescription(product.description);
    setSize(product.size || '');
    setColor(product.color || '');
    setGender(product.gender || '');
    setCost(product.cost.toString());
    setImage(null);
  };

  // Handle edit button click
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm(product);
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', userId); // Ensure user owns the product

      if (error) throw error;

      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !editingProduct) return;

    setLoading(true);
    try {
      let imageUrl = editingProduct.image_url;
      if (image) {
        const newImageUrl = await uploadImage(image);
        if (newImageUrl) imageUrl = newImageUrl;
      }

      const { error } = await supabase
        .from('products')
        .update({
          name,
          description,
          size: size || null,
          color: color || null,
          gender: gender || null,
          cost: parseFloat(cost),
          image_url: imageUrl
        })
        .eq('id', editingProduct.id)
        .eq('user_id', userId); // Ensure user owns the product

      if (error) throw error;

      toast.success('Product updated successfully!');
      setShowEditModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Error updating product');
    } finally {
      setLoading(false);
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
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Error adding product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Add New Product</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="input"
              style={{ minHeight: '100px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Size</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'unisex' | '')}
                className="input"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Cost *</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
                step="0.01"
                min="0"
                className="input"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Product Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="button"
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Edit Product</h2>
            
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="input"
                  style={{ minHeight: '100px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Size</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Color</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'unisex' | '')}
                    className="input"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Cost *</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                    step="0.01"
                    min="0"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Product Image</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="input"
                />
                {editingProduct.image_url && (
                  <img
                    src={editingProduct.image_url}
                    alt="Current product image"
                    style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '0.5rem' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="button"
                >
                  {loading ? 'Updating...' : 'Update Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="button button-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Products</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {products.map((product) => (
            <div key={product.id} className="card" style={{ margin: 0 }}>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--border-radius)' }}
                />
              )}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{product.name}</h3>
                <p style={{ color: '#666', marginBottom: '0.5rem' }}>{product.description}</p>
                <p style={{ fontWeight: 'bold', color: '#0070f3' }}>£{product.cost.toFixed(2)}</p>
                {product.size && <p style={{ fontSize: '0.875rem' }}>Size: {product.size}</p>}
                {product.color && <p style={{ fontSize: '0.875rem' }}>Color: {product.color}</p>}
                {product.gender && <p style={{ fontSize: '0.875rem' }}>Gender: {product.gender}</p>}
                
                {/* Show edit/delete buttons only for user's own products */}
                {userId === product.user_id && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      className="button button-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="button button-small button-danger"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: var(--border-radius);
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .button-small {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }

        .button-secondary {
          background-color: #666;
        }

        .button-danger {
          background-color: #dc3545;
        }

        .button-danger:hover {
          background-color: #bd2130;
        }
      `}</style>
    </div>
  );
} 