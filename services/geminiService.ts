import { GoogleGenAI, Type, Schema } from "@google/genai";
import { fileToGenerativePart } from "./utils";
import { VideoAnalysis, AnalysisMode } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

// Schema updated with granular Storyboard fields
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Tiêu đề ngắn gọn cho video",
    },
    summary: {
      type: Type.STRING,
      description: "Tóm tắt nội dung video",
    },
    style: {
      type: Type.STRING,
      description: "Phong cách video (VD: 3D/Pixar, Anime, Cinematic Realistic, Footage...)",
    },
    scenes: {
      type: Type.ARRAY,
      description: "Danh sách các cảnh quay (Scenes).",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER, description: "Số thứ tự cảnh" },
          startTime: { type: Type.STRING, description: "Thời gian bắt đầu (MM:SS)" },
          startTimeSeconds: { type: Type.NUMBER, description: "Thời gian bắt đầu (giây)" },
          endTime: { type: Type.STRING, description: "Thời gian kết thúc (MM:SS)" },
          
          setting: { 
            type: Type.STRING, 
            description: "Mô tả BỐI CẢNH." 
          },
          characterDescription: {
            type: Type.STRING,
            description: "Mô tả NHÂN VẬT."
          },
          action: {
            type: Type.STRING,
            description: "Mô tả HÀNH ĐỘNG & TƯƠNG TÁC."
          },
          cameraAngle: { 
            type: Type.STRING, 
            description: "CAMERA (Shot): Góc quay, Vị trí máy, Chuyển động camera." 
          },
          
          imagePrompt: { type: Type.STRING, description: "Prompt tiếng Anh thuần túy để tạo ảnh (Visual description only)." },
          
          dialogue: { type: Type.STRING, description: "LỜI THOẠI." },
          voiceDescription: { type: Type.STRING, description: "MÔ TẢ GIỌNG ĐỌC." },
          sound: { type: Type.STRING, description: "ÂM THANH: SFX và BGM." },
        },
        required: ["id", "startTime", "startTimeSeconds", "endTime", "setting", "characterDescription", "action", "cameraAngle", "imagePrompt", "dialogue", "voiceDescription", "sound"],
      },
    },
  },
  required: ["title", "summary", "style", "scenes"],
};

