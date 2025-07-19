'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import Pagination from './Pagination';
import Search from './Search';
import { ChevronUpIcon, ChevronDownIcon, FunnelIcon, ShoppingBagIcon, EyeIcon, XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import ShoppingCart from './ShoppingCart';
import Link from 'next/link';
import QuickView from './QuickView';
import { Product as ProductType, ProductImage } from '@/types/types';
import ImageCarousel from './ImageCarousel';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { getDisplayPrice, hasSalePrice, getActualPrice } from '@/utils/utils';

type SortField = 'name' | 'cost' | 'created_at' | 'size';
type SortOrder = 'asc' | 'desc';

type Product = ProductType;

export default function PublicProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    size: '',
    color: '',
    category: '',
    status: 'in_stock'
  });
  const { addItem, items } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewImages, setQuickViewImages] = useState<ProductImage[]>([]);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // State to track selected quantities for each product
  const [selectedQuantities, setSelectedQuantities] = useState<{ [productId: string]: number }>({});

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchCategories();
    fetchTotalProducts();
    fetchProducts();
  }, [currentPage, searchQuery, sortField, sortOrder, filters]);

  // Initialize selected quantities when products change
  useEffect(() => {
    const initialQuantities: { [productId: string]: number } = {};
    products.forEach(product => {
      if (!selectedQuantities[product.id]) {
        initialQuantities[product.id] = 1;
      }
    });
    if (Object.keys(initialQuantities).length > 0) {
      setSelectedQuantities(prev => ({ ...prev, ...initialQuantities }));
    }
  }, [products]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchTotalProducts = async () => {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Apply filters
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    if (filters.size) {
      query = query.eq('size', filters.size);
    }
    if (filters.color) {
      query = query.ilike('color', `%${filters.color}%`);
    }
    if (filters.minPrice) {
      query = query.gte('cost', parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      query = query.lte('cost', parseFloat(filters.maxPrice));
    }
    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { count, error } = await query;

    if (!error) {
      setTotalProducts(count || 0);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images (*),
        categories!inner (
          id,
          name,
          slug
        )
      `)
      .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

    // Apply filters
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    if (filters.size && filters.size !== 'all') {
      query = query.eq('size', filters.size);
    }
    if (filters.color) {
      query = query.ilike('color', `%${filters.color}%`);
    }
    if (filters.minPrice) {
      query = query.gte('cost', parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      query = query.lte('cost', parseFloat(filters.maxPrice));
    }
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category_id', filters.category);
    }
    if (filters.status && filters.status !== '') {
      query = query.eq('status', filters.status);
    }

    // Add sorting
    if (sortField === 'size') {
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      query = query.order('size', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order(sortField, { ascending: sortOrder === 'asc' });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    if (data) {
      console.log('Fetched products:', data);
      setProducts(data);
    }
    setLoading(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      size: '',
      color: '',
      category: '',
      status: 'in_stock'
    });
    setCurrentPage(1);
  };

  // Update quantity for a specific product
  const updateProductQuantity = (productId: string, newQuantity: number, maxQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > maxQuantity) newQuantity = maxQuantity;
    
    setSelectedQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  // Get selected quantity for a product (default to 1)
  const getSelectedQuantity = (productId: string): number => {
    return selectedQuantities[productId] || 1;
  };

  const renderFilterBadge = (label: string, value: string | undefined | null, filterType: 'size' | 'color') => {
    if (!value) return null;
    
    const isActive = filters[filterType] === value;
    
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isActive) {
            handleFilterChange(filterType, '');
          } else {
            setShowFilters(true);
            handleFilterChange(filterType, value);
          }
        }}
        className={`text-xs px-2 py-1 rounded-full transition-colors ${
          isActive 
            ? 'text-white hover:opacity-80' 
            : 'text-primary hover:opacity-80'
        }`}
        style={{ 
          backgroundColor: isActive 
            ? 'var(--color-primary)' 
            : 'rgba(67, 198, 195, 0.1)'
        }}
      >
        {label}: {value}
      </button>
    );
  };

  const handleQuickView = async (product: Product) => {
    setSelectedProduct(product);
    try {
      const { data: images, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching product images:', error);
        return;
      }

      setQuickViewImages(images);
      setIsQuickViewOpen(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const selectedQty = getSelectedQuantity(product.id);
    const currentCartItem = items.find(item => item.id === product.id);
    const currentCartQty = currentCartItem ? currentCartItem.quantity : 0;
    
    // Check if adding this quantity would exceed available stock
    if (currentCartQty + selectedQty > product.quantity) {
      toast.error(`Only ${product.quantity - currentCartQty} more items available`);
      return;
    }
    
    // Add the selected quantity to cart
    for (let i = 0; i < selectedQty; i++) {
      addItem(product);
    }
    
    toast.success(`Added ${selectedQty} ${selectedQty === 1 ? 'item' : 'items'} to cart`);
    
    // Reset selected quantity to 1 after adding to cart
    setSelectedQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filters.category || filters.category === 'all' || product.category_id === filters.category;
    return matchesSearch && matchesCategory;
  });

  const renderCategoryBadge = (category: { id: string; name: string; slug: string }) => {
    const isActive = filters.category === category.id;
    
    return (
      <button
        key={category.id}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isActive) {
            handleFilterChange('category', 'all');
          } else {
            handleFilterChange('category', category.id);
          }
        }}
        className={`absolute top-2 left-2 px-3 py-1 rounded-full text-sm font-medium z-30 transition-all transform hover:scale-105 ${
          isActive 
            ? 'bg-primary text-white hover:bg-hover-primary' 
            : 'bg-white/90 text-primary hover:bg-white'
        }`}
      >
        {category.name}
      </button>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 md:flex-row flex-col">
        <h1 
          className="text-4xl font-cooper-std mb-4 md:mb-0 transition-colors duration-200"
          style={{ color: isDarkMode ? 'var(--color-primary)' : 'var(--color-secondary)' }}
        >
          Our Products
        </h1>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <Search 
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            placeholder="Search products..."
            className="flex-1"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size</label>
              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
              <input
                type="text"
                value={filters.color}
                onChange={(e) => handleFilterChange('color', e.target.value)}
                placeholder="Enter color"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="Min price"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="Max price"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {(filters.category !== '' && filters.category !== 'all') && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filtered by:</span>
          {categories.map(cat => {
            if (cat.id === filters.category) {
              return (
                <button
                  key={cat.id}
                  onClick={() => handleFilterChange('category', 'all')}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-sm font-medium hover:bg-hover-primary"
                >
                  {cat.name}
                  <XMarkIcon className="w-4 h-4 ml-2" />
                </button>
              );
            }
            return null;
          })}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))
        ) : (
          filteredProducts.map((product) => {
            const selectedQty = getSelectedQuantity(product.id);
            const unitPrice = getActualPrice(product);
            const totalPrice = unitPrice * selectedQty;
            const currentCartItem = items.find(item => item.id === product.id);
            const currentCartQty = currentCartItem ? currentCartItem.quantity : 0;
            const availableQty = product.quantity - currentCartQty;
            const isOutOfStock = availableQty <= 0;

            return (
              <div 
                key={product.id} 
                className="rounded-lg shadow-lg overflow-hidden transition-colors duration-200"
                style={{ backgroundColor: isDarkMode ? 'var(--color-bg-tertiary)' : 'white' }}
              >
                <div className="relative aspect-square">
                  {product.categories && product.categories[0] && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const isActive = filters.category === product.category_id;
                        handleFilterChange('category', isActive ? 'all' : (product.category_id || 'all'));
                      }}
                      className={`absolute top-2 left-2 px-3 py-1 rounded-full text-sm font-medium z-30 transition-all transform hover:scale-105 ${
                        filters.category === product.category_id
                          ? 'bg-primary text-white hover:bg-hover-primary'
                          : 'bg-white/90 text-primary hover:bg-white'
                      }`}
                    >
                      {product.categories[0].name}
                    </button>
                  )}
                  
                  {/* Stock indicator */}
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium z-30 bg-black/50 text-white">
                    {availableQty} left
                  </div>

                  <Link
                    href={product.slug === 'custom-coaster' || product.is_custom ? '/design-my-coaster' : `/product/${product.id}`}
                    className="block relative h-full w-full group"
                  >
                    <Image
                      src={product.image_url || '/placeholder.png'}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition-opacity group-hover:opacity-75"
                      fill
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleQuickView(product);
                          }}
                          className="p-2 bg-white dark:bg-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          aria-label="Quick View"
                        >
                          <EyeIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
                        </button>
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={isOutOfStock}
                          className={`p-2 bg-white dark:bg-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                            isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          aria-label="Add to Cart"
                        >
                          <ShoppingBagIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="p-4 flex flex-col h-full transition-colors duration-200">
                <div style={{ backgroundColor: isDarkMode ? 'var(--color-bg-tertiary)' : 'white' }}>
                  <Link 
                    href={product.slug === 'custom-coaster' || product.is_custom ? '/design-my-coaster' : `/product/${product.id}`} 
                    className="block group"
                  >
                    {product.categories?.[0]?.id && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const isActive = filters.category === product.categories![0].id;
                          handleFilterChange('category', isActive ? 'all' : (product.categories![0].id || 'all'));
                        }}
                        className={`mb-2 px-2 py-1 text-xs rounded-full transition-colors ${
                          filters.category === product.categories![0].id
                            ? 'text-white hover:opacity-80'
                            : 'text-primary hover:opacity-80'
                        }`}
                        style={{ 
                          backgroundColor: filters.category === product.categories![0].id
                            ? 'var(--color-primary)'
                            : 'rgba(67, 198, 195, 0.1)'
                        }}
                      >
                        {product.categories![0].name}
                      </button>
                    )}
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors font-cooper-std" style={{ color: isDarkMode ? 'var(--color-primary)' : 'var(--color-secondary)' }}>
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </Link>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {renderFilterBadge('Size', product.size, 'size')}
                    {renderFilterBadge('Color', product.color, 'color')}
                  </div>
                  
                  </div>
                  <div className="mt-4 h-full">
                    {/* Quantity Selector */}
                    {!isOutOfStock && availableQty > 1 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{availableQty} available</span>
                        </div>
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateProductQuantity(product.id, selectedQty - 1, availableQty);
                            }}
                            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              selectedQty <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={selectedQty <= 1}
                          >
                            <MinusIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </button>
                          <span className="px-4 py-2 text-center min-w-[3rem] border-x border-gray-300 dark:border-gray-600">
                            {selectedQty}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateProductQuantity(product.id, selectedQty + 1, availableQty);
                            }}
                            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              selectedQty >= availableQty ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={selectedQty >= availableQty}
                          >
                            <PlusIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-col">
                        {selectedQty > 1 && !isOutOfStock && availableQty > 1 ? (
                          <>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {getDisplayPrice(product)} each
                            </span>
                            <span 
                              className="text-lg font-bold transition-colors duration-200"
                              style={{ color: isDarkMode ? 'var(--color-secondary)' : '#111827' }}
                            >
                              £{totalPrice.toFixed(2)} total
                            </span>
                          </>
                        ) : (
                          <span 
                            className="text-lg font-bold transition-colors duration-200"
                            style={{ color: isDarkMode ? 'var(--color-secondary)' : '#111827' }}
                          >
                            {getDisplayPrice(product)}
                          </span>
                        )}
                        {hasSalePrice(product) && (
                          <span className="text-sm text-gray-500 line-through">
                            £{(product.cost * selectedQty).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={isOutOfStock}
                        className={`rounded-full px-4 py-2 text-sm text-white transition-colors ${
                          isOutOfStock
                            ? 'opacity-50 cursor-not-allowed bg-gray-400'
                            : 'hover:opacity-80'
                        }`}
                        style={{ 
                          backgroundColor: isOutOfStock ? '#9CA3AF' : 'var(--color-primary)'
                        }}
                      >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalProducts / ITEMS_PER_PAGE)}
        onPageChange={setCurrentPage}
      />

      <QuickView
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct ? {
          ...selectedProduct,
          sale_cost: selectedProduct.sale_cost || null,
          quantity: selectedProduct.quantity || 0
        } : null}
      />
    </div>
  );
} 