import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        &copy; 2026 Upstream Literacy. All rights reserved.
      </footer>
    </div>
  );
}
