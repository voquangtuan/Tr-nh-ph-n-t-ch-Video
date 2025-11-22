import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import AnalysisDisplay from './components/AnalysisDisplay';
import ApiKeyModal from './components/ApiKeyModal';
import { analyzeVideo } from './services/geminiService';
import { VideoAnalysis, AnalysisState, AnalysisMode } from './types';
import { 
  AlertTriangle, 
  Wand2, 
  ArrowLeft, 
  PlayCircle, 
  X, 
  Sparkles, 
  ChevronRight,
  LayoutDashboard,
  Rocket,
  Palette,
  Zap,
  Trophy,
  Film,
  Flame,
  CheckCircle2,
  Loader2
} from 'lucide-react';

// --- THEME SYSTEM DEFINITION ---
export interface ThemeConfig {
  id: string;
  name: string;
  isDark: boolean;
  
  // Backgrounds
  bgApp: string;       
  headerBg: string;    
  cardBg: string;      
  sidebarBg: string;   
  
  // Typography Colors
  textColor: string;
  subTextColor: string;
  headingColor: string;
  
  // Colors & Gradients
  primaryColor: string;
  accentColor: string; 
  textGradient: string;
  buttonGradient: string;
  bannerGradient: string; 
  
  // Borders & Accents
  borderColor: string;
  borderHighlight: string; 
  shadowColor: string;
  iconBg: string;
}

