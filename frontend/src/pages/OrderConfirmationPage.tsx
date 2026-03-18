import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import type { Order } from '../types';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { useAuth } from '../context/AuthContext';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;
    apiClient
      .get(`/orders/${orderNumber}/`)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
        <Link to="/" className="text-amber-600 hover:text-amber-700 font-medium">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500">
          Order #{order.order_number} <OrderStatusBadge status={order.status} />
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex justify-between">
              <div>
                <p className="text-gray-900 font-medium">{item.product_name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity} x ${item.price}</p>
              </div>
              <span className="font-medium text-gray-900">${item.subtotal}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${order.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>${order.tax}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 text-base pt-2">
            <span>Total</span>
            <span>${order.total}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
        <p className="text-gray-600 text-sm">
          {order.shipping_first_name} {order.shipping_last_name}<br />
          {order.shipping_address_line1}<br />
          {order.shipping_address_line2 && <>{order.shipping_address_line2}<br /></>}
          {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <Link
          to="/products"
          className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Continue Shopping
        </Link>
        {user && (
          <Link
            to="/orders"
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors"
          >
            View Orders
          </Link>
        )}
      </div>
    </div>
  );
}
