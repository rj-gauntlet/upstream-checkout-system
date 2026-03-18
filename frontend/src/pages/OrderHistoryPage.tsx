import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import type { Order } from '../types';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/orders/')
      .then((res) => setOrders(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-ocean-deeper mb-8 font-[family-name:'Playfair_Display']">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Link
            to="/products"
            className="text-current-accent hover:text-current-dark font-medium"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden shadow-sm border border-ocean/5">
          <table className="w-full">
            <thead className="bg-ocean-mist">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-ocean-deeper uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ocean-deeper uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ocean-deeper uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-ocean-deeper uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-ocean-mist/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      to={`/order-confirmation/${order.order_number}`}
                      className="text-current-accent hover:text-current-dark font-medium text-sm"
                    >
                      #{order.order_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium text-right">
                    ${order.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
