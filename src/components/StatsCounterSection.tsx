import React from "react";
import { 
  CheckCircle2, 
  Users, 
  Award, 
  FolderCheck, 
  Headphones, 
  Building2 
} from "lucide-react";

interface StatsCounterSectionProps {
  lang: "ar" | "en";
  theme: "dark" | "light";
  totalProjectsCount?: number;
  totalProjects?: number;
}

export default function StatsCounterSection({
  lang,
  theme,
  totalProjectsCount,
  totalProjects
}: StatsCounterSectionProps) {
  const count = totalProjects ?? totalProjectsCount ?? 180;
  const stats = [
    {
      icon: FolderCheck,
      number: `+${Math.max(count, 150)}`,
      titleAr: "مشروع تخرج مكتمل",
      titleEn: "Completed Graduation Projects",
      subtitleAr: "أكواد، عتاد ومخططات موثقة",
      subtitleEn: "Source code & hardware schematics"
    },
    {
      icon: Users,
      number: "+2,450",
      titleAr: "طالب وطالبة مهندسين",
      titleEn: "Engineering Students",
      subtitleAr: "من مختلف الجامعات والمعاهد",
      subtitleEn: "Across universities & institutes"
    },
    {
      icon: Award,
      number: "99.4%",
      titleAr: "نسبة قبول المشاريع",
      titleEn: "Project Approval Rate",
      subtitleAr: "بدرجات تخرج ممتازة وتفوق",
      subtitleEn: "High academic distinction"
    },
    {
      icon: Headphones,
      number: "24/7",
      titleAr: "دعم استشاري وفني",
      titleEn: "Technical Support",
      subtitleAr: "إشراف هندسي مباشر",
      subtitleEn: "Direct engineering guidance"
    }
  ];

  return (
    <div className={`py-12 border-y transition-all ${
      theme === "dark" 
        ? "bg-slate-900/50 border-slate-800/80" 
        : "bg-slate-50 border-slate-200/80"
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  theme === "dark" 
                    ? "bg-slate-950/80 border-slate-800/80 hover:border-rose-500/40 shadow-lg shadow-slate-950" 
                    : "bg-white border-slate-200 hover:border-rose-500/40 shadow-md shadow-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-indigo-600 text-white shadow-md shadow-rose-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-rose-500 tracking-tight">
                    {stat.number}
                  </span>
                </div>
                <h4 className={`font-black text-xs sm:text-sm mb-1 ${
                  theme === "dark" ? "text-slate-100" : "text-slate-900"
                }`}>
                  {lang === "ar" ? stat.titleAr : stat.titleEn}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  {lang === "ar" ? stat.subtitleAr : stat.subtitleEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
