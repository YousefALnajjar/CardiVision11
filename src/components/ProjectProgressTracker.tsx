import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface Phase {
  id: string;
  titleEn: string;
  titleAr: string;
}

const PHASES: Phase[] = [
  { id: "concept", titleEn: "Concept & Planning", titleAr: "الفكرة والتخطيط" },
  { id: "simulation", titleEn: "Simulation & Design", titleAr: "المحاكاة والتصميم" },
  { id: "testing", titleEn: "Implementation & Testing", titleAr: "التنفيذ والاختبار" },
  { id: "documentation", titleEn: "Documentation & Thesis", titleAr: "التوثيق والأطروحة" }
];

interface ProjectProgressTrackerProps {
  theme: "dark" | "light";
  lang: "ar" | "en";
  userId: string;
}

export default function ProjectProgressTracker({ theme, lang, userId }: ProjectProgressTrackerProps) {
  const [completedPhases, setCompletedPhases] = useState<string[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem(`progress_${userId}`);
    if (saved) {
      try {
        setCompletedPhases(JSON.parse(saved));
      } catch(e) {}
    }
  }, [userId]);

  const togglePhase = (phaseId: string) => {
    let newPhases = [...completedPhases];
    if (newPhases.includes(phaseId)) {
      newPhases = newPhases.filter(id => id !== phaseId);
    } else {
      newPhases.push(phaseId);
    }
    setCompletedPhases(newPhases);
    localStorage.setItem(`progress_${userId}`, JSON.stringify(newPhases));
  };

  const progressPercentage = Math.round((completedPhases.length / PHASES.length) * 100);

  return (
    <div className={`p-6 rounded-3xl border mt-6 ${
      theme === "dark" 
        ? "bg-slate-900 border-slate-800" 
        : "bg-white border-slate-200 shadow-sm"
    }`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className={`font-black text-lg ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
            {lang === "ar" ? "متتبع إنجاز مشروع التخرج" : "Graduation Project Tracker"}
          </h3>
          <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
            {lang === "ar" 
              ? "حدد المراحل المكتملة لتتبع تقدمك في إنجاز المشروع." 
              : "Mark completed phases to track your project progress."}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className={`text-xs font-bold ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
            {lang === "ar" ? "نسبة الإنجاز" : "Completion"}
          </span>
          <span className="text-xl font-black text-rose-500">{progressPercentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-2.5 rounded-full mb-8 overflow-hidden ${
        theme === "dark" ? "bg-slate-800" : "bg-slate-100"
      }`}>
        <motion.div 
          className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Interactive Phases Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {PHASES.map((phase, index) => {
          const isCompleted = completedPhases.includes(phase.id);
          
          return (
            <button
              key={phase.id}
              onClick={() => togglePhase(phase.id)}
              className={`relative flex flex-col p-4 rounded-2xl border text-start transition-all duration-300 ${
                isCompleted
                  ? theme === "dark"
                    ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "bg-emerald-50 border-emerald-200 shadow-sm"
                  : theme === "dark"
                    ? "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                  isCompleted
                    ? "bg-emerald-500/20 text-emerald-500"
                    : theme === "dark"
                      ? "bg-slate-800 text-slate-400"
                      : "bg-slate-200 text-slate-500"
                }`}>
                  {lang === "ar" ? `المرحلة ${index + 1}` : `Phase ${index + 1}`}
                </span>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className={`w-5 h-5 ${theme === "dark" ? "text-slate-700" : "text-slate-300"}`} />
                )}
              </div>
              <h4 className={`font-bold text-sm ${
                isCompleted 
                  ? theme === "dark" ? "text-emerald-400" : "text-emerald-700"
                  : theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}>
                {lang === "ar" ? phase.titleAr : phase.titleEn}
              </h4>
              
              {/* Connector Line for Desktop */}
              {index < PHASES.length - 1 && (
                <div className={`hidden md:block absolute top-1/2 -end-4 w-4 border-t-2 border-dashed z-10 ${
                  isCompleted ? "border-emerald-500/50" : theme === "dark" ? "border-slate-800" : "border-slate-300"
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
