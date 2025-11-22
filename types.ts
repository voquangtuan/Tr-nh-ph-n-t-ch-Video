export type AnalysisMode = 'original' | 'creative' | 'remix';

export interface Scene {
  id: number;
  startTime: string; // Format MM:SS
  startTimeSeconds: number; // Dùng để seek video player chính xác
  endTime: string;
  
  // Fields mới theo chuẩn Storyboard
  setting: string; // Bối cảnh: không gian, ánh sáng, môi trường
  characterDescription: string; // Nhân vật: Giới tính, tuổi, dáng, mặt, tóc, trang phục...
  action: string; // Hành động: Ai làm gì, tương tác, biểu cảm
  
  imagePrompt: string; // Prompt tiếng Anh chuẩn để generate ảnh/video
  cameraAngle: string; // Góc máy & Chuyển động
  dialogue: string; // Lời thoại
  voiceDescription: string; // Mô tả giọng nói
  sound: string; // Âm thanh hiệu ứng/nền
  thumbnailUrl?: string; // URL blob của ảnh đã trích xuất
}

export interface VideoAnalysis {
  title: string;
  summary: string;
  style: string; // Phong cách nghệ thuật (Cinematic, Anime, 3D render...)
  scenes: Scene[];
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  data: VideoAnalysis | null;
  isExtractingFrames: boolean; // Trạng thái đang cắt ảnh từ video
}