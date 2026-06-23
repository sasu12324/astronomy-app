import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lobbyService } from '../services/lobby.service.js';
import { useAuthStore } from '../stores/authStore.js';
import {
  ArrowRight,
  User,
  Check,
  Sparkles
} from 'lucide-react';

export const JoinTestPage = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuthStore();
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [step, setStep] = useState<'code' | 'name'>('code');
  const [lobbyId, setLobbyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const findLobby = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');

    try {
      const lobby = await lobbyService.findByCode(code);
      
      if (lobby.status !== 'waiting') {
        setError('Это лобби уже начато или завершено');
        setLoading(false);
        return;
      }

      setLobbyId(lobby.id);

      // Если авторизован — сразу присоединяем и редиректим
      if (isAuthenticated && profile) {
        const result = await lobbyService.join(
          lobby.id, 
          `${profile.lastName} ${profile.firstName}`, 
          profile.uid, 
          false
        );
        localStorage.setItem(`lobby_${lobby.id}_participant`, result.participantId);
        navigate(`/test/${lobby.id}`);
        return;
      }
      
      // Иначе — запрашиваем имя
      setStep('name');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Лобби не найдено');
    } finally {
      setLoading(false);
    }
  };

  const joinAsGuest = async () => {
    if (!displayName.trim()) return;
    setLoading(true);

    try {
      const result = await lobbyService.join(lobbyId, displayName, undefined, true);
      localStorage.setItem(`lobby_${lobbyId}_participant`, result.participantId);
      navigate(`/test/${lobbyId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка присоединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl p-8">
          {/* Шаг 1: Ввод кода */}
          {step === 'code' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Присоединиться к тесту</h1>
              <p className="text-slate-400 mb-6">Введите код, который дал преподаватель</p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Введите код"
                  maxLength={6}
                  className="w-full px-4 py-4 bg-slate-900/80 border border-slate-600 rounded-xl text-white text-center text-2xl font-mono font-bold tracking-[0.3em] placeholder-slate-600 placeholder:text-base placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all uppercase"
                />

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                  onClick={findLobby}
                  disabled={loading || code.length < 4}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                >
                  {loading ? 'Поиск...' : (
                    <>
                      Далее
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Шаг 2: Ввод имени (для гостей) */}
          {step === 'name' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Как вас зовут?</h1>
              <p className="text-slate-400 mb-6">Введите фамилию и имя, чтобы преподаватель вас узнал</p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Иванов Иван"
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                  onClick={joinAsGuest}
                  disabled={loading || !displayName.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:from-slate-700 text-white font-bold rounded-xl transition-all"
                >
                  {loading ? 'Присоединение...' : 'Присоединиться'}
                </button>

                <button
                  onClick={() => setStep('code')}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  ← Назад к вводу кода
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};