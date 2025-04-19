'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

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

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      await fetchOrder();
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
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

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-secondary">Order not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-secondary hover:text-primary transition-colors"
        >
          ← Back to Orders
        </button>
        <div className="flex gap-2">
          <select
            value={order.status}
            onChange={(e) => updateOrderStatus(e.target.value)}
            disabled={updating}
            className="px-4 py-2 border border-secondary-border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-neutral rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Order ID:</span> {order.id}</p>
                <p><span className="font-medium">Date:</span> {format(new Date(order.created_at), 'PPP')}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </p>
                <p><span className="font-medium">Total Amount:</span> £{order.total_amount.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {order.delivery_address?.full_name}</p>
                <p><span className="font-medium">Email:</span> {order.user_email || 'Guest Checkout'}</p>
                <p><span className="font-medium">Phone:</span> {order.delivery_address?.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
            <div className="space-y-1">
              <p>{order.delivery_address?.address_line1}</p>
              {order.delivery_address?.address_line2 && (
                <p>{order.delivery_address.address_line2}</p>
              )}
              <p>{order.delivery_address?.city}, {order.delivery_address?.state}</p>
              <p>{order.delivery_address?.postal_code}</p>
              <p>{order.delivery_address?.country}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="bg-white rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-secondary-border">
                <thead>
                  <tr className="bg-neutral">
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-border">
                  {order.order_items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {item.product.image_url && (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded mr-4"
                            />
                          )}
                          <span>{item.product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{item.quantity}</td>
                      <td className="px-6 py-4">£{item.unit_price.toFixed(2)}</td>
                      <td className="px-6 py-4">£{(item.quantity * item.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 