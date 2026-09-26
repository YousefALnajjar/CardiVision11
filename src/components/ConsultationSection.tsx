import React, { useState } from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  Cpu, 
  Layers, 
  Send, 
  CheckCircle,
  Clock,
  ArrowRight,
  MessageSquare
} from "lucide-react";

interface ConsultationSectionProps {
  lang: "ar" | "en";
  theme: "dark" | "light";
  currentUser: any;
  onOpenAuth: () => void;
  onConsultationSubmitted?: () => void;
}

export default function ConsultationSection({
  lang,
  theme,
  currentUser,
  onOpenAuth,
  onConsultationSubmitted
}: ConsultationSectionProps) {
  const [idea, setIdea] = useState("");
  const [type, setType] = useState("consultation");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Dynamic loading stages for the AI engineer based on consultation type
  const loadingSteps = lang === "ar" ? [
    "جاري قراءة متطلبات الطلب وتحليل المدخلات بعناية...",
    "جاري معالجة الفكرة ومطابقتها مع المعايير الهندسية...",
    "جاري إعداد التوصيات الأكاديمية والتقنية المطلوبة بدقة...",
    "جاري صياغة الاستشارة النهائية والتنسيق العلمي المتقن..."
  ] : [
    "Analyzing consultation request and parsing user specifications...",
    "Processing concept against academic & technical engineering standards...",
    "Formulating targeted technical recommendations and structure...",
    "Assembling final markdown consultation and scientific report..."
  ];

  const handleGetConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setLoadingStep(0);

    // Rotate loading text step sequence every 2.5s for absolute immersion
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser ? currentUser.id : "guest",
          type,
          consultationType: type,
          idea,
          userInput: idea,
          language: lang
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.consultation.response);
        onConsultationSubmitted?.();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(lang === "ar" ? "عذراً، فشل الاتصال بخادم الذكاء الاصطناعي" : "AI Gateway Connection Error");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <section 
      className={`p-6 md:p-8 rounded-3xl border transition-colors duration-300 relative ${
        theme === "dark" 
          ? "bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/20 border-slate-800" 
          : "bg-gradient-to-br from-white to-indigo-50/20 border-slate-200 shadow-sm"
      }`}
      id="consultation-section"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto text-left">
        
        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 text-white shadow-lg shadow-rose-500/10 shrink-0">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-black text-rose-500 tracking-wider">
              {lang === "ar" ? "قسم الاستشارات والمخططات الذكي" : "Smart Engineering Desk"}
            </span>
            <h2 className={`text-xl md:text-2xl font-black mt-0.5 ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}>
              {lang === "ar" ? "مستشار الذكاء الاصطناعي لمشاريع التخرج" : "AI Graduation Project Consultant"}
            </h2>
          </div>
        </div>

        <p className={`text-xs leading-relaxed mb-6 ${theme === "dark" ? "text-slate-400" : "text-slate-700 font-medium"}`}>
          {lang === "ar" 
            ? "اكتب فكرة مشروعك الهندسي أو الفني، وسيقوم مستشار CardioVision المدرب بالذكاء الاصطناعي بتقديم مخطط تفصيلي متكامل، واقتراح القطع الإلكترونية، والبرامج اللازمة، مع رسم الهيكل والخطوات الأكاديمية فوراً." 
            : "Describe your graduation or research project concept. CardioVision's AI consultant will draft a complete electronic layout, recommend components, determine appropriate software, and formulate a technical workflow instantly."}
        </p>

        {/* Form */}
        <form onSubmit={handleGetConsultation} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consultation Type Selector */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                theme === "dark" ? "text-slate-400" : "text-slate-700"
              }`}>
                🎯 {lang === "ar" ? "نوع طلب الاستشارة الهندسية:" : "Requested Consult Category:"}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={`w-full text-xs border outline-none rounded-xl p-3 font-semibold ${
                  theme === "dark" 
                    ? "bg-slate-950 border-slate-850 text-slate-200" 
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                }`}
              >
                <option value="consultation">{lang === "ar" ? "استشارة أكاديمية عامة وعصف ذهني" : "Academic Brainstorming"}</option>
                <option value="schematic">{lang === "ar" ? "مخطط كتل وتوصيلات الحساسات" : "Sensor Wiring Block Diagram"}</option>
                <option value="pcb_design">{lang === "ar" ? "تصميم وتخطيط لوحة PCB مخصصة" : "PCB Layout & Printing advice"}</option>
                <option value="custom_project">{lang === "ar" ? "طلب تنفيذ مشروع خاص بالكامل" : "Custom Project Design Request"}</option>
                <option value="modification">{lang === "ar" ? "طلب تعديل أو إضافة ميزات لمشروع قائم" : "Project Feature Addition"}</option>
              </select>
            </div>

            {/* Quick Helper prompt indicators */}
            <div className="flex flex-wrap items-end gap-1 pb-1">
              <span className={`text-[9px] font-bold block mb-1.5 w-full ${
                theme === "dark" ? "text-slate-500" : "text-slate-600"
              }`}>{lang === "ar" ? "أفكار مقترحة سريعة:" : "Quick Ideas:"}</span>
              <button
                type="button"
                onClick={() => setIdea(lang === "ar" ? "كرسي متحرك ذكي لذوي الهمم يتم التحكم بحركته عبر إيماءات الرأس وحساس ژيروسكوب وبث إحداثيات GPS لاسلكياً" : "Smart wheelchair for disabled controlled by head gestures using gyroscope and wireless GPS telemetry")}
                className={`text-[9.5px] px-2.5 py-1 rounded-lg border font-bold transition-all ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-850 text-slate-400 hover:text-rose-400"
                    : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                }`}
              >
                ♿ {lang === "ar" ? "كرسي ذكي لذوي الهمم" : "Smart Wheelchair"}
              </button>
              <button
                type="button"
                onClick={() => setIdea(lang === "ar" ? "روبوت ذكي لإطفاء الحرائق والتحكم به عن بعد مع نظام بث فيديو كاميرا ESP32-CAM" : "Smart firefighting robot controlled remotely with ESP32-CAM live stream feed")}
                className={`text-[9.5px] px-2.5 py-1 rounded-lg border font-bold transition-all ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-850 text-slate-400 hover:text-rose-400"
                    : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                }`}
              >
                🤖 {lang === "ar" ? "روبوت إطفاء الحرائق" : "Firefighting Robot"}
              </button>
            </div>
          </div>

          {/* Description input */}
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
              theme === "dark" ? "text-slate-400" : "text-slate-700"
            }`}>
              ✍️ {lang === "ar" ? "اشرح فكرة مشروعك بالتفصيل هنا:" : "Describe your system specifications & features:"}
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={lang === "ar" ? "مثال: نظام لمراقبة سلامة السائقين وكشف النعاس باستخدام معالجة الصور والتنبيه الصوتي عبر الهاتف..." : "e.g., Driver drowsiness detection system using computer vision, face mesh, and ESP32 active alarm..."}
              className={`w-full text-xs border outline-none rounded-2xl p-4 h-28 transition-colors ${
                theme === "dark" 
                  ? "bg-slate-950 border-slate-850 text-slate-200 focus:border-rose-500" 
                  : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-rose-500"
              }`}
              required
            ></textarea>
          </div>

          {/* Guest message prompt */}
          {!currentUser && (
            <p className="text-[10px] text-amber-500 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10 font-bold leading-relaxed">
              ⚠️ {lang === "ar" 
                ? "أنت تتصفح كزائر، يمكنك تجربة الاستشارة الفورية ولكن ننصحك بتسجيل الدخول لحفظ ومزامنة كافة استشاراتك وتلقي تنبيهات رد CardioVision." 
                : "You are currently browsing as a guest. We highly recommend signing in to preserve your consultations history."}
            </p>
          )}

          {/* Trigger button */}
          <button
            type="submit"
            disabled={loading || !idea.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/15"
            id="consultation-submit-btn"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>{loading ? (lang === "ar" ? "جاري البناء..." : "Analyzing...") : (lang === "ar" ? "توليد المخطط والاستشارة فوراً" : "Generate Schematic & Consult")}</span>
          </button>

        </form>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
            {error}
          </div>
        )}

        {/* LOADING SCREEN IMAGES SEQUENCES */}
        {loading && (
          <div className="mt-6 p-6 rounded-2xl bg-slate-950 border border-slate-850 text-center space-y-4">
            <Cpu className="w-8 h-8 mx-auto text-rose-500 animate-spin-slow" />
            <p className="text-xs text-slate-300 font-extrabold animate-pulse">
              {loadingSteps[loadingStep]}
            </p>
            <div className="w-full bg-slate-900 rounded-full h-1.5 max-w-xs mx-auto overflow-hidden">
              <div 
                className="bg-rose-500 h-1.5 rounded-full transition-all duration-1000" 
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* RESULT ANALYSIS PANEL */}
        {result && (
          <div className="mt-6 p-6 rounded-2xl bg-slate-950 border border-slate-850 text-left space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-850">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>{lang === "ar" ? "تقرير الاستشارة الهندسية الصادر" : "Engineering Consultation Issued"}</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                Authorized CardioVision AI
              </span>
            </div>

            {/* Markdown response body */}
            <div className="text-xs leading-relaxed text-slate-300 space-y-4 font-sans max-h-96 overflow-y-auto pr-2 scrollbar-thin">
              <div className="whitespace-pre-line prose prose-invert max-w-none text-slate-200">
                {result}
              </div>
            </div>

            {/* Direct WhatsApp Forwarding Panel */}
            <div className={`p-5 rounded-2xl border space-y-4 shadow-xl ${
              theme === "dark" 
                ? "bg-emerald-950/20 border-emerald-500/30 shadow-emerald-950/40" 
                : "bg-emerald-50/70 border-emerald-200 shadow-emerald-100/30"
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-xl animate-bounce">💬</span>
                <div>
                  <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${
                    theme === "dark" ? "text-emerald-400" : "text-emerald-800"
                  }`}>
                    {lang === "ar" ? "إرسال فوري ومباشر إلى المهندس يوسف" : "Direct Forward to Eng. Yousef"}
                  </h4>
                  <p className={`text-[11px] font-medium leading-relaxed ${
                    theme === "dark" ? "text-slate-300" : "text-slate-600"
                  }`}>
                    {lang === "ar"
                      ? "تم توليد الاستشارة بالذكاء الاصطناعي بنجاح! لمناقشة تعديلات المخطط، تصميم لوحة PCB، والاتفاق على حجز القطع الإلكترونية وتأكيد طلب التنفيذ الفعلي، انقر أدناه لإرسال كامل التفاصيل إلى المهندس يوسف مباشرة على الواتس اب."
                      : "AI consultation layout successfully compiled! To discuss circuit revisions, custom PCB layouts, or order/reserve physical hardware components with Eng. Yousef, click below to forward your detailed concept instantly on WhatsApp."}
                  </p>
                </div>
              </div>
              
              <a 
                href={`https://wa.me/963964809575?text=${encodeURIComponent(
                  lang === "ar"
                    ? `مرحباً مهندس يوسف، لقد قمت بطلب استشارة هندسية من CardioVision وأود مناقشة تفاصيل التنفيذ وبدء التصميم الفعلي لمشروعي:\n\n` +
                      `👤 *الاسم الكامل:* ${currentUser ? currentUser.name : "زائر المنصة"}\n` +
                      `📧 *البريد الإلكتروني:* ${currentUser ? currentUser.email : "تصفح كزائر"}\n` +
                      `🎯 *نوع الاستشارة:* ${
                        type === "consultation" ? "استشارة عامة وعصف ذهني" : 
                        type === "schematic" ? "مخطط كتل وتوصيل الحساسات" :
                        type === "pcb_design" ? "تصميم وتخطيط لوحة PCB" :
                        type === "custom_project" ? "طلب تنفيذ مشروع كامل" : "تعديل وإضافة ميزات لمشروع قائم"
                      }\n` +
                      `✍️ *فكرة مشروعي المكتوبة:*\n${idea}\n\n` +
                      `🤖 *ملخص استشارة الذكاء الاصطناعي المقترحة:*\n${result.slice(0, 500)}...\n\n` +
                      `بانتظار ردكم الكريم لمتابعة التصميم والاتفاق على القطع اللازمة.`
                    : `Hello Eng. Yousef, I have requested an engineering consultation from CardioVision and would like to discuss design details and start implementation:\n\n` +
                      `👤 *Name:* ${currentUser ? currentUser.name : "Guest Visitor"}\n` +
                      `📧 *Email:* ${currentUser ? currentUser.email : "Guest Profile"}\n` +
                      `🎯 *Category:* ${type}\n` +
                      `✍️ *My Idea:* ${idea}\n\n` +
                      `🤖 *AI Consultant Summary:*\n${result.slice(0, 500)}...\n\n` +
                      `Looking forward to your professional feedback to kick off development.`
                )}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] animate-pulse"
              >
                <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
                <span>{lang === "ar" ? "اضغط هنا لإرسال فكرة الاستشارة للواتساب الآن" : "Click Here to Forward Consultation to WhatsApp"}</span>
              </a>
            </div>

            {/* CTA directly after analysis */}
            <div className="pt-4 border-t border-slate-850/60 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[10px] text-slate-500 font-bold">
                {lang === "ar" ? "💡 هل تريد حجز وتصميم المخططات الكاملة؟" : "💡 Want to order custom hardware design?"}
              </span>
              
              <a 
                href="https://wa.me/963964809575" 
                target="_blank" 
                rel="noopener noreferrer"
                className="py-1.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] flex items-center gap-1.5"
              >
                <span>{lang === "ar" ? "تواصل مباشر مع CardioVision" : "Contact CardioVision"}</span>
                <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </a>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
