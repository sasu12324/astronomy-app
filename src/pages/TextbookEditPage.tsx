import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { textbookService } from '../services/textbook.service.js';
import { uploadService } from '../services/upload.service.js';
import { 
  Save, ArrowLeft, Loader2, Image as ImageIcon, 
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Code,
  AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';

export const TextbookEditPage = () => {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const isEditing = !!lectureId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'html'>('visual');
  
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  
  const [order, setOrder] = useState<number>(1);
  const [number, setNumber] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      loadLecture();
    }
  }, [lectureId]);

  const loadLecture = async () => {
    try {
      const data = await textbookService.getById(lectureId!);
      setOrder(data.order);
      setNumber(data.number);
      setTitle(data.title);
      setContent(data.content);
      if (editorRef.current) {
        editorRef.current.innerHTML = data.content;
      }
    } catch (error) {
      console.error('Ошибка загрузки лекции:', error);
      alert('Не удалось загрузить лекцию');
      navigate('/textbook');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !number) {
      alert('Заполните номер и название параграфа');
      return;
    }

    if (selectedImg) {
      selectedImg.classList.remove('ring-4', 'ring-emerald-500');
      setSelectedImg(null);
    }

    let finalContent = viewMode === 'visual' && editorRef.current 
      ? editorRef.current.innerHTML 
      : content;

    finalContent = finalContent.replace(/ring-4 ring-emerald-500/g, '').trim();

    setSaving(true);
    try {
      const payload = { order, number, title, content: finalContent };
      
      if (isEditing) {
        await textbookService.update(lectureId!, payload);
        navigate(`/textbook/${lectureId}`);
      } else {
        const newLecture = await textbookService.create(payload);
        navigate(`/textbook/${newLecture.id}`);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const toggleViewMode = () => {
    if (viewMode === 'visual') {
      if (selectedImg) {
        selectedImg.classList.remove('ring-4', 'ring-emerald-500');
        setSelectedImg(null);
      }
      if (editorRef.current) setContent(editorRef.current.innerHTML);
      setViewMode('html');
    } else {
      if (editorRef.current) editorRef.current.innerHTML = content;
      setViewMode('visual');
    }
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode !== 'visual') return;
    const target = e.target as HTMLElement;

    if (selectedImg && selectedImg !== target) {
      selectedImg.classList.remove('ring-4', 'ring-emerald-500');
      setSelectedImg(null);
    }

    if (target.tagName === 'IMG') {
      target.classList.add('ring-4', 'ring-emerald-500');
      setSelectedImg(target as HTMLImageElement);
    }
  };

  // ИСПРАВЛЕНО: Улучшенная функция форматирования
  const applyFormat = (command: string, value: string | undefined = undefined) => {
    if (viewMode !== 'visual') return;

    if (selectedImg && ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].includes(command)) {
      selectedImg.classList.remove('float-left', 'float-right', 'block', 'mx-auto', 'mr-6', 'ml-6', 'mb-4');
      if (command === 'justifyLeft') selectedImg.classList.add('float-left', 'mr-6', 'mb-4');
      else if (command === 'justifyCenter' || command === 'justifyFull') selectedImg.classList.add('block', 'mx-auto', 'mb-4');
      else if (command === 'justifyRight') selectedImg.classList.add('float-right', 'ml-6', 'mb-4');
      
      if (editorRef.current) setContent(editorRef.current.innerHTML);
      return;
    }

    // Некоторые браузеры требуют теги в угловых скобках
    let finalValue = value;
    if (command === 'formatBlock' && value) {
      finalValue = `<${value}>`;
    }

    document.execCommand(command, false, finalValue);
    editorRef.current?.focus();
    
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) continue;

        const placeholderId = `[Загрузка изображения ${Date.now()}...]`;

        if (viewMode === 'visual') {
          document.execCommand('insertText', false, placeholderId);
        } else {
          const start = textareaRef.current!.selectionStart;
          const end = textareaRef.current!.selectionEnd;
          setContent(content.substring(0, start) + `\n${placeholderId}\n` + content.substring(end));
        }

        try {
          const url = await uploadService.uploadImage(file);
          const imgTag = `<img src="${url}" alt="Иллюстрация" class="max-w-full sm:max-w-2xl rounded-xl border border-slate-700 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all block mx-auto mb-4" />`;
          
          if (viewMode === 'visual' && editorRef.current) {
            editorRef.current.innerHTML = editorRef.current.innerHTML.replace(placeholderId, imgTag);
          } else {
            setContent(prev => prev.replace(placeholderId, imgTag));
          }
        } catch (error) {
          console.error('Ошибка загрузки картинки:', error);
          const errorMsg = `*[Ошибка загрузки изображения]*`;
          if (viewMode === 'visual' && editorRef.current) {
            editorRef.current.innerHTML = editorRef.current.innerHTML.replace(placeholderId, errorMsg);
          } else {
            setContent(prev => prev.replace(placeholderId, errorMsg));
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-8 px-4">
      {/* ИСПРАВЛЕНО: Принудительные стили для списков и заголовков */}
      <style>{`
        .custom-editor h3 { font-size: 1.5em !important; font-weight: bold !important; margin-top: 1em !important; margin-bottom: 0.5em !important; color: #34d399 !important; }
        .custom-editor h4 { font-size: 1.25em !important; font-weight: bold !important; margin-top: 1em !important; margin-bottom: 0.5em !important; color: white !important; }
        .custom-editor ul { list-style-type: disc !important; padding-left: 1.5em !important; margin-bottom: 1em !important; }
        .custom-editor ol { list-style-type: decimal !important; padding-left: 1.5em !important; margin-bottom: 1em !important; }
        .custom-editor li { display: list-item !important; margin-bottom: 0.25em !important; }
      `}</style>

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Редактирование параграфа' : 'Новый параграф'}
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Сохранить
          </button>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-slate-700/50">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Порядковый номер (для сортировки)</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Номер параграфа (текст)</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Например: § 1"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-400 mb-2">Название параграфа</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Предмет астрономии"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-400">Содержимое</label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md">
                  <ImageIcon className="w-3 h-3" />
                  Вставка картинок: Ctrl+V
                </span>
                <button
                  onClick={toggleViewMode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-medium rounded-lg transition-colors"
                >
                  <Code className="w-4 h-4" />
                  {viewMode === 'visual' ? 'HTML-код' : 'Визуальный редактор'}
                </button>
              </div>
            </div>

            {viewMode === 'visual' && (
              <div className="flex items-center gap-1 p-2 mb-2 bg-slate-900 border border-slate-700 rounded-lg flex-wrap">
                <button onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Жирный"><Bold className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Курсив"><Italic className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-slate-700 mx-1" />
                <button onMouseDown={(e) => { e.preventDefault(); applyFormat('formatBlock', 'H3'); }} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Заголовок 1"><Heading2 className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyFormat('formatBlock', 'H4'); }} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Заголовок 2"><Heading3 className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-slate-700 mx-1" />
                <button onMouseDown={(e) => { e.preventDefault(); applyFormat('insertUnorderedList'); }} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Маркированный список"><List className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyFormat('insertOrderedList'); }} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Нумерованный список"><ListOrdered className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-slate-700 mx-1" />
                <button onMouseDown={(e) => { e.preventDefault(); applyFormat('justifyLeft'); }} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="По левому краю"><AlignLeft className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyFormat('justifyCenter'); }} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="По центру"><AlignCenter className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyFormat('justifyRight'); }} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="По правому краю"><AlignRight className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyFormat('justifyFull'); }} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="По ширине"><AlignJustify className="w-4 h-4" /></button>
              </div>
            )}

            <div className="relative border border-slate-600 rounded-xl overflow-hidden bg-slate-900 focus-within:border-emerald-500 transition-colors">
              {viewMode === 'visual' ? (
                <div
                  ref={editorRef}
                  contentEditable
                  onPaste={handlePaste}
                  onClick={handleEditorClick}
                  onInput={() => {
                    // ИСПРАВЛЕНО: Мгновенное сохранение текста при печати
                    if (editorRef.current) setContent(editorRef.current.innerHTML);
                  }}
                  // ИСПРАВЛЕНО: Добавлен класс custom-editor для работы наших принудительных стилей
                  className="custom-editor w-full min-h-[600px] max-h-[800px] overflow-y-auto p-4 outline-none prose prose-invert prose-slate max-w-none
                    prose-p:text-slate-300 prose-p:leading-relaxed
                    prose-strong:text-white
                    prose-img:rounded-xl prose-img:border prose-img:border-slate-700"
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePaste}
                  className="w-full min-h-[600px] max-h-[800px] p-4 bg-transparent outline-none text-slate-300 font-mono text-sm leading-relaxed resize-y custom-scrollbar"
                  placeholder="<p>Введите HTML код...</p>"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

