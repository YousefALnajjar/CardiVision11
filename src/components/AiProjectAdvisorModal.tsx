import React, { useState } from "react";
import { 
  Sparkles, 
  X, 
  Bot, 
  Send, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Cpu, 
  DollarSign, 
  Clock,
  BookOpen
} from "lucide-react";

interface AiProjectAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "ar" | "en";
  theme: "dark" | "light";
  onSelectSuggestedProject?: (projectData: any) => void;
}

export default function AiProjectAdvisorModal({
  isOpen,
  onClose,
  lang,
  theme,
  onSelectSuggestedProject
}: AiProjectAdvisorModalProps) {
  const [major, setMajor] = useState("الهندسة الطبية والحيوية");
  const [interests, setInterests] = useState("إنترنت الأشياء، المستشعرات الحيوية، المعالجة الرقمية للإشارات");
  const [budget, setBudget] = useState("متوسط (100 - 200 ألف ل.س)");
  const [difficulty, setDifficulty] = useState("متقدم");
  
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRecommendations([]);

    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ major, interests, budget, difficulty, lang })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      } else {
        setError(lang === "ar" ? "تعذر توليد الاقتراحات، يرجى المحاولة لاحقاً." : "Could not generate suggestions, please try again.");
      }
    } catch (err: any) {
      setError(err.message || "فشل الاتصال بمستشار الذكاء الاصطناعي");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden my-8 ${
        theme === "dark" 
          ? "bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/90" 
          : "bg-white border-slate-200 text-slate-900 shadow-slate-300/60"
      }`}>
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-rose-500/10 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-lg shadow-rose-500/20">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black flex items-center gap-2">
                {lang === "ar" ? "مستشار الذكاء الاصطناعي لاختيار مشروع التخرج" : "AI Graduation Project Advisor"}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold">
                  Gemini 3.6
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {lang === "ar" ? "أدخل تخصصك واهتماماتك وسيقوم المستشار بصياغة 3 أفكار مشاريع مبتكرة وشاملة" : "Input your major & budget to generate 3 tailored project ideas"}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
          
          {/* Form inputs */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Major */}
            <div>
              <label className="text-xs font-black text-slate-300 block mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                {lang === "ar" ? "التخصص الأكاديمي والكلية:" : "Academic Specialization:"}
              </label>
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs font-bold transition-all ${
                  theme === "dark" 
                    ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500" 
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500"
                }`}
              >
                <option value="الهندسة الطبية والحيوية">الهندسة الطبية والحيوية</option>
                <option value="هندسة البرمجيات والذكاء الاصطناعي">هندسة البرمجيات والذكاء الاصطناعي</option>
                <option value="الهندسة الكهربائية والتحكم">الهندسة الكهربائية والتحكم</option>
                <option value="هندسة الاتصالات والشبكات">هندسة الاتصالات والشبكات</option>
                <option value="الهندسة الميكانيكية والميكاترونكس">الهندسة الميكانيكية والميكاترونكس</option>
              </select>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="text-xs font-black text-slate-300 block mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                {lang === "ar" ? "مستوى الصعوبة المطلوب:" : "Preferred Difficulty Level:"}
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs font-bold transition-all ${
                  theme === "dark" 
                    ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500" 
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500"
                }`}
              >
                <option value="مبتدئ / بسيط">مبتدئ / بسيط (تطبيقات سهلة)</option>
                <option value="متوسط">متوسط (تطبيقات عملانية مع أجهزة)</option>
                <option value="متقدم">متقدم (عتاد + برمجيات + ذكاء اصطناعي)</option>
                <option value="احترافي / بحثي">احترافي / بحثي (مستوى دراسات عليا)</option>
              </select>
            </div>

            {/* Technical Interests */}
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-300 block mb-1.5 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                {lang === "ar" ? "الاهتمامات والمتحكمات المفضلة:" : "Preferred Microcontrollers & Tools:"}
              </label>
              <input 
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="مثال: ESP32, Arduino, Python, TensorFlow, React, OpenCV..."
                className={`w-full p-3 rounded-xl border text-xs font-bold transition-all ${
                  theme === "dark" 
                    ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500" 
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500"
                }`}
              />
            </div>

            {/* Submit CTA */}
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-black text-xs shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === "ar" ? "جاري تحليل البيانات وصياغة الأفكار..." : "Generating Project Proposals..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === "ar" ? "توليد 3 مشاريع تخرج مخصصة بالذكاء الاصطناعي" : "Generate 3 Custom Project Ideas"}</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Errors display */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Recommendations Results List */}
          {recommendations.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800/80 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-rose-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {lang === "ar" ? "المشاريع الهندسية المقترحة لك:" : "AI Generated Project Proposals:"}
                </h4>
                <span className="text-[10px] text-slate-400 font-bold">
                  {recommendations.length} {lang === "ar" ? "خيارات متكاملة" : "Options"}
                </span>
              </div>

              {recommendations.map((item, idx) => (
                <div 
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    theme === "dark"
                      ? "bg-slate-950/80 border-slate-800 hover:border-rose-500/40"
                      : "bg-slate-50 border-slate-200 hover:border-rose-500/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 text-[10px] font-black inline-block mb-1">
                        {item.category || "الهندسة الطبية والتطبيقية"}
                      </span>
                      <h5 className="font-black text-sm sm:text-base text-white">
                        {lang === "ar" ? item.titleAr : item.titleEn}
                      </h5>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-emerald-400 block font-mono">
                        {item.estimatedCost || "150,000 ل.س"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {item.estimatedDuration || "10 أيام"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {lang === "ar" ? item.descriptionAr : item.descriptionEn}
                  </p>

                  {/* Hardware list */}
                  {Array.isArray(item.recommendedHardware) && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.recommendedHardware.map((hw: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-800/80 text-rose-300 text-[10px] font-bold border border-slate-700/50">
                          {hw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick trigger action */}
                  <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                    <button
                      onClick={() => {
                        if (onSelectSuggestedProject) onSelectSuggestedProject(item);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all"
                    >
                      <span>{lang === "ar" ? "طلب تنفيذ أو استشارة حول هذا المشروع" : "Request This Project"}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
