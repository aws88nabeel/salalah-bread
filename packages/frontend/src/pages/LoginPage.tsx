import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import { useAuthStore } from '../stores/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore(s => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login({ phone, password });
      setAuth(data.user, data.token);
      toast.success('مرحباً بعودتك!');
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-orange-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary-700">🥖 طلبات الخبز</h1>
          <p className="text-gray-500 mt-1">تسجيل الدخول</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input
              type="tel"
              className="input-field"
              placeholder="968XXXXXXXX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'جاري التحميل...' : 'دخول'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          ليس لديك حساب؟ <Link to="/register" className="text-primary-600 hover:underline">تسجيل جديد</Link>
        </p>
      </div>
    </div>
  );
}
