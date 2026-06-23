import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadService } from '../services/upload.service.js';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export const ImageUpload = ({ value, onChange, label = 'Добавить изображение' }: ImageUploadProps) => {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Только изображения (PNG, JPG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Максимальный размер 5MB');
      return;
    }

    setLoading(true);
    try {
      const url = await uploadService.uploadImage(file);
      onChange(url);
    } catch (err) {
      alert('Ошибка загрузки изображения');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  if (value) {
    return (
      <div className="relative group">
        <img
          src={value}
          alt="Uploaded"
          className="w-full h-48 object-cover rounded-xl border border-slate-700"
        />
        <button
          onClick={() => onChange('')}
          className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => inputRef.current?.click()}
      disabled={loading}
      className="w-full flex flex-col items-center justify-center gap-2 p-6 bg-slate-900/60 border-2 border-dashed border-slate-700 rounded-xl hover:border-slate-500 transition-all disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
          <span className="text-sm text-slate-500">Загрузка...</span>
        </>
      ) : (
        <>
          <Upload className="w-8 h-8 text-slate-500" />
          <span className="text-sm text-slate-500">{label}</span>
          <span className="text-xs text-slate-600">PNG, JPG, GIF до 5MB</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </button>
  );
};