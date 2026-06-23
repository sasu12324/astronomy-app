import { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Trophy, Users } from 'lucide-react';

interface WheelComponentProps {
  items: string[];
  onSpinEnd?: (winner: string) => void;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
  '#10B981', '#EF4444', '#06B6D4', '#F97316',
  '#84CC16', '#F43F5E', '#06B6D4', '#A855F7'
];

export const WheelComponent = ({ items, onSpinEnd, colors = DEFAULT_COLORS }: WheelComponentProps) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 400;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    ctx.clearRect(0, 0, size, size);

    const anglePerItem = (2 * Math.PI) / items.length;

    // Рисуем секторы
    items.forEach((item, index) => {
      const startAngle = index * anglePerItem - Math.PI / 2;
      const endAngle = (index + 1) * anglePerItem - Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      const color = colors[index % colors.length];
      ctx.fillStyle = color;
      ctx.fill();

      ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Текст
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerItem / 2);

      const textRadius = radius * 0.65;
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.font = 'bold 13px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;

      let displayText = item;
      if (displayText.length > 18) {
        displayText = displayText.substring(0, 16) + '...';
      }

      ctx.fillText(displayText, textRadius, 4);
      ctx.restore();
    });

    // Внешнее кольцо
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Центральный круг
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Иконка в центре
    ctx.fillStyle = '#60a5fa';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', centerX, centerY);
  };

  useEffect(() => {
    drawWheel();
  }, [items]);

  const spin = () => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    const spins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + spins * 360 + randomAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      // ИСПРАВЛЕННЫЙ РАСЧЁТ ПОБЕДИТЕЛЯ
      // Стрелка находится сверху (0 градусов / 360 градусов)
      // Колесо вращается по часовой стрелке (положительный угол)
      // Нужно найти, какой сектор оказался под стрелкой
      
      const finalAngle = totalRotation % 360;
      
      // Угол одного сектора
      const anglePerItem = 360 / items.length;
      
      // Стрелка указывает на ВЕРХ (0°). 
      // После вращения колеса на finalAngle по часовой стрелке,
      // сектор под стрелкой — это тот, который "приехал" наверх.
      // 
      // Сектор 0 рисуется от -90° до (-90° + anglePerItem)
      // После вращения на finalAngle, сектор 0 занимает углы:
      // от (-90° + finalAngle) до (-90° + finalAngle + anglePerItem)
      //
      // Стрелка на 0° (верх). Ищем сектор, содержащий угол 0°.
      // Для сектора i после вращения на finalAngle:
      // начало: -90° + finalAngle + i * anglePerItem
      // конец: -90° + finalAngle + (i+1) * anglePerItem
      //
      // Нужно: начало <= 0° < конец (по модулю 360)
      // -90° + finalAngle + i * anglePerItem <= 0°
      // i * anglePerItem <= 90° - finalAngle
      // i <= (90° - finalAngle) / anglePerItem
      //
      // Берём floor и нормализуем по модулю items.length
      
      // Нормализуем: приводим к диапазону [0, 360)
      const normalizedAngle = ((finalAngle % 360) + 360) % 360;
      
      // Стрелка сверху (0° в стандартной системе, но canvas рисует с -90°)
      // Сектор под стрелкой = тот, чей центр ближе всего к верху
      // Или проще: считаем, что стрелка указывает на угол 0° (верх)
      // После вращения колеса на normalizedAngle по часовой,
      // "верх" колеса (было -90°) сдвинулось на normalizedAngle
      // Значит теперь на верху находится то, что было на угле -normalizedAngle
      
      // Проще: инвертируем направление
      // Колесо крутится по часовой → содержимое движется против часовой
      // Стрелка сверху. Что под стрелкой? То, что "пришло" сверху.
      // Если колесо провернулось на normalizedAngle по часовой,
      // то элемент, который был на угле (360 - normalizedAngle) от верха,
      // теперь оказался сверху.
      
      // Ещё проще: представим, что стрелка — это линия на 0°.
      // Колесо повернулось на normalizedAngle по часовой.
      // Значит содержимое сдвинулось на normalizedAngle против часовой.
      // Элемент, который был на угле θ, теперь на угле (θ - normalizedAngle).
      // Ищем элемент, у которого (θ - normalizedAngle) ≡ 0 (mod 360)
      // θ ≡ normalizedAngle (mod 360)
      
      // Но элемент 0 начинается с -90° (верх)
      // Центр элемента i: -90° + i * anglePerItem + anglePerItem/2
      // После вращения: -90° + i * anglePerItem + anglePerItem/2 - normalizedAngle
      // Приравниваем к 0° (верх):
      // -90° + i * anglePerItem + anglePerItem/2 - normalizedAngle = 0°
      // i * anglePerItem = 90° + normalizedAngle - anglePerItem/2
      // i = (90° + normalizedAngle - anglePerItem/2) / anglePerItem
      
      // Альтернативно: используем offset от верха
      // Стрелка указывает на верх. После вращения на normalizedAngle по часовой,
      // элемент под стрелкой — это элемент, центр которого был на угле
      // (normalizedAngle + 90°) относительно начальной позиции верха.
      // Потому что верх сдвинулся на normalizedAngle по часовой,
      // значит чтобы вернуться к верху, нужно сдвинуть на normalizedAngle против часовой.
      
      // ПРАВИЛЬНАЯ ФОРМУЛА:
      // Стрелка на 12 часов (0° или 360°).
      // Колесо повернулось на normalizedAngle по часовой.
      // Элемент под стрелкой = элемент, чей центр оказался на 12 часов.
      // Центр элемента i изначально на угле: i * anglePerItem (относительно 0° = 3 часа)
      // Но мы рисуем с -90° (12 часов), так что:
      // Центр элемента i изначально: -90° + i * anglePerItem + anglePerItem/2
      // После вращения на normalizedAngle: -90° + i * anglePerItem + anglePerItem/2 + normalizedAngle
      // Приводим к [0, 360): (-90° + i * anglePerItem + anglePerItem/2 + normalizedAngle + 360) % 360
      // Ищем, когда это равно 0° (верх):
      // (-90 + i * anglePerItem + anglePerItem/2 + normalizedAngle) % 360 = 0
      // i * anglePerItem = 90 - normalizedAngle - anglePerItem/2 (mod 360)
      
      // Ещё проще через "обратное" вращение:
      // Если колесо провернулось на normalizedAngle по часовой,
      // то чтобы узнать, что оказалось наверху, 
      // мысленно крутим колесо на normalizedAngle ПРОТИВ часовой.
      // Элемент, который был на позиции 0° (верх), окажется на угле normalizedAngle.
      // Но нам нужно наоборот: что оказалось на 0°?
      // Это элемент, который был на угле -normalizedAngle (или 360 - normalizedAngle)
      
      // Финальная простая формула:
      // Берём угол, на который провернулось колесо (normalizedAngle)
      // Делим на угол сектора, берём остаток от деления на количество секторов
      // Но нужно инвертировать направление, потому что колесо крутится по часовой,
      // а элементы движутся против
      
      const effectiveAngle = (360 - normalizedAngle) % 360;
      const winnerIndex = Math.floor(effectiveAngle / anglePerItem) % items.length;
      
      const selectedWinner = items[winnerIndex];

      setWinner(selectedWinner);
      setIsSpinning(false);
      onSpinEnd?.(selectedWinner);
    }, 4000);
  };

  const reset = () => {
    setRotation(0);
    setWinner(null);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Users className="w-12 h-12 mb-3 text-slate-600" />
        <p className="text-lg font-medium">Добавьте студентов в колесо</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Колесо с указателем */}
      <div className="relative">
        {/* Внешнее свечение */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl scale-110" />

        <canvas
          ref={canvasRef}
          className="relative z-10 transition-transform duration-[4000ms]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)'
          }}
        />

        {/* Указатель сверху */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
          <div className="relative">
            <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-300 rounded-full shadow-lg shadow-yellow-400/50" />
          </div>
        </div>

        {/* Декоративное кольцо */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-700/50 pointer-events-none z-10" />
      </div>

      {/* Результат */}
      {winner && (
        <div className="text-center animate-in zoom-in duration-300">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-3">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Выпал</span>
          </div>
          <p className="text-3xl font-black text-white bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
            {winner}
          </p>
        </div>
      )}

      {/* Кнопки управления */}
      <div className="flex gap-4">
        <button
          onClick={spin}
          disabled={isSpinning}
          className="flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold text-lg rounded-2xl transition-all transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-xl shadow-blue-600/25 disabled:shadow-none"
        >
          <Play className={`w-6 h-6 ${isSpinning ? 'animate-pulse' : ''}`} />
          {isSpinning ? 'Крутится...' : 'Крутить колесо'}
        </button>

        <button
          onClick={reset}
          disabled={isSpinning}
          className="flex items-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold rounded-2xl transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          Сброс
        </button>
      </div>

      {/* Подсказка */}
      <p className="text-slate-500 text-sm">
        Нажмите «Крутить колесо», чтобы случайно выбрать студента
      </p>
    </div>
  );
};