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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">🍞</div>
        <h2 className="text-xl font-semibold text-gray-700">مرحباً بك في طلبات الخبز!</h2>
        <p className="text-gray-500 mt-2">قائمة الطعام غير متاحة حالياً، يرجى المحاولة لاحقاً</p>
      </div>
    );
  }

  if (!menu || menu.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">🍞</div>
        <h2 className="text-xl font-semibold text-gray-700">مرحباً بك في طلبات الخبز!</h2>
        <p className="text-gray-500 mt-2">لا توجد أصناف متاحة حالياً</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">خبزنا الطازج</h1>
        <p className="text-gray-500 mt-2">اختر من تشكيلتنا اليومية</p>
      </div>
      {menu.map(category => (
        <section key={category.id} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-r-4 border-primary-500 pr-3">
            {category.nameAr}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.items.map(item => (
              <div key={item.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.nameAr}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                    <p className="text-primary-600 font-bold mt-2">{item.price} ر.ع.</p>
                  </div>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.nameAr} className="w-20 h-20 rounded-lg object-cover ml-3" />
                  )}
                </div>
                <button
                  onClick={() => { addItem(item); toast.success(`تمت إضافة ${item.nameAr}`); }}
                  className="btn-primary w-full mt-3 text-sm"
                >
                  + أضف إلى السلة
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
