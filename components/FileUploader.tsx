import React, { useCallback, useState } from 'react';
import { Upload, Film } from 'lucide-react';
import { ThemeConfig } from '../App';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  selectedFileName?: string | null;
  theme?: ThemeConfig;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, selectedFileName, theme }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndProcessFile = (file: File) => {
    const maxSize = 200 * 1024 * 1024; // 200MB
    
    if (!file.type.startsWith('video/')) {
      setError("Vui lòng tải lên file video hợp lệ.");
      return;
    }

    if (file.size > maxSize) {
      setError("File quá lớn (Max 200MB).");
      return;
    }

    setError(null);
    onFileSelected(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  }, [onFileSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  // Fallback colors if theme is not provided
  const borderColor = theme ? theme.borderColor : 'border-slate-300';
  const accentColor = theme ? theme.primaryColor.replace('text-', 'text-') : 'text-indigo-600';
  const highlightBg = theme ? theme.iconBg : 'bg-indigo-50';

  return (
    <div className="w-full">
      <div
        className={`relative group border-2 border-dashed rounded-2xl transition-all duration-300 ease-out h-56 flex items-center justify-center cursor-pointer
          ${dragActive 
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-xl' 
            : `${borderColor} bg-white hover:border-indigo-400 hover:bg-slate-50 hover:shadow-md`
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
          accept="video/mp4,video/webm,video/quicktime"
        />
        
        <div className="flex flex-col items-center justify-center text-center space-y-4 p-6 pointer-events-none">
            {/* Icon Circle */}
            <div className={`p-4 rounded-full transition-all duration-300 shadow-sm ${dragActive ? 'bg-indigo-100 text-indigo-600' : `${highlightBg} group-hover:scale-110`}`}>
               <Upload className={`w-8 h-8 ${dragActive ? 'text-indigo-600' : 'text-slate-500'}`} />
            </div>
            
            <div className="space-y-1">
                <p className={`text-lg font-bold ${theme ? theme.headingColor : 'text-slate-700'}`}>
                  Kéo thả video vào đây
                </p>
                <p className={`text-sm font-medium ${theme ? theme.subTextColor : 'text-slate-500'}`}>
                  hoặc <span className="text-indigo-600 underline underline-offset-2">chọn từ máy tính</span>
                </p>
                <p className="text-xs text-slate-400 pt-2">MP4, WebM (Max 200MB)</p>
            </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
           <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span> {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;