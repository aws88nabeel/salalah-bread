import { useParams, Link } from 'react-router-dom';
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

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">الطلب غير موجود</h2>
        <Link to="/" className="btn-primary mt-4 inline-block">العودة للقائمة</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800">تم استلام طلبك!</h1>
        <p className="text-gray-500 mt-1">رقم الطلب: {order.id.slice(0, 8)}</p>
      </div>

      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">حالة الطلب</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>
        <div className="text-sm space-y-2">
          <p><strong>📍 العنوان:</strong> {order.deliveryAddress}</p>
          <p><strong>📅 التاريخ:</strong> {order.deliveryDate}</p>
          {order.notes && <p><strong>📝 ملاحظات:</strong> {order.notes}</p>}
        </div>
      </div>

      {order.items && (
        <div className="card mb-4">
          <h3 className="font-semibold mb-3">المنتجات</h3>
          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>× {item.quantity}</span>
                <span>{Number(item.subtotal).toFixed(3)} ر.ع.</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>المجموع</span>
            <span className="text-primary-600">{Number(order.totalAmount).toFixed(3)} ر.ع.</span>
          </div>
        </div>
      )}

      <div className="text-center">
        <Link to="/" className="btn-primary">العودة للقائمة</Link>
      </div>
    </div>
  );
}
