import React, { useState } from 'react';
import { Product, ProductImage } from '@/types/types';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

interface ProductWithImages extends Product {
  product_images: ProductImage[];
  category_id: string | null;
  status: 'in_stock' | 'sold_out';
}

const Products: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [cost, setCost] = useState('');
  const [saleCost, setSaleCost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductWithImages | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<'in_stock' | 'sold_out'>('in_stock');
  const [products, setProducts] = useState<ProductWithImages[]>([]);

  const supabase = createClient();

  // Set form fields for editing
  const setEditForm = (product: ProductWithImages) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setSize(product.size || '');
    setColor(product.color || '');
    setCost(product.cost?.toString() || '');
    setSaleCost(product.sale_cost?.toString() || '');
    setSelectedCategory(product.category_id || '');
    setFinalImageUrl(product.image_url || null);
    setNewStatus(product.status);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate sale cost is less than original cost
    const originalCost = parseFloat(cost);
    const salePrice = parseFloat(saleCost);
    
    if (salePrice >= originalCost) {
      toast.error('Sale price must be less than original cost');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name,
          description,
          size,
          color,
          cost: originalCost,
          sale_cost: salePrice,
          category_id: selectedCategory,
          image_url: finalImageUrl,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct?.id);

      if (error) throw error;

      toast.success('Product updated successfully');
      setEditingProduct(null);
      fetchProducts(); // Refresh the products list
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), categories(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  return (
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
  );
};

export default Products; 