const THEMES: Record<string, ThemeConfig> = {
  fun_edu: {
    id: 'fun_edu',
    name: 'Light Studio',
    isDark: false,
    // Nền trắng sáng như ảnh chụp màn hình
    bgApp: 'bg-slate-50 min-h-screen', 
    headerBg: 'bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm',
    cardBg: 'bg-white ring-1 ring-slate-200', // Thêm ring để nổi bật hơn
    sidebarBg: 'bg-indigo-50/80 backdrop-blur border border-indigo-100', // Sidebar màu xanh nhạt
    
    textColor: 'text-slate-700',
    subTextColor: 'text-slate-500',
    headingColor: 'text-slate-900', 
    
    primaryColor: 'text-indigo-600',
    accentColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    textGradient: 'bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent',
    buttonGradient: 'from-indigo-600 via-purple-600 to-indigo-600', 
    bannerGradient: 'from-indigo-600 to-purple-600', 
    
    borderColor: 'border-slate-200',
    borderHighlight: 'border-indigo-200',
    shadowColor: 'shadow-xl shadow-indigo-900/5',
    iconBg: 'bg-white text-indigo-600 shadow-sm border border-slate-100',
  },
};

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [maxDuration, setMaxDuration] = useState<number>(8);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // App State Flow
  const [appStep, setAppStep] = useState<'select-mode' | 'analyzing' | 'result'>('select-mode');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode | null>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);
  
  // Theme State - Default to fun_edu (Light Mode now)
  const [currentThemeId, setCurrentThemeId] = useState<string>('fun_edu');

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    data: null,
    isExtractingFrames: false,
  });

  const performAnalysis = async (file: File, currentMaxDuration: number, currentApiKey: string, mode: AnalysisMode) => {
    setAppStep('analyzing');
    setAnalysisState({ isLoading: true, error: null, data: null, isExtractingFrames: false });
    const effectiveDuration = 8;

    try {
      const result = await analyzeVideo(file, effectiveDuration, currentApiKey, mode);
      setAnalysisState({
        isLoading: false,
        error: null,
        data: result,
        isExtractingFrames: true,
      });
      setAppStep('result');
    } catch (error: any) {
      if (error.message?.includes("API Key") || error.message?.includes("403")) {
        setShowApiKeyModal(true);
      }
      setAnalysisState({
        isLoading: false,
        error: error.message || "Không thể phân tích video. Vui lòng kiểm tra API Key và thử lại.",
        data: null,
        isExtractingFrames: false,
      });
    }
  };

  const handleModeSelection = (mode: AnalysisMode) => {
    setAnalysisMode(mode);
    // Scroll to uploader after a short delay to allow rendering
    setTimeout(() => {
      uploaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleFileSelected = (file: File) => {
    if (!analysisMode) return;
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setVideoUrl(url);
    performAnalysis(file, maxDuration, apiKey, analysisMode);
  };

  const handleManualRetry = () => {
    if (!selectedFile || !videoUrl || !analysisMode) return;
    performAnalysis(selectedFile, maxDuration, apiKey, analysisMode);
  };

  const handleModeChangeFromResult = (newMode: AnalysisMode) => {
    if (!selectedFile) return;
    if (newMode === analysisMode && analysisState.data) return;
    setAnalysisMode(newMode);
    performAnalysis(selectedFile, maxDuration, apiKey, newMode);
  };

  const resetApp = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setAnalysisState({ isLoading: false, error: null, data: null, isExtractingFrames: false });
    setSelectedFile(null);
    setVideoUrl(null);
    setShowVideoModal(false);
    setAnalysisMode(null);
    setAppStep('select-mode');
  };

  const getModeDisplayInfo = () => {
    switch (analysisMode) {
      case 'creative':
        return {
          icon: <Sparkles className="w-6 h-6" />,
          title: "Video sáng tạo",
          desc: "Tự động thêm hiệu ứng chuyên nghiệp, Cinematic nhưng không làm thay đổi lời thoại.",
          colorClass: "text-white bg-white/10 border-white/20",
          gradient: "from-fuchsia-500 to-purple-600" // Match Purple Card
        };
      case 'remix':
        return {
          icon: <Zap className="w-6 h-6" />,
          title: "Kịch bản Viral Remix",
          desc: "Thổi hồn vào lời thoại mới.",
          colorClass: "text-white bg-white/10 border-white/20",
          gradient: "from-violet-500 to-indigo-600" // Match Violet Card
        };
      default:
        return {
          icon: <Film className="w-6 h-6" />,
          title: "Video nguyên bản",
          desc: "Phân tích kỹ thuật Storyboard chính xác.",
          colorClass: "text-white bg-white/10 border-white/20",
          gradient: "from-blue-500 to-indigo-600" // Match Blue Card
        };
    }
  };

  const modeInfo = getModeDisplayInfo();
  const theme = THEMES[currentThemeId];

  return (
    <div className={`min-h-screen font-sans selection:bg-purple-500 selection:text-white transition-all duration-500 ease-in-out ${theme.bgApp} ${theme.textColor}`}>
      <Header 
        onOpenApiKeyModal={() => setShowApiKeyModal(true)} 
        onHomeClick={resetApp}
        themeConfig={theme}
      />
      
      <ApiKeyModal 
        isOpen={showApiKeyModal} 
        onClose={() => setShowApiKeyModal(false)} 
        onSave={handleSaveApiKey}
        initialKey={apiKey}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-10">
        
        {/* STEP 1: SELECT MODE (Cards Section) */}
        {appStep === 'select-mode' && (
          <div id="mode-selection" className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
            
            <div className="text-center mb-12">
               <h3 className={`text-4xl font-extrabold text-slate-900 mb-3`}>Bạn muốn AI làm gì?</h3>
               <div className="h-1.5 w-24 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              
              {/* Card 1: Video nguyên bản - Blue Gradient */}
              <button 
                onClick={() => handleModeSelection('original')}
                className={`group relative overflow-hidden rounded-[2rem] p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl shadow-xl flex flex-col h-full ring-1 ring-white/20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white
                ${analysisMode && analysisMode !== 'original' ? 'opacity-50 grayscale-[0.7] scale-95' : ''}
                ${analysisMode === 'original' ? 'ring-4 ring-blue-200 scale-105 shadow-blue-500/40 z-10' : ''}
                `}
              >
                   {analysisMode === 'original' && (
                     <div className="absolute top-4 right-4 bg-white text-blue-600 rounded-full p-1 animate-in zoom-in">
                       <CheckCircle2 className="w-6 h-6" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                   <div className="relative z-10 flex flex-col h-full">
                      <div className="mb-6 p-4 bg-white/20 backdrop-blur-md rounded-2xl w-fit shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300">
                          <Film className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-extrabold mb-3 text-white">Video nguyên bản</h3>
                      <p className="text-blue-50 leading-relaxed text-sm flex-grow font-medium opacity-90">
                        AI phân tích video gốc và trích xuất Storyboard kỹ thuật chính xác. Tăng tốc độ dựng phim.
                      </p>
                      
                      {!analysisMode && (
                        <div className="mt-6 text-xs font-extrabold text-blue-600 bg-white uppercase tracking-wider flex items-center justify-center gap-2 px-6 py-3 rounded-full shadow-lg hover:bg-blue-50 transition-all">
                          Chọn chế độ này <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                   </div>
              </button>

              {/* Card 2: Video sáng tạo - Purple/Fuchsia Gradient */}
              <button 
                onClick={() => handleModeSelection('creative')}
                className={`group relative overflow-hidden rounded-[2rem] p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl shadow-xl flex flex-col h-full ring-1 ring-white/20 bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white
                ${analysisMode && analysisMode !== 'creative' ? 'opacity-50 grayscale-[0.7] scale-95' : ''}
                ${analysisMode === 'creative' ? 'ring-4 ring-fuchsia-200 scale-105 shadow-fuchsia-500/40 z-10' : ''}
                `}
              >
                   {analysisMode === 'creative' && (
                     <div className="absolute top-4 right-4 bg-white text-fuchsia-600 rounded-full p-1 animate-in zoom-in">
                       <CheckCircle2 className="w-6 h-6" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                   
                   <div className="relative z-10 flex flex-col h-full">
                      <div className="mb-6 p-4 bg-white/20 backdrop-blur-md rounded-2xl w-fit shadow-lg border border-white/20 group-hover:rotate-12 transition-transform duration-300">
                          <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-extrabold mb-3 text-white">Video sáng tạo</h3>
                      <p className="text-fuchsia-50 leading-relaxed text-sm flex-grow font-medium opacity-90">
                        Tự động thêm hiệu ứng chuyên nghiệp, Cinematic nhưng không làm thay đổi lời thoại.
                      </p>
                      
                      {!analysisMode && (
                        <div className="mt-6 text-xs font-extrabold text-fuchsia-600 bg-white uppercase tracking-wider flex items-center justify-center gap-2 px-6 py-3 rounded-full shadow-lg hover:bg-fuchsia-50 transition-all">
                          Chọn chế độ này <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                   </div>
              </button>

              {/* Card 3: Kịch bản Viral Remix - Violet/Indigo Gradient */}
              <button 
                onClick={() => handleModeSelection('remix')}
                className={`group relative overflow-hidden rounded-[2rem] p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl shadow-xl flex flex-col h-full ring-1 ring-white/20 bg-gradient-to-br from-violet-500 to-indigo-600 text-white
                ${analysisMode && analysisMode !== 'remix' ? 'opacity-50 grayscale-[0.7] scale-95' : ''}
                ${analysisMode === 'remix' ? 'ring-4 ring-violet-200 scale-105 shadow-violet-500/40 z-10' : ''}
                `}
              >
                   {analysisMode === 'remix' && (
                     <div className="absolute top-4 right-4 bg-white text-violet-600 rounded-full p-1 animate-in zoom-in">
                       <CheckCircle2 className="w-6 h-6" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                   {/* HOT Badge */}
                   <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-4 py-2 rounded-bl-3xl shadow-lg z-20 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-current animate-pulse" /> HOT
                   </div>

                   <div className="relative z-10 flex flex-col h-full">
                      <div className="mb-6 p-4 bg-white/20 backdrop-blur-md rounded-2xl w-fit shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300">
                          <Zap className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-extrabold mb-3 text-white">Kịch bản Viral Remix</h3>
                      <p className="text-violet-100 leading-relaxed text-sm flex-grow font-medium opacity-90">
                         Thổi hồn vào lời thoại mới.
                      </p>
                      
                      {!analysisMode && (
                        <div className="mt-6 text-xs font-extrabold text-violet-600 bg-white uppercase tracking-wider flex items-center justify-center gap-2 px-6 py-3 rounded-full shadow-lg hover:bg-violet-50 transition-all">
                          Chọn chế độ này <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                   </div>
              </button>
            </div>

            {/* INLINE FILE UPLOADER SECTION */}
            {analysisMode && (
              <div 
                ref={uploaderRef}
                className="max-w-4xl mx-auto mt-12 animate-in slide-in-from-bottom-10 fade-in duration-500"
              >
                 <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100`}>
                    {/* Header of Upload Card - Matches selected gradient */}
                    <div className={`px-8 py-4 bg-gradient-to-r ${modeInfo.gradient} text-white flex items-center justify-between`}>
                       <div className="flex items-center gap-3">
                          <div className="bg-white/20 p-2 rounded-lg">
                             {modeInfo.icon}
                          </div>
                          <div>
                             <p className="text-[10px] uppercase font-bold opacity-90">Bạn đã chọn</p>
                             <h3 className="text-lg font-bold">{modeInfo.title}</h3>
                          </div>
                       </div>
                    </div>

                    {/* Body of Upload Card */}
                    <div className="p-8 md:p-10 text-center bg-slate-50">
                       <h3 className="text-xl font-bold mb-6 text-slate-700">
                         Sẵn sàng để phân tích! Tải video của bạn lên:
                       </h3>
                       <FileUploader 
                          onFileSelected={handleFileSelected} 
                          selectedFileName={selectedFile?.name}
                          theme={theme}
                        />
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 & 4: ANALYZING & RESULT */}
        {(appStep === 'analyzing' || (appStep === 'result' && analysisState.isLoading)) && videoUrl && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pt-6 text-center">
            <div className={`relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border-2 border-slate-200 ring-4 ring-indigo-50`}>
               {/* Video Player - Auto Play & Loop - MUTED IS FALSE */}
               <video 
                  src={videoUrl} 
                  className="w-full h-full bg-black object-contain" 
                  controls={appStep === 'result'} // Chỉ hiện controls khi xong
                  autoPlay 
                  loop 
                  muted={false} // Bật tiếng khi đang phân tích
                  playsInline 
               />
               
               {/* Floating Status Badge - Non-intrusive */}
               {appStep === 'analyzing' && (
                  <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-indigo-100 animate-in slide-in-from-bottom-4 z-20">
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      <div className="text-left">
                          <p className="text-indigo-900 font-bold text-sm">Đang phân tích...</p>
                          <p className="text-slate-500 text-[10px]">AI đang đọc Storyboard</p>
                      </div>
                  </div>
               )}
            </div>
          </div>
        )}

        {analysisState.error && (
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-4 shadow-sm animate-in fade-in">
            <div className="p-2 bg-red-100 rounded-full text-red-600">
               <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-red-800 text-lg">Đã xảy ra lỗi</h3>
              <p className="text-red-600 mt-1 mb-3">{analysisState.error}</p>
              <div className="flex gap-4">
                <button onClick={handleManualRetry} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700">Thử lại</button>
                <button onClick={() => setShowApiKeyModal(true)} className="px-4 py-2 bg-white border border-red-300 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50">Kiểm tra API Key</button>
              </div>
            </div>
          </div>
        )}

        {appStep === 'result' && analysisState.data && !analysisState.isLoading && (
          <div className="space-y-6 mt-6">
            {/* Toolbar Action Bar - Grouped Buttons with better colors */}
            <div className={`sticky top-[5rem] z-40 py-4 transition-all duration-300 flex justify-center items-center gap-4`}>
               
              {/* Nút Phân tích khác - Gradient Purple */}
              <button 
                onClick={resetApp}
                className={`flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wide transition-all duration-200 text-white shadow-lg hover:scale-105 hover:shadow-purple-500/40 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Phân tích video khác</span>
              </button>
              
              {/* Nút Xem lại video gốc - Gradient Blue/Cyan (Sáng và bắt mắt hơn) */}
              <button 
                onClick={() => setShowVideoModal(true)}
                className={`flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wide transition-all duration-200 text-white shadow-lg hover:scale-105 hover:shadow-cyan-500/40 bg-gradient-to-r from-sky-500 to-cyan-500`}
              >
                <PlayCircle className="w-5 h-5 fill-white text-sky-600" />
                <span>Xem lại video gốc</span>
              </button>
            </div>
            
            <AnalysisDisplay 
              data={analysisState.data} 
              videoUrl={videoUrl} 
              currentMode={analysisMode!}
              onModeChange={handleModeChangeFromResult}
              themeConfig={theme}
            />
          </div>
        )}

        {showVideoModal && videoUrl && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-6xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
               <div className="flex justify-between items-center p-4 border-b border-white/10 bg-zinc-900">
                  <h3 className="text-white font-bold">Video Gốc</h3>
                  <button onClick={() => setShowVideoModal(false)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
               </div>
               <div className="flex-grow bg-black flex items-center justify-center relative">
                 <video src={videoUrl} className="w-full h-full max-h-full" controls autoPlay />
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;