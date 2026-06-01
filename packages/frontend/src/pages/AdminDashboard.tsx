import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminApi.getStats().then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => adminApi.getOrders().then(r => r.data),
    refetchInterval: 15000,
  });

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">لوحة التحكم</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <div className="text-3xl font-bold text-primary-600">{stats?.totalOrders || 0}</div>
              <div className="text-sm text-gray-500">إجمالي الطلبات</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-green-600">{stats?.todayOrders || 0}</div>
              <div className="text-sm text-gray-500">طلبات اليوم</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-blue-600">{stats?.totalRevenue?.toFixed(3) || '0.000'}</div>
              <div className="text-sm text-gray-500">إجمالي الإيرادات (ر.ع.)</div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">آخر الطلبات</h2>
              <Link to="/admin/orders" className="text-sm text-primary-600 hover:underline">عرض الكل</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-right py-2">#</th>
                    <th className="text-right py-2">العميل</th>
                    <th className="text-right py-2">المبلغ</th>
                    <th className="text-right py-2">التاريخ</th>
                    <th className="text-right py-2">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders?.slice(0, 10).map(order => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 font-mono text-xs">{order.id.slice(0, 8)}</td>
                      <td className="py-2">{order.customerName}</td>
                      <td className="py-2">{Number(order.totalAmount).toFixed(3)} ر.ع.</td>
                      <td className="py-2">{order.deliveryDate}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
