import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import type { Product, Category, PaginatedResponse } from '../types';
import ProductCard from '../components/ProductCard';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const currentCategory = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 12;

  useEffect(() => {
    apiClient
      .get('/categories/')
      .then((res) => setCategories(res.data.results ?? res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {
      page: String(currentPage),
    };
    if (currentCategory) params.category = currentCategory;
    const searchQuery = searchParams.get('search');
    if (searchQuery) params.search = searchQuery;

    apiClient
      .get<PaginatedResponse<Product>>('/products/', { params })
      .then((res) => {
        setProducts(res.data.results);
        setTotalCount(res.data.count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentCategory, currentPage, searchParams]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search, page: '1' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-ocean-deeper mb-8 font-[family-name:'Playfair_Display']">Products</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-1 border border-ocean/20 rounded-l-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none"
              />
              <button
                type="submit"
                className="bg-current-accent hover:bg-current-dark text-white px-4 py-2 rounded-r-lg text-sm font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-ocean-deeper mb-3">Categories</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => updateParams({ category: '', page: '1' })}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !currentCategory
                      ? 'bg-current-mist text-current-accent border-l-2 border-current-accent font-medium'
                      : 'text-gray-600 hover:text-ocean hover:bg-ocean-mist'
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => updateParams({ category: cat.slug, page: '1' })}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentCategory === cat.slug
                        ? 'bg-current-mist text-current-accent border-l-2 border-current-accent font-medium'
                        : 'text-gray-600 hover:text-ocean hover:bg-ocean-mist'
                    }`}
                  >
                    {cat.name}
                    {cat.product_count !== undefined && (
                      <span className="text-gray-400 ml-1">({cat.product_count})</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current-accent" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => updateParams({ page: String(currentPage - 1) })}
                    disabled={currentPage <= 1}
                    className="px-3 py-2 rounded-lg border border-ocean/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ocean-mist transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => updateParams({ page: String(currentPage + 1) })}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-2 rounded-lg border border-ocean/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ocean-mist transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
