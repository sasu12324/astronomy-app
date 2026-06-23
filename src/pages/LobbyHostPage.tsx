import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lobbyService } from '../services/lobby.service.js';
import type { Lobby } from '../types/index.js';
import {
  Users,
  Play,
  Square,
  Copy,
  Check,
  ArrowLeft,
  Trophy
} from 'lucide-react';

export const LobbyHostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;
    loadLobby();
    intervalRef.current = window.setInterval(loadLobby, 2000);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [id]);

  const loadLobby = async () => {
    try {
      const data = await lobbyService.getById(id!);
      setLobby(data);
    } catch (error) {
      console.error('Ошибка загрузки лобби:', error);
    }
  };

  const copyCode = async () => {
    if (!lobby) return;
    await navigator.clipboard.writeText(lobby.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startTest = async () => {
    if (!id) return;
    try {
      await lobbyService.start(id);
      loadLobby();
    } catch (error) {
      console.error('Ошибка запуска:', error);
    }
  };

  const finishTest = async () => {
    if (!id) return;
    try {
      await lobbyService.finish(id);
      loadLobby();
    } catch (error) {
      console.error('Ошибка завершения:', error);
    }
  };

  if (!lobby) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Загрузка...</div>
      </div>
    );
  }

  const participants = Object.entries(lobby.participants || {});
  const isWaiting = lobby.status === 'waiting';
  const isActive = lobby.status === 'active';
  const isFinished = lobby.status === 'finished';

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Шапка */}
        <button
          onClick={() => navigate('/tests/manage')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к тестам
        </button>

        <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          {/* Инфо */}
          <div className="px-6 py-5 border-b border-slate-700/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">{lobby.testTitle}</h1>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isWaiting ? 'bg-amber-500/20 text-amber-300' :
                    isActive ? 'bg-emerald-500/20 text-emerald-300' :
                    'bg-slate-600/30 text-slate-400'
                  }`}>
                    {isWaiting ? 'Ожидание' : isActive ? 'Идёт тест' : 'Завершено'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {participants.length} участников
                  </span>
                </div>
              </div>

              {/* Код лобби */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Код для подключения</p>
                  <div className="flex items-center gap-2">
                    <code className="px-4 py-2 bg-slate-900 rounded-xl text-2xl font-mono font-bold text-emerald-400 tracking-[0.2em]">
                      {lobby.code}
                    </code>
                    <button
                      onClick={copyCode}
                      className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
                      title="Копировать"
                    >
                      {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Управление */}
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
            {isWaiting && (
              <button
                onClick={startTest}
                disabled={participants.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
              >
                <Play className="w-5 h-5" />
                Начать тест
              </button>
            )}
            {isActive && (
              <button
                onClick={finishTest}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20"
              >
                <Square className="w-5 h-5" />
                Завершить тест
              </button>
            )}
            {isFinished && (
              <div className="flex items-center gap-2 text-slate-400">
                <Check className="w-5 h-5 text-emerald-400" />
                Тест завершён
              </div>
            )}
          </div>

          {/* Участники */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Участники
            </h2>

            {participants.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>Ожидание участников...</p>
                <p className="text-sm mt-1">Поделитесь кодом {lobby.code} со студентами</p>
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map(([pid, p]) => (
                  <div key={pid} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-700/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        p.isAnonymous ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {p.displayName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{p.displayName}</p>
                        {p.isAnonymous && (
                          <span className="text-xs text-amber-400/70">Гость</span>
                        )}
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">
                          {Object.keys(p.answers || {}).length} ответов
                        </span>
                      </div>
                    )}
                    
                    {isFinished && (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="font-bold text-white">{p.score} баллов</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};