import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAuthStore } from '../stores/authStore.js';
import { auth } from '../config/firebase.js';
import api from '../api/axios.js';
import type { UserRole } from '../types/index.js';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Users,
  Star
} from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'student' as UserRole, // Роль всегда 'student'
    group: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const { loadProfile } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      await updateProfile(user, {
        displayName: `${formData.lastName} ${formData.firstName}`
      });

      const token = await user.getIdToken();

      // Создаем документ в Firestore (роль отправится как 'student')
      await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        group: formData.group || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await loadProfile();

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:bg-white/15 text-sm";

  return (
    <div className="h-screen w-full bg-[#0a0e27] relative overflow-hidden flex items-center justify-center">
      {/* Звёздное небо */}
      <div className="absolute inset-0 w-full h-full">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 2 + 's',
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}

        {[...Array(12)].map((_, i) => (
          <div
            key={`bright-${i}`}
            className="absolute"
            style={{
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
          >
            <Star
              className="text-yellow-200 animate-pulse"
              style={{
                width: Math.random() * 10 + 6 + 'px',
                height: Math.random() * 10 + 6 + 'px',
                animationDelay: Math.random() * 2 + 's',
                opacity: Math.random() * 0.5 + 0.5
              }}
            />
          </div>
        ))}

        <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="absolute bottom-20 left-16 w-20 h-20 rounded-full bg-purple-500/20 blur-2xl" />
      </div>

      {/* Карточка */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-[#111835]/80 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Шапка */}
          <div className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 px-6 py-4 text-center border-b border-white/10">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur mb-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <h2 className="text-xl font-bold text-white">Создать аккаунт</h2>
            <p className="text-blue-200 text-xs mt-0.5">Начните изучать астрономию</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            {/* Ошибка */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-2.5 rounded-lg flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 text-red-300 font-bold text-xs">!</div>
                {error}
              </div>
            )}

            {/* ФИО */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Фамилия"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Имя"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                required
              />
            </div>

            {/* Группа (теперь отображается всегда, так как роль всегда student) */}
            <div className="relative">
              <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Группа (например: ИС-101)"
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Пароль */}
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Пароль (мин. 6 символов)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`${inputClass} pr-10`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Подтверждение пароля */}
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Подтвердите пароль"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`${inputClass} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Кнопка */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold py-2.5 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Зарегистрироваться
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Ссылка на вход */}
            <p className="text-center text-white/60 text-xs mt-4">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
                Войти
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
