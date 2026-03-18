import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const totalItems = cart?.total_items ?? 0;

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `transition-colors pb-1 ${
      isActive(path)
        ? 'text-current-accent border-b-2 border-current-accent'
        : 'text-white/80 hover:text-current-light'
    }`;

  return (
    <nav className="bg-ocean-deeper shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/branding/logo.png" alt="Upstream" className="h-10" />
            <span className="font-[family-name:'Playfair_Display'] font-semibold text-white text-lg hidden sm:block">
              Upstream Literacy
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={navLinkClass('/')}>
              Home
            </Link>
            <Link to="/products" className={navLinkClass('/products')}>
              Products
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart */}
            <Link to="/cart" className="relative text-white/80 hover:text-current-light transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-sunbeam text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/account" className="text-white/80 hover:text-current-light transition-colors">
                  {user.first_name || user.username}
                </Link>
                <button
                  onClick={logout}
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-white/80 hover:text-current-light transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-current-accent hover:bg-current-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <Link to="/cart" className="relative text-white/80">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-sunbeam text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white/80"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-3">
            <Link
              to="/"
              className="block text-white/80 hover:text-current-light"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block text-white/80 hover:text-current-light"
              onClick={() => setMenuOpen(false)}
            >
              Products
            </Link>
            {user ? (
              <>
                <Link
                  to="/account"
                  className="block text-white/80 hover:text-current-light"
                  onClick={() => setMenuOpen(false)}
                >
                  Account
                </Link>
                <Link
                  to="/orders"
                  className="block text-white/80 hover:text-current-light"
                  onClick={() => setMenuOpen(false)}
                >
                  Orders
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="block text-white/60 hover:text-white text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-white/80 hover:text-current-light"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block text-current-accent font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
