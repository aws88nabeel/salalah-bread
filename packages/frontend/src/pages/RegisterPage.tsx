import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import { useAuthStore } from '../stores/auth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore(s => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.register({ phone, name, password });
      setAuth(data.user, data.token);
      toast.success(`أهلاً بك، ${data.user.name}! تم إنشاء حسابك بنجاح 🥖`, {
        style: { borderRadius: '12px', background: '#292524', color: '#fff' },
      });
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'فشل إنشاء الحساب، يرجى التأكد من البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-warm-200/80 p-8 w-full max-w-md relative overflow-hidden space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
            🥖
          </div>
          <h1 className="text-2xl font-black text-warm-900">إنشاء حساب جديد</h1>
          <p className="text-xs text-warm-500">انضم إلينا واستمتع بطلب الخبز الطازج في صلالة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-warm-700 mb-1">الاسم الكامل:</label>
            <input
              type="text"
              className="input-field text-sm"
              placeholder="مثال: أحمد المعشني"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-warm-700 mb-1">رقم الهاتف:</label>
            <input
              type="tel"
              className="input-field text-sm"
              placeholder="968XXXXXXXX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-warm-700 mb-1">كلمة المرور:</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field text-sm pl-10"
                placeholder="٦ أحرف أو أرقام على الأقل"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-warm-400 hover:text-warm-600 font-semibold"
              >
                {showPassword ? 'إخفاء' : 'إظهار'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 text-sm font-bold shadow-md"
            disabled={loading}
          >
            {loading ? 'جاري التسجيل...' : 'إنشاء الحساب 🥖'}
          </button>
        </form>

        <p className="text-center text-xs text-warm-500 pt-2 border-t border-warm-100">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-amber-700 font-bold hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
