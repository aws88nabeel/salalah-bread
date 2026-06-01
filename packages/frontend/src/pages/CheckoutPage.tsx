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

  const { data: slots } = useQuery({
    queryKey: ['slots', deliveryDate],
    queryFn: () => slotsApi.getAvailable(deliveryDate).then(r => r.data),
  });

  const handleSubmit = async () => {
    if (!location || !location.address) {
      toast.error('يرجى إدخال عنوان التوصيل');
      return;
    }
    if (!selectedSlot) {
      toast.error('يرجى اختيار وقت التوصيل');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await ordersApi.create({
        customerName: user?.name || '',
        deliveryLat: location.lat,
        deliveryLng: location.lng,
        deliveryAddress: location.address,
        slotId: selectedSlot,
        deliveryDate,
        notes,
        items: items.map(i => ({ menuItemId: i.menuItem.id, quantity: i.quantity })),
      });
      clearCart();
      toast.success('تم تقديم الطلب بنجاح!');
      navigate(`/order/${data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'فشل تقديم الطلب');
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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">إتمام الطلب</h1>

      <div className="space-y-6">
        <div className="card">
          <h2 className="font-semibold text-lg mb-3">📍 موقع التوصيل</h2>
          <LocationPicker onLocationChange={setLocation} />
        </div>

        <div className="card">
          <h2 className="font-semibold text-lg mb-3">🕐 وقت التوصيل</h2>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">التاريخ</label>
            <input
              type="date"
              className="input-field"
              value={deliveryDate}
              min={new Date().toISOString().slice(0, 10)}
              max={tomorrow.toISOString().slice(0, 10)}
              onChange={e => setDeliveryDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {slots?.map(slot => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot.id)}
                disabled={slot.remainingCapacity <= 0}
                className={`p-3 rounded-lg border text-center transition-all ${
                  selectedSlot === slot.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : slot.remainingCapacity <= 0
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="font-medium">{slot.labelAr}</div>
                <div className="text-xs mt-1">
                  {slot.remainingCapacity <= 0
                    ? 'ممتلئ'
                    : `${slot.remainingCapacity} طلب متبقي`}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-lg mb-3">📝 ملاحظات</h2>
          <textarea
            className="input-field"
            rows={3}
            placeholder="ملاحظات إضافية (اختياري)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="card">
          <h2 className="font-semibold text-lg mb-3">🛒 ملخص الطلب</h2>
          <div className="space-y-2 mb-4">
            {items.map(({ menuItem, quantity }) => (
              <div key={menuItem.id} className="flex justify-between text-sm">
                <span>{menuItem.nameAr} × {quantity}</span>
                <span>{(Number(menuItem.price) * quantity).toFixed(3)} ر.ع.</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>المجموع</span>
            <span className="text-primary-600">{totalAmount().toFixed(3)} ر.ع.</span>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-2">
          {!selectedSlot ? '⚠️ لم تختر وقت التوصيل بعد' : `✅ تم اختيار وقت التوصيل (${selectedSlot.slice(0,8)})`}
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedSlot}
          className="btn-primary w-full py-3 text-lg"
        >
          {submitting ? 'جاري تقديم الطلب...' : 'تأكيد الطلب'}
        </button>
      </div>
    </div>
  );
}
