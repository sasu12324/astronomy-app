import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { textbookService } from '../services/textbook.service.js';
import { useAuthStore } from '../stores/authStore.js';
import type { TextbookLecture } from '../types/index.js';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Edit3,
  Plus,
  Trash2,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';

export const TextbookPage = () => {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const { isTeacher } = useAuthStore();

  const [lectures, setLectures] = useState<Array<{ id: string; order: number; number: string; title: string }>>([]);
  const [currentLecture, setCurrentLecture] = useState<TextbookLecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadLectures();
  }, []);

  useEffect(() => {
    if (lectureId) {
      loadLecture(lectureId);
    } else if (lectures.length > 0) {
      navigate(`/textbook/${lectures[0].id}`, { replace: true });
    }
  }, [lectureId, lectures]);

  const loadLectures = async () => {
    try {
      const data = await textbookService.getAll();
      setLectures(data);
      
      if (!lectureId && data.length > 0) {
        navigate(`/textbook/${data[0].id}`, { replace: true });
      } else if (data.length === 0) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Ошибка загрузки лекций:', error);
      setLoading(false);
    }
  };

  const loadLecture = async (id: string) => {
    setLoading(true);
    try {
      const data = await textbookService.getById(id);
      setCurrentLecture(data);
    } catch (error) {
      console.error('Ошибка загрузки лекции:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToLecture = (id: string) => {
    navigate(`/textbook/${id}`);
    setSidebarOpen(false);
  };

  const goToPrev = () => {
    const idx = lectures.findIndex(l => l.id === lectureId);
    if (idx > 0) goToLecture(lectures[idx - 1].id);
  };

  const goToNext = () => {
    const idx = lectures.findIndex(l => l.id === lectureId);
    if (idx < lectures.length - 1) goToLecture(lectures[idx + 1].id);
  };

  const handleDelete = async () => {
    if (!currentLecture || !confirm('Удалить эту лекцию?')) return;
    try {
      await textbookService.delete(currentLecture.id);
      await loadLectures();
      if (lectures.length > 1) {
        const idx = lectures.findIndex(l => l.id === currentLecture.id);
        const nextId = lectures[idx + 1]?.id || lectures[idx - 1]?.id;
        if (nextId) goToLecture(nextId);
      } else {
        setCurrentLecture(null);
        navigate('/textbook');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  // Обработчик клика по контенту для увеличения картинок
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      setSelectedImage((target as HTMLImageElement).src);
    }
  };

  if (loading && !currentLecture) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-start">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg border border-slate-700"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={`
        fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-40 w-80 flex-shrink-0 bg-slate-800/95 backdrop-blur border-r border-slate-700
        transform transition-transform duration-300 lg:transform-none flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Оглавление
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {lectures.map((lecture) => (
            <button
              key={lecture.id}
              onClick={() => goToLecture(lecture.id)}
              className={`w-full text-left px-4 py-3 border-b border-slate-700/50 transition-all ${
                lecture.id === lectureId
                  ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500'
                  : 'hover:bg-slate-700/50 border-l-4 border-l-transparent'
              }`}
            >
              <span className="text-xs text-slate-500 block mb-0.5">{lecture.number}</span>
              <span className={`text-sm ${lecture.id === lectureId ? 'text-emerald-400 font-medium' : 'text-slate-300'}`}>
                {lecture.title}
              </span>
            </button>
          ))}

          {lectures.length === 0 && (
            <div className="p-4 text-center text-slate-500 text-sm">
              Пока нет лекций
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0 min-h-screen flex flex-col">
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-700 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="lg:hidden w-10" />
            
            <div className="flex items-center gap-3">
              <button
                onClick={goToPrev}
                disabled={lectures.findIndex(l => l.id === lectureId) <= 0}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-sm text-slate-500">
                {lectures.length > 0 ? `${lectures.findIndex(l => l.id === lectureId) + 1} / ${lectures.length}` : '0 / 0'}
              </span>
              
              <button
                onClick={goToNext}
                disabled={lectures.findIndex(l => l.id === lectureId) >= lectures.length - 1}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {isTeacher() && (
              <div className="flex items-center gap-2">
                {currentLecture && (
                  <button
                    onClick={() => navigate(`/textbook/edit/${lectureId}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Редактировать</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/textbook/create')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Новая</span>
                </button>
                {currentLecture && (
                  <button
                    onClick={handleDelete}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          ) : currentLecture ? (
            <article className="space-y-8">
              <header>
                <span className="text-sm text-emerald-400 font-medium">{currentLecture.number}</span>
                <h1 className="text-3xl font-bold text-white mt-2">{currentLecture.title}</h1>
              </header>

              {currentLecture.content && (
                <div 
                  className="prose prose-invert prose-slate max-w-none
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:text-slate-300 prose-p:leading-relaxed
                    prose-strong:text-white
                    prose-ul:text-slate-300 prose-ol:text-slate-300
                    prose-li:marker:text-emerald-400
                    prose-img:rounded-xl prose-img:border prose-img:border-slate-700
                    prose-img:cursor-pointer hover:prose-img:ring-2 hover:prose-img:ring-emerald-500 transition-all"
                  dangerouslySetInnerHTML={{ __html: currentLecture.content }}
                  onClick={handleContentClick}
                />
              )}
            </article>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">Выберите лекцию из оглавления или создайте новую</p>
            </div>
          )}
        </div>
      </main>

      {/* Модальное окно для увеличенной картинки */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Увеличенное изображение"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Чтобы случайный клик по самой картинке не закрывал её
          />
        </div>
      )}
    </div>
  );
};