import React, { useMemo } from "react";
import { Project } from "../types";
import { BarChart3, Layers, Zap, Trophy, Brain } from "lucide-react";

interface ProjectStatisticsProps {
  projects: Project[];
  lang: "ar" | "en";
}

export default function ProjectStatistics({ projects, lang }: ProjectStatisticsProps) {
  const stats = useMemo(() => {
    const total = projects.length;
    
    // Average Difficulty
    let totalDifficulty = 0;
    let difficultyCount = 0;
    
    // Categories popularity
    const categoryCounts: Record<string, number> = {};

    projects.forEach(p => {
      // Difficulty
      if (p.difficultyLevel === "easy") { totalDifficulty += 1; difficultyCount++; }
      else if (p.difficultyLevel === "medium") { totalDifficulty += 2; difficultyCount++; }
      else if (p.difficultyLevel === "hard") { totalDifficulty += 3; difficultyCount++; }

      // Category
      if (p.category) {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      }
    });

    const avgDiffNum = difficultyCount > 0 ? Math.round(totalDifficulty / difficultyCount) : 0;
    let avgDiffLabel = lang === "ar" ? "غير محدد" : "N/A";
    let avgDiffColor = "text-slate-400";
    if (avgDiffNum === 1) {
      avgDiffLabel = lang === "ar" ? "سهل" : "Easy";
      avgDiffColor = "text-emerald-500";
    } else if (avgDiffNum === 2) {
      avgDiffLabel = lang === "ar" ? "متوسط" : "Medium";
      avgDiffColor = "text-amber-500";
    } else if (avgDiffNum === 3) {
      avgDiffLabel = lang === "ar" ? "صعب" : "Hard";
      avgDiffColor = "text-rose-500";
    }

    const popularCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      total,
      avgDiffLabel,
      avgDiffColor,
      popularCategories
    };
  }, [projects, lang]);

  if (!projects || projects.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {lang === "ar" ? "إجمالي المشاريع" : "Total Projects"}
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.total}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {lang === "ar" ? "متوسط الصعوبة" : "Average Difficulty"}
          </p>
          <p className={`text-xl font-bold ${stats.avgDiffColor}`}>
            {stats.avgDiffLabel}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
            {lang === "ar" ? "الأقسام الأكثر شيوعاً" : "Popular Categories"}
          </p>
          <div className="flex flex-wrap gap-1">
            {stats.popularCategories.map(([cat, count], idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[100px]" title={`${cat} (${count})`}>
                {cat}
              </span>
            ))}
            {stats.popularCategories.length === 0 && (
              <span className="text-[10px] text-slate-400">-</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
