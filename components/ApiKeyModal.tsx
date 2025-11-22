import React, { useState, useEffect } from 'react';
import { Key, X, Lock } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  initialKey: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, initialKey }) => {
  const [keyValue, setKeyValue] = useState(initialKey);
  
  useEffect(() => {
    setKeyValue(initialKey);
  }, [initialKey, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-yellow-500 mb-2">
            <Key className="w-6 h-6" />
            <h3 className="text-xl font-bold text-white">Nhập API Key của bạn</h3>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            Để tạo prompt, bạn cần có một Google AI API Key. Ứng dụng này sẽ lưu key của bạn một cách an toàn trong trình duyệt của bạn (LocalStorage).
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Google AI API Key</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="password"
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block pl-10 p-3 placeholder-slate-600"
              />
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Bạn chưa có key? Lấy một cái tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
          </div>
        </div>

        <div className="bg-slate-800/50 px-6 py-4 flex justify-end gap-3 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onSave(keyValue);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all"
          >
            Lưu Key
          </button>
        </div>

      </div>
    </div>
  );
};

export default ApiKeyModal;