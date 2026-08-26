import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminApi.getStats().then(r => r.data),
    refetchInterval: 15000,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => adminApi.getOrders().then(r => r.data),
    refetchInterval: 10000,
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
    pending: 'bg-amber-100 text-amber-900 border-amber-300',
    confirmed: 'bg-blue-100 text-blue-900 border-blue-300',
    baking: 'bg-purple-100 text-purple-900 border-purple-300',
    out_for_delivery: 'bg-orange-100 text-orange-900 border-orange-300',
    delivered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    cancelled: 'bg-red-100 text-red-900 border-red-300',
  };

  const pendingCount = recentOrders?.filter(o => o.status === 'pending').length || 0;
  const bakingCount = recentOrders?.filter(o => o.status === 'baking').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-900">لوحة تحكم المخبز</h1>
          <p className="text-xs text-warm-500 mt-1">إحصائيات المبيعات والطلبات اليومية في صلالة</p>
        </div>
        <Link to="/admin/orders" className="btn-primary text-xs py-2.5 font-bold">
          إدارة جميع الطلبات ←
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      ) : (
        <>
          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-white to-amber-50/60 border border-amber-200/80 p-5 flex items-center justify-between shadow-soft">
              <div>
                <span className="text-xs font-bold text-warm-500 block mb-1">إجمالي الطلبات</span>
                <span className="text-3xl font-black text-amber-900">{stats?.totalOrders || 0}</span>
                <span className="text-[10px] text-warm-400 block mt-1">منذ إطلاق التطبيق</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl shadow-sm">
                📋
              </div>
            </div>

            <div className="card bg-gradient-to-br from-white to-emerald-50/60 border border-emerald-200/80 p-5 flex items-center justify-between shadow-soft">
              <div>
                <span className="text-xs font-bold text-warm-500 block mb-1">طلبات اليوم</span>
                <span className="text-3xl font-black text-emerald-800">{stats?.todayOrders || 0}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">تحديث مباشر</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl shadow-sm">
                🌅
              </div>
            </div>

            <div className="card bg-gradient-to-br from-white to-blue-50/60 border border-blue-200/80 p-5 flex items-center justify-between shadow-soft">
              <div>
                <span className="text-xs font-bold text-warm-500 block mb-1">إجمالي الإيرادات</span>
                <span className="text-2xl sm:text-3xl font-black text-blue-900">
                  {Number(stats?.totalRevenue || 0).toFixed(3)}
                </span>
                <span className="text-[10px] text-blue-600 font-bold block mt-1">ريال عماني (ر.ع.)</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl shadow-sm">
                💰
              </div>
            </div>

            <div className="card bg-gradient-to-br from-white to-purple-50/60 border border-purple-200/80 p-5 flex items-center justify-between shadow-soft">
              <div>
                <span className="text-xs font-bold text-warm-500 block mb-1">طلبات نشطة الآن</span>
                <span className="text-3xl font-black text-purple-900">{pendingCount + bakingCount}</span>
                <span className="text-[10px] text-purple-600 font-semibold block mt-1">
                  {pendingCount} قيد الانتظار • {bakingCount} بالفرن
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-2xl shadow-sm">
                🥖
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="card space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-warm-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🕒</span>
                <h2 className="font-bold text-warm-900 text-base">أحدث الطلبات الواردة</h2>
              </div>
              <Link to="/admin/orders" className="text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline">
                عرض كافة الطلبات ({recentOrders?.length || 0}) ←
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-warm-100 text-warm-500 font-bold">
                    <th className="py-2.5 px-3">المعرف</th>
                    <th className="py-2.5 px-3">اسم العميل</th>
                    <th className="py-2.5 px-3">رقم الهاتف</th>
                    <th className="py-2.5 px-3">المبلغ</th>
                    <th className="py-2.5 px-3">التاريخ</th>
                    <th className="py-2.5 px-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100">
                  {recentOrders?.slice(0, 8).map(order => (
                    <tr key={order.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-amber-900">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-warm-900">{order.customerName}</td>
                      <td className="py-3 px-3 text-warm-600">{order.customerPhone}</td>
                      <td className="py-3 px-3 font-black text-amber-900">
                        {Number(order.totalAmount).toFixed(3)} ر.ع.
                      </td>
                      <td className="py-3 px-3 text-warm-500">{order.deliveryDate}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[order.status] || 'bg-gray-100'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(!recentOrders || recentOrders.length === 0) && (
                <p className="text-center text-warm-400 py-8 text-xs">لا توجد طلبات حتى الآن</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