const getPromptForMode = (mode: AnalysisMode, maxDuration: number): string => {
  const baseRules = `
    - QUAN TRỌNG VỀ THỜI GIAN: Phân tích và tách cảnh sao cho độ dài mỗi cảnh nằm trong khoảng **7 đến 8 giây**.
    - TUYỆT ĐỐI KHÔNG để cảnh dài quá ${maxDuration} giây (8 giây).
    - NẾU cảnh gốc ngắn (dưới 5s), hãy GỘP (MERGE) các shot liên tiếp có cùng bối cảnh lại thành một Scene hoàn chỉnh để đạt độ dài 7-8s.
    - NẾU cảnh gốc dài, hãy CHIA NHỎ thành các đoạn 7-8s hợp lý.
    - Đảm bảo thời gian (startTime, endTime) chính xác.
  `;

  if (mode === 'creative') {
    return `
      Bạn là một Visual Director (Đạo diễn hình ảnh) chuyên nghiệp cho phim điện ảnh Hollywood và AI Video Generation (Sora/Midjourney).
      
      NHIỆM VỤ: Phân tích video để TÁI TẠO LẠI VISUAL Ở ĐẲNG CẤP CAO HƠN (SÁNG TẠO THÊM).
      
      YÊU CẦU CỤ THỂ:
      1. **Thời lượng (Duration)**: Tuân thủ nghiêm ngặt quy tắc 7-8 giây cho mỗi cảnh.
      2. **Setting & ImagePrompt**: Không chỉ mô tả cái đang thấy, hãy "Nâng cấp" nó. Thêm các từ khóa về ánh sáng (Volumetric lighting, Cinematic lighting), chất liệu (8k textures), lens (35mm, anamorphic), và không khí (moody, atmospheric).
      3. **Camera**: Mô tả chi tiết chuyển động máy quay nghệ thuật.
      4. **Lời thoại (Dialogue)**: QUAN TRỌNG - PHẢI GIỮ NGUYÊN VẸN, CHÍNH XÁC TUYỆT ĐỐI lời thoại từ video gốc. KHÔNG ĐƯỢC THAY ĐỔI LỜI THOẠI.
      5. **Âm thanh**: Giữ nguyên mô tả âm thanh gốc.
      
      Mục tiêu: Tạo ra prompt để generate ra video đẹp hơn bản gốc, nghệ thuật hơn, và có nhịp độ đều đặn 7-8s.
      ${baseRules}
    `;
  }

  if (mode === 'remix') {
    return `
      Bạn là một Viral Scriptwriter và Video Editor chuyên nghiệp.
      
      NHIỆM VỤ: Phân tích video gốc và tạo ra bản Storyboard REMIX.
      
      NGUYÊN TẮC BẮT BUỘC (CRITICAL RULES):
      1. **Thời lượng (Duration)**: Đây là yếu tố quan trọng nhất. Nội dung lời thoại và hành động phải vừa khít trong khoảng **7 đến 8 giây**. Không ngắn hơn, không dài hơn.
      2. **Hình ảnh (Visuals)**: Phải mô tả CHÍNH XÁC những gì đang diễn ra trong video gốc (Setting, Character, Camera). KHÔNG ĐƯỢC BỊA ĐẶT hình ảnh không có thật. Giữ nguyên cấu trúc Storyboard.
      3. **Lời thoại (Dialogue) & Nhịp độ**: ĐÂY LÀ PHẦN CẦN REMIX.
         - Hãy VIẾT LẠI lời thoại dựa trên nội dung gốc nhưng làm cho nó hấp dẫn hơn, viral hơn.
         - Lời thoại phải đủ dài để đọc trong 7-8 giây một cách tự nhiên.
      4. **Action**: Mô tả hành động sao cho khớp với thời lượng 7-8 giây này.
      
      CẤU TRÚC OUTPUT MONG MUỐN TRONG JSON:
      - setting: Mô tả chi tiết bối cảnh thực tế.
      - characterDescription: Mô tả nhân vật thực tế.
      - action: Mô tả hành động thực tế + gợi ý hiệu ứng edit.
      - dialogue: Lời thoại ĐÃ ĐƯỢC VIẾT LẠI (Remixed 7-8s).
      
      Mục tiêu: Giữ nguyên phần "Xương sống" (Hình ảnh) nhưng thay đổi phần "Hồn" (Lời thoại) để video cuốn hút, tối ưu cho Short-form 7-8s.
      ${baseRules}
    `;
  }

  // Original Mode
  return `
    Bạn là một chuyên gia phân tích Storyboard và Kỹ thuật điện ảnh.
    
    NHIỆM VỤ: Phân tích video thành các cảnh (scenes) để tái tạo lại video này chính xác như bản gốc (Storyboard kỹ thuật).
    
    YÊU CẦU CẤU TRÚC DỮ LIỆU CHI TIẾT:
    1. **Thời lượng**: Cố gắng nhóm các shot ngắn lại hoặc chia shot dài ra để mỗi scene mô tả được trọn vẹn trong khoảng **7-8 giây**.
    2. **Bối cảnh & Visual**: Mô tả chính xác, trung thực những gì nhìn thấy.
    3. **Lời thoại**: Bắt buộc chính xác từng từ (Verbatim), đặt trong ngoặc kép. Nếu không có thì để chuỗi rỗng.
    4. **Camera**: Ghi rõ góc máy (Wide/Medium/Close) và chuyển động.
    
    Mục tiêu: Tạo ra bản sao kỹ thuật số chính xác của video nhưng được tổ chức lại thành các đoạn 7-8 giây chuẩn chỉ.
    ${baseRules}
  `;
};

export const analyzeVideo = async (
  file: File, 
  maxDuration: number, 
  customApiKey?: string, 
  mode: AnalysisMode = 'original'
): Promise<VideoAnalysis> => {
  try {
    const apiKey = customApiKey || process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("Vui lòng nhập Google AI API Key để tiếp tục.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Data = await fileToGenerativePart(file);
    
    const prompt = getPromptForMode(mode, maxDuration);

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Không nhận được phản hồi từ AI");

    return JSON.parse(text) as VideoAnalysis;
  } catch (error) {
    console.error("Lỗi phân tích video:", error);
    throw error;
  }
};