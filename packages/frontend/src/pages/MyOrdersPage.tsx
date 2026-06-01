import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../lib/api';

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  baking: 'قيد الخبز',
  out_for_delivery: 'في الطريق إليك',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  baking: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function MyOrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => ordersApi.getMyOrders().then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">لا توجد طلبات</h2>
        <p className="text-gray-500 mb-6">لم تقم بطلب أي خبز بعد</p>
        <Link to="/" className="btn-primary">تصفح القائمة</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">طلباتي</h1>
      <div className="space-y-3">
        {orders.map(order => (
          <Link
            key={order.id}
            to={`/order/${order.id}`}
            className="card block hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                #{order.id.slice(0, 8)} — {new Date(order.createdAt!).toLocaleDateString('ar-OM')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{order.deliveryDate} — {order.deliveryAddress}</span>
              <span className="font-semibold">{Number(order.totalAmount).toFixed(3)} ر.ع.</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
