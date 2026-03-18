import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CheckoutForm, { type CheckoutFormData } from '../components/CheckoutForm';
import CartSummary from '../components/CartSummary';
import StripePaymentForm from '../components/StripePaymentForm';
import PayPalButton from '../components/PayPalButton';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');
const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email || '',
    shipping_first_name: user?.first_name || '',
    shipping_last_name: user?.last_name || '',
    shipping_address_line1: user?.profile?.address_line1 || '',
    shipping_address_line2: '',
    shipping_city: user?.profile?.city || '',
    shipping_state: user?.profile?.state || '',
    shipping_zip_code: user?.profile?.zip_code || '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const paypalOptions = useMemo(() => ({
    clientId: paypalClientId,
    currency: 'USD',
  }), []);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-ocean-deeper mb-4 font-[family-name:'Playfair_Display']">Your cart is empty</h2>
        <a href="/products" className="text-current-accent hover:text-current-dark font-medium">
          Browse Products
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Create order
      const orderRes = await apiClient.post('/checkout/', {
        ...formData,
        payment_method: paymentMethod,
      });

      const newOrderNumber = orderRes.data.order_number;
      setOrderNumber(newOrderNumber);
      localStorage.setItem('checkout_email', formData.email);

      if (paymentMethod === 'stripe') {
        // Get Stripe payment intent
        const intentRes = await apiClient.post('/payments/stripe/create-intent/', {
          order_number: newOrderNumber,
        });
        setClientSecret(intentRes.data.client_secret);
      }
      // PayPal handled by its own button flow
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create order. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStripeSuccess = async () => {
    await refreshCart();
    if (orderNumber) {
      navigate(`/order-confirmation/${orderNumber}`);
    }
  };

  const handleStripeError = (msg: string) => {
    setError(msg);
  };

  const handlePayPalCreateOrder = async () => {
    let currentOrderNumber = orderNumber;

    if (!currentOrderNumber) {
      // Create order first if not already created
      const orderRes = await apiClient.post('/checkout/', {
        ...formData,
        payment_method: 'paypal',
      });
      currentOrderNumber = orderRes.data.order_number;
      setOrderNumber(currentOrderNumber);
      localStorage.setItem('checkout_email', formData.email);
    }

    const paypalRes = await apiClient.post('/payments/paypal/create-order/', {
      order_number: currentOrderNumber,
    });
    return paypalRes.data.paypal_order_id;
  };

  const handlePayPalApprove = async (data: { orderID: string }) => {
    // Capture the PayPal payment on our backend
    await apiClient.post('/payments/paypal/capture/', {
      paypal_order_id: data.orderID,
    });
    await refreshCart();
    if (orderNumber) {
      navigate(`/order-confirmation/${orderNumber}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-ocean-deeper mb-8 font-[family-name:'Playfair_Display']">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {!clientSecret ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-xl shadow-sm border border-ocean/5 p-6">
                <CheckoutForm data={formData} onChange={setFormData} />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-ocean/5 p-6">
                <h3 className="text-lg font-semibold text-ocean-deeper mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className="accent-current-accent"
                    />
                    <span className="text-gray-700">Credit / Debit Card (Stripe)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="accent-current-accent"
                    />
                    <span className="text-gray-700">PayPal</span>
                  </label>
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              {paymentMethod === 'stripe' && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-current-accent hover:bg-current-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
                >
                  {submitting ? 'Processing...' : 'Continue to Payment'}
                </button>
              )}

              {paymentMethod === 'paypal' && (
                <PayPalScriptProvider options={paypalOptions}>
                  <PayPalButton
                    createOrderHandler={handlePayPalCreateOrder}
                    onApproveHandler={handlePayPalApprove}
                  />
                </PayPalScriptProvider>
              )}
            </form>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-ocean/5 p-6">
              <h3 className="text-lg font-semibold text-ocean-deeper mb-4">Payment Details</h3>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm
                  clientSecret={clientSecret}
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                />
              </Elements>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:w-80">
          <CartSummary subtotal={cart.subtotal} />
          <div className="bg-white rounded-xl shadow-sm border border-ocean/5 p-4 mt-4">
            <h4 className="font-medium text-ocean-deeper text-sm mb-3">Items ({cart.total_items})</h4>
            <div className="space-y-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">
                    {item.product.name} x{item.quantity}
                  </span>
                  <span className="text-gray-900 shrink-0">${item.subtotal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
