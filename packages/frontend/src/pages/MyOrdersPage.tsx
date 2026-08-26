import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../lib/api';

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار ⏳',
  confirmed: 'تم التأكيد ✅',
  baking: 'قيد الخبز 🥖',
  out_for_delivery: 'في الطريق 🛵',
  delivered: 'تم التوصيل 🎉',
  cancelled: 'ملغي ❌',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  confirmed: 'bg-blue-100 text-blue-900 border-blue-300',
  baking: 'bg-purple-100 text-purple-900 border-purple-300',
  out_for_delivery: 'bg-orange-100 text-orange-900 border-orange-300',
  delivered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  cancelled: 'bg-red-100 text-red-900 border-red-300',
};

export default function MyOrdersPage() {
  const [filter, setFilter] = useState<string>('all');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => ordersApi.getMyOrders().then(r => r.data),
    refetchInterval: 15000,
  });

  const filteredOrders = orders?.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-warm-200 p-8 shadow-soft my-8">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 border border-amber-200/80">
          📋
        </div>
        <h2 className="text-2xl font-bold text-warm-900 mb-2">لا توجد طلبات سابقة</h2>
        <p className="text-warm-500 text-sm mb-6 leading-relaxed">
          لم تقم بطلب خبز حتى الآن. اطلب الآن لتجربة الخبز العماني والطازج من مخبزنا!
        </p>
        <Link to="/" className="btn-primary w-full text-sm py-3">
          تصفح قائمة الخبز 🥖
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-900">سجل طلباتي</h1>
          <p className="text-xs text-warm-500 mt-1">تتبع كافة طلبات الخبز ومواعيد التوصيل الخاصة بك</p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-warm-100 text-warm-700 hover:bg-amber-50'
            }`}
          >
            الكل ({orders.length})
          </button>
          {['pending', 'baking', 'out_for_delivery', 'delivered'].map(st => {
            const count = orders.filter(o => o.status === st).length;
            if (count === 0) return null;
            return (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  filter === st
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-warm-100 text-warm-700 hover:bg-amber-50'
                }`}
              >
                {statusLabels[st]?.split(' ')[0]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-warm-200 p-6">
            <p className="text-warm-500 text-xs">لا توجد طلبات تطابق هذا التصفية</p>
          </div>
        ) : (
          filteredOrders?.map(order => (
            <Link
              key={order.id}
              to={`/order/${order.id}`}
              className="card block hover:shadow-xl hover:border-amber-300 transition-all duration-200 group border border-warm-200/80 p-5"
            >
              <div className="flex items-center justify-between mb-3 border-b border-warm-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-warm-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-OM') : order.deliveryDate}
                  </span>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || 'bg-gray-100'}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-warm-700">
                <div className="space-y-1">
                  <p className="font-medium text-warm-900">📍 {order.deliveryAddress}</p>
                  <p className="text-warm-500">📅 موعد التوصيل المحدد: {order.deliveryDate}</p>
                </div>

                <div className="text-left font-black text-amber-900 text-base sm:text-lg">
                  {Number(order.totalAmount).toFixed(3)} ر.ع.
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
