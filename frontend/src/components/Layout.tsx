import { Link, Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-ocean-deeper border-t-3 border-current-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            {/* Left: Logo + Name */}
            <div className="flex items-center gap-3">
              <img src="/branding/logo.png" alt="Upstream" className="h-10" />
              <span className="font-[family-name:'Playfair_Display'] font-semibold text-white text-lg">
                Upstream Literacy
              </span>
            </div>

            {/* Right: 3 Columns */}
            <div className="grid grid-cols-3 gap-10 text-sm">
              {/* Shop */}
              <div>
                <h4 className="text-current-accent uppercase tracking-wider text-xs font-semibold mb-3">
                  Shop
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link to="/products" className="text-white/60 hover:text-white transition-colors">
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart" className="text-white/60 hover:text-white transition-colors">
                      Cart
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-current-accent uppercase tracking-wider text-xs font-semibold mb-3">
                  Support
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link to="/contact" className="text-white/60 hover:text-white transition-colors">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/faq" className="text-white/60 hover:text-white transition-colors">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Account */}
              <div>
                <h4 className="text-current-accent uppercase tracking-wider text-xs font-semibold mb-3">
                  Account
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link to="/login" className="text-white/60 hover:text-white transition-colors">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="text-white/60 hover:text-white transition-colors">
                      Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" className="text-white/60 hover:text-white transition-colors">
                      Orders
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-white/35 text-sm">
            &copy; 2026 Upstream Education. All rights reserved. | Houston, TX
          </div>
        </div>
      </footer>
    </div>
  );
}
