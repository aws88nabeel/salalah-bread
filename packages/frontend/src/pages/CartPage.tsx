import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalAmount, clearCart } = useCartStore();
  const token = useAuthStore(s => s.token);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">سلتك فارغة</h2>
        <p className="text-gray-500 mb-6">أضف بعض الخبز الطازج إلى سلتك</p>
        <Link to="/" className="btn-primary">تصفح القائمة</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">سلة المشتريات</h1>
      <div className="space-y-3 mb-6">
        {items.map(({ menuItem, quantity }) => (
          <div key={menuItem.id} className="card flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold">{menuItem.nameAr}</h3>
              <p className="text-sm text-gray-500">{Number(menuItem.price).toFixed(3)} ر.ع. / للقطعة</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >−</button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >+</button>
            </div>
            <p className="w-20 text-left font-semibold">
              {(Number(menuItem.price) * quantity).toFixed(3)} ر.ع.
            </p>
            <button
              onClick={() => removeItem(menuItem.id)}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">المجموع</span>
          <span className="text-xl font-bold text-primary-600">{totalAmount().toFixed(3)} ر.ع.</span>
        </div>
        <div className="flex gap-3">
          <button onClick={clearCart} className="btn-secondary flex-1">تفريغ السلة</button>
          <Link to={token ? '/checkout' : '/login'} className="btn-primary flex-1 text-center">
            متابعة الطلب
          </Link>
        </div>
      </div>
    </div>
  );
}
