import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { trackEvent } from '../utils/analytics';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent('page_view', { metadata: { page: 'home' } });
  }, []);

  useEffect(() => {
    Promise.all([
      apiClient.get('/products/featured/').then((res) => res.data.results ?? res.data),
      apiClient.get('/categories/').then((res) => res.data.results ?? res.data),
    ])
      .then(([products, cats]) => {
        setFeatured(products);
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categoryIcons: Record<string, React.ReactNode> = {
    curriculum: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    assessment: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    professional: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
    classroom: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  };

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('curriculum') || lower.includes('reading')) return categoryIcons.curriculum;
    if (lower.includes('assessment') || lower.includes('test') || lower.includes('data')) return categoryIcons.assessment;
    if (lower.includes('professional') || lower.includes('training') || lower.includes('pd')) return categoryIcons.professional;
    return categoryIcons.classroom;
  };

  return (
    <div>
      {/* Hero */}
      <section
        className="relative py-24 px-4 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 80%, rgba(68, 192, 197, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(252, 215, 57, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #153548 0%, #286181 50%, #337a9e 100%)
          `,
        }}
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-current-accent/15 border border-current-accent/30 text-current-light text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">
            Research-Backed Curriculum
          </div>

          <h1 className="font-[family-name:'Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Empowering <span className="text-sunbeam">Literacy</span> for Every Learner
          </h1>

          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Improving K-5 reading outcomes with research-backed materials and tools designed for educators, parents, and students.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-sunbeam hover:bg-sunbeam-dark text-gray-900 font-semibold px-8 py-3.5 rounded-lg text-base transition-colors shadow-lg hover:shadow-xl"
            >
              Browse Products
            </Link>
            <a
              href="#featured"
              className="inline-flex items-center gap-2 border border-white/40 hover:border-white/60 text-white/90 hover:text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {[
              'Evidence-Based Approach',
              'Trusted by 500+ Schools',
              'Free Shipping on Orders $150+',
              'Educator Discounts Available',
            ].map((text) => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-current-accent flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:'Playfair_Display'] text-3xl font-bold text-ocean-deeper mb-3">
            Featured Products
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-4">
            Hand-picked resources designed to accelerate reading growth in every classroom.
          </p>
          <div className="w-16 h-0.5 bg-current-accent mx-auto" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current-accent" />
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No featured products available.</p>
        )}
      </section>

      {/* Shop by Category */}
      <section className="bg-ocean-deeper py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:'Playfair_Display'] text-3xl font-bold text-white mb-3">
              Shop by Category
            </h2>
            <div className="w-16 h-0.5 bg-sunbeam mx-auto" />
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-xl p-6 text-center transition-all duration-300 hover:bg-current-accent/10 hover:border-current-accent/30"
                >
                  <div className="text-white/60 group-hover:text-current-accent transition-colors mb-4 flex justify-center">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <h3 className="font-[family-name:'Playfair_Display'] text-white font-semibold text-lg mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-white/50 text-sm">
                    {cat.product_count ?? 0} {(cat.product_count ?? 0) === 1 ? 'product' : 'products'}
                  </p>
                </Link>
              ))}
            </div>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/40" />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
