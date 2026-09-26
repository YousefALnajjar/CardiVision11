import React, { useState } from "react";
import { Gauge, Info } from "lucide-react";

export interface DifficultyBadgeProps {
  level?: "easy" | "medium" | "hard" | string;
  lang: "ar" | "en";
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function DifficultyBadge({
  level = "medium",
  lang,
  interactive = true,
  size = "md",
  className = ""
}: DifficultyBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const normLevel = (level === "easy" || level === "medium" || level === "hard") ? level : "medium";

  const config = {
    easy: {
      code: "01",
      labelAr: "سهل",
      labelEn: "EASY",
      bars: [true, false, false],
      detailAr: "مستوى سهل: تنفيذ سريع، مكونات أساسية وأكواد جاهزة للتطبيق المباشر",
      detailEn: "Easy Level: Quick setup, basic hardware components & ready firmware",
      gradient: "from-cyan-500/20 via-sky-500/10 to-indigo-500/20",
      accentBorder: "border-sky-500/40 hover:border-sky-400",
      textColor: "text-sky-300",
      activeBarColor: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]"
    },
    medium: {
      code: "02",
      labelAr: "متوسط",
      labelEn: "MEDIUM",
      bars: [true, true, false],
      detailAr: "مستوى متوسط: يتطلب خبرة بالدارات، الحساسات الحيوية، وبرمجة متحكم ESP32/Arduino",
      detailEn: "Medium Level: Requires circuit setup, sensors & ESP32/Arduino microcontroller logic",
      gradient: "from-indigo-500/20 via-purple-500/10 to-indigo-500/20",
      accentBorder: "border-indigo-500/40 hover:border-indigo-400",
      textColor: "text-indigo-300",
      activeBarColor: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]"
    },
    hard: {
      code: "03",
      labelAr: "صعب",
      labelEn: "ADVANCED",
      bars: [true, true, true],
      detailAr: "مستوى متقدم/صعب: خوارزميات ذكاء اصطناعي، معالجة إشارات حيوية، وتكامل سحابي متكامل",
      detailEn: "Advanced Level: High complexity, AI vision/bio-signals, cloud & PCB engineering",
      gradient: "from-fuchsia-500/20 via-rose-500/10 to-purple-500/20",
      accentBorder: "border-fuchsia-500/40 hover:border-fuchsia-400",
      textColor: "text-fuchsia-300",
      activeBarColor: "bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.6)]"
    }
  }[normLevel];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[9px] gap-1.5",
    md: "px-2.5 py-1 text-[10px] gap-2",
    lg: "px-3.5 py-1.5 text-xs gap-2.5"
  }[size];

  const barSizeClass = {
    sm: "w-1 h-2",
    md: "w-1.5 h-2.5",
    lg: "w-2 h-3.5"
  }[size];

  return (
    <div
      className="relative inline-block z-10"
      onMouseEnter={() => interactive && setShowTooltip(true)}
      onMouseLeave={() => interactive && setShowTooltip(false)}
    >
      <div
        className={`inline-flex items-center rounded-xl font-mono font-extrabold uppercase tracking-wider bg-slate-950/90 border backdrop-blur-md transition-all duration-300 cursor-help shadow-sm hover:shadow-md ${config.accentBorder} ${config.textColor} ${sizeClasses} ${className}`}
      >
        {/* Gauge icon & Level Code */}
        <span className="flex items-center gap-1 font-mono text-slate-400 font-bold">
          <Gauge className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-[9px] opacity-70">LVL-{config.code}</span>
        </span>

        {/* 3-Segment Tech Progress Bar Gauge */}
        <div className="flex items-center gap-0.5" title={lang === "ar" ? config.detailAr : config.detailEn}>
          {config.bars.map((active, idx) => (
            <span
              key={idx}
              className={`rounded-xs transition-all duration-300 ${barSizeClass} ${
                active ? config.activeBarColor : "bg-slate-800/80 border border-slate-700/50"
              }`}
            />
          ))}
        </div>

        {/* Text Label */}
        <span className="font-sans font-black">
          {lang === "ar" ? config.labelAr : config.labelEn}
        </span>
      </div>

      {/* Interactive Tooltip on Hover */}
      {interactive && showTooltip && (
        <div className="absolute top-full mt-2 start-0 min-w-[220px] max-w-[280px] p-2.5 rounded-2xl bg-slate-950/95 border border-slate-800 text-slate-200 text-[11px] leading-snug shadow-2xl z-50 animate-fade-in backdrop-blur-xl">
          <div className="flex items-center gap-1.5 mb-1 text-slate-400 font-mono text-[10px] font-bold">
            <Info className="w-3 h-3 text-indigo-400" />
            <span>{lang === "ar" ? "مؤشر تعقيد التنفيذ" : "Execution Complexity"}</span>
          </div>
          <p className="font-sans text-slate-300 font-medium">
            {lang === "ar" ? config.detailAr : config.detailEn}
          </p>
        </div>
      )}
    </div>
  );
}
