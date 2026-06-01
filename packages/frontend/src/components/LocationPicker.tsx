import { useState } from 'react';

const SALALAH_DEFAULT = { lat: 17.02, lng: 54.09 };

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

  const handleConfirm = () => {
    if (!address.trim()) return;
    setConfirmed(true);
    onLocationChange({
      lat: SALALAH_DEFAULT.lat,
      lng: SALALAH_DEFAULT.lng,
      address: address.trim(),
      isDeliverable: true,
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">عنوان التوصيل</label>
        <textarea
          className="input-field"
          rows={2}
          placeholder="اكتب عنوانك في صلالة (مثال: حي السعادة، شارع ٦، بناية ١٢)"
          value={address}
          onChange={e => { setAddress(e.target.value); setConfirmed(false); }}
        />
      </div>

      {!confirmed ? (
        <button
          onClick={handleConfirm}
          disabled={!address.trim()}
          className="btn-primary w-full"
        >
          تأكيد العنوان
        </button>
      ) : (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg">
          ✅ العنوان ضمن منطقة التوصيل: {address}
        </div>
      )}
    </div>
  );
}

export type { LocationResult };
