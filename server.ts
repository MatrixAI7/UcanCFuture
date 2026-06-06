/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { calculateNumerology, getLifePathDetails } from "./src/utils/numerology";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily/Safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 6 custom analysis requirements mapping
const PROMPT_TEMPLATES: Record<number, (dob: string, name: string, profile: any) => string> = {
  1: (dob, name, p) => `
Tôi sẽ cung cấp ngày sinh của mình.
Hãy phân tích theo góc độ thần số học.
Trình bày các đặc điểm nổi bật về tính cách, điểm mạnh, điểm cần cải thiện và cách tôi thường tiếp cận công việc cũng như cuộc sống.
Giải thích bằng ngôn ngữ dễ hiểu.
Đưa ra ví dụ thực tế để tôi dễ hình dung hơn.

Thông tin chi tiết của tôi:
- Ngày sinh: ${dob}
- Họ tên: ${name}
- Chỉ số Đường đời (Life Path): Số ${p.lifePath}
- Chỉ số Sứ mệnh (Destiny): Số ${p.destiny}
- Chỉ số Linh hồn (Soul Urge): Số ${p.soulUrge}
- Chỉ số Nhân cách (Personality): Số ${p.personality}
- Chỉ số Ngày sinh (Birthday Number): Số ${p.birthdayNum}
`,

  2: (dob, name, p) => `
Dựa trên ngày sinh tôi cung cấp.
Hãy phân tích những điểm mạnh nổi bật nhất của tôi theo góc độ thần số học.
Giải thích lý do.
Đưa ra các tình huống thực tế mà những điểm mạnh này có thể phát huy hiệu quả.
Trình bày ngắn gọn, rõ ràng và dễ áp dụng trong cuộc sống hàng ngày.

Thông tin chi tiết của tôi:
- Ngày sinh: ${dob}
- Họ tên: ${name}
- Chỉ số Đường đời (Life Path): Số ${p.lifePath}
- Chỉ số Sứ mệnh (Destiny): Số ${p.destiny}
- Chỉ số Ngày sinh (Birthday Number): Số ${p.birthdayNum}
`,

  3: (dob, name, p) => `
Dựa trên ngày sinh của tôi.
Hãy phân tích những lĩnh vực công việc hoặc hoạt động có thể phù hợp theo góc độ thần số học.
Giải thích từng lựa chọn.
Nêu rõ lý do và đặc điểm liên quan.
Trình bày theo từng mục riêng biệt.
Giúp tôi có thêm góc nhìn để tham khảo khi phát triển bản thân.

Thông tin chi tiết của tôi:
- Ngày sinh: ${dob}
- Họ tên: ${name}
- Chỉ số Đường đời (Life Path): Số ${p.lifePath}
- Chỉ số Sứ mệnh (Destiny): Số ${p.destiny}
- Chỉ số Ngày sinh (Birthday Number): Số ${p.birthdayNum}
`,

  4: (dob, name, p) => `
Dựa trên ngày sinh tôi cung cấp.
Hãy phân tích cách tôi thường giao tiếp, kết nối và xây dựng mối quan hệ với người khác theo góc độ thần số học.
Nêu những điểm thuận lợi và những điều cần lưu ý.
Đưa ra các gợi ý giúp cải thiện khả năng kết nối với mọi người.

Thông tin chi tiết của tôi:
- Ngày sinh: ${dob}
- Họ tên: ${name}
- Chỉ số Đường đời (Life Path): Số ${p.lifePath}
- Chỉ số Sứ mệnh (Destiny): Số ${p.destiny}
- Chỉ số Linh hồn (Soul Urge): Số ${p.soulUrge}
- Chỉ số Nhân cách (Personality): Số ${p.personality}
`,

  5: (dob, name, p) => `
Dựa trên ngày sinh của tôi.
Hãy phân tích những bài học quan trọng mà tôi có thể cần chú ý trong quá trình phát triển bản thân theo góc độ thần số học.
Giải thích dễ hiểu.
Đưa ra các gợi ý thực tế.
Tập trung vào việc hoàn thiện kỹ năng, tư duy và cách ứng xử trong cuộc sống.

Thông tin chi tiết của tôi:
- Ngày sinh: ${dob}
- Họ tên: ${name}
- Chỉ số Đường đời (Life Path): Số ${p.lifePath}
- Chỉ số Sứ mệnh (Destiny): Số ${p.destiny}
- Thế vận Năm cá nhân (Personal Year 2026): Số ${p.personalYear}
`,

  6: (dob, name, p) => `
Dựa trên ngày sinh tôi cung cấp.
Hãy tạo một báo cáo tổng hợp theo góc độ thần số học.
Bao gồm tính cách, điểm mạnh, điểm cần cải thiện, định hướng phát triển bản thân, công việc phù hợp và các lời khuyên hữu ích.
Trình bày thành từng phần rõ ràng.
Ngôn ngữ đơn giản.
Dễ đọc và dễ áp dụng.

Thông tin chi tiết của tôi:
- Ngày sinh: ${dob}
- Họ tên: ${name}
- Chỉ số Đường đời (Life Path): Số ${p.lifePath}
- Chỉ số Sứ mệnh (Destiny): Số ${p.destiny}
- Chỉ số Linh hồn (Soul Urge): Số ${p.soulUrge}
- Chỉ số Nhân cách (Personality): Số ${p.personality}
- Chỉ số Ngày sinh (Birthday Number): Số ${p.birthdayNum}
- Thế vận Năm cá nhân (Personal Year 2026): Số ${p.personalYear}
`
};

