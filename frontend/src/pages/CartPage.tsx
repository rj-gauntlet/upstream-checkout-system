import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartSummary from '../components/CartSummary';

function DebouncedQuantityInput({ value, max, onChange }: { value: number; max: number; onChange: (qty: number) => void }) {
  const [localValue, setLocalValue] = useState(String(value));
  const [stockWarning, setStockWarning] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const commitChange = (qty: number) => {
    const clamped = Math.max(1, Math.min(max, Math.floor(qty)));
    setStockWarning(qty > max);
    if (qty > max) setTimeout(() => setStockWarning(false), 2000);
    if (clamped !== value) onChange(clamped);
    setLocalValue(String(clamped));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setLocalValue(raw);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (raw && parseInt(raw) > 0) {
      debounceRef.current = setTimeout(() => commitChange(parseInt(raw)), 500);
    }
  };

  const handleBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const num = parseInt(localValue) || 1;
    commitChange(num);
  };

  return (
    <div>
      <div className="flex items-center border border-ocean/20 rounded">
        <button
          onClick={() => { if (debounceRef.current) clearTimeout(debounceRef.current); commitChange(value - 1); }}
          className="px-2 py-1 text-gray-600 hover:bg-ocean-mist text-sm transition-colors"
        >-</button>
        <input
          type="text"
          inputMode="numeric"
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="w-10 text-center py-1 text-sm border-x border-ocean/20 outline-none"
        />
        <button
          onClick={() => { if (debounceRef.current) clearTimeout(debounceRef.current); commitChange(value + 1); }}
          className="px-2 py-1 text-gray-600 hover:bg-ocean-mist text-sm transition-colors"
        >+</button>
      </div>
      {stockWarning && <p className="text-xs text-amber-600 mt-1">Only {max} available</p>}
    </div>
  );
}

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current-accent" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-ocean-light/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h2 className="text-2xl font-bold text-ocean-deeper mb-2 font-[family-name:'Playfair_Display']">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added any products yet.</p>
        <Link
          to="/products"
          className="inline-block bg-current-accent hover:bg-current-dark text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-ocean-deeper mb-8 font-[family-name:'Playfair_Display']">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-ocean/5 p-4 flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {item.product.primary_image ? (
                  <img
                    src={item.product.primary_image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.product.slug}`}
                  className="font-semibold text-gray-900 hover:text-current-accent transition-colors"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-ocean">${item.product.price} each</p>

                <div className="flex items-center justify-between mt-2">
                  <DebouncedQuantityInput
                    value={item.quantity}
                    max={item.product.stock}
                    onChange={(qty) => updateQuantity(item.id, qty)}
                  />

                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">${item.subtotal}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-80">
          <CartSummary
            subtotal={cart.subtotal}
            ctaLabel="Proceed to Checkout"
            onCtaClick={() => navigate('/checkout')}
          />
        </div>
      </div>
    </div>
  );
}
