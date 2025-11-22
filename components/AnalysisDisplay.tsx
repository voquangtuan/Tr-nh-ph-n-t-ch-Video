import React, { useEffect, useState, useRef } from 'react';
import { VideoAnalysis, Scene, AnalysisMode } from '../types';
import { ThemeConfig } from '../App';
import { 
  Download, 
  Copy, 
  Check, 
  Sparkles,
  Film,
  MessageSquareQuote,
  Music,
  Mic,
  MapPin,
  User,
  Zap,
  Video,
  PlayCircle,
  X,
  Repeat,
  Clock,
  Wand2,
  Settings2,
  LayoutDashboard,
  PenTool
} from 'lucide-react';

interface AnalysisDisplayProps {
  data: VideoAnalysis;
  videoUrl: string | null;
  currentMode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  themeConfig: ThemeConfig;
}

// Helper parse MM:SS to seconds
const parseTimeToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(part => parseFloat(part));
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

// Construct text for copy/download
const constructSceneText = (scene: Scene, globalStyle: string, mode: AnalysisMode) => {
  let dialogueVal = scene.dialogue ? scene.dialogue.trim() : '';
  if (dialogueVal && !dialogueVal.startsWith('"')) dialogueVal = `"${dialogueVal}"`;

  const voiceVal = scene.voiceDescription || '';
  const soundVal = scene.sound || '';

  if (mode === 'creative') {
    return `(CẢNH ${scene.id} - CREATIVE VISUAL)
=== VISUAL PROMPT (High Quality) ===
PROMPT: ${scene.imagePrompt}. ${scene.setting}.
SUBJECT: ${scene.characterDescription}.
ACTION: ${scene.action}.
CAMERA: ${scene.cameraAngle}.
STYLE: ${globalStyle}, cinematic, 8k, hyper-realistic.

=== ORIGINAL AUDIO (KEPT VERBATIM) ===
Dialogue: ${dialogueVal}
Voice: ${voiceVal}
Sound: ${soundVal}`;
  }

  if (mode === 'remix') {
    return `Phong cách video: ${globalStyle} (Remix Version)
Mô tả bối cảnh chi tiết: ${scene.setting}
Camera (Shot): ${scene.cameraAngle}
Characters: ${scene.characterDescription}
Action (Movement): ${scene.action}
Dialogue: ${dialogueVal}
Voice: ${voiceVal}
Sound: ${soundVal}
Không phụ đề, không text trên video`;
  }

  return `Phong cách video: ${globalStyle}
Mô tả bối cảnh chi tiết: ${scene.setting}
Camera (Shot): ${scene.cameraAngle}
Characters: ${scene.characterDescription}
Action (Movement): ${scene.action}
Dialogue: ${dialogueVal}
Voice: ${voiceVal}
Sound: ${soundVal}
Không phụ đề, không text trên video`;
};

// --- Sub-component: Scene Player Modal (Always Dark for better viewing) ---
const ScenePlayerModal: React.FC<{
  scene: Scene;
  videoUrl: string;
  onClose: () => void;
}> = ({ scene, videoUrl, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const endTimeSeconds = parseTimeToSeconds(scene.endTime);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = scene.startTimeSeconds;
      videoRef.current.play().catch(console.error);
    }
  }, [scene]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime >= endTimeSeconds) {
        videoRef.current.currentTime = scene.startTimeSeconds;
        videoRef.current.play();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
        <div className="p-4 bg-zinc-900/80 backdrop-blur flex justify-between items-center border-b border-white/10 absolute top-0 left-0 right-0 z-10">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="bg-indigo-600 px-2 py-0.5 rounded text-xs">CẢNH {scene.id}</span>
              <span className="text-slate-300 text-sm font-mono">
                {scene.startTime} - {scene.endTime}
              </span>
            </h3>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative aspect-video bg-black flex items-center justify-center group">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            controls={true}
            autoPlay
            onClick={() => {
              if (videoRef.current?.paused) videoRef.current.play();
              else videoRef.current?.pause();
              setIsPlaying(!isPlaying);
            }}
          />
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none">
            <Repeat className="w-3 h-3 animate-spin-slow" />
            <span>Đang lặp lại đoạn cắt</span>
          </div>
        </div>

        <div className="p-4 bg-zinc-900 border-t border-white/5">
          <p className="text-slate-300 text-sm line-clamp-2 italic">"{scene.action}"</p>
        </div>
      </div>
    </div>
  );
};


