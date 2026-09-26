import React, { useState, useEffect } from "react";
import { Project } from "../types";
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Star, 
  Clock, 
  GraduationCap, 
  Cpu, 
  ShoppingCart, 
  Eye, 
  Play,
  ArrowRight
} from "lucide-react";

interface FeaturedProjectsCarouselProps {
  projects: Project[];
  lang: "ar" | "en";
  theme: "dark" | "light";
  onSelectProject: (project: Project) => void;
  onBuyProject: (projectId: string) => void;
}

export default function FeaturedProjectsCarousel({
  projects,
  lang,
  theme,
  onSelectProject,
  onBuyProject
}: FeaturedProjectsCarouselProps) {
  const featured = (projects || []).slice(0, 5); // top 5 featured projects
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || featured.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, featured.length]);

  if (featured.length === 0) return null;

  const current = featured[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  return (
    <div 
      className="relative my-10 max-w-7xl mx-auto px-4"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-md shadow-rose-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className={`font-black text-lg sm:text-2xl tracking-tight ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}>
              {lang === "ar" ? "المشاريع المميزة والاستثنائية" : "Featured & Premium Projects"}
            </h2>
            <p className="text-xs text-rose-500 font-bold">
              {lang === "ar" ? "أعلى تقييماً وأكثرها طلباً لطلاب الهندسة" : "Highest rated graduation projects available for download"}
            </p>
          </div>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className={`p-2.5 rounded-xl border transition-all ${
              theme === "dark" 
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            aria-label="Previous Project"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
          </button>
          
          <div className="flex items-center gap-1.5 px-2">
            {featured.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx 
                    ? "w-6 bg-gradient-to-r from-rose-500 to-indigo-600" 
                    : "w-2 bg-slate-700/40 hover:bg-slate-500"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className={`p-2.5 rounded-xl border transition-all ${
              theme === "dark" 
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            aria-label="Next Project"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
          </button>
        </div>
      </div>

      {/* Featured Slide Showcase */}
      <div className={`relative overflow-hidden rounded-3xl border transition-all duration-500 ${
        theme === "dark" 
          ? "bg-slate-900/80 border-slate-800/80 shadow-2xl shadow-slate-950" 
          : "bg-white border-slate-200/80 shadow-xl shadow-slate-200/50"
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
          
          {/* Image / Banner Side */}
          <div className="lg:col-span-6 relative min-h-[260px] lg:min-h-full overflow-hidden group">
            <img 
              src={current.imageUrl} 
              alt={lang === "ar" ? current.titleAr : current.titleEn}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent lg:bg-gradient-to-r lg:from-slate-950/80 lg:via-slate-950/30 lg:to-transparent" />
            
            {/* Top Badges */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-rose-500/90 text-white font-black text-xs shadow-lg backdrop-blur-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {lang === "ar" ? "مشروع مميز" : "Featured"}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 text-amber-400 font-extrabold text-xs border border-amber-400/30 backdrop-blur-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {current.rating || 4.9}
              </span>
            </div>

            {/* Video preview hint */}
            {current.videoUrl && (
              <button 
                onClick={() => onSelectProject(current)}
                className="absolute bottom-4 left-4 px-3.5 py-2 rounded-2xl bg-black/70 hover:bg-rose-600 text-white text-xs font-bold border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{lang === "ar" ? "معاينة الفيديو" : "Watch Video"}</span>
              </button>
            )}
          </div>

          {/* Details Side */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & University Tag */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-black">
                  {lang === "ar" ? current.projectTypeAr : current.projectTypeEn}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-800/60 text-slate-300 text-[11px] font-bold flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-rose-400" />
                  {lang === "ar" ? current.universityAr : current.universityEn}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-800/60 text-slate-300 text-[11px] font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {lang === "ar" ? current.durationAr : current.durationEn}
                </span>
              </div>

              {/* Title */}
              <h3 className={`text-xl sm:text-2xl font-black mb-3 leading-snug ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}>
                {lang === "ar" ? current.titleAr : current.titleEn}
              </h3>

              {/* Description */}
              <p className={`text-xs sm:text-sm line-clamp-3 mb-6 leading-relaxed ${
                theme === "dark" ? "text-slate-300" : "text-slate-600"
              }`}>
                {lang === "ar" ? current.descriptionAr : current.descriptionEn}
              </p>

              {/* Software Tech Stack Badges */}
              <div className="mb-6">
                <span className="text-[11px] font-black uppercase text-slate-400 block mb-2">
                  {lang === "ar" ? "التقنيات والبرامج المستخدمة:" : "Tech Stack & Tools:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {((lang === "ar" ? (current?.softwareAr || (current as any)?.softwareUsed) : (current?.softwareEn || (current as any)?.softwareUsed)) || []).slice(0, 5).map((tool: string, i: number) => (
                    <span 
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-rose-300 text-[10px] font-bold border border-slate-700/50 flex items-center gap-1"
                    >
                      <Cpu className="w-3 h-3 text-rose-400" />
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Action CTA */}
            <div className="pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">
                  {lang === "ar" ? "سعر المشروع الكامل مع المخططات والأكواد:" : "Full Project Package Price:"}
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">
                    {(current?.price ?? (current as any)?.priceSyp ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {lang === "ar" ? "ل.س" : "SYP"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectProject(current)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                      : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  <Eye className="w-4 h-4 text-rose-400" />
                  <span>{lang === "ar" ? "التفاصيل والمخطط" : "Full Schematics"}</span>
                </button>

                <button
                  onClick={() => onBuyProject(current.id)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-rose-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{lang === "ar" ? "شراء وتنزيل الفوري" : "Buy & Download"}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
