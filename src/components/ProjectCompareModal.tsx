import React from "react";
import { X, CheckCircle2, Cpu, Code2, Clock, DollarSign, Activity } from "lucide-react";
import { Project } from "../types";
import DifficultyBadge from "./DifficultyBadge";

interface ProjectCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  lang: "ar" | "en";
  theme: "dark" | "light";
}

export default function ProjectCompareModal({
  isOpen,
  onClose,
  projects,
  lang,
  theme
}: ProjectCompareModalProps) {
  if (!isOpen || projects.length !== 2) return null;

  const [p1, p2] = projects;

  const formatPrice = (price?: number) => {
    return lang === "ar" ? `${(price || 0).toLocaleString()} ل.س` : `${(price || 0).toLocaleString()} SYP`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-sm bg-slate-950/60 transition-all">
      <div 
        className={`relative w-full max-w-5xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
          theme === "dark" 
            ? "bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/80" 
            : "bg-white border-slate-200 text-slate-900 shadow-slate-300/50"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/60 dark:border-slate-800/60">
          <h2 className="text-lg font-black flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            {lang === "ar" ? "مقارنة المشاريع" : "Project Comparison"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/50 hover:bg-rose-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Project 1 Column */}
            <div className={`rounded-xl border p-5 flex flex-col gap-5 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <div className="text-[10px] font-bold text-indigo-500 mb-1 tracking-wider uppercase">{lang === "ar" ? "المشروع الأول" : "Project 1"}</div>
                <h3 className="text-lg font-black text-rose-500">{lang === "ar" ? p1.titleAr : p1.titleEn}</h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3">{lang === "ar" ? p1.descriptionAr : p1.descriptionEn}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>{formatPrice(p1.price)}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{lang === "ar" ? p1.durationAr : p1.durationEn}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 mb-2">{lang === "ar" ? "مستوى الصعوبة" : "Difficulty Level"}</div>
                <DifficultyBadge level={p1.difficultyLevel} lang={lang} />
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Cpu className="w-3.5 h-3.5"/> {lang === "ar" ? "المكونات العتادية" : "Hardware Components"}</div>
                <div className="flex flex-wrap gap-1.5">
                  {(lang === "ar" ? p1.componentsAr : p1.componentsEn).map((c, i) => (
                    <span key={i} className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">{c}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Code2 className="w-3.5 h-3.5"/> {lang === "ar" ? "البرمجيات" : "Software"}</div>
                <div className="flex flex-wrap gap-1.5">
                  {(lang === "ar" ? p1.softwareAr : p1.softwareEn).map((s, i) => (
                    <span key={i} className="px-2 py-1 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Project 2 Column */}
            <div className={`rounded-xl border p-5 flex flex-col gap-5 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <div className="text-[10px] font-bold text-indigo-500 mb-1 tracking-wider uppercase">{lang === "ar" ? "المشروع الثاني" : "Project 2"}</div>
                <h3 className="text-lg font-black text-rose-500">{lang === "ar" ? p2.titleAr : p2.titleEn}</h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3">{lang === "ar" ? p2.descriptionAr : p2.descriptionEn}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>{formatPrice(p2.price)}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{lang === "ar" ? p2.durationAr : p2.durationEn}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 mb-2">{lang === "ar" ? "مستوى الصعوبة" : "Difficulty Level"}</div>
                <DifficultyBadge level={p2.difficultyLevel} lang={lang} />
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Cpu className="w-3.5 h-3.5"/> {lang === "ar" ? "المكونات العتادية" : "Hardware Components"}</div>
                <div className="flex flex-wrap gap-1.5">
                  {(lang === "ar" ? p2.componentsAr : p2.componentsEn).map((c, i) => (
                    <span key={i} className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">{c}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Code2 className="w-3.5 h-3.5"/> {lang === "ar" ? "البرمجيات" : "Software"}</div>
                <div className="flex flex-wrap gap-1.5">
                  {(lang === "ar" ? p2.softwareAr : p2.softwareEn).map((s, i) => (
                    <span key={i} className="px-2 py-1 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">{s}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
