import { useAuthStore } from '../stores/authStore.js';
import { Link } from 'react-router-dom';
import { BookOpen, Newspaper, FlaskConical, CircleDot, GraduationCap, Users } from 'lucide-react';

export const HomePage = () => {
  const { profile, isTeacher } = useAuthStore();

  const role = isTeacher() ? 'teacher' : 'student';

  const cards = [
    {
      title: 'Новости',
      description: 'Последние открытия и события в мире астрономии',
      icon: <Newspaper className="w-8 h-8 text-blue-500" />,
      link: '/news',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Учебник',
      description: 'Изучайте астрономию по разделам от простого к сложному',
      icon: <BookOpen className="w-8 h-8 text-emerald-500" />,
      link: '/textbook',
      color: 'bg-emerald-50 border-emerald-200'
    },
    ...(role === 'teacher' ? [
      {
        title: 'Управление тестами',
        description: 'Создавайте, редактируйте и запускайте тесты для студентов',
        icon: <FlaskConical className="w-8 h-8 text-purple-500" />,
        link: '/tests/manage',
        color: 'bg-purple-50 border-purple-200'
      },
      {
        title: 'Колесо фортуны',
        description: 'Случайный выбор студентов для ответов и активностей',
        icon: <CircleDot className="w-8 h-8 text-orange-500" />,
        link: '/wheel',
        color: 'bg-orange-50 border-orange-200'
      }
    ] : [
      {
        title: 'Пройти тест',
        description: 'Присоединяйтесь к тестам по коду от преподавателя',
        icon: <FlaskConical className="w-8 h-8 text-purple-500" />,
        link: '/tests/join',
        color: 'bg-purple-50 border-purple-200'
      }
    ])
  ];

  return (
    // ИЗМЕНЕНО ЗДЕСЬ: добавил py-8 (отступы по вертикали) и px-4 (отступы по горизонтали для мобилок)
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Приветствие */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            {role === 'teacher' ? (
              <Users className="w-7 h-7" />
            ) : (
              <GraduationCap className="w-7 h-7" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Добро пожаловать, {profile?.firstName}!
            </h1>
            <p className="text-slate-300 mt-1">
              {role === 'teacher'
                ? 'Вы вошли как преподаватель'
                : 'Вы вошли как учащийся'}
            </p>
          </div>
        </div>
        <p className="text-slate-400 max-w-2xl">
          {role === 'teacher'
            ? 'Управляйте тестами, добавляйте новости, создавайте задания и используйте колесо фортуны для интерактивных занятий.'
            : 'Проходите тесты, изучайте учебник по астрономии и следите за последними новостями из мира науки.'}
        </p>
      </div>

      {/* Карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className={`group p-6 rounded-xl border-2 ${card.color} hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-white shadow-sm">
                {card.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-800 group-hover:text-slate-900">
                  {card.title}
                </h2>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  {card.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 mt-3 group-hover:gap-2 transition-all">
                  Перейти →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Доп. информация */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="text-2xl font-bold text-slate-800">🪐</div>
          <h3 className="font-semibold text-slate-700 mt-2">Солнечная система</h3>
          <p className="text-sm text-slate-500 mt-1">8 планет, множество спутников и малых тел</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="text-2xl font-bold text-slate-800">⭐</div>
          <h3 className="font-semibold text-slate-700 mt-2">Звёзды</h3>
          <p className="text-sm text-slate-500 mt-1">От протозвёзд до нейтронных звёзд и чёрных дыр</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="text-2xl font-bold text-slate-800">🌌</div>
          <h3 className="font-semibold text-slate-700 mt-2">Галактики</h3>
          <p className="text-sm text-slate-500 mt-1">Млечный Путь и за его пределами</p>
        </div>
      </div>
    </div>
  );
};
