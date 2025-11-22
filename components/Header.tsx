import React from 'react';
import { Key, Video, User, Share2, Home } from 'lucide-react';
import { ThemeConfig } from '../App';

interface HeaderProps {
  onOpenApiKeyModal?: () => void;
  onHomeClick: () => void;
  themeConfig: ThemeConfig;
}

const Header: React.FC<HeaderProps> = ({ onOpenApiKeyModal, onHomeClick, themeConfig }) => {
  return (
    <header className={`${themeConfig.headerBg} transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo Area - Updated Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                 <Video className="w-5 h-5 text-white fill-white" />
             </div>
             <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-white">
                 <div className="w-2 h-2 bg-white rounded-full"></div>
             </div>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className={`text-xl font-extrabold tracking-tight leading-none uppercase text-purple-700`}>
              Trình Phân Tích Cảnh Video ✨
            </h1>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-0.5 text-slate-500">
                Phát triển bởi <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent font-black">FUNEDU</span>
            </span>
          </div>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* HOME BUTTON (Replaces Theme Switcher) */}
          <button
            onClick={onHomeClick}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-blue-500 text-white shadow-md hover:scale-110 hover:shadow-blue-500/30`}
            title="Trang chủ"
          >
            <Home className="w-5 h-5" />
          </button>

          {/* API Key Button (Orange Circle) */}
          {onOpenApiKeyModal && (
            <button 
              onClick={onOpenApiKeyModal}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-orange-500 text-white shadow-md hover:scale-110"
              title="API Key"
            >
              <Key className="w-5 h-5" />
            </button>
          )}
          
          {/* Fake User Button (Red Circle) */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500 text-white shadow-md cursor-pointer hover:scale-110 transition-transform">
              <User className="w-5 h-5" />
          </div>

          {/* Fake Share Button (Purple Circle) */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500 text-white shadow-md cursor-pointer hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5" />
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;