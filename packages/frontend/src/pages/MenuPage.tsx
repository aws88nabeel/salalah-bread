import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '../lib/api';
import { useCartStore } from '../stores/cart';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const { data: menu, isLoading, error } = useQuery({
    queryKey: ['menu'],
    queryFn: () => menuApi.getAll().then(r => r.data),
  });

  const addItem = useCartStore(s => s.addItem);
  const cartItems = useCartStore(s => s.items);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get item quantity in cart
  const getItemQuantity = (itemId: string) => {
    const found = cartItems.find(i => i.menuItem.id === itemId);
    return found ? found.quantity : 0;
  };

  const filteredCategories = useMemo(() => {
    if (!menu) return [];

    return menu
      .map(category => {
        const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory;
        if (!matchesCategory) return null;

        const filteredItems = category.items.filter(item => {
          const query = searchQuery.toLowerCase().trim();
          if (!query) return true;
          return (
            item.nameAr.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query)) ||
            (item.nameEn && item.nameEn.toLowerCase().includes(query))
          );
        });

        if (filteredItems.length === 0) return null;

        return {
          ...category,
          items: filteredItems,
        };
      })
      .filter(Boolean);
  }, [menu, selectedCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Hero Skeleton */}
        <div className="h-64 bg-warm-200 rounded-3xl w-full"></div>
        {/* Category Filter Skeleton */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 w-28 bg-warm-200 rounded-full shrink-0"></div>
          ))}
        </div>
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-warm-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-warm-200 p-8 shadow-sm">
        <div className="text-6xl mb-4">🌾</div>
        <h2 className="text-2xl font-bold text-warm-900">مرحباً بك في طلبات الخبز!</h2>
        <p className="text-warm-500 mt-2">عذراً، تعذر تحميل قائمة الطعام حالياً. يرجى المحاولة لاحقاً.</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary mt-6 mx-auto"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white p-8 sm:p-12 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-amber-600/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-200 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
            <span>✨ مخبوزات طازجة يومياً من فرن صلالة</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-amber-50 leading-tight">
            استمتع بطعم الخبز الأصيل يأتيك طازجاً
          </h1>

          <p className="text-amber-100/80 text-sm sm:text-base leading-relaxed">
            اختبر تشكيلتنا الغنية من الخبز العماني التقليدي، الخبز الأوروبي، والمخبوزات الصحية المصنوعة بأجود المكونات.
          </p>

          {/* Search Box */}
          <div className="pt-2">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث عن نوع الخبز المفضل لديك..."
                className="w-full pl-10 pr-12 py-3.5 bg-white/95 text-warm-900 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-warm-400 text-sm font-medium"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-warm-400">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 text-sm bg-warm-100 rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Floating Bread Visual Badge */}
        <div className="hidden lg:flex absolute left-8 bottom-8 top-8 items-center justify-center">
          <div className="text-[140px] leading-none drop-shadow-2xl hover:scale-105 transition-transform duration-300">
            🥖
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
            selectedCategory === 'all'
              ? 'bg-amber-600 text-white shadow-md scale-105'
              : 'bg-white text-warm-700 hover:bg-amber-50 border border-warm-200'
          }`}
        >
          🥐 الكل ({menu.reduce((acc, cat) => acc + cat.items.length, 0)})
        </button>

        {menu.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-amber-600 text-white shadow-md scale-105'
                : 'bg-white text-warm-700 hover:bg-amber-50 border border-warm-200'
            }`}
          >
            {category.nameAr} ({category.items.length})
          </button>
        ))}
      </div>

      {/* Product Grid by Category */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-warm-200 p-8 shadow-sm">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-xl font-bold text-warm-800">لم نجد أصنافاً تطابق بحثك</h3>
          <p className="text-warm-500 text-sm mt-1">جرب البحث بكلمات أخرى أو تصفح جميع الأقسام</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="btn-secondary mt-4 text-xs mx-auto"
          >
            إعادة ضبط البحث
          </button>
        </div>
      ) : (
        filteredCategories.map(category => (
          category && (
            <section key={category.id} className="space-y-4">
              <div className="flex items-center gap-3 border-r-4 border-amber-600 pr-3">
                <h2 className="text-2xl font-black text-warm-900 tracking-tight">
                  {category.nameAr}
                </h2>
                <span className="text-xs text-warm-500 font-semibold bg-warm-100 px-2.5 py-1 rounded-full">
                  {category.items.length} أصناف
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map(item => {
                  const qtyInCart = getItemQuantity(item.id);

                  return (
                    <div
                      key={item.id}
                      className="group bg-white rounded-2xl border border-warm-200/80 p-5 shadow-soft hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                    >
                      <div>
                        {/* Image or Icon Container */}
                        <div className="relative h-44 w-full bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-xl overflow-hidden mb-4 flex items-center justify-center border border-amber-100">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.nameAr}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                              🥖
                            </span>
                          )}

                          {/* Price Badge */}
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-amber-900 font-black text-xs px-3 py-1.5 rounded-xl shadow-sm border border-amber-200/60">
                            {Number(item.price).toFixed(3)} ر.ع.
                          </div>

                          {qtyInCart > 0 && (
                            <div className="absolute top-3 right-3 bg-amber-600 text-white font-bold text-xs px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
                              <span>سلتك:</span>
                              <span>{qtyInCart}</span>
                            </div>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg text-warm-900 group-hover:text-amber-800 transition-colors">
                            {item.nameAr}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-warm-600 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 mt-2 border-t border-warm-100 flex items-center justify-between gap-3">
                        <button
                          onClick={() => {
                            addItem(item);
                            toast.success(`تمت إضافة "${item.nameAr}" إلى السلة 🥖`, {
                              style: { borderRadius: '12px', background: '#292524', color: '#fff' },
                            });
                          }}
                          className="btn-primary w-full py-2.5 text-xs font-bold"
                        >
                          <span>+ أضف إلى السلة</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )
        ))
      )}
    </div>
  );
}
