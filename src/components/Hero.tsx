import React from "react";
import { Sparkles, BrainCircuit, ShieldAlert, Award, FileSpreadsheet } from "lucide-react";

interface HeroProps {
  lang: "ar" | "en";
  onBrowseProjects: () => void;
  onRequestConsult: () => void;
  onOpenServices?: () => void;
  theme: "dark" | "light";
}

export default function Hero({ lang, onBrowseProjects, onRequestConsult, onOpenServices, theme }: HeroProps) {
  return (
    <section 
      className={`relative py-16 md:py-24 rounded-3xl overflow-hidden mb-12 border transition-all duration-300 ${
        theme === "dark" 
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-900" 
          : "bg-gradient-to-br from-white via-slate-50 to-rose-50/20 border-slate-200 shadow-md"
      }`} 
      id="hero-banner"
    >
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 end-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl -me-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 start-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -ms-20 -mb-20 pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        
        {/* Supervisor badge */}
        <div 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-sm shadow-rose-500/5 whitespace-nowrap"
          id="hero-supervisor-badge"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin-slow shrink-0" />
          {lang === "ar" ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-sm font-medium">تحت إشراف فريق</span>
              <span className="text-xs font-black uppercase tracking-wider">CardioVision</span>
            </span>
          ) : (
            <span className="text-xs font-black uppercase tracking-wider">
              Supervised by CardioVision Team
            </span>
          )}
        </div>

        {/* Main Heading */}
        <h1 className={`text-3xl md:text-5xl font-black tracking-tight mb-6 leading-tight ${
          theme === "dark" 
            ? "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent" 
            : "text-slate-900"
        }`}>
          {lang === "ar" ? (
            <>
              بوابتك المعتمدة لمشاريع <span className="text-rose-600 dark:text-rose-500">التخرج الهندسية</span> المتكاملة
            </>
          ) : (
            <>
              Your Certified Gate for Complete <span className="text-rose-600 dark:text-rose-500">Engineering</span> Graduation Projects
            </>
          )}
        </h1>

        {/* Supporting Paragraph */}
        <p className={`text-xs md:text-sm leading-relaxed max-w-2xl mx-auto mb-10 font-medium ${
          theme === "dark" ? "text-slate-400" : "text-slate-700"
        }`}>
          {lang === "ar" 
            ? "نحن في CardioVision نجمع بين جودة العتاد، واحترافية البرمجيات، والمخططات التفصيلية المضمونة. نوفر الأكواد النظيفة والتقارير العلمية مع دعم فني ممتد ومتواصل حتى لحظة مناقشة المشروع."
            : "At CardioVision, we deliver high-quality physical hardware integration, customized modern software interfaces, and fully verified schematics. We supply clean source codes, thesis reports, and continuous technical defense preparation."}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <button
            onClick={onBrowseProjects}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-95 text-white font-black text-xs transition-all shadow-lg shadow-rose-500/20"
            id="hero-browse-projects-btn"
          >
            {lang === "ar" ? "تصفح المشاريع المتوفرة" : "Browse Executed Projects"}
          </button>
          
          <button
            onClick={onRequestConsult}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 text-white font-black text-xs hover:opacity-95 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            id="hero-ai-advisor-btn"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{lang === "ar" ? "مستشار الذكاء الاصطناعي لاختيار مشروعك" : "AI Project Advisor"}</span>
          </button>

          {onOpenServices && (
            <button
              onClick={onOpenServices}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-xs transition-all border flex items-center justify-center gap-2 ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
                  : "bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs"
              }`}
              id="hero-services-btn"
            >
              <span>{lang === "ar" ? "خدماتنا ونبذة عنا" : "Services & About Us"}</span>
            </button>
          )}
        </div>

        {/* Feature Grid Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-slate-200 dark:border-slate-900/60 text-left">
          
          <div className={`p-4 rounded-2xl border transition-colors ${
            theme === "dark" 
              ? "bg-slate-950/20 border-slate-900/40" 
              : "bg-white border-slate-200 shadow-xs"
          }`}>
            <Award className="w-5 h-5 text-rose-500 mb-2" />
            <h4 className={`text-xs font-black ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
              {lang === "ar" ? "ضمان النجاح والتميز" : "Excellence Guaranteed"}
            </h4>
            <p className={`text-[10px] mt-1 ${theme === "dark" ? "text-slate-500" : "text-slate-600 font-medium"}`}>
              {lang === "ar" ? "مشاريع فريدة ومقبولة أكاديمياً" : "Unique, approved topics"}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border transition-colors ${
            theme === "dark" 
              ? "bg-slate-950/20 border-slate-900/40" 
              : "bg-white border-slate-200 shadow-xs"
          }`}>
            <BrainCircuit className="w-5 h-5 text-indigo-500 mb-2" />
            <h4 className={`text-xs font-black ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
              {lang === "ar" ? "دعم عتادي وبرمجي" : "Full-Stack Hardware"}
            </h4>
            <p className={`text-[10px] mt-1 ${theme === "dark" ? "text-slate-500" : "text-slate-600 font-medium"}`}>
              {lang === "ar" ? "توصيل الحساسات وبرمجة اللوحات" : "ESP32, PCB, Sensors"}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border transition-colors ${
            theme === "dark" 
              ? "bg-slate-950/20 border-slate-900/40" 
              : "bg-white border-slate-200 shadow-xs"
          }`}>
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className={`text-xs font-black ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
              {lang === "ar" ? "تقارير علمية شاملة" : "80+ Page Thesis PDF"}
            </h4>
            <p className={`text-[10px] mt-1 ${theme === "dark" ? "text-slate-500" : "text-slate-600 font-medium"}`}>
              {lang === "ar" ? "شرح الأكواد والنظريات بالكامل" : "Comprehensive files & text"}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border transition-colors ${
            theme === "dark" 
              ? "bg-slate-950/20 border-slate-900/40" 
              : "bg-white border-slate-200 shadow-xs"
          }`}>
            <ShieldAlert className="w-5 h-5 text-amber-500 mb-2" />
            <h4 className={`text-xs font-black ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
              {lang === "ar" ? "دعم حتى المناقشة" : "Defense Assistance"}
            </h4>
            <p className={`text-[10px] mt-1 ${theme === "dark" ? "text-slate-500" : "text-slate-600 font-medium"}`}>
              {lang === "ar" ? "إشراف دائم متاح على مدار الساعة" : "24/7 technical follow-up"}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
