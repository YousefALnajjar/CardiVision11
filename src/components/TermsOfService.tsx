import React from "react";
import { Scale, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, FileCode2, CreditCard } from "lucide-react";

interface TermsOfServiceProps {
  lang: "ar" | "en";
  theme: "dark" | "light";
  onBack: () => void;
}

export default function TermsOfService({ lang, theme, onBack }: TermsOfServiceProps) {
  const isAr = lang === "ar";

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors ${
      theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`} dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation / Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              theme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            id="terms-back-btn"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isAr ? "العودة إلى المنصة الرئيسية" : "Back to CardioVision"}</span>
          </button>

          <span className="text-xs font-mono text-slate-400">
            {isAr ? "آخر تحديث: سبتمبر 2026" : "Last updated: September 2026"}
          </span>
        </div>

        {/* Page Header */}
        <div className={`rounded-3xl p-8 sm:p-10 border shadow-xl relative overflow-hidden ${
          theme === "dark"
            ? "bg-slate-900/90 border-slate-800 text-white"
            : "bg-white border-slate-100 text-slate-900"
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight" id="terms-title">
                {isAr ? "شروط الخدمة والاستخدام الأكاديمي" : "Terms of Service & Academic Guidelines"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {isAr
                  ? "القواعد والضوابط المنظمة لاستخدام منصة CardioVision ومشاريع التخرج الهندسية"
                  : "Rules and terms governing graduation project usage and engineering services"}
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Academic Use & Intellectual Property */}
        <div className={`rounded-3xl p-6 sm:p-8 border space-y-4 ${
          theme === "dark" ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-100"
        }`}>
          <div className="flex items-center gap-3">
            <FileCode2 className="w-5 h-5 text-indigo-500 shrink-0" />
            <h2 className="text-lg font-black">
              {isAr ? "1. الاستخدام الأكاديمي والملكية الفكرية" : "1. Academic Use & Intellectual Property"}
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {isAr
              ? "توفر منصة CardioVision مشاريع تخرج هندسية متكاملة (مخططات العتاد Schematics، ملفات PCB، الأكواد المصدرية، ونماذج الذكاء الاصطناعي). يقر المستخدم بالالتزام بالقواعد التالية:"
              : "CardioVision provides verified engineering graduation projects (schematics, PCB designs, source codes, AI models). Users agree to:"}
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? "تُمنح التراخيص للطلاب والباحثين لأغراض الدراسة الأكاديمية والبحث العلمي وتطوير النماذج الأولية."
                  : "Licenses are granted for academic research, learning, prototyping, and educational development."}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? "يُحظر إعادة نشر أو إعادة بيع الحزم البرمجية والملفات الهندسية كمنصة تجارية منافسة دون إذن كتابي مسبق."
                  : "Redistribution or resale of engineering project source packages is strictly prohibited without prior written consent."}
              </span>
            </li>
          </ul>
        </div>

        {/* Section 2: Payments via Syriatel Cash */}
        <div className={`rounded-3xl p-6 sm:p-8 border space-y-4 ${
          theme === "dark" ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-100"
        }`}>
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-rose-500 shrink-0" />
            <h2 className="text-lg font-black">
              {isAr ? "2. الدفع والتسليم عبر سيريتيل كاش" : "2. Orders & Syriatel Cash Payment"}
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {isAr
              ? "يتم سداد قيمة المشاريع حصرياً عبر التحويل الإلكتروني المباشر لرقم سيريتيل كاش المعتمد (0982257195). يتم تفعيل روابط التحميل فور تدقيق إشعار الدفع من قِبل إدارة المنصة."
              : "Project fees are settled via verified Syriatel Cash transfer to (+963 982 257 195). Download links are activated upon administration verification."}
          </p>
        </div>

        {/* Section 3: User Accounts */}
        <div className={`rounded-3xl p-6 sm:p-8 border space-y-4 ${
          theme === "dark" ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-100"
        }`}>
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="text-lg font-black">
              {isAr ? "3. التزامات الحساب والمصادقة" : "3. User Account Responsibilities"}
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {isAr
              ? "يجب استخدام حساب Google شخصي حقيقي وصالح. تحتفظ المنصة بالحق في تعليق الحسابات التي تنتهك حقوق الملكية أو ترسل تعليقات غير لائقة."
              : "Users must authenticate using valid personal Google accounts. The platform reserves the right to terminate accounts violating IP or posting abusive content."}
          </p>
        </div>

      </div>
    </div>
  );
}
