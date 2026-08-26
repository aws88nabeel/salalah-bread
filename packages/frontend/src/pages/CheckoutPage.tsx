import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { slotsApi, ordersApi } from '../lib/api';
import LocationPicker from '../components/LocationPicker';
import type { LocationResult } from '../components/LocationPicker';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCartStore();
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const [location, setLocation] = useState<LocationResult | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', deliveryDate],
    queryFn: () => slotsApi.getAvailable(deliveryDate).then(r => r.data),
  });

  const handleSubmit = async () => {
    if (!location || !location.address) {
      toast.error('يرجى تأكيد عنوان التوصيل أولاً');
      return;
    }
    if (!selectedSlot) {
      toast.error('يرجى اختيار وقت التوصيل المناسب');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await ordersApi.create({
        customerName: user?.name || 'عميل صلالة',
        deliveryLat: location.lat,
        deliveryLng: location.lng,
        deliveryAddress: location.address,
        slotId: selectedSlot,
        deliveryDate,
        notes,
        items: items.map(i => ({ menuItemId: i.menuItem.id, quantity: i.quantity })),
      });
      clearCart();
      toast.success('تم إرسال طلبك بنجاح! 🥖', {
        style: { borderRadius: '12px', background: '#292524', color: '#fff' },
      });
      navigate(`/order/${data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'عذراً، حدث خطأ أثناء تقديم الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-warm-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-warm-900">إتمام الطلب والتوصيل</h1>
        <p className="text-xs text-warm-500 mt-1">يرجى تحديد عنوان التوصيل والموعد المفضل لاستلام خبزك الطازج</p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Location */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2 text-warm-900 font-bold text-base border-b border-warm-100 pb-2">
            <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs">١</span>
            <span>📍 عنوان التوصيل في صلالة</span>
          </div>
          <LocationPicker onLocationChange={setLocation} />
        </div>

        {/* Step 2: Time Slots */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 text-warm-900 font-bold text-base border-b border-warm-100 pb-2">
            <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs">٢</span>
            <span>🕐 اختر موعد التوصيل</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-warm-700 mb-1">تاريخ التوصيل:</label>
            <input
              type="date"
              className="input-field text-sm font-semibold max-w-xs"
              value={deliveryDate}
              min={new Date().toISOString().slice(0, 10)}
              max={tomorrow.toISOString().slice(0, 10)}
              onChange={e => {
                setDeliveryDate(e.target.value);
                setSelectedSlot('');
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-warm-700 mb-2">الفترات المتاحة للتوصيل:</label>

            {slotsLoading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600"></div>
              </div>
            ) : slots && slots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slots.map(slot => {
                  const isSelected = selectedSlot === slot.id;
                  const isFull = slot.remainingCapacity <= 0;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot.id)}
                      disabled={isFull}
                      className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 relative overflow-hidden ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/90 ring-2 ring-amber-500/30 text-amber-950 shadow-sm'
                          : isFull
                          ? 'border-warm-200 bg-warm-100/60 text-warm-400 cursor-not-allowed opacity-60'
                          : 'border-warm-200 hover:border-amber-400 hover:bg-amber-50/30 text-warm-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-sm">{slot.labelAr}</span>
                        {isSelected && <span className="text-amber-600 text-base">✓</span>}
                      </div>

                      <div className="flex items-center justify-between w-full text-xs">
                        <span className="text-warm-500">{slot.slotStart} - {slot.slotEnd}</span>
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          isFull
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isFull ? 'مكتمل' : `متبقي ${slot.remainingCapacity} طلبات`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-warm-500 py-4 text-center bg-warm-50 rounded-xl">لا توجد فترات توصيل متاحة لهذا اليوم</p>
            )}
          </div>
        </div>

        {/* Step 3: Notes */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2 text-warm-900 font-bold text-base border-b border-warm-100 pb-2">
            <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs">٣</span>
            <span>📝 ملاحظات التوصيل (اختياري)</span>
          </div>
          <textarea
            className="input-field text-sm"
            rows={2}
            placeholder="مثال: يرجى الاتصال عند الوصول، أو ترك الطلب عند الباب"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Step 4: Summary & Submit */}
        <div className="card bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 text-white p-6 space-y-4">
          <h2 className="font-bold text-lg text-amber-100 border-b border-amber-700/60 pb-2">
            🛒 ملخص الطلب النهائي
          </h2>

          <div className="space-y-2 text-xs text-amber-100/90 max-h-40 overflow-y-auto pr-1">
            {items.map(({ menuItem, quantity }) => (
              <div key={menuItem.id} className="flex justify-between items-center py-1 border-b border-amber-800/40">
                <span>{menuItem.nameAr} <strong className="text-amber-300">× {quantity}</strong></span>
                <span className="font-bold">{(Number(menuItem.price) * quantity).toFixed(3)} ر.ع.</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-amber-700/80 flex justify-between items-center text-lg font-black text-amber-50">
            <span>الإجمالي الكلي:</span>
            <span className="text-2xl text-amber-300">{totalAmount().toFixed(3)} ر.ع.</span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !selectedSlot || !location}
            className="btn-primary w-full py-3.5 text-base font-black shadow-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 transition-all disabled:opacity-50"
          >
            {submitting ? 'جاري إرسال الطلب...' : 'تأكيد وإرسال الطلب 🥖'}
          </button>
        </div>
      </div>
    </div>
  );
}
