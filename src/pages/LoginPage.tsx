import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase.js';
import { useAuthStore } from '../stores/authStore.js';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loadProfile } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Попытка входа:', email); // <-- добавь это
            await signInWithEmailAndPassword(auth, email, password);
            await loadProfile();
            navigate('/');
        } catch (err: any) {
            console.error('Полная ошибка:', err.code, err.message); // <-- и это
            if (err.code === 'auth/invalid-credential') {
                setError('Неверный email или пароль');
            } else {
                setError(err.message || 'Ошибка входа');
            }
        } finally {
            setLoading(false);
        }
    };

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
            </div>

            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-[#111835]/80 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 px-6 py-4 text-center border-b border-white/10">
                        <h2 className="text-xl font-bold text-white">Вход</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            {loading ? 'Вход...' : 'Войти'}
                        </button>

                        <p className="text-center text-white/60 text-sm">
                            Нет аккаунта?{' '}
                            <Link to="/register" className="text-blue-400 hover:text-blue-300">
                                Зарегистрироваться
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};