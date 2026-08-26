import { useState } from 'react';

const SALALAH_DEFAULT = { lat: 17.02, lng: 54.09 };

const SALALAH_NEIGHBORHOODS = [
  'حي السعادة الشمالية',
  'حي السعادة الجنوبية',
  'الدهاريز',
  'عوقد الشمالية',
  'عوقد الجنوبية',
  'صلالة الوسطى',
  'حي الحافة',
  'صلالة الجديدة',
];

interface LocationResult {
  lat: number;
  lng: number;
  address: string;
  isDeliverable: boolean;
}

interface Props {
  onLocationChange: (loc: LocationResult) => void;
  value?: LocationResult;
}

export default function LocationPicker({ onLocationChange, value }: Props) {
  const [address, setAddress] = useState(value?.address || '');
  const [confirmed, setConfirmed] = useState(!!value?.address);

  const handleConfirm = (customAddress?: string) => {
    const finalAddr = (customAddress || address).trim();
    if (!finalAddr) return;

    setAddress(finalAddr);
    setConfirmed(true);
    onLocationChange({
      lat: SALALAH_DEFAULT.lat,
      lng: SALALAH_DEFAULT.lng,
      address: finalAddr,
      isDeliverable: true,
    });
  };

  const selectNeighborhood = (name: string) => {
    const fullAddr = `${name}، صلالة`;
    handleConfirm(fullAddr);
  };

  return (
    <div className="space-y-4">
      {/* Quick Select Neighborhood Pills */}
      <div>
        <label className="block text-xs font-bold text-warm-700 mb-2">
          📍 خيارات سريعة لأحياء صلالة:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SALALAH_NEIGHBORHOODS.map(n => (
            <button
              key={n}
              type="button"
              onClick={() => selectNeighborhood(n)}
              className="text-xs bg-warm-100 hover:bg-amber-100 hover:text-amber-900 text-warm-700 px-3 py-1.5 rounded-xl transition-colors border border-warm-200"
            >
              + {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-warm-700 mb-1">
          العنوان الكامل بالتفصيل:
        </label>
        <textarea
          className="input-field text-sm"
          rows={2}
          placeholder="اكتب عنوانك بالتفصيل (مثال: حي السعادة، شارع ٦، المجمع السكني، بناية ١٢، شقة ٤)"
          value={address}
          onChange={e => {
            setAddress(e.target.value);
            setConfirmed(false);
          }}
        />
      </div>

      {!confirmed ? (
        <button
          type="button"
          onClick={() => handleConfirm()}
          disabled={!address.trim()}
          className="btn-primary w-full text-xs py-2.5 font-bold"
        >
          تأكيد عنوان التوصيل ✨
        </button>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">✅</span>
            <div>
              <span className="font-bold block">العنوان مؤكد ضمن منطقة التوصيل (صلالة):</span>
              <span className="text-emerald-700 font-medium">{address}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirmed(false)}
            className="text-xs text-amber-800 underline font-semibold hover:text-amber-900 shrink-0"
          >
            تعديل
          </button>
        </div>
      )}
    </div>
  );
}

export type { LocationResult };
