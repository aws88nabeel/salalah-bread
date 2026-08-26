import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import { useAuthStore } from '../stores/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
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
      const { data } = await authApi.login({ phone, password });
      setAuth(data.user, data.token);
      toast.success(`مرحباً بعودتك، ${data.user.name}! 🥖`, {
        style: { borderRadius: '12px', background: '#292524', color: '#fff' },
      });
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'عذراً، رقم الهاتف أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setPhone('96899990000');
    setPassword('admin123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-warm-200/80 p-8 w-full max-w-md relative overflow-hidden space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
            🥖
          </div>
          <h1 className="text-2xl font-black text-warm-900">تسجيل الدخول</h1>
          <p className="text-xs text-warm-500">أهلاً بك مجدداً في تطبيق طلبات الخبز — صلالة</p>
        </div>

        {/* Demo Admin Quick Button */}
        <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <div>
            <span className="font-bold block">دخول تجريبي كمدير:</span>
            <span className="text-[10px] text-amber-700">96899990000 / admin123</span>
          </div>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-xl font-bold hover:bg-amber-700 shadow-xs transition-colors"
          >
            تعبئة تلقائية
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
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
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول 🥖'}
          </button>
        </form>

        <p className="text-center text-xs text-warm-500 pt-2 border-t border-warm-100">
          ليس لديك حساب بعد؟{' '}
          <Link to="/register" className="text-amber-700 font-bold hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}
