'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  stripe_session_id: string;
  order_items?: {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    product: {
      name: string;
      image_url?: string;
      is_custom?: boolean;
    };
    design_image_url?: string;
  }[];
  delivery_address?: {
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error('Authentication error');
      }

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          delivery_addresses (*),
          order_items (
            *,
            product:products (
              name,
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-neutral rounded-lg p-6">
                  <div className="h-4 bg-primary-light rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-primary-light rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-main">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-secondary mb-8">Order History</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary-light text-lg">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-neutral rounded-lg shadow-sm p-6">
                <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-secondary-light mb-1">Order ID</p>
                    <p className="font-medium text-secondary">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-light mb-1">Date</p>
                    <p className="font-medium text-secondary">
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-light mb-1">Status</p>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-light mb-1">Total</p>
                    <p className="font-medium text-secondary">
                      £{order.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-secondary-border pt-4">
                  <p className="text-sm text-secondary-light mb-2">Items</p>
                  <div className="space-y-2">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        {item.product.is_custom && item.design_image_url ? (
                          <img
                            src={item.design_image_url}
                            alt="Custom design"
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : item.product.image_url && (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-secondary">{item.product.name}</p>
                          <p className="text-sm text-secondary-light">
                            Quantity: {item.quantity} × £{item.unit_price.toFixed(2)}
                          </p>
                          {item.product.is_custom && item.design_image_url && (
                            <div className="mt-2">
                              <p className="text-sm text-secondary-light mb-1">Custom Design:</p>
                              <div className="flex items-center gap-2">
                                <img
                                  src={item.design_image_url}
                                  alt="Custom design"
                                  className="w-16 h-16 object-cover rounded border border-secondary-border"
                                />
                                <a
                                  href={item.design_image_url}
                                  download
                                  className="text-sm text-primary hover:text-hover-primary"
                                >
                                  Download Design
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.delivery_address && (
                  <div className="border-t border-secondary-border mt-4 pt-4">
                    <p className="text-sm text-secondary-light mb-2">Delivery Address</p>
                    <p className="text-secondary">{order.delivery_address.full_name}</p>
                    <p className="text-secondary-light">
                      {order.delivery_address.address_line1}
                      {order.delivery_address.address_line2 && (
                        <>, {order.delivery_address.address_line2}</>
                      )}
                    </p>
                    <p className="text-secondary-light">
                      {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.postal_code}
                    </p>
                    <p className="text-secondary-light">{order.delivery_address.country}</p>
                    {order.delivery_address.phone && (
                      <p className="text-secondary-light">Phone: {order.delivery_address.phone}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 