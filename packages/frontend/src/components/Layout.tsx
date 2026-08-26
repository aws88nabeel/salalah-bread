import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore(s => s.totalItems());
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60'
      : 'text-warm-600 hover:text-amber-700 hover:bg-warm-100/70 px-3 py-1.5 rounded-lg transition-colors';

  return (
    <div className="min-h-screen flex flex-col bg-warm-50 text-warm-900 font-sans">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 text-amber-50 text-xs py-2 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
        <span>📍 توصيل طازج يومياً لجميع أحياء صلالة</span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline">✨ اطلب الآن واختَر موعد التوصيل المناسب لك</span>
      </div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-warm-200/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              🥖
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-amber-900 group-hover:text-amber-700 transition-colors">
                طلبات الخبز
              </span>
              <span className="text-[10px] text-amber-600 font-semibold -mt-1 tracking-wider">
                مخبز صلالة
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2 text-sm">
            <Link to="/" className={isActive('/')}>القائمة</Link>

            {user ? (
              <>
                <Link to="/orders" className={isActive('/orders')}>طلباتي</Link>
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className={isActive('/admin')}>لوحة التحكم</Link>
                    <Link to="/admin/orders" className={isActive('/admin/orders')}>إدارة الطلبات</Link>
                  </>
                )}
              </>
            ) : null}

            {/* Cart Link */}
            <Link
              to="/cart"
              className={`relative flex items-center gap-1.5 ${
                location.pathname === '/cart'
                  ? 'bg-amber-600 text-white font-semibold px-3.5 py-1.5 rounded-lg shadow-sm'
                  : 'bg-warm-100 hover:bg-amber-50 text-warm-800 hover:text-amber-700 px-3.5 py-1.5 rounded-lg transition-all border border-warm-200'
              }`}
            >
              <span className="text-base">🛒</span>
              <span className="hidden sm:inline font-medium text-xs"> السلة</span>
              {totalItems > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-sm animate-bounce-short">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-2 mr-2 border-r border-warm-200 pr-2">
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-warm-800 truncate max-w-[100px]">{user.name}</span>
                  <span className="text-[10px] text-amber-600 font-semibold capitalize">{user.role === 'admin' ? 'مدير' : 'عميل'}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-medium px-2.5 py-1.5 rounded-lg transition-colors border border-red-100"
                  title="تسجيل خروج"
                >
                  خروج
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mr-1 border-r border-warm-200 pr-2">
                <Link to="/login" className="text-xs font-semibold text-amber-800 hover:text-amber-900 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                  دخول
                </Link>
                <Link to="/register" className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all">
                  تسجيل جديد
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-warm-200 py-8 mt-12 text-warm-700">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🥖</span>
              <span className="font-bold text-lg text-amber-900">طلبات الخبز صلالة</span>
            </div>
            <p className="text-warm-500 leading-relaxed text-xs">
              نقدم لكم أفضل المخبوزات الطازجة يومياً في مدينة صلالة، مُعدة بشغف بأعلى معايير الجودة والتوصيل السريع مباشرة إلى باب منزلكم.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-warm-900 mb-3 text-sm">مواعيد التوصيل والخدمة</h4>
            <ul className="space-y-1.5 text-xs text-warm-600">
              <li>🌅 الفترة الصباحية: ٠٦:٠٠ ص — ٠٩:٠٠ ص</li>
              <li>🌆 الفترة المسائية: ٠٤:٠٠ م — ٠٨:٠٠ م</li>
              <li>📍 نطاق التوصيل: كافة أحياء مدينة صلالة</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-warm-900 mb-3 text-sm">روابط سريعة</h4>
            <div className="flex flex-col space-y-1.5 text-xs text-warm-600">
              <Link to="/" className="hover:text-amber-700 transition-colors">قائمة الخبز والمخبوزات</Link>
              <Link to="/orders" className="hover:text-amber-700 transition-colors">متابعة طلباتي</Link>
              <a href="#support" className="hover:text-amber-700 transition-colors">الدعم وخدمة العملاء</a>
            </div>
          </div>
        </div>
        <div className="border-t border-warm-100 max-w-6xl mx-auto mt-6 pt-4 px-4 flex flex-col sm:flex-row justify-between items-center text-xs text-warm-400 gap-2">
          <span>© 2026 طلبات الخبز — جميع الحقوق محفوظة</span>
          <span>صُنِع بشغف في صلالة 🇴🇲</span>
        </div>
      </footer>
    </div>
  );
}
