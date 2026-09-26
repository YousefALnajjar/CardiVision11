import React from "react";
import { ShieldCheck, ArrowRight, ArrowLeft, Lock, Database, Eye, FileText, CheckCircle2 } from "lucide-react";

interface PrivacyPolicyProps {
  lang: "ar" | "en";
  theme: "dark" | "light";
  onBack: () => void;
}

export default function PrivacyPolicy({ lang, theme, onBack }: PrivacyPolicyProps) {
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
            id="privacy-back-btn"
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
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight" id="privacy-title">
                {isAr ? "سياسة الخصوصية وحماية البيانات" : "Privacy Policy & Data Protection"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {isAr
                  ? "منصة CardioVision تلتزم بأعلى معايير حماية خصوصية الطلاب والباحثين والمهندسين"
                  : "CardioVision platform is committed to top-tier privacy standards for students & researchers"}
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Google Authentication Security */}
        <div className={`rounded-3xl p-6 sm:p-8 border space-y-4 ${
          theme === "dark" ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-100"
        }`}>
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-indigo-500 shrink-0" />
            <h2 className="text-lg font-black">
              {isAr ? "1. تسجيل الدخول وحماية الحسابات (Google Sign-In)" : "1. Authentication & Account Security"}
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {isAr
              ? "تعتمد منصة CardioVision حصرياً على خدمة مصادقة Google الرسمية (Google Identity Services) للتحقق من هوية المستخدمين. نؤكد بشكل قاطع:"
              : "CardioVision exclusively uses official Google Identity Services for user authentication. We strictly guarantee:"}
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? "لا نطلب ولا نستلم ولا نخزن أبداً كلمات المرور الخاصة بحسابات Google. يتم إدخال كلمة المرور إن لزم فقط على خوادم Google الرسمية والمشفرة."
                  : "We never request, receive, or store Google passwords. Any credentials are processed purely on Google's encrypted authentication infrastructure."}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? "نحصل فقط على البيانات الأساسية المصرح بها من قِبلكم: البريد الإلكتروني، الاسم الكامل، والصورة الشخصية لأغراض توثيق الحساب وإرسال روابط المشاريع."
                  : "We only retrieve basic authorized profile data: email address, full name, and avatar URL to verify account identity and project delivery."}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? "يتم التحقق من صحة رموز التوثيق الرقمية (Google ID Tokens) برمجياً عبر مفاتيح التشفير الرسمية لشركة Google قبل إنشاء أي جلسة داخل المنصة."
                  : "All Google ID tokens are cryptographically verified against Google official endpoints prior to granting application session access."}
              </span>
            </li>
          </ul>
        </div>

        {/* Section 2: Data Collection & Usage */}
        <div className={`rounded-3xl p-6 sm:p-8 border space-y-4 ${
          theme === "dark" ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-100"
        }`}>
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-rose-500 shrink-0" />
            <h2 className="text-lg font-black">
              {isAr ? "2. البيانات المحفوظة وكيفية استخدامها" : "2. Data Retention & Usage"}
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {isAr
              ? "تحتفظ قاعدة بيانات المنصة الآمنة (PostgreSQL) بالبيانات الضرورية فقط لإتمام الخدمات الأكاديمية والهندسية:"
              : "Our secure PostgreSQL database retains only data necessary to fulfill engineering and academic services:"}
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pr-2">
            <li>{isAr ? "سجل طلبات شراء مشاريع التخرج وحالة الدفع عبر سيريتيل كاش." : "Graduation project order records and payment statuses via Syriatel Cash."}</li>
            <li>{isAr ? "التعليقات والتقييمات الأكاديمية على المشاريع." : "Academic comments and project reviews submitted by verified users."}</li>
            <li>{isAr ? "طلبات الاستشارات الهندسية والطبية الحيوية المقدمة للخبراء." : "Biomedical and engineering consultation inquiries sent to platform experts."}</li>
          </ul>
        </div>

        {/* Section 3: Sessions and Cookies */}
        <div className={`rounded-3xl p-6 sm:p-8 border space-y-4 ${
          theme === "dark" ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-100"
        }`}>
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="text-lg font-black">
              {isAr ? "3. ملفات تعريف الارتباط وأمان الجلسة (Cookies)" : "3. Cookie & Session Security"}
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {isAr
              ? "نستخدم ملفات تعريف ارتباط مشفرة ومحمية بخاصية HttpOnly و SameSite لمنع الوصول غير المصرح به وضمان أمان جلسات المستخدمين أثناء تصفح المنصة."
              : "We utilize encrypted HttpOnly and SameSite cookies to protect user session tokens from cross-site access and maintain login security."}
          </p>
        </div>

        {/* Section 4: Contact & Data Deletion */}
        <div className={`rounded-3xl p-6 sm:p-8 border space-y-4 ${
          theme === "dark" ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-100"
        }`}>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-teal-500 shrink-0" />
            <h2 className="text-lg font-black">
              {isAr ? "4. طلبات حذف البيانات والتواصل" : "4. Data Rights & Support"}
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {isAr
              ? "يحق لأي طالب أو مهندس طلب حذف حسابه وسجلاته بالكامل في أي وقت عبر التواصل المباشر مع إدارة المنصة عبر واتساب (0964809575) أو عبر قسم اتصل بنا."
              : "Users have the right to request deletion of their account data at any time by contacting administration directly via WhatsApp (+963 964 809 575)."}
          </p>
        </div>

      </div>
    </div>
  );
}
