import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addItem(product.id);
    } catch {
      // Handle error silently
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block bg-white rounded-xl border border-ocean/5 shadow-sm hover:shadow-lg hover:-translate-y-1.5 hover:border-current-accent/20 transition-all duration-300 overflow-hidden"
    >
      <div className="h-44 bg-gradient-to-br from-ocean-mist to-current-mist relative overflow-hidden">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ocean-light/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
        )}
        {!product.in_stock && (
          <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-[0.65rem] font-bold uppercase tracking-wide px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
        {product.featured && product.in_stock && (
          <div className="absolute top-2 left-2 bg-sunbeam text-gray-900 text-[0.65rem] font-bold uppercase tracking-wide px-2 py-1 rounded">
            Featured
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-current-accent text-xs font-semibold uppercase tracking-wider mb-1">
          {product.category_name}
        </p>
        <h3 className="font-[family-name:'Playfair_Display'] font-semibold text-gray-900 mb-1 group-hover:text-ocean transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-ocean">${product.price}</span>
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock || adding}
            className="bg-current-accent hover:bg-current-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-md transition-colors"
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
