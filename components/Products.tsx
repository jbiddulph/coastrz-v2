import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import Pagination from './Pagination';
import Search from './Search';
import AddProductForm from './AddProductForm';
import { Squares2X2Icon as ViewGridIcon, ListBulletIcon as ViewListIcon } from '@heroicons/react/24/solid';
import { colors } from '@/utils/colors';

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

interface ProductsProps {
  userId: string | null;
}

export default function Products({ userId }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const ITEMS_PER_PAGE = 20;
  const supabase = createClient();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unisex' | ''>('');
  const [cost, setCost] = useState('');
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    fetchTotalProducts();
    fetchProducts();
  }, [currentPage, searchQuery]);

  const fetchTotalProducts = async () => {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    const { count, error } = await query;

    if (error) {
      toast.error('Error fetching total products count');
      return;
    }

    setTotalProducts(count || 0);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*')
      .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)
      .order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Error fetching products');
      return;
    }

    setProducts(data || []);
    setLoading(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
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

    const productToUpdate = editingProduct; // Create a non-null reference
    setLoading(true);
    try {
      let imageUrl = productToUpdate.image_url;
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
        .eq('id', productToUpdate.id)
        .eq('user_id', userId);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-primary rounded-t-lg p-4 flex justify-between items-center">
        <h2 className="text-neutral text-2xl font-bold">Products</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-neutral rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-primary-light text-primary'
                  : 'text-secondary hover:bg-neutral'
              }`}
              title="Grid view"
            >
              <ViewGridIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${
                viewMode === 'table'
                  ? 'bg-primary-light text-primary'
                  : 'text-secondary hover:bg-neutral'
              }`}
              title="Table view"
            >
              <ViewListIcon className="h-5 w-5" />
            </button>
          </div>
          <Search
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            placeholder="Search products..."
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-neutral text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-neutral transition-colors"
          >
            Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-neutral rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative pb-[100%]">
                    <img
                      src={product.image_url || '/placeholder.png'}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-secondary">{product.name}</h3>
                    <p className="text-secondary-light text-sm mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-bold">
                        ${product.cost.toFixed(2)}
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-accent hover:text-hover-accent"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-danger hover:text-hover-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 bg-neutral rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-secondary-border">
                <thead className="bg-neutral">
                  <tr>
                    {['Image', 'Name', 'Description', 'Size', 'Color', 'Gender', 'Cost', 'Actions'].map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-neutral divide-y divide-secondary-border">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-primary-light">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={product.image_url || '/placeholder.png'}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-secondary">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-secondary-light line-clamp-2">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-light">{product.size}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-light">{product.color}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-light">{product.gender}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary">
                          ${product.cost.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-accent hover:text-hover-accent mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-danger hover:text-hover-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalProducts / ITEMS_PER_PAGE)}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductForm
          userId={userId}
          onClose={() => setShowAddModal(false)}
          onProductAdded={() => {
            fetchProducts();
            fetchTotalProducts();
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-neutral rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-secondary">Edit Product</h2>
            
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-secondary">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block mb-2 text-secondary">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-secondary">Size</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-secondary">Color</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-secondary">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'unisex' | '')}
                    className="w-full px-4 py-2 border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full px-4 py-2 border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-secondary">Product Image</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="w-full px-4 py-2 border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {editingProduct?.image_url && (
                  <img
                    src={editingProduct?.image_url}
                    alt="Current product image"
                    className="w-20 h-20 object-cover mt-2"
                  />
                )}
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-neutral rounded-lg hover:bg-hover-primary transition-colors disabled:opacity-50"
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
                  className="px-6 py-2 bg-secondary text-neutral rounded-lg hover:opacity-90 transition-colors ml-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 