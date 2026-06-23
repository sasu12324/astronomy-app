import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../services/test.service.js';
import { lobbyService } from '../services/lobby.service.js';
import { ImageUpload } from '../components/ImageUpload.js';
import type { Test, Question } from '../types/index.js';
import {
    Plus,
    Trash2,
    Edit3,
    Play,
    FileText,
    HelpCircle,
    X,
    Save
} from 'lucide-react';

export const TestsManagePage = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState<Test[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingTest, setEditingTest] = useState<Test | null>(null);
    const [activeLobbies, setActiveLobbies] = useState<Record<string, string>>({}); // testId -> lobbyId


    // Форма
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        loadTests();
    }, []);

    const loadTests = async () => {
        try {
            const data = await testService.getAll();
            setTests(data);
        } catch (error) {
            console.error('Ошибка загрузки тестов:', error);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            id: crypto.randomUUID(),
            type: 'single',
            text: '',
            options: ['', ''],
            correctOptionIndex: 0,
            correctOptionIndexes: [],
            correctText: '',
            imageUrl: '',
            optionImages: []
        }]);
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleCreate = async () => {
        if (!title || questions.length === 0) return;
        if (questions.some(q => !q.text || q.options.some(o => !o))) return;

        try {
            await testService.create({ title, description, questions });
            await loadTests();
            resetForm();
        } catch (error) {
            console.error('Ошибка создания:', error);
        }
    };

    const handleUpdate = async () => {
        if (!editingTest || !title || questions.length === 0) return;

        try {
            await testService.update(editingTest.id, { title, description, questions });
            await loadTests();
            resetForm();
        } catch (error) {
            console.error('Ошибка обновления:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить этот тест?')) return;
        try {
            await testService.delete(id);
            await loadTests();
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    };

    const startEdit = (test: Test) => {
        setEditingTest(test);
        setTitle(test.title);
        setDescription(test.description || '');
        setQuestions(test.questions);
        setIsEditing(true);
        setIsCreating(false);
    };

    const startCreate = () => {
        resetForm();
        setIsCreating(true);
        setIsEditing(false);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setQuestions([]);
        setIsCreating(false);
        setIsEditing(false);
        setEditingTest(null);
    };

    const createLobby = async (testId: string) => {
        try {
            const lobby = await lobbyService.create(testId);
            setActiveLobbies({ ...activeLobbies, [testId]: lobby.id });
        } catch (error) {
            console.error('Ошибка создания лобби:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Шапка */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            Управление тестами
                        </h1>
                        <p className="text-slate-400 text-base mt-2">
                            Создавайте, редактируйте и запускайте тесты для студентов
                        </p>
                    </div>
                    {!isCreating && !isEditing && (
                        <button
                            onClick={startCreate}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            Новый тест
                        </button>
                    )}
                </div>

                {/* Форма создания/редактирования */}
                {(isCreating || isEditing) && (
                    <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden mb-8">
                        <div className="px-6 py-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
                            <h2 className="text-xl font-bold text-white">
                                {isEditing ? 'Редактировать тест' : 'Создать новый тест'}
                            </h2>
                            <button onClick={resetForm} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Название и описание */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Название теста</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Например: Тест по Солнечной системе"
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Описание (необязательно)</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Краткое описание теста"
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Вопросы */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-bold text-slate-300">Вопросы ({questions.length})</label>
                                    <button
                                        onClick={addQuestion}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Добавить вопрос
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {questions.map((q, qIndex) => (
                                        <div key={q.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
                                            <div className="flex items-start gap-3">
                                                <span className="flex-shrink-0 w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-sm font-bold text-slate-300">
                                                    {qIndex + 1}
                                                </span>
                                                <div className="flex-1 space-y-4">
                                                    {/* Тип и текст вопроса */}
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={q.type}
                                                            onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                                            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        >
                                                            <option value="single">Один ответ</option>
                                                            <option value="multiple">Несколько ответов</option>
                                                            <option value="text">Текстовый ответ</option>
                                                        </select>
                                                        <input
                                                            type="text"
                                                            value={q.text}
                                                            onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                                            placeholder="Текст вопроса"
                                                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        />
                                                    </div>

                                                    {/* Картинка вопроса */}
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-2">Картинка к вопросу (необязательно)</p>
                                                        <ImageUpload
                                                            value={q.imageUrl}
                                                            onChange={(url: string) => updateQuestion(qIndex, 'imageUrl', url)}
                                                            label="Загрузить картинку вопроса"
                                                        />
                                                    </div>

                                                    {/* Варианты ответов (single/multiple) */}
                                                    {(q.type === 'single' || q.type === 'multiple') && (
                                                        <div className="space-y-3">
                                                            {q.options.map((opt, oIndex) => (
                                                                <div key={oIndex} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        {q.type === 'single' ? (
                                                                            <input
                                                                                type="radio"
                                                                                name={`correct-${q.id}`}
                                                                                checked={q.correctOptionIndex === oIndex}
                                                                                onChange={() => updateQuestion(qIndex, 'correctOptionIndex', oIndex)}
                                                                                className="w-4 h-4 text-emerald-500"
                                                                            />
                                                                        ) : (
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={(q.correctOptionIndexes || []).includes(oIndex)}
                                                                                onChange={(e) => {
                                                                                    const current = q.correctOptionIndexes || [];
                                                                                    const updated = e.target.checked
                                                                                        ? [...current, oIndex]
                                                                                        : current.filter(i => i !== oIndex);
                                                                                    updateQuestion(qIndex, 'correctOptionIndexes', updated);
                                                                                }}
                                                                                className="w-4 h-4 text-emerald-500 rounded"
                                                                            />
                                                                        )}
                                                                        <input
                                                                            type="text"
                                                                            value={opt}
                                                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                                            placeholder={`Вариант ${oIndex + 1}`}
                                                                            className={`flex-1 px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${(q.type === 'single' && q.correctOptionIndex === oIndex) ||
                                                                                (q.type === 'multiple' && (q.correctOptionIndexes || []).includes(oIndex))
                                                                                ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
                                                                                : 'border-slate-600'
                                                                                }`}
                                                                        />
                                                                        <button
                                                                            onClick={() => {
                                                                                const updated = [...questions];
                                                                                updated[qIndex].options.splice(oIndex, 1);
                                                                                updated[qIndex].optionImages?.splice(oIndex, 1);
                                                                                setQuestions(updated);
                                                                            }}
                                                                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                                                                            title="Удалить вариант"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </div>

                                                                    {/* Картинка варианта */}
                                                                    <div className="ml-6">
                                                                        <p className="text-xs text-slate-500 mb-1">Картинка к варианту (необязательно)</p>
                                                                        <div className="max-w-xs">
                                                                            <ImageUpload
                                                                                value={q.optionImages?.[oIndex]}
                                                                                onChange={(url: string) => {
                                                                                    const updated = [...(q.optionImages || [])];
                                                                                    updated[oIndex] = url;
                                                                                    updateQuestion(qIndex, 'optionImages', updated);
                                                                                }}
                                                                                label="Картинка"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            {q.options.length < 6 && (
                                                                <button
                                                                    onClick={() => {
                                                                        const updated = [...questions];
                                                                        updated[qIndex].options.push('');
                                                                        if (!updated[qIndex].optionImages) updated[qIndex].optionImages = [];
                                                                        updated[qIndex].optionImages.push('');
                                                                        setQuestions(updated);
                                                                    }}
                                                                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                                                >
                                                                    + Добавить вариант
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Текстовый ответ */}
                                                    {q.type === 'text' && (
                                                        <div>
                                                            <label className="block text-xs text-slate-500 mb-1">Правильный ответ (можно несколько вариантов через | )</label>
                                                            <input
                                                                type="text"
                                                                value={q.correctText || ''}
                                                                onChange={(e) => updateQuestion(qIndex, 'correctText', e.target.value)}
                                                                placeholder="Например: Земля | земля | Earth"
                                                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => removeQuestion(qIndex)}
                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Удалить вопрос"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Кнопки */}
                            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                                <button
                                    onClick={resetForm}
                                    className="flex-1 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={isEditing ? handleUpdate : handleCreate}
                                    disabled={!title || questions.length === 0 || questions.some(q => !q.text || q.options.some(o => !o))}
                                    className="flex-[2] flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:shadow-none"
                                >
                                    <Save className="w-5 h-5" />
                                    {isEditing ? 'Сохранить изменения' : 'Создать тест'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Список тестов */}
                {!isCreating && !isEditing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tests.length === 0 ? (
                            <div className="col-span-full text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-700/50 border-dashed">
                                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-400 mb-2">Нет тестов</h3>
                                <p className="text-slate-500 mb-6">Создайте первый тест, чтобы начать</p>
                                <button
                                    onClick={startCreate}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    Создать тест
                                </button>
                            </div>
                        ) : (
                            tests.map(test => (
                                <div key={test.id} className="bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-all">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="text-lg font-bold text-white line-clamp-2">{test.title}</h3>
                                            <div className="flex gap-1 ml-2">
                                                <button
                                                    onClick={() => startEdit(test)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                    title="Редактировать"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(test.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Удалить"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{test.description || 'Без описания'}</p>

                                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                            <span className="flex items-center gap-1">
                                                <HelpCircle className="w-4 h-4" />
                                                {test.questions.length} вопросов
                                            </span>
                                        </div>

                                        {/* Лобби */}
                                        {activeLobbies[test.id] ? (
                                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                                <p className="text-sm text-emerald-300 font-medium mb-2">Лобби активно</p>
                                                <div className="flex items-center gap-2">
                                                    <code className="flex-1 px-3 py-2 bg-slate-900 rounded-lg text-emerald-400 font-mono text-lg font-bold tracking-wider">
                                                        {/* Код будет загружен отдельно */}
                                                        LOBBY
                                                    </code>
                                                    <button
                                                        onClick={() => navigate(`/lobby/${activeLobbies[test.id]}`)}
                                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => createLobby(test.id)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all"
                                            >
                                                <Play className="w-4 h-4" />
                                                Создать лобби
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};