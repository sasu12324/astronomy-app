import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lobbyService } from '../services/lobby.service.js';
import type { Lobby, Question } from '../types/index.js';
import {
    Check,
    X,
    Clock,
    Trophy,
    AlertCircle,
    Loader2,
    Flag
} from 'lucide-react';

interface TestData {
    id: string;
    title: string;
    description: string;
    questions: Question[];
}

export const TestTakePage = () => {
    const { lobbyId } = useParams<{ lobbyId: string }>();
    const navigate = useNavigate();
    const [lobby, setLobby] = useState<Lobby | null>(null);
    const [test, setTest] = useState<TestData | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
    const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, { correct: boolean; score: number }>>({});
    const [participantId, setParticipantId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [finished, setFinished] = useState(false);
    const [totalScore, setTotalScore] = useState(0);
    const [finishing, setFinishing] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const [multiAnswers, setMultiAnswers] = useState<Record<string, number[]>>({});
    const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!lobbyId) return;

        const storedParticipantId = localStorage.getItem(`lobby_${lobbyId}_participant`);
        if (storedParticipantId) {
            setParticipantId(storedParticipantId);
        }

        loadLobby();
        intervalRef.current = window.setInterval(checkLobbyStatus, 3000);

        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        };
    }, [lobbyId]);

    const loadLobby = async () => {
        try {
            const data = await lobbyService.getById(lobbyId!);
            setLobby(data);

            if (data.status === 'active' && !test) {
                loadTest();
            }

            if (data.status === 'finished' && !finished) {
                setFinished(true);
                const participant = data.participants?.[participantId];
                if (participant) {
                    setTotalScore(participant.score || 0);
                }
            }

            setLoading(false);
        } catch (err) {
            setError('Ошибка загрузки лобби');
            setLoading(false);
        }
    };

    const checkLobbyStatus = async () => {
        try {
            const data = await lobbyService.getById(lobbyId!);
            setLobby(data);

            if (data.status === 'active' && !test) {
                loadTest();
            }

            if (data.status === 'finished' && !finished) {
                setFinished(true);
                const participant = data.participants?.[participantId];
                if (participant) {
                    setTotalScore(participant.score || 0);
                }
            }
        } catch (err) {
            console.error('Ошибка проверки статуса:', err);
        }
    };

    const loadTest = async () => {
        try {
            const data = await lobbyService.getTest(lobbyId!);
            setTest(data);
        } catch (err) {
            setError('Ошибка загрузки теста');
        }
    };

    const selectAnswer = async (questionId: string, optionIndex: number) => {
        if (selectedAnswers[questionId] !== undefined) return;
        if (!participantId) {
            setError('Ошибка идентификации. Обновите страницу.');
            return;
        }

        setSelectedAnswers({ ...selectedAnswers, [questionId]: optionIndex });

        try {
            const result = await lobbyService.submitAnswer(lobbyId!, participantId, questionId, optionIndex);
            setSubmittedAnswers({
                ...submittedAnswers,
                [questionId]: { correct: result.correct, score: result.score }
            });
            setTotalScore(result.score);
        } catch (err) {
            setError('Ошибка отправки ответа');
        }
    };

    const finishPersonal = async () => {
        if (!participantId || finishing) return;
        setFinishing(true);

        try {
            await lobbyService.finishPersonal(lobbyId!, participantId);
            await loadLobby();
        } catch (err) {
            setError('Ошибка завершения теста');
        } finally {
            setFinishing(false);
        }
    };

    const goToNext = () => {
        if (test && currentQuestion < test.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const goToPrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const toggleMultiAnswer = (questionId: string, index: number) => {
        const current = multiAnswers[questionId] || [];
        const updated = current.includes(index)
            ? current.filter(i => i !== index)
            : [...current, index];
        setMultiAnswers({ ...multiAnswers, [questionId]: updated });
    };

    const submitMultiAnswer = async (questionId: string) => {
        if (!participantId) return;
        const selected = multiAnswers[questionId] || [];
        if (selected.length === 0) return;

        try {
            const result = await lobbyService.submitAnswer(lobbyId!, participantId, questionId, undefined, selected);
            setSubmittedAnswers({
                ...submittedAnswers,
                [questionId]: { correct: result.correct, score: result.score }
            });
            setTotalScore(result.score);
        } catch (err) {
            setError('Ошибка отправки ответа');
        }
    };

    const submitTextAnswer = async (questionId: string) => {
        if (!participantId) return;
        const text = textAnswers[questionId]?.trim();
        if (!text) return;

        try {
            const result = await lobbyService.submitAnswer(lobbyId!, participantId, questionId, undefined, undefined, text);
            setSubmittedAnswers({
                ...submittedAnswers,
                [questionId]: { correct: result.correct, score: result.score }
            });
            setTotalScore(result.score);
        } catch (err) {
            setError('Ошибка отправки ответа');
        }
    };

    // ========== РЕНДЕР СОСТОЯНИЙ ==========

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Загрузка...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-white text-xl font-bold mb-2">Ошибка</p>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/tests/join')}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all"
                    >
                        Вернуться
                    </button>
                </div>
            </div>
        );
    }

    if (lobby?.status === 'waiting') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-amber-400 animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Ожидание начала</h1>
                    <p className="text-slate-400 mb-6">
                        Вы в лобби <span className="text-emerald-400 font-mono font-bold">{lobby.code}</span>
                    </p>
                    <p className="text-slate-500 text-sm">
                        Преподаватель скоро начнёт тест. Не закрывайте страницу.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Ожидание...
                    </div>
                </div>
            </div>
        );
    }

    // РЕЗУЛЬТАТ (препод завершил ИЛИ студент сам завершил)
    const isPersonallyFinished = lobby?.participants?.[participantId]?.finishedAt !== undefined;

    if (finished || isPersonallyFinished) {
        const maxScore = test?.questions.length || lobby?.questionsCount || 0;
        const score = totalScore;
        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-8">
                <div className="text-center max-w-md w-full">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">Тест завершён!</h1>
                    <p className="text-slate-400 mb-8">{test?.title || lobby?.testTitle}</p>

                    <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-8 mb-6">
                        <p className="text-sm text-slate-500 mb-2">Ваш результат</p>
                        <div className="text-5xl font-black text-white mb-2">
                            {score} <span className="text-slate-500 text-2xl">/ {maxScore}</span>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${percentage >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                            percentage >= 60 ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                            {percentage >= 80 ? 'Отлично!' : percentage >= 60 ? 'Хорошо' : 'Попробуйте ещё'}
                        </div>
                    </div>

                    {test && (
                        <div className="space-y-2 mb-6 text-left">
                            {test.questions.map((q, i) => {
                                const submitted = submittedAnswers[q.id];
                                return (
                                    <div key={q.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                        <span className="text-slate-500 text-sm w-6">#{i + 1}</span>
                                        {submitted ? (
                                            submitted.correct ? (
                                                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                            ) : (
                                                <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                                            )
                                        ) : (
                                            <span className="text-slate-500 text-sm flex-shrink-0">—</span>
                                        )}
                                        <span className="text-slate-300 text-sm truncate flex-1">{q.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/')}
                        className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                    >
                        На главную
                    </button>
                </div>
            </div>
        );
    }

    // ========== АКТИВНЫЙ ТЕСТ ==========
    if (!test) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
            </div>
        );
    }

    const question = test.questions[currentQuestion];
    const hasAnswered = selectedAnswers[question.id] !== undefined ||
        submittedAnswers[question.id] !== undefined;
    const submitted = submittedAnswers[question.id];
    const allAnswered = test.questions.every(q =>
        selectedAnswers[q.id] !== undefined ||
        submittedAnswers[q.id] !== undefined
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
                {/* Прогресс */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-400">
                            Вопрос {currentQuestion + 1} из {test.questions.length}
                        </span>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400">
                                Счёт: <span className="text-emerald-400 font-bold">{totalScore}</span>
                            </span>
                            {allAnswered && (
                                <button
                                    onClick={finishPersonal}
                                    disabled={finishing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white text-sm font-bold rounded-lg transition-all"
                                >
                                    <Flag className="w-4 h-4" />
                                    {finishing ? 'Завершение...' : 'Завершить тест'}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / test.questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Вопрос */}
                <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-6 leading-relaxed">
                        {question.text}
                    </h2>

                    {/* КАРТИНКА ВОПРОСА — ВСТАВЬ СЮДА */}
                    {question.imageUrl && (
                        <img
                            src={question.imageUrl}
                            alt="Вопрос"
                            className="w-full max-h-64 object-contain rounded-xl mb-4 border border-slate-700"
                        />
                    )}

                    {/* Варианты ответов */}
                    <div className="space-y-3">
                        {question.type === 'text' ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={textAnswers[question.id] || ''}
                                    onChange={(e) => setTextAnswers({ ...textAnswers, [question.id]: e.target.value })}
                                    disabled={hasAnswered}
                                    placeholder="Введите ваш ответ..."
                                    className="w-full px-4 py-3 bg-slate-900/60 border-2 border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                                />
                                {!hasAnswered && (
                                    <button
                                        onClick={() => submitTextAnswer(question.id)}
                                        disabled={!textAnswers[question.id]?.trim()}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all"
                                    >
                                        Отправить ответ
                                    </button>
                                )}
                            </div>
                        ) : (
                            question.options.map((option: string, index: number) => {
                                const isSelected = question.type === 'single'
                                    ? selectedAnswers[question.id] === index
                                    : (multiAnswers[question.id] || []).includes(index);
                                const isCorrect = submitted?.correct && isSelected;
                                const isWrong = submitted && !submitted.correct && isSelected;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => question.type === 'single'
                                            ? selectAnswer(question.id, index)
                                            : toggleMultiAnswer(question.id, index)
                                        }
                                        disabled={hasAnswered && question.type === 'single'}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isCorrect
                                            ? 'bg-emerald-500/10 border-emerald-500/50'
                                            : isWrong
                                                ? 'bg-red-500/10 border-red-500/50'
                                                : isSelected
                                                    ? 'bg-blue-500/10 border-blue-500/50'
                                                    : 'bg-slate-900/60 border-slate-700 hover:border-slate-600'
                                            } ${hasAnswered && !isSelected ? 'opacity-50' : ''}`}
                                    >
                                        <span className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' :
                                            isWrong ? 'bg-red-500/20 text-red-400' :
                                                isSelected ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-slate-700 text-slate-400'
                                            }`}>
                                            {isCorrect ? <Check className="w-5 h-5" /> :
                                                isWrong ? <X className="w-5 h-5" /> :
                                                    question.type === 'multiple' ? (
                                                        <div className={`w-5 h-5 rounded border-2 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-400'}`}>
                                                            {isSelected && <Check className="w-3 h-3 text-white mx-auto" />}
                                                        </div>
                                                    ) : String.fromCharCode(65 + index)}
                                        </span>
                                        <span className="text-white font-medium">{option}</span>

                                        {/* КАРТИНКА ВАРИАНТА — ВСТАВЬ СЮДА */}
                                        {question.optionImages?.[index] && (
                                            <img
                                                src={question.optionImages[index]}
                                                alt={`Вариант ${index + 1}`}
                                                className="ml-auto w-16 h-16 object-cover rounded-lg border border-slate-700"
                                            />
                                        )}

                                        {isCorrect && <span className="ml-auto text-emerald-400 text-sm font-bold">Верно!</span>}
                                        {isWrong && <span className="ml-auto text-red-400 text-sm font-bold">Неверно</span>}
                                    </button>
                                );
                            })
                        )}

                        {/* Кнопка отправки для multiple */}
                        {question.type === 'multiple' && !hasAnswered && (
                            <button
                                onClick={() => submitMultiAnswer(question.id)}
                                disabled={(multiAnswers[question.id] || []).length === 0}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all mt-2"
                            >
                                Подтвердить выбор
                            </button>
                        )}
                    </div>
                </div>

                {/* Навигация */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={goToPrev}
                        disabled={currentQuestion === 0}
                        className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white font-medium rounded-xl transition-all"
                    >
                        ← Назад
                    </button>

                    <div className="flex gap-2">
                        {test.questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentQuestion(i)}
                                className={`w-3 h-3 rounded-full transition-all ${i === currentQuestion ? 'bg-emerald-400 w-6' :
                                    (selectedAnswers[test.questions[i].id] !== undefined || submittedAnswers[test.questions[i].id] !== undefined) ? 'bg-emerald-500/50' :
                                        'bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={goToNext}
                        disabled={currentQuestion === test.questions.length - 1}
                        className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white font-medium rounded-xl transition-all"
                    >
                        Далее →
                    </button>
                </div>

                {/* Кнопка завершения внизу (если все отвечены) */}
                {allAnswered && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={finishPersonal}
                            disabled={finishing}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-amber-500/20"
                        >
                            <Flag className="w-5 h-5" />
                            {finishing ? 'Завершение...' : 'Завершить тест и посмотреть результат'}
                        </button>
                        <p className="text-slate-500 text-sm mt-2">
                            Вы ответили на все вопросы. Можете завершить сейчас или дождаться окончания от преподавателя.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};