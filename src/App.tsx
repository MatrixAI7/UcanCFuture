/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Calendar,
  User,
  Compass,
  Award,
  Heart,
  TrendingUp,
  FileText,
  Printer,
  History,
  Info,
  Clock,
  Shield,
  Moon,
  Star,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  HelpCircle
} from "lucide-react";
import { calculateNumerology, calculateEasternZodiac, LIFE_PATH_DETAILS, getLifePathDetails } from "./utils/numerology";
import { NumerologyProfile, DescriptionItem } from "./types";

interface SavedProfile {
  id: string;
  fullName: string;
  dob: string;
  gender: string;
  createdAt: string;
}

export default function App() {
  // Input states
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Nam");
  
  // App states
  const [submitted, setSubmitted] = useState(false);
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [zodiac, setZodiac] = useState<any | null>(null);
  const [lifePathDetails, setLifePathDetailsState] = useState<DescriptionItem | null>(null);
  
  // History profiles
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  
  // Sound on/off (simulated cosmic ambience/clicks)
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Loading & specific prompt section cache states
  const [loadingSectionId, setLoadingSectionId] = useState<number | null>(null);
  const [loadingQuote, setLoadingQuote] = useState("");
  const [analysisCache, setAnalysisCache] = useState<Record<number, string>>({});
  const [activeSectionTab, setActiveSectionTab] = useState<number>(1);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Mystic loading quotes
  const mysticQuotes = [
    "Đang kết nối năng lượng tinh tú phương Đông và ma trận số phương Tây...",
    "Đang phân tích Thần số học Pythagoras dưới góc nhìn của học giả cổ đại...",
    "Trí tuệ nhân tạo Gemini đang kết tinh tri thức về bản mệnh đường đời của bạn...",
    "Đang tính toán dao động tần số rung động của họ tên và ngày sinh...",
    "Hài hòa năng lượng Âm Dương, Ngũ Hành phong thủy bản mệnh...",
    "Đại diện tri thức số học đang lập báo cáo chiêm nghiệm định mệnh..."
  ];

  // Preset demo profiles for quick testing
  const demoProfiles = [
    { fullName: "Nguyễn Văn Minh", dob: "1994-08-16", gender: "Nam" },
    { fullName: "Trần Thị Kim Chi", dob: "1988-12-05", gender: "Nữ" },
    { fullName: "Lê Hoàng Khánh", dob: "2001-03-31", gender: "Nam" }
  ];

  // Section identifiers mapped with Vietnamese names and prompts requested in instructions
  const SECTIONS = [
    {
      id: 1,
      title: "Phân tích tổng quan từ ngày sinh",
      shortTitle: "Phân tích tổng quan",
      desc: "Trình bày đặc điểm nổi bật về tính cách, điểm mạnh, điểm cần cải thiện, và cách tiếp cận công việc cùng cuộc sống với ví dụ trực diện.",
      icon: User,
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 2,
      title: "Khám phá điểm mạnh cá nhân",
      shortTitle: "Điểm mạnh nổi bật",
      desc: "Phân tích sâu những điểm mạnh nổi bật theo thần số học, lý giải nguyên nhân và gợi mở các tình huống thực tiễn để phát huy hiệu quả.",
      icon: Award,
      color: "from-amber-400 to-orange-600"
    },
    {
      id: 3,
      title: "Tìm lĩnh vực phù hợp",
      shortTitle: "Định hướng lĩnh vực",
      desc: "Học thức nghề nghiệp, tìm kiếm các công việc hoặc hoạt động phù hợp nhất với bản thể thần số học tốt hơn để mở rộng tư duy.",
      icon: Compass,
      color: "from-teal-400 to-emerald-600"
    },
    {
      id: 4,
      title: "Phân tích cách xây dựng mối quan hệ",
      shortTitle: "Giao tiếp & Kết nối",
      desc: "Mô tả xu hướng giao tiếp, khả năng kết nối bạn bè, đối tác, những điểm thuận lợi và cảnh báo lưu ý, gợi ý hữu ích.",
      icon: Heart,
      color: "from-rose-500 to-pink-600"
    },
    {
      id: 5,
      title: "Xác định bài học phát triển bản thân",
      shortTitle: "Bài học cuộc sống",
      desc: "Khám phá những thử thách vũ trụ đòi hỏi bồi đắp nâng cao tư duy, mài giũa kỹ năng, sửa chữa khuyết điểm tốt đẹp hơn.",
      icon: TrendingUp,
      color: "from-purple-500 to-violet-600"
    },
    {
      id: 6,
      title: "Tạo báo cáo tổng hợp cá nhân",
      shortTitle: "Báo cáo tổng hợp AI",
      desc: "Lập một báo cáo toàn diện nhất bao hàm tính cách, điểm mạnh, điểm yếu định hướng công việc lẫn các lời khuyên thiết thực tối ưu.",
      icon: FileText,
      color: "from-fuchsia-500 to-pink-700"
    }
  ];

  // Sound effect simulator
  const playClick = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(650, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.log("Audio simulation failed:", e);
    }
  };

  const playMysticUnlock = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.5);
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(450, audioCtx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1600, audioCtx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
      
      osc.start();
      osc2.start();
      osc.stop(audioCtx.currentTime + 0.6);
      osc2.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.log("Audio simulation failed:", e);
    }
  };

  // Load Saved Profiles on mount
  useEffect(() => {
    const stored = localStorage.getItem("TUTI_NUMEROLOGY_PROFILES");
    if (stored) {
      try {
        setSavedProfiles(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load history profiles:", e);
      }
    }
  }, []);

  // Save profile helper
  const saveProfileToLocalStorage = (name: string, bday: string, sex: string) => {
    if (!name || !bday) return;
    const isDup = savedProfiles.some(p => p.fullName.trim().toLowerCase() === name.trim().toLowerCase() && p.dob === bday);
    if (isDup) return;

    const newProfile: SavedProfile = {
      id: Math.random().toString(36).substring(2, 9),
      fullName: name,
      dob: bday,
      gender: sex,
      createdAt: new Date().toLocaleDateString("vi-VN")
    };
    const updated = [newProfile, ...savedProfiles].slice(0, 8); // Keep last 8 searches
    setSavedProfiles(updated);
    localStorage.setItem("TUTI_NUMEROLOGY_PROFILES", JSON.stringify(updated));
  };

  // Delete profile helper
  const deleteProfile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playClick();
    const filtered = savedProfiles.filter(p => p.id !== id);
    setSavedProfiles(filtered);
    localStorage.setItem("TUTI_NUMEROLOGY_PROFILES", JSON.stringify(filtered));
  };

  // Load specific demo/saved profile
  const loadProfile = (name: string, bday: string, sex: string) => {
    playClick();
    setFullName(name);
    setDob(bday);
    setGender(sex);
    setApiError(null);
    setAnalysisCache({}); // Reset Gemini reports
    
    // Set immediate programmatic analysis
    const p = calculateNumerology(bday, name);
    const z = calculateEasternZodiac(parseInt(bday.split("-")[0], 10) || 2000);
    const d = getLifePathDetails(p.lifePath);
    
    setProfile(p);
    setZodiac(z);
    setLifePathDetailsState(d);
    setSubmitted(true);
  };

  // Handle Manual Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !dob) return;
    
    playMysticUnlock();
    setApiError(null);
    setAnalysisCache({}); // Reset Gemini cache
    
    const p = calculateNumerology(dob, fullName);
    const z = calculateEasternZodiac(parseInt(dob.split("-")[0], 10) || 2000);
    const d = getLifePathDetails(p.lifePath);
    
    setProfile(p);
    setZodiac(z);
    setLifePathDetailsState(d);
    setSubmitted(true);
    
    saveProfileToLocalStorage(fullName, dob, gender);
  };

  // Trigger Gemini AI custom content analysis
  const fetchAnalysis = async (secId: number) => {
    if (loadingSectionId !== null) return;
    playClick();
    setApiError(null);
    setLoadingSectionId(secId);
    
    // Cycle loading quotes for fun
    let quoteIndex = 0;
    setLoadingQuote(mysticQuotes[quoteIndex]);
    const quoteInterval = setInterval(() => {
      quoteIndex = (quoteIndex + 1) % mysticQuotes.length;
      setLoadingQuote(mysticQuotes[quoteIndex]);
    }, 4500);

    try {
      const response = await fetch("/api/numerology/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dob,
          fullName,
          sectionId: secId
        })
      });

      const data = await response.json();
      clearInterval(quoteInterval);

      if (data.success && data.resultText) {
        setAnalysisCache(prev => ({
          ...prev,
          [secId]: data.resultText
        }));
        playMysticUnlock();
      } else {
        throw new Error(data.error || "Không thể phân tích dữ liệu thần số học từ hệ thống.");
      }
    } catch (err: any) {
      console.error(err);
      clearInterval(quoteInterval);
      setApiError(err.message || "Đã xảy ra lỗi kết nối với máy chủ AI Gemini. Vui lòng kiểm tra cài đặt Secrets của bạn.");
    } finally {
      setLoadingSectionId(null);
    }
  };

  // Safe markdown viewer converter to styled HTML elements
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    // Split into lines
    const lines = text.split("\n");
    let currentList: React.ReactNode[] = [];
    const elements: React.ReactNode[] = [];

    const flushList = (key: number) => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-6 py-2 space-y-2 text-slate-300">
            {currentList}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();

      // Check if header
      if (trimmed.startsWith("###")) {
        flushList(i);
        const headerText = trimmed.replace(/^###\s*/, "");
        elements.push(
          <h4 key={i} className="text-lg font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-amber-200 mt-6 mb-3 border-l-2 border-violet-400 pl-3">
            {parseInlineStyles(headerText)}
          </h4>
        );
      } else if (trimmed.startsWith("####")) {
        flushList(i);
        const headerText = trimmed.replace(/^####\s*/, "");
        elements.push(
          <h5 key={i} className="text-md font-semibold text-slate-200 mt-4 mb-2">
            {parseInlineStyles(headerText)}
          </h5>
        );
      } else if (trimmed.startsWith("##") || trimmed.startsWith("#")) {
        flushList(i);
        const headerText = trimmed.replace(/^#+\s*/, "");
        elements.push(
          <h3 key={i} className="text-xl font-bold font-display text-amber-300 mt-8 mb-4 border-b border-indigo-900/60 pb-1">
            {parseInlineStyles(headerText)}
          </h3>
        );
      }
      // Check if bullet point
      else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const bulletText = trimmed.substring(2);
        currentList.push(
          <li key={`bullet-${i}`} className="leading-relaxed">
            {parseInlineStyles(bulletText)}
          </li>
        );
      }
      // Check if numbered list
      else if (/^\d+\.\s/.test(trimmed)) {
        flushList(i);
        const listText = trimmed.replace(/^\d+\.\s*/, "");
        elements.push(
          <div key={i} className="flex gap-3 text-slate-300 py-1.5 alignment-start leading-relaxed">
            <span className="flex items-center justify-center bg-violet-950 text-violet-300 border border-violet-800/40 rounded-full w-6 h-6 text-xs shrink-0 font-mono">
              {trimmed.match(/^\d+/)?.[0]}
            </span>
            <p className="flex-1">{parseInlineStyles(listText)}</p>
          </div>
        );
      }
      // Blockquote
      else if (trimmed.startsWith(">")) {
        flushList(i);
        const quoteText = trimmed.replace(/^>\s*/, "");
        elements.push(
          <blockquote key={i} className="border-l-4 border-amber-400 bg-amber-950/20 px-4 py-3 rounded-r-lg my-3 text-amber-200 font-serif italic text-sm leading-relaxed">
            {parseInlineStyles(quoteText)}
          </blockquote>
        );
      }
      // Empty line
      else if (trimmed === "") {
        flushList(i);
      }
      // Normal paragraph
      else {
        flushList(i);
        elements.push(
          <p key={i} className="text-slate-300 leading-relaxed py-2 text-justify">
            {parseInlineStyles(trimmed)}
          </p>
        );
      }
    });

    // Final flush
    flushList(lines.length);

    return <div className="space-y-1">{elements}</div>;
  };

  // Helper to parse double asterisks **bold** in react
  const parseInlineStyles = (txt: string) => {
    const parts = txt.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="text-amber-200 font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Reset Form state
  const handleReset = () => {
    playClick();
    setSubmitted(false);
    setProfile(null);
    setZodiac(null);
    setLifePathDetailsState(null);
    setAnalysisCache({});
    setApiError(null);
  };

  // Print function
  const handlePrint = () => {
    playClick();
    window.print();
  };

  // Copy report link simulation
  const handleShare = () => {
    playClick();
    const dummyUrl = window.location.href;
    navigator.clipboard.writeText(dummyUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  return (
    <div className="min-h-screen bg-[#070514] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#070514] to-[#04030a] text-slate-100 selection:bg-violet-800 selection:text-white mystic-scroll">
      
      {/* Dynamic Star Overlay Decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.08),_transparent_60%)] pointer-events-none"></div>

      {/* Floating Status Bar & Sound Controller - Subtle */}
      <header className="no-print border-b border-indigo-950/60 bg-[#0c0a1c]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3.5 clickable" onClick={() => { playClick(); handleReset(); }}>
            <div className="bg-gradient-to-br from-violet-600 to-amber-400 p-2 rounded-xl shadow-lg ring-1 ring-violet-400/30">
              <Sparkles className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-display font-bold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-indigo-200 to-amber-250">
                TỬ VI THẦN SỐ HỌC
              </span>
              <p className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase hidden sm:block">AI Gemini Bản Cực Khai Phóng</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sound Toggle widget */}
            <button
              onClick={() => { setSoundEnabled(!soundEnabled); setTimeout(playClick, 50); }}
              className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5 focus:outline-none ${
                soundEnabled
                  ? "bg-violet-950/60 text-violet-300 border-violet-800/80 shadow-inner"
                  : "bg-slate-900/40 text-slate-500 border-slate-800/60 hover:text-slate-400"
              }`}
              title={soundEnabled ? "Tắt âm thanh hiệu ứng" : "Bật âm thanh hiệu ứng"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline font-mono text-[10px]">Âm thanh</span>
            </button>

            {/* Print trigger if content analyzed */}
            {submitted && (
              <button
                onClick={handlePrint}
                className="p-2 sm:px-3 sm:py-2 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-200 border border-indigo-800/50 rounded-lg text-xs flex items-center gap-2 transition"
                title="In báo cáo chi tiết"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">In kết quả</span>
              </button>
            )}

            {/* Quick reference block */}
            <div className="px-3 py-1.5 bg-slate-950 border border-indigo-950 rounded-full text-[11px] text-slate-400 font-mono flex items-center gap-1.5 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Gemini 3.5 AI</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* API key missing warning detector */}
        {apiError && apiError.includes("API Key") && (
          <div className="mb-8 p-4 bg-amber-955/20 border border-amber-800/40 rounded-xl text-amber-250 text-sm flex items-start gap-3 shadow-2xl">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold">Lưu ý kết nối API: </span>
              Hệ thống chưa tìm thấy khóa <code className="bg-slate-950 px-1.5 py-0.5 rounded text-fuchsia-300 text-xs font-mono">GEMINI_API_KEY</code>. 
              Bạn hãy cung cấp API Key trong tab Secrets của Google AI Studio để mở khóa tính năng tóm tắt thông minh do AI thực hiện. 
              Mặc dù vậy, công cụ vẫn tính toán thần số học và tử vi hoàn toàn chính xác tức thời bằng thuật toán Pythagoras!
            </div>
          </div>
        )}

        {!submitted ? (
          /* SECTION A: WELL-CRAFTED LANDING PAGE & FORM */
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Elegant Celestial Callout Banner */}
            <div className="text-center space-y-4 py-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-950/90 to-indigo-950/90 border border-violet-800/40 px-4 py-1.5 rounded-full text-violet-300 text-xs sm:text-sm shadow-xl tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>Trí Tuệ Phương Đông Giao Thoa Học Thuyết Pythagoras Phương Tây</span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight">
                <span className="block text-slate-100">Khai Phóng Định Mệnh</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-violet-300 to-indigo-300">
                  Tử Vi & Thần Số Học AI
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Nhập đầy đủ Họ tên và Ngày sinh dương lịch của bạn để giải mã toàn bộ các chỉ số Đường đời, Sứ mệnh, Mệnh cách Can chi cổ truyền và nhận bản luận giải thông thái từ AI Gemini.
              </p>
            </div>

            {/* Main Interactive Form card */}
            <div className="bg-gradient-to-b from-[#120f2b]/95 to-[#0b091a]/95 border border-indigo-900/50 p-6 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-sm ring-1 ring-violet-500/10">
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,_rgba(245,158,11,0.04),_transparent_60%)] pointer-events-none"></div>

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name input element */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-violet-400" />
                      Họ và Tên Đầy Đủ
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn Minh"
                      className="w-full bg-[#080614]/80 text-white placeholder-slate-500 border border-indigo-950 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all shadow-inner"
                    />
                    <p className="text-[10px] text-slate-500 italic">Nhập tiếng Việt có dấu đầy đủ để tính chỉ số Sứ mệnh & Nhân cách chính xác nhất</p>
                  </div>

                  {/* DoB input element */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-violet-400" />
                      Ngày Tháng Năm Sinh <span className="text-amber-400/80 font-normal text-[10px]">(Dương Lịch)</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-[#080614]/80 text-white border border-indigo-950 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all shadow-inner font-mono"
                    />
                    <p className="text-[10px] text-slate-500 italic">Nhấp biểu tượng để chọn ngày sinh chính xác trên lịch dương</p>
                  </div>
                </div>

                {/* Additional details: Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-pink-400" />
                      Giới Tính Bản Thể
                    </label>
                    <div className="flex gap-4">
                      {["Nam", "Nữ", "Khác"].map((sex) => (
                        <button
                          key={sex}
                          type="button"
                          onClick={() => { playClick(); setGender(sex); }}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                            gender === sex
                              ? "bg-violet-950/60 border-violet-500 text-violet-200 shadow-lg"
                              : "bg-[#09071a]/50 border-indigo-950 text-slate-400 hover:border-indigo-900 hover:text-slate-300"
                          }`}
                        >
                          {sex}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aesthetic quote panel */}
                  <div className="bg-[#090717]/80 rounded-xl border border-indigo-950/40 p-3.5 text-xs text-slate-400 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Sử dụng hệ thống Pythagoras cổ đại kết tủa lượng dao động của chữ cái tương thích với bộ 26 ký tự Latin tiêu chuẩn khoa học kết hợp Can Chi năm sinh lục thập hoa giáp Đông Á.
                    </p>
                  </div>
                </div>

                {/* Submit button action */}
                <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  {/* Demo load quick buttons */}
                  <div className="flex flex-col w-full sm:w-auto space-y-1.5">
                    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Hồ sơ mẫu thử nhanh:</span>
                    <div className="flex flex-wrap gap-2">
                      {demoProfiles.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => loadProfile(p.fullName, p.dob, p.gender)}
                          className="px-3 py-1.5 bg-indigo-950/20 hover:bg-indigo-900/40 border border-indigo-900/40 hover:border-indigo-800/80 rounded-lg text-[11px] text-indigo-300 transition flex items-center gap-1"
                        >
                          <Star className="w-3 h-3 text-amber-400" />
                          <span>{p.fullName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submission triggers */}
                  <button
                    type="submit"
                    className="w-full sm:w-auto font-display font-bold px-8 py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-500 text-white text-sm rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] outline-none flex items-center justify-center gap-2 cursor-pointer border border-violet-500/20"
                  >
                    <span>TRA CỨU CHI TIẾT</span>
                    <Sparkles className="w-4.5 h-4.5 text-amber-250 animate-pulse" />
                  </button>
                </div>
              </form>
            </div>

            {/* Saved Profile History section */}
            {savedProfiles.length > 0 && (
              <div className="bg-[#0b091a]/40 border border-indigo-950/60 p-5 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                    <History className="w-4 h-4 text-violet-400" />
                    Lịch Sử Tra Cứu Gần Đây
                  </span>
                  <button
                    onClick={() => {
                      playClick();
                      setSavedProfiles([]);
                      localStorage.removeItem("TUTI_NUMEROLOGY_PROFILES");
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-400 underline"
                  >
                    Xóa tất cả
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {savedProfiles.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadProfile(item.fullName, item.dob, item.gender)}
                      className="bg-indigo-950/10 hover:bg-indigo-950/30 border border-indigo-950/40 hover:border-indigo-900/60 p-3 rounded-xl transition cursor-pointer relative group text-left"
                    >
                      <button
                        onClick={(e) => deleteProfile(e, item.id)}
                        className="absolute top-1.5 right-1.5 text-slate-500 hover:text-slate-300 w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                        title="Xóa bản ghi"
                      >
                        ×
                      </button>
                      <p className="text-xs font-semibold text-slate-200 truncate pr-3">{item.fullName}</p>
                      <p className="text-[10px] text-indigo-400 font-mono mt-1">{item.dob.split("-").reverse().join("/")}</p>
                      <span className="inline-block text-[9px] px-1.5 py-0.2 bg-indigo-950/60 border border-indigo-900/40 rounded text-slate-400 mt-1.5">{item.gender}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aesthetic FAQ features layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
              <div className="p-4 bg-slate-900/20 border border-indigo-950/40 rounded-xl space-y-2">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 shrink-0" />
                  Con số Chủ Đạo (Life Path)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Là kim chỉ nam tiết lộ bức tranh lớn nhất về vận thế cuộc đời, các bài học cốt lõi, cơ duyên thử thách và xu hướng nội tâm sẵn có trong hành trình.
                </p>
              </div>
              <div className="p-4 bg-slate-900/20 border border-indigo-950/40 rounded-xl space-y-2">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-violet-400 shrink-0" />
                  Mệnh Cách Can Chi
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tử vi Đông Á cổ điển phân tinh thọ Mệnh ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ), nạp âm tương hòa cát lợi hỗ trợ thấu suốt bản tính hài hòa tự nhiên.
                </p>
              </div>
              <div className="p-4 bg-slate-900/20 border border-indigo-950/40 rounded-xl space-y-2">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />
                  Đúc Kết Toàn Diện AI
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Đại diện ngôn ngữ lớn tiên tiến nhất từ Google hỗ trợ phân tích kết hợp thần kỳ, tổng hợp ý nguyện, giải mã chiều sâu cuộc sống từng khía cạnh.
                </p>
              </div>
            </div>

          </div>
        ) : (
          /* SECTION B: CALCULATION RESULTS & EXPERT ANALYSIS SCREEN */
          <div className="space-y-8 animate-fade-in relative">
            
            {/* Top Back Action Button bar */}
            <div className="no-print flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-slate-950/60 border border-indigo-950/50 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-200 border border-indigo-900/60 hover:border-indigo-800/80 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tra Cứu Bản Mệnh Khác</span>
                </button>
                <div className="h-5 w-[1px] bg-indigo-950/80"></div>
                <div>
                  <span className="text-xs text-slate-400">Đang luận giải cho: </span>
                  <span className="text-xs font-bold text-amber-200">{fullName}</span>
                  <span className="text-xs text-slate-400 font-mono ml-2">({dob.split("-").reverse().join("/")})</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShare}
                  className="px-3 py-2 bg-slate-900/[40%] hover:bg-slate-800/[60%] border border-indigo-950 rounded-lg text-xs text-slate-300 transition flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? "Đã sao chép liên kết!" : "Chia sẻ"}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  <span>In báo cáo bả nghệ</span>
                </button>
              </div>
            </div>

            {/* PRINT-ONLY HEADER */}
            <div className="hidden print:block text-black space-y-2 mb-8 text-center text-left">
              <h1 className="text-2xl font-bold uppercase tracking-wider">HỒ SƠ BÁO CÁO CÁ NHÂN TỬ VI THẦN SỐ HỌC</h1>
              <p className="text-sm">Họ tên đương đơn: <strong>{fullName}</strong> | Ngày sinh: <strong>{dob.split("-").reverse().join("/")}</strong> ({gender})</p>
              <p className="text-xs italic text-gray-500">Được lập tự động vào ngày {new Date().toLocaleDateString("vi-VN")} bởi nền tảng Tử Vi Thần Số Học AI Gemini</p>
              <hr className="border-gray-300" />
            </div>

            {/* 1. PRIMARY METRICS INSTANT DASHBOARD GRAPHIC (Numerology & Eastern Zodiac combined) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Box A1: Con Số Chủ Đạo Circular focus display */}
              <div className="md:col-span-1 bg-gradient-to-b from-[#110d29] to-[#0a0818]/60 border border-indigo-900/60 p-6 rounded-2xl flex flex-col items-center justify-between text-center relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle,_rgba(139,92,246,0.1),_transparent_60%)] pointer-events-none"></div>
                
                <div className="w-full">
                  <div className="flex items-center justify-between w-full border-b border-indigo-950/80 pb-3 mb-4 text-left">
                    <span className="text-[11px] font-mono font-bold text-indigo-400 tracking-wider uppercase block">CON SỐ CHỦ ĐẠO</span>
                    <span className="text-[10px] px-2 py-0.5 bg-violet-950/60 border border-violet-800/40 rounded text-violet-300 font-mono">Life Path</span>
                  </div>

                  {/* High visual numeric crown ring */}
                  <div className="my-5 relative inline-flex items-center justify-center">
                    {/* Ring glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/30 to-amber-400/30 blur-xl rounded-full scale-120 animate-pulse"></div>
                    <div className="w-32 h-32 rounded-full border-4 border-dashed border-violet-500/40 flex flex-col items-center justify-center bg-[#070514]/90 ring-4 ring-indigo-950 shadow-inner z-10 relative">
                      <span className="text-4xl md:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-amber-250">
                        {profile?.lifePath}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-md font-bold font-display text-amber-250 mt-2 mb-1.5 px-2">
                    {lifePathDetails?.title}
                  </h3>
                  <p className="text-xs text-slate-350 italic leading-relaxed px-1">
                    "{lifePathDetails?.keyword}"
                  </p>
                </div>

                <div className="w-full bg-[#080614]/80 border border-indigo-950/60 rounded-xl p-3.5 mt-5 text-left text-xs space-y-2">
                  <span className="font-bold text-slate-200 block border-b border-indigo-950/50 pb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Lời khuyên vàng:
                  </span>
                  <p className="text-slate-400 italic">
                    {lifePathDetails?.advice}
                  </p>
                </div>
              </div>

              {/* Box A2: Eastern Zodiac Eastern Astrolabe card */}
              <div className="md:col-span-1 bg-gradient-to-b from-[#110d29] to-[#0a0818]/60 border border-indigo-900/60 p-6 rounded-2xl text-left relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle,_rgba(245,158,11,0.06),_transparent_60%)] pointer-events-none"></div>

                <div className="flex items-center justify-between w-full border-b border-indigo-950/80 pb-3 mb-4">
                  <span className="text-[11px] font-mono font-bold text-amber-500 tracking-wider uppercase block">TỬ VI PHONG THỦY</span>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-950/60 border border-amber-800/40 rounded text-amber-305 font-mono">Eastern Horoscope</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Bản Mệnh Can Chi</span>
                    <p className="text-2xl font-bold font-display text-amber-100 mt-1 flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                      {zodiac?.canChiName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-[#080614]/80 border border-indigo-950/40 rounded-xl p-3">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Ngũ Hành Nạp Âm</span>
                      <p className="text-sm font-bold text-indigo-300 mt-1 flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          zodiac?.element === "Thủy" ? "bg-blue-500 shadow-blue-500/20" :
                          zodiac?.element === "Kim" ? "bg-slate-300 shadow-slate-300/20" :
                          zodiac?.element === "Mộc" ? "bg-emerald-500 shadow-emerald-500/20" :
                          zodiac?.element === "Hỏa" ? "bg-rose-500 shadow-rose-500/20" : "bg-amber-600 shadow-amber-600/20"
                        } shadow-lg`}></span>
                        Mệnh {zodiac?.element}
                      </p>
                    </div>

                    <div className="bg-[#080614]/80 border border-indigo-950/40 rounded-xl p-3">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Bản Thể Năng Lượng</span>
                      <p className="text-sm font-bold text-violet-300 mt-1 font-mono">Thế {zodiac?.yinYang}</p>
                    </div>
                  </div>

                  <div className="bg-[#080614]/85 border border-indigo-950/60 rounded-xl p-3 text-xs space-y-1.5">
                    <span className="text-slate-400 font-bold block flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Khung giờ hoàng đạo cát lợi:
                    </span>
                    <p className="text-[11px] text-emerald-300 font-mono leading-relaxed">
                      {zodiac?.luckyHours}
                    </p>
                    <p className="text-[9px] text-slate-500 italic">Áp dụng cho mưu sự lớn, ký kết, xuất hành cầu may mắn.</p>
                  </div>
                </div>
              </div>

              {/* Box A3: Core Pythagorean Indicators Grouping */}
              <div className="md:col-span-1 bg-gradient-to-b from-[#110d29] to-[#0a0818]/60 border border-indigo-900/60 p-6 rounded-2xl relative overflow-hidden shadow-xl text-left">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle,_rgba(139,92,246,0.06),_transparent_60%)] pointer-events-none"></div>

                <div className="flex items-center justify-between w-full border-b border-indigo-950/80 pb-3 mb-4">
                  <span className="text-[11px] font-mono font-bold text-violet-400 tracking-wider uppercase block font-mono">CÁC CHỈ SỐ MA TRẬN PHỤ</span>
                  <span className="text-[10px] px-2 py-0.5 bg-violet-950/60 border border-violet-800/40 rounded text-violet-300 font-mono">Pythagore Metrics</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 bg-[#080614]/80 border border-indigo-950/50 rounded-xl hover:bg-[#0c091f]/60 transition">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-400" />
                      Chỉ số Sứ mệnh <span className="text-[9px] text-slate-500">(Tên)</span>
                    </span>
                    <span className="text-xs font-mono font-bold bg-indigo-950 border border-indigo-800/50 px-2 py-0.5 rounded text-indigo-200">
                      Số {profile?.destiny}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#080614]/80 border border-indigo-950/50 rounded-xl hover:bg-[#0c091f]/60 transition">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      Chỉ số Linh hồn <span className="text-[9px] text-slate-500">(Lòng mong mỏi)</span>
                    </span>
                    <span className="text-xs font-mono font-bold bg-rose-950 border border-rose-800/40 px-2 py-0.5 rounded text-rose-300">
                      Số {profile?.soulUrge}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#080614]/80 border border-indigo-950/50 rounded-xl hover:bg-[#0c091f]/60 transition">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-400" />
                      Chỉ số Nhân cách <span className="text-[9px] text-slate-500">(Hình ảnh ngoài)</span>
                    </span>
                    <span className="text-xs font-mono font-bold bg-teal-950 border border-teal-800/40 px-2 py-0.5 rounded text-teal-300">
                      Số {profile?.personality}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#080614]/80 border border-indigo-950/50 rounded-xl hover:bg-[#0c091f]/60 transition">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      Chỉ số Ngày sinh <span className="text-[9px] text-slate-500">(Đặc tài lẻ)</span>
                    </span>
                    <span className="text-xs font-mono font-bold bg-amber-950 border border-amber-800/45 px-2 py-0.5 rounded text-amber-200">
                      Số {profile?.birthdayNum}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#0c091c] border border-violet-900 hover:border-violet-750 transition rounded-xl">
                    <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-fuchsia-400" />
                      Năm cá nhân 2026
                    </span>
                    <span className="text-xs font-mono font-black text-amber-300 px-2.5 py-0.5 bg-amber-950/50 border border-amber-800/30 rounded">
                      Số {profile?.personalYear}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* 2. TABBED / LISTED DETAILED AI INTERACTION INTERFACE */}
            <div className="bg-gradient-to-b from-[#110e2d] to-[#0c0a1a] border border-indigo-900/60 rounded-2xl shadow-2xl overflow-hidden text-left relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,_rgba(139,92,246,0.03),_transparent_60%)] pointer-events-none"></div>

              {/* Header Title with Sparkling layout */}
              <div className="p-6 border-b border-indigo-950/80 bg-[#0e0c24]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase block">KHO TÀNG TRI THỨC</span>
                  <h2 className="text-xl font-bold font-display text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-450 animate-pulse animate-bounce" />
                    Bản Phóng Tác Luận Giải Thần Số Học & Tử Vi AI
                  </h2>
                </div>
                <p className="text-xs text-slate-400 max-w-sm">
                  Chọn các mục bên dưới để kích hoạt dòng suy luận chuyên sâu của trí tuệ nhân tạo Gemini cho ngày sinh và họ tên của bạn.
                </p>
              </div>

              <div className="no-print grid grid-cols-1 md:grid-cols-4 border-b border-indigo-950/80">
                {/* Visual Tab Selection for responsive layout */}
                <div className="md:col-span-1 bg-[#09071a]/50 border-r border-indigo-950/80 p-4 space-y-1.5">
                  {SECTIONS.map((sec) => {
                    const HasCache = !!analysisCache[sec.id];
                    const Icon = sec.icon;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => { playClick(); setActiveSectionTab(sec.id); }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all outline-none ${
                          activeSectionTab === sec.id
                            ? "bg-violet-950 text-violet-100 border-l-4 border-violet-500 shadow"
                            : "hover:bg-[#0d0b26]/50 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 text-slate-400 ${activeSectionTab === sec.id ? "text-violet-400" : ""}`} />
                          <span className="truncate">{sec.shortTitle}</span>
                        </div>
                        {HasCache ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shrink-0 ml-1.5" title="Đã có bản luận giải"></span>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sub Tab Description / Trigger Button panel */}
                <div className="md:col-span-3 p-6 bg-[#0c0a1f]/10 min-h-[350px] flex flex-col justify-between">
                  {(() => {
                    const activeSec = SECTIONS.find(s => s.id === activeSectionTab)!;
                    const cachedText = analysisCache[activeSec.id];
                    const isScanning = loadingSectionId === activeSec.id;

                    return (
                      <div className="space-y-6 flex-1 flex flex-col justify-between">
                        
                        {/* Prompt Header */}
                        <div>
                          <div className="inline-flex items-center gap-1.5 bg-[#17143a] border border-indigo-900 px-3 py-1 rounded-full text-[10px] text-indigo-300 font-mono tracking-wider mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                            <span>MỤC CHUYÊN SÂU {activeSec.id} / 6</span>
                          </div>
                          <h3 className="text-lg font-bold font-display text-slate-100 mb-2">{activeSec.title}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{activeSec.desc}</p>
                        </div>

                        {/* Analysis Body Area */}
                        <div className="my-4 flex-1">
                          {isScanning ? (
                            /* Mystic star unlocking loader */
                            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                              <div className="relative">
                                {/* Double spinning orbits */}
                                <div className="absolute inset-0 bg-violet-500/10 rounded-full blur-xl animate-pulse"></div>
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-violet-500/50 animate-spin flex items-center justify-center">
                                  <div className="w-10 h-10 rounded-full border-2 border-dotted border-amber-400/50 animate-spin flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1.5 max-w-sm">
                                <span className="text-xs font-bold font-mono text-violet-400 tracking-widest block uppercase animate-pulse">Khai mở triết luỹ AI...</span>
                                <p className="text-[11px] text-slate-400 italic leading-relaxed">
                                  "{loadingQuote}"
                                </p>
                              </div>
                            </div>
                          ) : cachedText ? (
                            /* Loaded markdown display */
                            <div className="bg-[#080614]/80 border border-indigo-950/60 p-5 sm:p-7 rounded-xl max-h-[500px] overflow-y-auto mystic-scroll shadow-inner">
                              {renderMarkdown(cachedText)}
                            </div>
                          ) : (
                            /* Placeholder for untriggered state */
                            <div className="py-14 border border-dashed border-indigo-950 rounded-xl bg-[#09071b]/20 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                              <div className="p-3 bg-indigo-950/40 rounded-full border border-indigo-900/40 mb-3 text-indigo-300">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                              </div>
                              <span className="text-xs font-bold text-slate-300 mb-1">Tinh hoa trí tuệ đang chờ khám phá</span>
                              <p className="text-[11px] max-w-md text-slate-500 leading-relaxed">
                                Nhấp vào nút phía dưới để kích hoạt máy tính AI Gemini phân tích chi tiết dữ liệu năng lượng dành riêng cho khía cạnh này.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Interactive button trigger panel */}
                        {!cachedText && !isScanning && (
                          <div className="pt-2 border-t border-indigo-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Info className="w-3.5 h-3.5 text-indigo-400" />
                              Thời gian tính toán trung bình từ 3 - 6 giây.
                            </span>

                            <button
                              onClick={() => fetchAnalysis(activeSec.id)}
                              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs tracking-wider flex items-center justify-center gap-2 outline-none cursor-pointer transition shadow-lg active:scale-95"
                            >
                              <span>KHAI MỞ CÙNG GEMINI AI</span>
                              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                            </button>
                          </div>
                        )}

                        {cachedText && !isScanning && (
                          <div className="pt-2 border-t border-indigo-950/50 flex items-center justify-between text-[11px] text-indigo-400">
                            <span className="flex items-center gap-1 text-slate-500">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Đã hoàn thành phân tích AI bản luận giải.
                            </span>
                            <button
                              onClick={() => fetchAnalysis(activeSec.id)}
                              className="text-indigo-300 hover:text-indigo-200 underline font-semibold flex items-center gap-1 transition"
                            >
                              <span>Tính lại mục này</span>
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* PRINT-ONLY EXPANSION FOR ALL CACHED/UNCACHED SECTIONS TO PROMPT RICHLY IN A PHYSICAL COPY */}
              <div className="hidden print:block p-8 space-y-10 text-black">
                <hr className="border-gray-300 my-6" />
                <h2 className="text-xl font-bold uppercase tracking-wide border-b border-gray-400 pb-1 mb-6">NỘI DUNG TỔNG LUẬN CHI TIẾT TỪ AI</h2>
                
                {SECTIONS.map((sec) => {
                  const content = analysisCache[sec.id];
                  return (
                    <div key={sec.id} className="space-y-3 break-inside-avoid">
                      <h3 className="text-md font-bold uppercase text-gray-800">{sec.id}. {sec.title}</h3>
                      <p className="text-xs text-gray-650 italic mb-2">Đặc điểm chỉ định: {sec.desc}</p>
                      
                      <div className="text-sm text-gray-900 border border-gray-200 p-4 rounded bg-gray-50 text-justify">
                        {content ? (
                          renderMarkdown(content)
                        ) : (
                          <p className="text-gray-400 italic">Quý độc giả vui lòng tra cứu trực tuyến mục này trên ứng dụng để nhận luận giải thần số học tự động bằng AI Gemini.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* 3. SCIENTIFIC BACKGROUND / RESEARCH DISCLOSURE */}
            <div className="no-print bg-[#0a081a]/40 border border-indigo-950/60 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between text-left gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-violet-950/50 rounded-xl border border-violet-800/40 text-violet-300 shrink-0">
                  <BookOpen className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Giao thoa Thần số học & Tử vi Đông Phương</h4>
                  <p className="text-xs text-slate-450 leading-relaxed mt-1">
                    Báo cáo sử dụng hệ quy chiếu khoa học định vị âm sắc Pythagoras để thấu suốt năng lực nội tâm của các con số rung động, kết hợp tính chất lục thập hoa giáp, cung mệnh ngũ hành phương Đông mang lại tri nhận bao quát để phát triển tài năng, bộc lộ điểm khéo léo vượt qua trở lực thực tế cuộc sống.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="no-print mt-20 border-t border-indigo-950/60 bg-[#060412]/90 py-8 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center space-x-2 text-indigo-400/80">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="font-display font-semibold tracking-wider text-xs">TỬ VI THẦN SỐ HỌC - CỔ ĐIỂN HY LẠP & THẦN CƠ ĐÔNG Á</span>
          </div>
          <p className="max-w-md mx-auto text-[11px] text-slate-500 leading-relaxed">
            Hệ tinh thông học thuyết chiêm nghiệm định mệnh, hỗ trợ khơi sáng con đường nhân sinh dưới góc nhìn của năng lượng phản ánh tự nhiên. Bản quyền phát triển độc quyền cùng Gemini AI Studio 2026.
          </p>
          <div className="pt-2 text-[10px] text-slate-650">
            Phiên bản phát triển ổn định 2.4.0 • Tri nhận và tự nguyện học hỏi.
          </div>
        </div>
      </footer>

    </div>
  );
}