const SceneCard: React.FC<{ 
  scene: Scene; 
  globalStyle: string;
  currentMode: AnalysisMode;
  onCopy: (text: string) => void;
  onPlay: (scene: Scene) => void;
  thumbnailUrl?: string;
  theme: ThemeConfig;
}> = ({ scene, globalStyle, currentMode, onCopy, onPlay, thumbnailUrl, theme }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = constructSceneText(scene, globalStyle, currentMode);
    onCopy(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let displayDialogue = scene.dialogue;
  if (displayDialogue && !displayDialogue.startsWith('"') && displayDialogue.trim() !== "") {
     displayDialogue = `"${displayDialogue}"`;
  }

  const getButtonLabel = () => {
      if (copied) return 'Đã sao chép!';
      if (currentMode === 'creative') return 'Sao chép Prompt Visual';
      if (currentMode === 'remix') return 'Sao chép Storyboard Remix';
      return 'Sao chép Storyboard';
  };

  // Define gradient for card header based on mode
  const getHeaderGradient = () => {
    if (currentMode === 'creative') return 'bg-gradient-to-r from-fuchsia-500 to-purple-600';
    if (currentMode === 'remix') return 'bg-gradient-to-r from-violet-500 to-indigo-600';
    return 'bg-gradient-to-r from-blue-600 to-indigo-700';
  };

  return (
    <div className={`${theme.cardBg} rounded-3xl overflow-hidden shadow-lg shadow-indigo-100 transition-all duration-300 flex flex-col h-full group hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200`}>
      
      {/* Header Strip of Card */}
      <div className={`px-5 py-3 flex justify-between items-center text-xs text-white shadow-md relative z-10 ${getHeaderGradient()}`}>
          <span className={`font-extrabold uppercase flex items-center gap-1 tracking-wider`}>
              CẢNH {scene.id}
          </span>
          <span className="font-mono font-bold bg-black/20 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] border border-white/10">
              <Clock className="w-3 h-3 text-white" />
              {scene.startTime} - {scene.endTime}
          </span>
      </div>

      {/* Thumbnail Section */}
      <div className="relative aspect-video bg-slate-100 w-full overflow-hidden group-hover:shadow-inner transition-all border-b border-slate-100">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={`Scene at ${scene.startTime}`} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-100" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center text-slate-400">
                <Film className="w-8 h-8 mb-2 animate-pulse" />
                <span className="text-xs">Loading frame...</span>
            </div>
          </div>
        )}
        
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[1px] cursor-pointer" onClick={() => onPlay(scene)}>
           <button className="transform hover:scale-110 transition-transform duration-200">
              <div className={`w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-white bg-gradient-to-br ${theme.buttonGradient}`}>
                 <PlayCircle className="w-8 h-8 fill-white" />
              </div>
           </button>
        </div>

        {/* Camera Angle Badge */}
        <div className="absolute bottom-2 left-2">
           <div className="bg-white/90 text-indigo-900 text-[10px] font-extrabold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-slate-200 uppercase tracking-wide">
              <Video className="w-3 h-3 text-indigo-600" />
              <span className="truncate max-w-[150px]">{scene.cameraAngle}</span>
           </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow gap-4 relative bg-white">
        
        {/* Dialogue Box */}
        {displayDialogue && displayDialogue.trim() !== '""' && (
          <div className={`rounded-2xl p-4 shadow-sm border border-l-4 ${currentMode === 'remix' ? 'bg-rose-50 border-rose-100 border-l-rose-500' : 'bg-blue-50 border-blue-100 border-l-blue-500'}`}>
             <div className="flex gap-3 items-start">
                {currentMode === 'remix' 
                  ? <PenTool className="w-5 h-5 text-rose-500 shrink-0 mt-1" /> 
                  : <MessageSquareQuote className={`w-5 h-5 shrink-0 mt-1 text-blue-500`} />
                }
                <div>
                  {currentMode === 'remix' && <span className="text-[10px] uppercase font-bold text-rose-500 block mb-1">Lời thoại Remix</span>}
                  <p className={`text-sm font-bold leading-relaxed text-slate-800`}>
                    {displayDialogue}
                  </p>
                </div>
             </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="space-y-4 flex-grow">
          <div className="flex gap-3 items-start group/item">
            <div className={`mt-0.5 p-1.5 rounded-full bg-blue-100 text-blue-600 shrink-0`}>
                <MapPin className="w-4 h-4" />
            </div>
            <div className={`text-sm leading-relaxed ${theme.textColor}`}>
              <span className={`block text-[10px] font-bold uppercase ${theme.subTextColor} mb-0.5`}>Bối cảnh</span>
              {scene.setting}
            </div>
          </div>

          <div className="flex gap-3 items-start group/item">
             <div className={`mt-0.5 p-1.5 rounded-full bg-emerald-100 text-emerald-600 shrink-0`}>
                <User className="w-4 h-4" />
            </div>
            <div className={`text-sm leading-relaxed ${theme.textColor}`}>
              <span className={`block text-[10px] font-bold uppercase ${theme.subTextColor} mb-0.5`}>Nhân vật</span>
              {scene.characterDescription}
            </div>
          </div>

          <div className="flex gap-3 items-start group/item">
             <div className={`mt-0.5 p-1.5 rounded-full bg-amber-100 text-amber-600 shrink-0`}>
                <Zap className="w-4 h-4" />
            </div>
            <div className={`text-sm leading-relaxed ${theme.textColor}`}>
              <span className={`block text-[10px] font-bold uppercase ${theme.subTextColor} mb-0.5`}>Hành động</span>
              {scene.action}
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-slate-100 my-2"></div>

        {/* Audio Info */}
        <div className="flex flex-wrap gap-2">
             {(scene.voiceDescription) && (
                <div className={`rounded-full border px-3 py-1 flex items-center gap-1.5 max-w-full bg-slate-50 border-slate-200 text-slate-600`}>
                   <Mic className="w-3 h-3 shrink-0 text-slate-400" />
                   <span className="text-[10px] font-medium truncate">{scene.voiceDescription}</span>
                </div>
             )}
             {(scene.sound) && (
                <div className={`rounded-full border px-3 py-1 flex items-center gap-1.5 max-w-full bg-slate-50 border-slate-200 text-slate-600`}>
                   <Music className="w-3 h-3 shrink-0 text-slate-400" />
                   <span className="text-[10px] italic truncate">{scene.sound}</span>
                </div>
             )}
        </div>

        {/* Copy Button - Now using Solid Gradient */}
        <button 
          onClick={handleCopy}
          className={`
            mt-auto w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5
            ${copied 
              ? 'bg-green-500 text-white' 
              : `bg-gradient-to-r ${theme.buttonGradient} text-white`
            }
          `}
        >
          {copied ? <Check className="w-4 h-4" /> : (currentMode === 'creative' ? <Wand2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />)}
          {getButtonLabel()}
        </button>
      </div>
    </div>
  );
};

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ data, videoUrl, currentMode, onModeChange, themeConfig }) => {
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [allCopied, setAllCopied] = useState(false);
  const [previewScene, setPreviewScene] = useState<Scene | null>(null);

  useEffect(() => {
    if (!videoUrl || !data.scenes.length) return;
    
    const extractFrames = async () => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;
      
      await new Promise((resolve) => {
        video.onloadedmetadata = () => resolve(true);
      });

      const newThumbnails: Record<number, string> = {};
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      for (const scene of data.scenes) {
        video.currentTime = scene.startTimeSeconds;
        await new Promise(r => {
          const onSeek = () => {
            video.removeEventListener('seeked', onSeek);
            r(true);
          };
          video.addEventListener('seeked', onSeek);
        });

        canvas.width = video.videoWidth / 3;
        canvas.height = video.videoHeight / 3;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.7));
        if (blob) {
           setThumbnails(prev => ({ ...prev, [scene.id]: URL.createObjectURL(blob) }));
        }
      }
    };

    extractFrames();
    return () => {
      Object.values(thumbnails).forEach((url) => URL.revokeObjectURL(url as string));
    };
  }, [videoUrl, data]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCopyAll = () => {
    const allPrompts = data.scenes.map((s) => constructSceneText(s, data.style, currentMode)).join('\n\n====================================\n\n');
    navigator.clipboard.writeText(allPrompts);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  const downloadPrompts = () => {
    const content = data.scenes.map((s) => constructSceneText(s, data.style, currentMode)).join('\n\n___________________________________________________\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.replace(/\s+/g, '_')}_${currentMode}_analysis.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDescriptionForMode = () => {
    if (currentMode === 'original') return "Chế độ chuẩn: AI phân tích chính xác Storyboard, lời thoại, góc máy theo video gốc. Tối ưu 7-8s.";
    if (currentMode === 'creative') return "Chế độ Visual: AI sẽ phân tích lại và TỰ ĐỘNG NÂNG CẤP mô tả hình ảnh/ánh sáng (Cinematic, 8k). Tối ưu 7-8s.";
    if (currentMode === 'remix') return "Chế độ Remix: AI viết lại thoại Viral nhưng giữ nguyên cấu trúc Storyboard. Độ dài vàng 7-8s.";
    return "";
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* --- DASHBOARD HEADER / HERO (Vibrant Gradient for visual impact) --- */}
      <div className={`rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br ${themeConfig.bannerGradient} relative border border-white/20`}>
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="relative z-10 p-8 md:p-10 text-white">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                  <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/20 backdrop-blur border border-white/20 shadow-sm`}>
                             {data.style}
                         </span>
                         <span className={`text-white/90 text-xs font-bold uppercase tracking-wider flex items-center gap-1`}>
                             <Sparkles className="w-3 h-3 text-yellow-300" /> {data.scenes.length} cảnh được phát hiện
                         </span>
                      </div>
                      <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md`}>
                          {data.title}
                      </h2>
                      <div className={`text-white/90 max-w-3xl leading-relaxed text-sm bg-black/10 backdrop-blur-sm p-4 rounded-xl border border-white/10`}>
                          <span className="font-bold text-yellow-300 uppercase text-xs mr-2 tracking-wider">Nội dung chính</span> 
                          {data.summary}
                      </div>
                  </div>

                  <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                      <button 
                        onClick={handleCopyAll}
                        className={`flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-xl shadow-lg transition-all border border-white/50`}
                      >
                        {allCopied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                        {allCopied ? 'Đã sao chép' : 'Copy Toàn bộ'}
                      </button>
                      <button 
                        onClick={downloadPrompts}
                        className={`flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-xl shadow-lg transition-all bg-black/20 hover:bg-black/30 border border-white/20 backdrop-blur-sm`}
                      >
                        <Download className="w-5 h-5" />
                        Tải xuống .txt
                      </button>
                  </div>
              </div>
          </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* --- LEFT SIDEBAR CONTROL PANEL (COLORFUL & EYE-CATCHING) --- */}
        <aside className="w-full lg:w-72 flex-shrink-0 sticky top-32">
            <div className={`rounded-3xl overflow-hidden shadow-xl shadow-purple-100 border border-purple-200 bg-gradient-to-br from-violet-100 via-purple-50 to-blue-50`}>
                <div className={`p-4 border-b border-white/50 flex items-center gap-2 bg-white/40 backdrop-blur-sm`}>
                    <Settings2 className={`w-4 h-4 text-purple-600`} />
                    <h3 className={`text-xs font-bold uppercase tracking-wider text-purple-800`}>Bảng điều khiển</h3>
                </div>
                
                <div className="p-5 space-y-4">
                    <div className={`text-[10px] font-bold uppercase text-purple-500 px-2 mb-1`}>Chuyển chế độ xem</div>
                    
                    <button
                        onClick={() => onModeChange('original')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                            currentMode === 'original' 
                            ? `bg-white text-blue-700 border-blue-200 shadow-md shadow-blue-200 ring-2 ring-blue-100` 
                            : `bg-white/60 border-transparent text-slate-600 hover:bg-white hover:shadow-sm`
                        }`}
                    >
                        <div className={`p-1.5 rounded-lg ${currentMode === 'original' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                           <LayoutDashboard className="w-4 h-4" />
                        </div>
                        <div className="text-left leading-tight">
                            <div>Nguyên bản</div>
                        </div>
                    </button>

                    <button
                        onClick={() => onModeChange('creative')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                            currentMode === 'creative' 
                            ? `bg-white text-fuchsia-700 border-fuchsia-200 shadow-md shadow-fuchsia-200 ring-2 ring-fuchsia-100` 
                            : `bg-white/60 border-transparent text-slate-600 hover:bg-white hover:shadow-sm`
                        }`}
                    >
                        <div className={`p-1.5 rounded-lg ${currentMode === 'creative' ? 'bg-fuchsia-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                           <Wand2 className="w-4 h-4" />
                        </div>
                        <div className="text-left leading-tight">
                            <div>Sáng tạo Visual</div>
                        </div>
                    </button>

                    <button
                        onClick={() => onModeChange('remix')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                            currentMode === 'remix' 
                            ? `bg-white text-violet-700 border-violet-200 shadow-md shadow-violet-200 ring-2 ring-violet-100` 
                            : `bg-white/60 border-transparent text-slate-600 hover:bg-white hover:shadow-sm`
                        }`}
                    >
                        <div className={`p-1.5 rounded-lg ${currentMode === 'remix' ? 'bg-violet-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                           <PenTool className="w-4 h-4" />
                        </div>
                        <div className="text-left leading-tight">
                            <div>Kịch bản Remix</div>
                        </div>
                    </button>
                </div>
                
                <div className={`p-4 text-[11px] leading-relaxed border-t border-white/50 text-slate-600 bg-white/30`}>
                    <div className="flex gap-2">
                        <div className="mt-1 min-w-[4px] rounded-full bg-purple-400 h-full"></div>
                        <p>{getDescriptionForMode()}</p>
                    </div>
                </div>
            </div>
        </aside>

        {/* --- RIGHT SCENES GRID --- */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {data.scenes.map((scene) => (
            <SceneCard 
                key={scene.id} 
                scene={scene} 
                globalStyle={data.style}
                currentMode={currentMode}
                thumbnailUrl={thumbnails[scene.id]}
                onCopy={copyToClipboard} 
                onPlay={(s) => setPreviewScene(s)}
                theme={themeConfig}
            />
            ))}
        </div>
      </div>
      
      {/* Modal Player */}
      {previewScene && videoUrl && (
        <ScenePlayerModal 
          scene={previewScene} 
          videoUrl={videoUrl} 
          onClose={() => setPreviewScene(null)} 
        />
      )}

    </div>
  );
};

export default AnalysisDisplay;