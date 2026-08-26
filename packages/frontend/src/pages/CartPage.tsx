import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalAmount, clearCart } = useCartStore();
  const token = useAuthStore(s => s.token);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-warm-200 p-8 shadow-soft my-8">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 border border-amber-200/80">
          🛒
        </div>
        <h2 className="text-2xl font-bold text-warm-900 mb-2">سلتك فارغة</h2>
        <p className="text-warm-500 text-sm mb-6 leading-relaxed">
          لم تقم بإضافة أي أنواع من الخبز أو المخبوزات حتى الآن. استمتع بتصفح قائمتنا اليومية!
        </p>
        <Link to="/" className="btn-primary w-full text-sm py-3">
          تصفح قائمة الخبز 🥖
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-warm-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-900">سلة المشتريات</h1>
          <p className="text-xs text-warm-500 mt-0.5">لديك {items.length} أصناف في سلتك</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold px-3 py-1.5 rounded-lg transition-colors border border-red-100"
        >
          تفريغ السلة 🗑️
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {items.map(({ menuItem, quantity }) => (
          <div
            key={menuItem.id}
            className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-warm-200 hover:border-amber-300 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-2xl shrink-0">
                {menuItem.imageUrl ? (
                  <img src={menuItem.imageUrl} alt={menuItem.nameAr} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  '🥖'
                )}
              </div>
              <div>
                <h3 className="font-bold text-warm-900 text-base">{menuItem.nameAr}</h3>
                <p className="text-xs text-warm-500">{Number(menuItem.price).toFixed(3)} ر.ع. / للقطعة</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-warm-100">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2 bg-warm-100/80 p-1 rounded-xl border border-warm-200">
                <button
                  onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-amber-100 text-amber-900 font-bold flex items-center justify-center shadow-sm text-sm transition-colors"
                  title="إنقاص الكمية"
                >
                  −
                </button>
                <span className="w-8 text-center font-extrabold text-sm text-warm-900">{quantity}</span>
                <button
                  onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-amber-100 text-amber-900 font-bold flex items-center justify-center shadow-sm text-sm transition-colors"
                  title="زيادة الكمية"
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-left font-black text-amber-900 text-base w-24">
                {(Number(menuItem.price) * quantity).toFixed(3)} ر.ع.
              </div>

              {/* Delete Button */}
              <button
                onClick={() => removeItem(menuItem.id)}
                className="text-warm-400 hover:text-red-600 transition-colors p-1"
                title="إزالة الصنف"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Total Summary Box */}
      <div className="card bg-gradient-to-br from-white to-amber-50/50 border border-amber-200/80 p-6 space-y-4">
        <h3 className="font-bold text-warm-900 text-lg border-b border-warm-200/60 pb-2">ملخص الحساب</h3>
        <div className="space-y-2 text-sm text-warm-600">
          <div className="flex justify-between">
            <span>مجموع المشتريات</span>
            <span>{totalAmount().toFixed(3)} ر.ع.</span>
          </div>
          <div className="flex justify-between">
            <span>رسوم التوصيل (صلالة)</span>
            <span className="text-green-600 font-semibold">مجاني 🎉</span>
          </div>
        </div>

        <div className="border-t border-warm-200 pt-3 flex justify-between items-center text-lg font-black text-warm-900">
          <span>المبلغ الإجمالي</span>
          <span className="text-2xl text-amber-800">{totalAmount().toFixed(3)} ر.ع.</span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link to="/" className="btn-secondary flex-1 text-center text-sm">
            ← إضافة المزيد
          </Link>
          <Link
            to={token ? '/checkout' : '/login'}
            className="btn-primary flex-1 text-center text-sm py-3 font-bold shadow-md"
          >
            متابعة لطلب التوصيل ←
          </Link>
        </div>
      </div>
    </div>
  );
}
