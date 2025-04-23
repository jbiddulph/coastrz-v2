'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  user_id: string;
  stripe_session_id: string;
  user_email?: string;
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
  order_items?: {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    product: {
      name: string;
      image_url?: string;
    };
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin/orders?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      console.log('Fetched orders:', data); // Debug log
      
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error('Invalid orders data received:', data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]); // Reset orders on error
    } finally {
      setLoading(false);
    }
  };

  // Refresh orders when component mounts and when pathname changes
  useEffect(() => {
    console.log('Orders component mounted or pathname changed'); // Debug log
    fetchOrders();
  }, [pathname]);

  // Set up interval to refresh orders periodically
  useEffect(() => {
    console.log('Setting up refresh interval'); // Debug log
    const intervalId = setInterval(fetchOrders, 5000); // Refresh every 5 seconds

    return () => {
      console.log('Cleaning up refresh interval'); // Debug log
      clearInterval(intervalId);
    };
  }, []);

  // Handle manual refresh
  const handleRefresh = async () => {
    console.log('Manual refresh triggered'); // Debug log
    await fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-primary rounded-t-lg p-4 flex justify-between items-center">
        <h2 className="text-neutral text-2xl font-bold">Orders ({orders.length})</h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-neutral text-primary rounded hover:bg-neutral-light transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="bg-neutral rounded-b-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-border">
            <thead className="bg-neutral">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Items
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral divide-y divide-secondary-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-primary-light">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-primary hover:text-hover-primary"
                    >
                      {order.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-secondary">
                      {order.delivery_address?.full_name}
                    </div>
                    <div className="text-sm text-secondary-light">
                      {order.user_email || 'Guest'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                    £{order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                    <div className="flex flex-col space-y-1">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <span>{item.quantity}x</span>
                          <span>{item.product.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 