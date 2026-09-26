import React from "react";
import { GraduationCap, Landmark, ShieldCheck } from "lucide-react";

interface PartnersSectionProps {
  lang: "ar" | "en";
  theme: "dark" | "light";
}

export default function PartnersSection({ lang, theme }: PartnersSectionProps) {
  const universities = [
    { nameAr: "جامعة دمشق", nameEn: "Damascus University" },
    { nameAr: "جامعة تشرين", nameEn: "Tishreen University" },
    { nameAr: "جامعة حلب", nameEn: "University of Aleppo" },
    { nameAr: "جامعة البعث", nameEn: "Al-Baath University" },
    { nameAr: "الجامعة الافتراضية السورية", nameEn: "Syrian Virtual University (SVU)" },
    { nameAr: "جامعة طرطوس", nameEn: "Tartous University" }
  ];

  return (
    <div className={`py-10 border-y transition-all ${
      theme === "dark" 
        ? "bg-slate-950 border-slate-900" 
        : "bg-slate-100/60 border-slate-200"
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6">
          <span className="text-[11px] font-black uppercase text-rose-500 tracking-wider flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            {lang === "ar" ? "اعتمادية المشروع ومعايير الجودة" : "Academic Accreditation & Quality Standards"}
          </span>
          <h3 className={`text-sm sm:text-base font-black mt-1 ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}>
            {lang === "ar" ? "مشاريع معتمدة وموجهة لطلاب كليات الهندسة والمعاهد العليا" : "Targeted for students of leading engineering faculties and higher institutes"}
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {universities.map((uni, idx) => (
            <div 
              key={idx}
              className={`px-4 py-2.5 rounded-2xl border transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                theme === "dark" 
                  ? "bg-slate-900/90 border-slate-800 text-slate-300 hover:border-rose-500/50 hover:text-white" 
                  : "bg-white border-slate-200 text-slate-700 hover:border-rose-500/50 hover:text-slate-900 shadow-xs"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="text-xs font-black">
                {lang === "ar" ? uni.nameAr : uni.nameEn}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
