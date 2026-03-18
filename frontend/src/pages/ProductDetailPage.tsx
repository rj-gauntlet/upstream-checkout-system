import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiClient
      .get(`/products/${slug}/`)
      .then((res) => setProduct(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // Handle error
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current-accent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-ocean-deeper mb-4 font-[family-name:'Playfair_Display']">Product Not Found</h2>
        <Link to="/products" className="text-current-accent hover:text-current-dark font-medium">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/products" className="text-current-accent hover:text-current-dark text-sm font-medium mb-6 inline-block">
        &larr; Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.primary_image ? (
            <img
              src={product.primary_image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-current-accent font-medium mb-2">{product.category_name}</p>
          <h1 className="text-3xl font-bold text-ocean-deeper mb-4 font-[family-name:'Playfair_Display']">{product.name}</h1>
          <p className="text-3xl font-bold text-ocean mb-6">${product.price}</p>

          {product.description && (
            <div className="text-gray-600 mb-6 leading-relaxed">
              <p>{product.description}</p>
            </div>
          )}

          {/* Stock status */}
          <div className="mb-6">
            {product.in_stock ? (
              <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-600 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Out of Stock
              </span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {product.in_stock && (
            <div className="space-y-4">
              <div className="flex items-center border border-ocean/20 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-ocean-mist transition-colors rounded-l-lg"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-medium border-x border-ocean/20">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-ocean-mist transition-colors rounded-r-lg"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full bg-current-accent hover:bg-current-dark disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {added ? 'Added!' : adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}

          {product.sku && (
            <p className="text-xs text-gray-400 mt-6">SKU: {product.sku}</p>
          )}
        </div>
      </div>
    </div>
  );
}