// API proxy endpoints
app.post("/api/numerology/analyze", async (req, res) => {
  try {
    const { dob, fullName, sectionId } = req.body;

    if (!dob || !fullName || !sectionId) {
      return res.status(400).json({ error: "Missing required fields: dob, fullName, sectionId" });
    }

    const secNum = parseInt(sectionId, 10);
    const templateFn = PROMPT_TEMPLATES[secNum];
    if (!templateFn) {
      return res.status(400).json({ error: "Invalid sectionId. Must be between 1 and 6 inclusive." });
    }

    // Programmatically calculate profile to populate template & verify accuracy
    const profile = calculateNumerology(dob, fullName);
    const resolvedPrompt = templateFn(dob, fullName, profile);

    // Call Gemini
    const gemini = getGeminiClient();
    
    const systemInstruction = 
      "Bạn là một chuyên gia hàng đầu về Tử vi và Thần số học Pythagoras tại Việt Nam. " +
      "Hãy phân tích thật chi tiết, có chiều sâu, dùng ngôn ngữ tiếng Việt uyển chuyển, ấm áp, thấu cảm, " +
      "đồng thời mang phong cách khoa học hiện đại dễ hiểu. Hãy định dạng câu trả lời bằng Markdown rõ ràng, sử dụng tiêu đề (h3, h4), " +
      "dấu gạch đầu dòng, tô đậm từ khóa quan trọng và chia khoảng cách dòng hợp lý để dễ đọc nhất.";

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: resolvedPrompt,
      config: {
        systemInstruction,
        temperature: 0.75,
      },
    });

    const resultText = response.text || "Không thể phân tích dữ liệu thần số học vào lúc này.";

    res.json({
      success: true,
      profile,
      resultText
    });
  } catch (error: any) {
    console.error("Error analyzing numerology:", error);
    if (error.message === "GEMINI_API_KEY_MISSING") {
      res.status(500).json({
        error: "Cấu hình API Key bị thiếu. Vui lòng thiết lập GEMINI_API_KEY trong bảng điều khiển Secrets của AI Studio.",
        code: "MISSING_API_KEY"
      });
    } else {
      res.status(500).json({ error: "Lỗi hệ thống khi xử lý phân tích tử vi thần số học: " + error.message });
    }
  }
});

// Calculate programmatically instantly without AI
app.post("/api/numerology/calculate", (req, res) => {
  try {
    const { dob, fullName } = req.body;
    if (!dob || !fullName) {
      return res.status(400).json({ error: "Thiếu ngày sinh hoặc họ tên." });
    }
    const profile = calculateNumerology(dob, fullName);
    const details = getLifePathDetails(profile.lifePath);
    res.json({
      success: true,
      profile,
      details
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite server integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT} with environment ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
