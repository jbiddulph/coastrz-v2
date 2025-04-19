'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Pagination from './Pagination';
import Search from './Search';
import { ChevronUpIcon, ChevronDownIcon, FunnelIcon, ShoppingBagIcon, EyeIcon } from '@heroicons/react/24/solid';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import ShoppingCart from './ShoppingCart';
import Link from 'next/link';
import QuickView from './QuickView';
import { Product, ProductImage } from '@/types/types';

type SortField = 'name' | 'size' | 'cost';
type SortOrder = 'asc' | 'desc';

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
    gender: '',
    minPrice: '',
    maxPrice: '',
    size: '',
    color: ''
  });
  const { addItem } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewImages, setQuickViewImages] = useState<ProductImage[]>([]);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const ITEMS_PER_PAGE = 12;
  const supabase = createClient();

  useEffect(() => {
    fetchTotalProducts();
    fetchProducts();
  }, [currentPage, searchQuery, sortField, sortOrder, filters]);

  const fetchTotalProducts = async () => {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Apply filters
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    if (filters.gender) {
      query = query.eq('gender', filters.gender);
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

    const { count, error } = await query;

    if (!error) {
      setTotalProducts(count || 0);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*')
      .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

    // Apply filters
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    if (filters.gender) {
      query = query.eq('gender', filters.gender);
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

    // Add sorting
    if (sortField === 'size') {
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      query = query.order('size', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order(sortField, { ascending: sortOrder === 'asc' });
    }

    const { data, error } = await query;

    if (!error && data) {
      // If sorting by size, do additional client-side sorting
      if (sortField === 'size') {
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        data.sort((a, b) => {
          const aIndex = sizeOrder.indexOf(a.size || '');
          const bIndex = sizeOrder.indexOf(b.size || '');
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return sortOrder === 'asc' ? aIndex - bIndex : bIndex - aIndex;
        });
      }
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
      gender: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      color: ''
    });
    setCurrentPage(1);
  };

  const renderFilterBadge = (label: string, value: string | undefined, filterType: 'size' | 'color' | 'gender') => {
    if (!value) return null;
    
    const isActive = filters[filterType] === value;
    
    return (
      <button
        onClick={() => {
          if (isActive) {
            handleFilterChange(filterType, '');
          } else {
            setShowFilters(true);
            handleFilterChange(filterType, value);
          }
        }}
        className={`text-xs px-2 py-1 rounded-full transition-colors ${
          isActive 
            ? 'bg-primary text-white hover:bg-hover-primary' 
            : 'bg-neutral hover:bg-primary hover:text-white'
        }`}
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-secondary font-cooper-std">Our Products</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Search
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            placeholder="Search products..."
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 bg-primary text-neutral rounded-lg hover:bg-hover-primary transition-colors"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
            <button
              onClick={() => setShowCart(!showCart)}
              className="flex items-center justify-center px-4 py-2 bg-primary text-neutral rounded-lg hover:bg-hover-primary transition-colors relative"
            >
              <ShoppingBagIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:flex-grow">
          {showFilters && (
            <div className="bg-neutral rounded-lg p-4 mb-8 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Gender</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    className="w-full p-2 border border-secondary-border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Size</label>
                  <select
                    value={filters.size}
                    onChange={(e) => handleFilterChange('size', e.target.value)}
                    className="w-full p-2 border border-secondary-border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Color</label>
                  <input
                    type="text"
                    value={filters.color}
                    onChange={(e) => handleFilterChange('color', e.target.value)}
                    placeholder="Enter color"
                    className="w-full p-2 border border-secondary-border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Min Price</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min price"
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-secondary-border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Max Price</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max price"
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-secondary-border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-secondary hover:text-primary transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="flex justify-center items-center h-64 text-secondary-light text-lg">
                  No products found
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <Link
                        href={`/product/${product.id}`}
                        className="block aspect-square relative cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={product.image_url || '/placeholder.png'}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleQuickView(product);
                          }}
                          className="absolute bottom-4 right-4 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-opacity"
                        >
                          <EyeIcon className="h-5 w-5 text-secondary" />
                        </button>
                      </Link>
                      <div className="p-4">
                        <Link href={`/product/${product.id}`} className="inline-block">
                          <h3 className="text-lg font-semibold mb-2 text-secondary hover:text-primary transition-colors">{product.name}</h3>
                        </Link>
                        <p className="text-secondary-light text-sm mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {renderFilterBadge('Size', product.size, 'size')}
                          {renderFilterBadge('Color', product.color, 'color')}
                          {renderFilterBadge('Gender', product.gender, 'gender')}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-primary font-bold">
                            £{product.cost.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleQuickView(product)}
                            className="text-primary hover:text-hover-primary"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalProducts / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {showCart && (
          <div className="lg:w-96 bg-neutral rounded-lg shadow-lg">
            <ShoppingCart />
          </div>
        )}
      </div>

      {selectedProduct && (
        <QuickView
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          product={selectedProduct}
          images={quickViewImages}
        />
      )}
    </div>
  );
} 