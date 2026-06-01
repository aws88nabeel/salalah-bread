import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import toast from 'react-hot-toast';

const statusList = ['pending', 'confirmed', 'baking', 'out_for_delivery', 'delivered', 'cancelled'];
const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  baking: 'قيد الخبز',
  out_for_delivery: 'في الطريق',
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

export default function AdminOrders() {
  const [filter, setFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminOrders', filter],
    queryFn: () => adminApi.getOrders(filter || undefined).then(r => r.data),
    refetchInterval: 15000,
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateStatus(id, status);
      toast.success('تم تحديث الحالة');
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    } catch (err: any) {
      toast.error('فشل التحديث');
    }
  };

  const nextStatus = (current: string): string | null => {
    const idx = statusList.indexOf(current);
    if (idx < statusList.length - 1) return statusList[idx + 1];
    return null;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">إدارة الطلبات</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-primary-500 text-white' : 'bg-gray-100'}`}>الكل</button>
        {statusList.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === s ? 'bg-primary-500 text-white' : 'bg-gray-100'}`}>
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-right py-3">#</th>
                <th className="text-right py-3">العميل</th>
                <th className="text-right py-3">الهاتف</th>
                <th className="text-right py-3">العنوان</th>
                <th className="text-right py-3">المبلغ</th>
                <th className="text-right py-3">التاريخ</th>
                <th className="text-right py-3">الحالة</th>
                <th className="text-right py-3">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                  <td className="py-3">{order.customerName}</td>
                  <td className="py-3">{order.customerPhone}</td>
                  <td className="py-3 max-w-[200px] truncate" title={order.deliveryAddress}>{order.deliveryAddress}</td>
                  <td className="py-3">{Number(order.totalAmount).toFixed(3)} ر.ع.</td>
                  <td className="py-3">{order.deliveryDate}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {nextStatus(order.status) && (
                      <button
                        onClick={() => updateStatus(order.id, nextStatus(order.status)!)}
                        className="text-xs bg-primary-500 text-white px-3 py-1 rounded-lg hover:bg-primary-600"
                      >
                        ← {statusLabels[nextStatus(order.status)!]}
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(order.id, 'cancelled')}
                        className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 mr-1"
                      >
                        إلغاء
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders?.length === 0 && (
            <p className="text-center text-gray-500 py-8">لا توجد طلبات</p>
          )}
        </div>
      )}
    </div>
  );
}
