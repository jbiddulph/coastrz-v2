import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import Pagination from './Pagination';
import Search from './Search';
import AddProductForm from './AddProductForm';
import ImageCarousel from './ImageCarousel';
import { Squares2X2Icon as ViewGridIcon, ListBulletIcon as ViewListIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { colors } from '@/utils/colors';
import { Product, ProductImage, ImageFile } from '@/types/types';
import { getDisplayPrice, hasSalePrice } from '@/utils/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductWithImages extends Product {
  product_images: ProductImage[];
  category_id: string;
  status: 'in_stock' | 'sold_out' | 'hidden';
}

interface ProductsProps {
  userId: string | null;
}

type SortField = 'name' | 'cost' | 'created_at' | 'size';
type SortOrder = 'asc' | 'desc';

export default function Products({ userId }: ProductsProps) {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithImages | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const ITEMS_PER_PAGE = 20;

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [cost, setCost] = useState('');
  const [saleCost, setSaleCost] = useState('');
  const [images, setImages] = useState<ImageFile[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchTotalProducts();
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchQuery, sortField, sortOrder]);

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
    try {
      let query = supabase
        .from('products')
        .select('*, product_images(*)')
        .order(sortField, { ascending: sortOrder === 'asc' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data as ProductWithImages[]);
    } catch (error) {
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data);
    } catch (error) {
      toast.error('Error fetching categories');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages: ImageFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: images.length === 0 // First image is primary by default
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    setImages(images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    })));
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
    setCost('');
    setSaleCost('');
    setImages([]);
  };

  // Set form fields for editing
  const setEditForm = (product: ProductWithImages) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setSize(product.size || '');
    setColor(product.color || '');
    setCost(product.cost.toString());
    setSaleCost(product.sale_cost ? product.sale_cost.toString() : '');
    setSelectedCategory(product.category_id || '');
    setShowEditModal(true);
    
    // Convert existing product images to ImageFile format
    if (product.product_images && product.product_images.length > 0) {
      const convertedImages: ImageFile[] = product.product_images.map(img => ({
        file: null as unknown as File, // We don't have the original file for existing images
        preview: img.image_url,
        isPrimary: img.is_primary
      }));
      setImages(convertedImages);
    } else {
      setImages([]);
    }
  };

  // Handle edit button click
  const handleEdit = (product: ProductWithImages) => {
    setEditingProduct(product);
    setEditForm(product);
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This will also remove it from any orders it appears in.')) return;

    try {
      // First, delete any order items that reference this product
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('product_id', productId);

      if (orderItemsError) throw orderItemsError;

      // Then fetch the product to get its main image
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Delete main product image from storage if it exists
      if (product?.image_url) {
        const mainImagePath = product.image_url.split('/').pop();
        if (mainImagePath) {
          const { error: mainImageError } = await supabase.storage
            .from('products')
            .remove([mainImagePath]);
          
          if (mainImageError) {
            console.error('Error deleting main image from storage:', mainImageError);
          }
        }
      }

      // Fetch all additional images associated with this product
      const { data: productImages, error: fetchError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId);

      if (fetchError) throw fetchError;

      // Delete additional images from storage if they exist
      if (productImages && productImages.length > 0) {
        for (const image of productImages) {
          if (image.image_url) {
            const path = image.image_url.split('/').pop();
            if (path) {
              const { error: storageError } = await supabase.storage
                .from('products')
                .remove([path]);
              
              if (storageError) {
                console.error('Error deleting additional image from storage:', storageError);
              }
            }
          }
        }

        // Delete image records from the database
        const { error: deleteImagesError } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', productId);

        if (deleteImagesError) throw deleteImagesError;
      }

      // Finally, delete the product itself
      const { error: deleteProductError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', userId); // Ensure user owns the product

      if (deleteProductError) throw deleteProductError;

      toast.success('Product and all associated data deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product and associated data');
    }
  };

  // Add slug generation function
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      // First, upload any new images
      const uploadedImageUrls: string[] = [];
      for (const image of images) {
        if (image.file) {
          const imageUrl = await uploadImage(image.file);
          if (imageUrl) {
            uploadedImageUrls.push(imageUrl);
          }
        }
      }

      // Find primary image URL from new images or keep existing one
      const primaryImageUrl = images.find(img => img.isPrimary)?.preview;
      const imageUrl = primaryImageUrl || editingProduct.image_url;

      // Validate sale cost
      const parsedCost = parseFloat(cost);
      const parsedSaleCost = saleCost ? parseFloat(saleCost) : null;
      
      if (parsedSaleCost && parsedSaleCost >= parsedCost) {
        toast.error('Sale cost must be less than original cost');
        return;
      }

      // Determine status based on quantity
      let newStatus = editingProduct.status;
      if (editingProduct.quantity === 0 && editingProduct.status === 'in_stock') {
        newStatus = 'sold_out';
      } else if (editingProduct.quantity > 0 && editingProduct.status === 'sold_out') {
        newStatus = 'in_stock';
      }

      // Generate new slug if name has changed
      const slug = name !== editingProduct.name ? generateSlug(name) : editingProduct.slug;

      // Update the product basic info
      const updates = {
        name,
        slug,
        description,
        size: size || undefined,
        color: color || undefined,
        cost: parsedCost,
        sale_cost: parsedSaleCost,
        category_id: selectedCategory || null,
        image_url: imageUrl,
        quantity: editingProduct.quantity,
        min_quantity: editingProduct.min_quantity || 1,
        status: newStatus
      };

      const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', editingProduct.id);

      if (updateError) throw updateError;

      // If we have new images, add them to product_images
      if (uploadedImageUrls.length > 0) {
        const productImages = uploadedImageUrls.map((url, index) => ({
          product_id: editingProduct.id,
          image_url: url,
          is_primary: index === 0 && !editingProduct.image_url
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(productImages);

        if (imagesError) throw imagesError;
      }

      toast.success('Product updated successfully');
      setShowEditModal(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(`Error updating product: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      let imageUrl = null;
      if (images.length > 0) {
        imageUrl = await uploadImage(images[0].file);
        if (!imageUrl) return;
      }

      const slug = generateSlug(name);
      const productData = {
        name,
        description,
        size: size || null,
        color: color || null,
        cost: parseFloat(cost),
        sale_cost: saleCost ? parseFloat(saleCost) : null,
        user_id: userId,
        slug,
        quantity: 1,
        min_quantity: 1,
        status: editingProduct?.status || 'in_stock',
        category_id: selectedCategory || null
      };

      const { error } = await supabase
        .from('products')
        .insert([productData]);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it with ascending order
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <div className="opacity-0 group-hover:opacity-50 ml-2 inline-block">
          <ChevronUpIcon className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="ml-2 inline-block">
        {sortOrder === 'asc' ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-primary rounded-t-lg p-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-neutral text-2xl font-bold">Products</h2>
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
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <Search
              searchQuery={searchQuery}
              onSearchChange={handleSearch}
              placeholder="Search products..."
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-neutral text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-neutral transition-colors whitespace-nowrap"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalProducts / ITEMS_PER_PAGE)}
          onPageChange={setCurrentPage}
        />
      </div>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-8 text-secondary-light">
              No products found
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-neutral rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative">
                        <ImageCarousel
                          images={product.product_images || []}
                          mainImage={product.image_url || undefined}
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-2">
                          {product.categories && product.categories.length > 0 && (
                            <span className="px-3 py-1 bg-primary text-white rounded-full text-sm">
                              {product.categories[0].name}
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            product.status === 'sold_out' 
                              ? 'bg-red-500 text-white' 
                              : product.status === 'hidden'
                              ? 'bg-gray-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}>
                            {product.status === 'in_stock' ? 'In Stock' : product.status === 'sold_out' ? 'Sold Out' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex-1">
                          <h3 className="text-lg text-secondary --color-secondary font-bold font-cooper-std">{product.name}</h3>
                          <div className="flex items-center gap-2">
                            <p className="text-primary font-bold">{getDisplayPrice(product)}</p>
                            {hasSalePrice(product) && (
                              <span className="text-sm text-gray-500 line-through">
                                £{product.cost.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
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
                <div className="bg-neutral rounded-bl-lg rounded-br-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-secondary-border">
                      <thead className="bg-neutral">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Image
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer group"
                            onClick={() => handleSort('name')}
                          >
                            <span className="flex items-center">
                              Name
                              {renderSortIcon('name')}
                            </span>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Description
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer group"
                            onClick={() => handleSort('size')}
                          >
                            <span className="flex items-center">
                              Size
                              {renderSortIcon('size')}
                            </span>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Color
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer group"
                            onClick={() => handleSort('cost')}
                          >
                            <span className="flex items-center">
                              Cost
                              {renderSortIcon('cost')}
                            </span>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Actions
                          </th>
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.status === 'sold_out' 
                                  ? 'bg-red-100 text-red-800' 
                                  : product.status === 'hidden'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {product.status === 'in_stock' ? 'In Stock' : product.status === 'sold_out' ? 'Sold Out' : 'Hidden'}
                              </span>
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
                              <div className="text-sm font-medium text-primary">
                                <div className="flex items-center gap-2">
                                  <span>{getDisplayPrice(product)}</span>
                                  {hasSalePrice(product) && (
                                    <span className="text-xs text-gray-500 line-through">
                                      £{product.cost.toFixed(2)}
                                    </span>
                                  )}
                                </div>
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
                </div>
              )}
            </>
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
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-secondary">Sale Cost</label>
                  <input
                    type="number"
                    value={saleCost}
                    onChange={(e) => setSaleCost(e.target.value)}
                    step="0.01"
                    min="0"
                    max={cost || undefined}
                    className="w-full px-4 py-2 border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {saleCost && parseFloat(saleCost) >= parseFloat(cost) && (
                    <p className="text-danger text-sm mt-1">Sale cost must be less than the original cost</p>
                  )}
                </div>

                <div className="mt-2">
                  <p className="text-sm text-secondary">
                    Final Price: {saleCost && parseFloat(saleCost) < parseFloat(cost) ? (
                      <>
                        <span className="line-through text-secondary-light">£{parseFloat(cost).toFixed(2)}</span>
                        <span className="ml-2 text-primary">£{parseFloat(saleCost).toFixed(2)}</span>
                      </>
                    ) : (
                      <span>£{parseFloat(cost || '0').toFixed(2)}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-secondary">Quantity *</label>
                  <input
                    type="number"
                    value={editingProduct.quantity}
                    onChange={(e) => setEditingProduct(prev => prev ? {
                      ...prev,
                      quantity: parseInt(e.target.value)
                    } : null)}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-secondary">Min Quantity *</label>
                  <input
                    type="number"
                    value={editingProduct.min_quantity || 1}
                    onChange={(e) => setEditingProduct(prev => prev ? {
                      ...prev,
                      min_quantity: parseInt(e.target.value)
                    } : null)}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-secondary">Status *</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct(prev => prev ? {
                      ...prev,
                      status: e.target.value as 'in_stock' | 'sold_out' | 'hidden'
                    } : null)}
                    required
                    className="w-full px-4 py-2 border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="sold_out">Sold Out</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-secondary">Product Images</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                  className="w-full px-4 py-2 border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                {/* Current Images */}
                {editingProduct?.product_images && editingProduct.product_images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-secondary mb-2">Current Images</h4>
                    <div className="grid grid-cols-4 gap-4">
                      {editingProduct.product_images.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.image_url}
                            alt="Product image"
                            className={`w-full h-24 object-cover rounded-lg ${
                              img.is_primary ? 'ring-2 ring-primary' : ''
                            }`}
                          />
                          {img.is_primary && (
                            <span className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded-full">
                              Primary
                            </span>
                          )}
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this image?')) {
                                try {
                                  // Extract the filename from the URL
                                  const urlParts = img.image_url.split('/');
                                  const fileName = urlParts[urlParts.length - 1];
                                  
                                  // Delete from storage if it's a Supabase storage URL
                                  if (!img.image_url.includes('http://') && !img.image_url.includes('https://')) {
                                    const { error: storageError } = await supabase.storage
                                      .from('products')
                                      .remove([`${fileName}`]);

                                    if (storageError) {
                                      console.error('Storage delete error:', storageError);
                                    }
                                  }

                                  // Delete from database
                                  const { error: dbError } = await supabase
                                    .from('product_images')
                                    .delete()
                                    .eq('id', img.id);

                                  if (dbError) throw dbError;

                                  // Update the editingProduct state to remove the deleted image
                                  setEditingProduct(prev => prev ? {
                                    ...prev,
                                    product_images: prev.product_images.filter(image => image.id !== img.id)
                                  } : null);

                                  toast.success('Image deleted successfully');
                                } catch (error) {
                                  console.error('Delete error:', error);
                                  toast.error('Error deleting image');
                                }
                              }
                            }}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete image"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                {images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-secondary mb-2">New Images</h4>
                    <div className="grid grid-cols-4 gap-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.preview}
                            alt={`Preview ${index + 1}`}
                            className={`w-full h-24 object-cover rounded-lg ${
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
                  </div>
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