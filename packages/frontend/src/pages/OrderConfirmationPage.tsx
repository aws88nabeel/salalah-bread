import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../lib/api';

const ORDER_STAGES = [
  { key: 'pending', label: 'قيد الانتظار', icon: '⏳', desc: 'تم إرسال الطلب وينتظر تأكيد المخبز' },
  { key: 'confirmed', label: 'تم التأكيد', icon: '✅', desc: 'تم قبول طلبك والتجهيز لبدء الخبز' },
  { key: 'baking', label: 'قيد الخبز', icon: '🥖', desc: 'خبزك الطازج داخل الفرن الآن' },
  { key: 'out_for_delivery', label: 'في الطريق', icon: '🛵', desc: 'السائق في طريقه لإيصال الطلب إليك' },
  { key: 'delivered', label: 'تم التوصيل', icon: '🎉', desc: 'بالهناء والشفاء! تم تسليم الطلب' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  confirmed: 'bg-blue-100 text-blue-900 border-blue-300',
  baking: 'bg-purple-100 text-purple-900 border-purple-300',
  out_for_delivery: 'bg-orange-100 text-orange-900 border-orange-300',
  delivered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  cancelled: 'bg-red-100 text-red-900 border-red-300',
};

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!).then(r => r.data),
    enabled: !!id,
    refetchInterval: 10000, // Live poll every 10s for status updates
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-white rounded-3xl border border-warm-200 p-8 shadow-soft">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-warm-900">الطلب غير موجود</h2>
        <p className="text-warm-500 text-sm mt-1">لم نتمكن من العثور على هذا الطلب</p>
        <Link to="/" className="btn-primary mt-6 inline-block text-xs">العودة للقائمة</Link>
      </div>
    );
  }

  const currentStageIndex = ORDER_STAGES.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white p-8 rounded-3xl shadow-xl text-center relative overflow-hidden">
        <div className="text-5xl mb-2 animate-bounce-short">🎉</div>
        <h1 className="text-2xl sm:text-3xl font-black text-amber-50">تم استلام طلبك بنجاح!</h1>
        <p className="text-amber-200/90 text-xs sm:text-sm mt-1">
          رقم المرجعي للطلب: <span className="font-mono font-bold text-amber-300">#{order.id.slice(0, 8)}</span>
        </p>
      </div>

      {/* Visual Stepper Timeline */}
      <div className="card space-y-4 p-6">
        <h2 className="font-extrabold text-warm-900 text-base border-b border-warm-100 pb-2">
          📍 تتبع حالة الطلب الحالية:
        </h2>

        {isCancelled ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-center">
            <span className="text-2xl block mb-1">❌</span>
            <span className="font-bold block">تم إلغاء هذا الطلب</span>
            <span className="text-xs text-red-600">إذا كان لديك استفسار يرجى التواصل مع الدعم.</span>
          </div>
        ) : (
          <div className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {ORDER_STAGES.map((stage, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div
                    key={stage.key}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isCurrent
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400/40 scale-105'
                        : isPassed
                        ? 'bg-amber-50 text-amber-950 border-amber-200'
                        : 'bg-warm-50 text-warm-400 border-warm-200 opacity-60'
                    }`}
                  >
                    <span className="text-2xl">{stage.icon}</span>
                    <span className="font-bold text-xs">{stage.label}</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold mt-1">
                        الآن
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {currentStageIndex >= 0 && (
              <div className="mt-4 bg-amber-50 border border-amber-200/80 p-3 rounded-xl text-center text-xs text-amber-900 font-medium">
                💬 <strong>المرحلة الحالية:</strong> {ORDER_STAGES[currentStageIndex]?.desc}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Delivery Info */}
        <div className="card space-y-2">
          <h3 className="font-bold text-warm-900 text-sm border-b border-warm-100 pb-2">📦 معلومات التوصيل</h3>
          <div className="text-xs text-warm-700 space-y-1.5">
            <p><strong>اسم العميل:</strong> {order.customerName}</p>
            <p><strong>الهاتف:</strong> {order.customerPhone}</p>
            <p><strong>العنوان:</strong> {order.deliveryAddress}</p>
            <p><strong>تاريخ التوصيل:</strong> {order.deliveryDate}</p>
            {order.notes && <p><strong>ملاحظات:</strong> {order.notes}</p>}
          </div>
        </div>

        {/* Status Badge & Summary */}
        <div className="card space-y-2">
          <h3 className="font-bold text-warm-900 text-sm border-b border-warm-100 pb-2">💳 ملخص الحساب</h3>
          <div className="text-xs text-warm-700 space-y-1.5">
            <div className="flex justify-between items-center">
              <span>حالة الطلب:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || 'bg-gray-100'}`}>
                {ORDER_STAGES.find(s => s.key === order.status)?.label || order.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>تاريخ الطلب:</span>
              <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-OM') : order.deliveryDate}</span>
            </div>
            <div className="border-t border-warm-100 pt-2 flex justify-between items-center text-sm font-extrabold text-warm-900">
              <span>الإجمالي:</span>
              <span className="text-amber-800 text-base">{Number(order.totalAmount).toFixed(3)} ر.ع.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <div className="card space-y-3">
          <h3 className="font-bold text-warm-900 text-sm border-b border-warm-100 pb-2">🥖 الأصناف المطلوبة</h3>
          <div className="space-y-2 text-xs text-warm-800">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-center py-1 border-b border-warm-50 last:border-0">
                <span className="font-medium">الكمية: {item.quantity}</span>
                <span className="font-bold">{Number(item.subtotal).toFixed(3)} ر.ع.</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 text-center flex gap-3 justify-center">
        <Link to="/orders" className="btn-secondary text-xs">
          📋 عرض كافة طلباتي
        </Link>
        <Link to="/" className="btn-primary text-xs">
          🥖 الطلب مرة أخرى
        </Link>
      </div>
    </div>
  );
}
