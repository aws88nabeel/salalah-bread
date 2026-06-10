import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore(s => s.totalItems());
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? 'text-primary-600 font-semibold' : 'text-gray-600 hover:text-primary-600';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary-700">
            🥖 طلبات الخبز
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className={isActive('/')}>القائمة</Link>
            {user ? (
              <>
                <Link to="/orders" className={isActive('/orders')}>طلباتي</Link>
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className={isActive('/admin')}>لوحة التحكم</Link>
                    <Link to="/admin/orders" className={isActive('/admin/orders')}>الطلبات</Link>
                  </>
                )}
                <button onClick={logout} className="text-red-500 hover:text-red-700">تسجيل خروج</button>
                <span className="text-gray-500 text-xs">{user.name}</span>
              </>
            ) : (
              <>
                <Link to="/login" className={isActive('/login')}>دخول</Link>
                <Link to="/register" className={isActive('/register')}>تسجيل</Link>
              </>
            )}
            <Link to="/cart" className={`relative ${isActive('/cart')}`}>
              🛒
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        © 2026 طلبات الخبز — طازج كل صباح
      </footer>
    </div>
  );
}
