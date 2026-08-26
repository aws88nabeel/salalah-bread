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
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  confirmed: 'bg-blue-100 text-blue-900 border-blue-300',
  baking: 'bg-purple-100 text-purple-900 border-purple-300',
  out_for_delivery: 'bg-orange-100 text-orange-900 border-orange-300',
  delivered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  cancelled: 'bg-red-100 text-red-900 border-red-300',
};

export default function AdminOrders() {
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminOrders', filter],
    queryFn: () => adminApi.getOrders(filter || undefined).then(r => r.data),
    refetchInterval: 10000,
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateStatus(id, status);
      toast.success(`تم تحديث حالة الطلب إلى: ${statusLabels[status]}`, {
        style: { borderRadius: '12px', background: '#292524', color: '#fff' },
      });
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    } catch (err: any) {
      toast.error('فشل تحديث الحالة');
    }
  };

  const nextStatus = (current: string): string | null => {
    const idx = statusList.indexOf(current);
    if (idx < statusList.length - 2) return statusList[idx + 1]; // Stop before 'cancelled'
    return null;
  };

  const filteredOrders = orders?.filter(order => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      order.id.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.customerPhone.includes(query) ||
      order.deliveryAddress.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-900">إدارة طلبات المخبز</h1>
          <p className="text-xs text-warm-500 mt-1">متابعة وتحديث حالة الطلبات مباشرة لعملاء صلالة</p>
        </div>

        {/* Live Search Input */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، الهاتف، أو المرجع..."
            className="input-field text-xs pr-8 py-2"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-400 text-xs">🔍</span>
        </div>
      </div>

      {/* Filter Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilter('')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            !filter
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-warm-700 hover:bg-amber-50 border border-warm-200'
          }`}
        >
          الكل ({orders?.length || 0})
        </button>
        {statusList.map(s => {
          const count = orders?.filter(o => o.status === s).length || 0;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filter === s
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-warm-700 hover:bg-amber-50 border border-warm-200'
              }`}
            >
              {statusLabels[s]} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      ) : (
        <div className="card p-4 space-y-4 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-warm-200 text-warm-500 font-bold">
                  <th className="py-3 px-3">المرجع</th>
                  <th className="py-3 px-3">العميل</th>
                  <th className="py-3 px-3">الهاتف</th>
                  <th className="py-3 px-3">العنوان</th>
                  <th className="py-3 px-3">المبلغ</th>
                  <th className="py-3 px-3">تاريخ التوصيل</th>
                  <th className="py-3 px-3">الحالة الحالية</th>
                  <th className="py-3 px-3 text-center">الإجراء المتاح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredOrders?.map(order => {
                  const next = nextStatus(order.status);

                  return (
                    <tr key={order.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-amber-900">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-3 font-bold text-warm-900">{order.customerName}</td>
                      <td className="py-3 px-3 text-warm-600 dir-ltr text-right">{order.customerPhone}</td>
                      <td className="py-3 px-3 max-w-[180px] truncate text-warm-700" title={order.deliveryAddress}>
                        {order.deliveryAddress}
                      </td>
                      <td className="py-3 px-3 font-black text-amber-900">
                        {Number(order.totalAmount).toFixed(3)} ر.ع.
                      </td>
                      <td className="py-3 px-3 text-warm-600 font-semibold">{order.deliveryDate}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[order.status] || 'bg-gray-100'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {next && (
                            <button
                              onClick={() => updateStatus(order.id, next)}
                              className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs transition-all active:scale-95"
                            >
                              ← {statusLabels[next]}
                            </button>
                          )}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(order.id, 'cancelled')}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
                            >
                              إلغاء
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {(!filteredOrders || filteredOrders.length === 0) && (
              <div className="text-center py-12">
                <p className="text-warm-400 text-xs">لا توجد طلبات تطابق معايير البحث والفلترة</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
