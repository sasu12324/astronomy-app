import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wheelService } from '../services/wheel.service.js';
import { WheelComponent } from '../components/wheel/WheelComponent.js';
import type { Wheel } from '../types/index.js';
import {
    Plus,
    Save,
    Trash2,
    Edit3,
    X,
    ChevronDown,
    Users,
    Sparkles,
    ArrowLeft,
    UserPlus,
    GripVertical
} from 'lucide-react';

export const WheelPage = () => {
    const [wheels, setWheels] = useState<Wheel[]>([]);
    const [selectedWheel, setSelectedWheel] = useState<Wheel | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [wheelName, setWheelName] = useState('');
    const [studentsInput, setStudentsInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    useEffect(() => {
        loadWheels();
    }, []);

    const loadWheels = async () => {
        try {
            const data = await wheelService.getAll();
            setWheels(data);
        } catch (error) {
            console.error('Ошибка загрузки колёс:', error);
        }
    };

    const parseStudents = (input: string): string[] => {
        return input
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0);
    };

    const handleCreate = async () => {
        const items = parseStudents(studentsInput);
        if (!wheelName || items.length === 0) return;

        setLoading(true);
        try {
            const newWheel = await wheelService.create(wheelName, items);
            setWheels([newWheel, ...wheels]);
            setSelectedWheel(newWheel);
            setIsCreating(false);
            setWheelName('');
            setStudentsInput('');
        } catch (error) {
            console.error('Ошибка создания:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedWheel) return;
        const items = parseStudents(studentsInput);

        setLoading(true);
        try {
            await wheelService.update(selectedWheel.id, wheelName, items);
            await loadWheels();
            setIsEditing(false);
            setSelectedWheel(null);
        } catch (error) {
            console.error('Ошибка обновления:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить это колесо?')) return;

        try {
            await wheelService.delete(id);
            setWheels(wheels.filter(w => w.id !== id));
            if (selectedWheel?.id === id) setSelectedWheel(null);
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    };

    const startEdit = (wheel: Wheel) => {
        setSelectedWheel(wheel);
        setWheelName(wheel.name);
        setStudentsInput(wheel.items.join('\n'));
        setIsEditing(true);
        setIsCreating(false);
    };

    const startCreate = () => {
        setIsCreating(true);
        setIsEditing(false);
        setWheelName('');
        setStudentsInput('');
        setSelectedWheel(null);
    };

    const cancelForm = () => {
        setIsCreating(false);
        setIsEditing(false);
        setWheelName('');
        setStudentsInput('');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Фоновый градиент */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Шапка */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Колесо фортуны
                            </h1>
                        </div>
                        <p className="text-slate-400 text-base ml-13">
                            Создавайте группы студентов и случайно выбирайте отвечающих
                        </p>
                    </div>
                    <button
                        onClick={startCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        Новая группа
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Левая колонка — список групп */}
                    <div className="lg:col-span-4">
                        {/* Мобильный переключатель */}
                        <button
                            onClick={() => setShowSaved(!showSaved)}
                            className="lg:hidden w-full flex items-center justify-between p-4 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 mb-4"
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                <span className="font-semibold text-white">Сохранённые группы</span>
                                <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">
                                    {wheels.length}
                                </span>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showSaved ? 'rotate-180' : ''}`} />
                        </button>

                        <div className={`${showSaved ? 'block' : 'hidden lg:block'}`}>
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <Users className="w-5 h-5 text-blue-400" />
                                <h2 className="text-lg font-bold text-white">Сохранённые группы</h2>
                                <span className="px-2.5 py-0.5 bg-slate-700 rounded-full text-xs font-medium text-slate-300">
                                    {wheels.length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {wheels.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700/50 border-dashed">
                                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium">Нет сохранённых групп</p>
                                        <p className="text-slate-600 text-sm mt-1">Создайте первую группу студентов</p>
                                    </div>
                                ) : (
                                    wheels.map(wheel => (
                                        <div
                                            key={wheel.id}
                                            onClick={() => { setSelectedWheel(wheel); setIsCreating(false); setIsEditing(false); }}
                                            className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedWheel?.id === wheel.id
                                                ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                                : 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-bold text-base truncate ${selectedWheel?.id === wheel.id ? 'text-blue-300' : 'text-white'}`}>
                                                        {wheel.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/80 rounded-md text-xs font-medium text-slate-300">
                                                            <UserPlus className="w-3 h-3" />
                                                            {wheel.items.length} студентов
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); startEdit(wheel); }}
                                                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Редактировать"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(wheel.id); }}
                                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Удалить"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {selectedWheel?.id === wheel.id && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка — основная область */}
                    <div className="lg:col-span-8">
                        {/* Форма создания/редактирования */}
                        {(isCreating || isEditing) && (
                            <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isEditing ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                                            {isEditing ? <Edit3 className="w-5 h-5 text-amber-400" /> : <Plus className="w-5 h-5 text-blue-400" />}
                                        </div>
                                        <h2 className="text-xl font-bold text-white">
                                            {isEditing ? 'Редактировать группу' : 'Новая группа студентов'}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={cancelForm}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Название */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">
                                            Название группы
                                        </label>
                                        <input
                                            type="text"
                                            value={wheelName}
                                            onChange={(e) => setWheelName(e.target.value)}
                                            placeholder="Например: ИС-101 или Группа А"
                                            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                                        />
                                    </div>

                                    {/* Студенты */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">
                                            Список студентов
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                value={studentsInput}
                                                onChange={(e) => setStudentsInput(e.target.value)}
                                                placeholder="Введите ФИО студентов, каждое с новой строки:&#10;Иванов Иван Иванович&#10;Петров Петр Петрович&#10;Сидоров Александр Сергеевич"
                                                rows={10}
                                                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-base leading-relaxed"
                                            />
                                            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-slate-800 rounded-lg text-xs font-medium text-slate-400 border border-slate-700">
                                                {parseStudents(studentsInput).length} чел.
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                            <GripVertical className="w-3 h-3" />
                                            Каждый студент — с новой строки
                                        </p>
                                    </div>

                                    {/* Кнопки */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={cancelForm}
                                            className="flex-1 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            onClick={isEditing ? handleUpdate : handleCreate}
                                            disabled={loading || !wheelName || parseStudents(studentsInput).length === 0}
                                            className="flex-[2] flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:shadow-none"
                                        >
                                            <Save className="w-5 h-5" />
                                            {loading ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Создать группу')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Просмотр колеса */}
                        {!isCreating && !isEditing && selectedWheel && (
                            <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedWheel.name}</h2>
                                        <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            {selectedWheel.items.length} студентов в группе
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEdit(selectedWheel)}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Изменить</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col items-center">
                                    <WheelComponent
                                        items={selectedWheel.items}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Пустое состояние */}
                        {!isCreating && !isEditing && !selectedWheel && (
                            <div className="flex flex-col items-center justify-center min-h-[500px] bg-slate-800/40 rounded-2xl border border-slate-700/50 border-dashed">
                                <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mb-6">
                                    <Sparkles className="w-10 h-10 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-400 mb-2">Выберите группу</h3>
                                <p className="text-slate-500 text-center max-w-sm mb-6">
                                    Выберите сохранённую группу из списка слева или создайте новую, чтобы начать
                                </p>
                                <button
                                    onClick={startCreate}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                                >
                                    <Plus className="w-5 h-5" />
                                    Создать группу
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};