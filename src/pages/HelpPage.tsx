import { useAuthStore } from '../stores/authStore.js';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    FlaskConical,
    Newspaper,
    CircleDot,
    Users,
    HelpCircle,
    Play,
    CheckCircle,
    Edit3,
    UserPlus,
    MonitorPlay
} from 'lucide-react';

export const HelpPage = () => {
    const { isAuthenticated, isTeacher } = useAuthStore();

    // Определяем текущую роль
    const role = !isAuthenticated ? 'guest' : isTeacher() ? 'teacher' : 'student';

    return (
        <div className="min-h-screen bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8">
            {/* Фоновые эффекты */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto">
                {/* Шапка страницы */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <HelpCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Справка и руководство</h1>
                        <p className="text-slate-400 mt-1">
                            {role === 'teacher' && 'Как организовать обучение и проводить тесты'}
                            {role === 'student' && 'Как проходить тесты и изучать материалы'}
                            {role === 'guest' && 'Как присоединиться к тесту без регистрации'}
                        </p>
                    </div>
                </div>

                {/* КОНТЕНТ ДЛЯ ПРЕПОДАВАТЕЛЯ */}
                {role === 'teacher' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400"><FlaskConical className="w-6 h-6" /></div>
                                    <h2 className="text-xl font-bold">1. Создание тестов</h2>
                                </div>
                                <ul className="space-y-3 text-slate-300 text-sm">
                                    <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" /> Перейдите в раздел «Тесты» и нажмите «Новый тест».</li>
                                    <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" /> Добавляйте вопросы разных типов: один ответ, несколько или текстовый ввод.</li>
                                    <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" /> К вопросам и вариантам ответов можно прикреплять изображения.</li>
                                </ul>
                            </div>

                            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400"><MonitorPlay className="w-6 h-6" /></div>
                                    <h2 className="text-xl font-bold">2. Проведение тестирования</h2>
                                </div>
                                <ul className="space-y-3 text-slate-300 text-sm">
                                    <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Нажмите «Создать лобби» рядом с нужным тестом.</li>
                                    <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Сообщите студентам 6-значный код лобби.</li>
                                    <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Дождитесь подключения участников и нажмите «Начать тест». Вы будете видеть их прогресс в реальном времени.</li>
                                </ul>
                            </div>

                            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400"><Edit3 className="w-6 h-6" /></div>
                                    <h2 className="text-xl font-bold">3. Учебник и Материалы</h2>
                                </div>
                                <ul className="space-y-3 text-slate-300 text-sm">
                                    <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" /> В разделе «Материалы» можно добавлять ссылки на полезные статьи и YouTube-видео.</li>
                                    <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" /> В разделе «Учебник» доступен визуальный редактор для создания полноценных лекций с форматированием и картинками.</li>
                                </ul>
                            </div>

                            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-orange-500/20 rounded-xl text-orange-400"><CircleDot className="w-6 h-6" /></div>
                                    <h2 className="text-xl font-bold">4. Колесо фортуны</h2>
                                </div>
                                <ul className="space-y-3 text-slate-300 text-sm">
                                    <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" /> Создавайте списки групп (каждый студент с новой строки).</li>
                                    <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" /> Крутите колесо на занятии, чтобы случайным образом выбрать отвечающего.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* КОНТЕНТ ДЛЯ СТУДЕНТА */}
                {role === 'student' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400"><Play className="w-6 h-6" /></div>
                                    <h2 className="text-xl font-bold">Как пройти тест?</h2>
                                </div>
                                <ul className="space-y-3 text-slate-300 text-sm">
                                    <li className="flex gap-2"><span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span> Получите 6-значный код у преподавателя.</li>
                                    <li className="flex gap-2"><span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span> Перейдите в раздел «Тесты» и введите код.</li>
                                    <li className="flex gap-2"><span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span> Дождитесь, пока преподаватель запустит тест.</li>
                                    <li className="flex gap-2"><span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span> Внимательно читайте вопросы. После ответа на все вопросы нажмите «Завершить тест», чтобы увидеть свой результат.</li>
                                </ul>
                                <Link to="/tests/join" className="mt-6 inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm">
                                    Перейти к тестам →
                                </Link>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400"><BookOpen className="w-6 h-6" /></div>
                                        <h2 className="text-xl font-bold">Учебник</h2>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-4">
                                        В разделе учебника собраны все лекции по курсу. Вы можете использовать оглавление слева для быстрой навигации по темам.
                                    </p>
                                    <Link to="/textbook" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm">
                                        Открыть учебник →
                                    </Link>
                                </div>

                                <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400"><Newspaper className="w-6 h-6" /></div>
                                        <h2 className="text-xl font-bold">Доп. материалы</h2>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-4">
                                        Преподаватель публикует здесь интересные статьи и обучающие видеоролики для самостоятельного изучения.
                                    </p>
                                    <Link to="/news" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium text-sm">
                                        Смотреть материалы →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* КОНТЕНТ ДЛЯ ГОСТЯ */}
                {role === 'guest' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400"><Play className="w-6 h-6" /></div>
                                    <h2 className="text-xl font-bold">Присоединиться к тесту</h2>
                                </div>
                                <p className="text-slate-300 text-sm mb-6">
                                    Вы можете пройти тест без регистрации на сайте. Для этого:
                                </p>
                                <ul className="space-y-4 text-slate-300 text-sm mb-6">
                                    <li className="flex gap-3">
                                        <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                                        Узнайте 6-значный код лобби у вашего преподавателя.
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                                        Введите код на странице подключения.
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                                        Укажите свои настоящие Фамилию и Имя, чтобы преподаватель смог оценить вашу работу.
                                    </li>
                                </ul>
                                <Link to="/tests/join" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all">
                                    Ввести код теста
                                </Link>
                            </div>

                            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700 flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400"><UserPlus className="w-6 h-6" /></div>
                                    <h2 className="text-xl font-bold">Зачем нужна регистрация?</h2>
                                </div>
                                <p className="text-slate-300 text-sm mb-4">
                                    Создав аккаунт, вы получите полный доступ к платформе:
                                </p>
                                <ul className="space-y-3 text-slate-300 text-sm flex-1">
                                    <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Вам не придется каждый раз вводить свое имя перед тестом.</li>
                                    <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Доступ к интерактивному учебнику по астрономии.</li>
                                    <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Просмотр дополнительных материалов и видеороликов.</li>
                                </ul>
                                <div className="mt-6 flex gap-3">
                                    <Link to="/register" className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">
                                        Регистрация
                                    </Link>
                                    <Link to="/login" className="flex-1 flex items-center justify-center px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">
                                        Вход
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
