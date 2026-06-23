import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import { useState, useRef, useEffect } from 'react';
import {
  Home,
  Newspaper,
  BookOpen,
  FlaskConical,
  CircleDot,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  HelpCircle
} from 'lucide-react';

export const Header = () => {
  const { profile, isAuthenticated, isTeacher, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate('/login');
  };

  // Закрыть dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Главная', icon: <Home className="w-4 h-4" /> },
    { to: '/news', label: 'Материал', icon: <Newspaper className="w-4 h-4" /> },
    { to: '/textbook', label: 'Учебник', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/help', label: 'Справка', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  // 2. Ссылки ТОЛЬКО для преподавателя
  const teacherLinks = [
    { to: '/tests/manage', label: 'Управление тестами', icon: <FlaskConical className="w-4 h-4" /> },
    { to: '/wheel', label: 'Колесо', icon: <CircleDot className="w-4 h-4" /> },
  ];

  // 3. Ссылки для студентов И гостей
  const studentLinks = [
    { to: '/tests/join', label: 'Пройти тест', icon: <FlaskConical className="w-4 h-4" /> },
  ];

  const roleLinks = isTeacher() ? teacherLinks : studentLinks;

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Астрономия
            </span>
          </Link>

          {/* Десктопная навигация */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.to)
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {roleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.to)
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Правая часть */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm font-bold">
                    {profile?.firstName?.[0] || 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    {profile?.lastName} {profile?.firstName}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">
                        {profile?.lastName} {profile?.firstName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{profile?.email}</p>
                      <span
                        className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${isTeacher()
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                          }`}
                      >
                        {isTeacher() ? 'Преподаватель' : 'Учащийся'}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Вход
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          {/* Мобильная кнопка меню */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-800/95 backdrop-blur">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive(link.to)
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {roleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive(link.to)
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="border-t border-white/10 pt-3 mt-3">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm font-bold">
                    {profile?.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {profile?.lastName} {profile?.firstName}
                    </p>
                    <span
                      className={`text-xs ${isTeacher() ? 'text-purple-300' : 'text-blue-300'
                        }`}
                    >
                      {isTeacher() ? 'Преподаватель' : 'Учащийся'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти
                </button>
              </div>
            ) : (
              <div className="border-t border-white/10 pt-3 mt-3 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white border border-white/10 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  Вход
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};