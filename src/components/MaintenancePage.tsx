import React, { useState } from "react";
import { 
  Wrench, 
  RefreshCw, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Sun, 
  Moon, 
  Heart, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

interface MaintenancePageProps {
  lang: "ar" | "en";
  setLang: (lang: "ar" | "en") => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  onOpenAdminAuth?: () => void;
  onCheckStatus?: () => Promise<boolean>;
  customReason?: string;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  onOpenAdminAuth,
  onCheckStatus,
  customReason
}) => {
  const [checking, setChecking] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const phone = "0964809575";
  const email = "admin@cardiovision.com";

  const handleCopy = (text: string, type: "phone" | "email") => {
    navigator.clipboard.writeText(text);
    if (type === "phone") {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleRetry = async () => {
    setChecking(true);
    setStatusMsg(null);
    try {
      if (onCheckStatus) {
        const isStillInMaintenance = await onCheckStatus();
        if (!isStillInMaintenance) {
          window.location.reload();
          return;
        }
      } else {
        const res = await fetch("/api/maintenance-status");
        const data = await res.json();
        if (!data.maintenanceMode) {
          window.location.reload();
          return;
        }
      }
      setStatusMsg(
        lang === "ar"
          ? "الموقع ما زال قيد أعمال الصيانة والتحديث. يرجى المحاولة بعد قليل."
          : "System is still under active maintenance. Please try again shortly."
      );
    } catch (err) {
      setStatusMsg(
        lang === "ar"
          ? "تعذر الاتصال بالخادم حالياً. جارٍ إعادة التحسينات..."
          : "Server is updating... Please wait."
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <div 
      className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-300 ${
        theme === "dark" 
          ? "bg-slate-950 text-slate-100" 
          : "bg-slate-50 text-slate-900"
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Background ECG Pulse Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-600/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl animate-pulse delay-700" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto p-4 sm:p-6 flex items-center justify-between border-b border-slate-800/40">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="CardioVision Logo" 
            className="w-11 h-11 object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">
                CardioVision
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                Maintenance
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-bold">
              {lang === "ar" ? "منصة مشاريع التخرج والهندسة الطبية" : "Biomedical & Engineering Projects Platform"}
            </p>
          </div>
        </div>

        {/* Header Controls: Lang & Theme */}
        <div className="flex items-center gap-2">
          {/* Lang Toggle */}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all ${
              theme === "dark" 
                ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200" 
                : "bg-white border-slate-200 hover:bg-slate-100 text-slate-800"
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>{lang === "ar" ? "English" : "العربية"}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`p-2.5 rounded-xl border transition-all ${
              theme === "dark" 
                ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-2xl w-full text-center space-y-8 my-auto">
          
          {/* Official CardioVision Logo Display */}
          <div className="inline-block mx-auto">
            <img 
              src="/logo.png" 
              alt="CardioVision Logo" 
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Main Titles */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              🚧 {lang === "ar" ? "الموقع قيد التحديث والصيانة" : "Site Under Maintenance"}
            </h1>
            <p className="text-sm sm:text-base text-rose-500 dark:text-rose-400 font-extrabold">
              {lang === "ar" ? "مرحباً بكم في CardioVision" : "Welcome to CardioVision"}
            </p>
          </div>

          {/* Detailed Message Box */}
          <div className={`p-6 sm:p-8 rounded-3xl border text-right sm:text-center leading-relaxed space-y-4 shadow-xl ${
            theme === "dark"
              ? "bg-slate-900/90 border-slate-800/80 text-slate-200"
              : "bg-white border-slate-200 text-slate-800"
          }`}>
            <p className="text-sm sm:text-base font-medium">
              {customReason || (
                lang === "ar"
                  ? "نعمل حالياً على إجراء تحديثات وتحسينات لنوفر لكم تجربة أفضل وأكثر أماناً."
                  : "We are currently conducting scheduled updates and improvements to provide you with a better, faster, and more secure experience."
              )}
            </p>

            <div className="pt-3 border-t border-slate-800/40 text-xs sm:text-sm font-bold text-slate-400 flex flex-col sm:flex-row items-center justify-center gap-2">
              <span>{lang === "ar" ? "نعتذر عن الإزعاج ونرجو المحاولة مرة أخرى لاحقاً." : "We apologize for the inconvenience and kindly ask you to try again later."}</span>
              <strong className="text-rose-400 font-extrabold">{lang === "ar" ? "شكراً لتفهمكم." : "Thank you for your understanding."}</strong>
            </div>
          </div>

          {/* Status Alert feedback */}
          {statusMsg && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold animate-fade-in flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Action Button & Contact Cards */}
          <div className="space-y-4">
            {/* Retry Button */}
            <button
              onClick={handleRetry}
              disabled={checking}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-rose-500/25 flex items-center justify-center gap-3 transition-all mx-auto transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${checking ? "animate-spin" : ""}`} />
              <span>{lang === "ar" ? "تحديث الصفحة وإعادة المحاولة (Retry)" : "Refresh Page & Retry"}</span>
            </button>

            {/* Support Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 max-w-xl mx-auto">
              {/* Phone card */}
              <div className={`p-4 rounded-2xl border text-center space-y-1.5 transition-all ${
                theme === "dark" ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
              }`}>
                <span className="text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-rose-500" />
                  <span>{lang === "ar" ? "رقم التواصل والواتساب:" : "Support Contact:"}</span>
                </span>
                <div className="flex items-center justify-center gap-2">
                  <a 
                    href={`tel:${phone}`} 
                    className="font-black text-sm text-slate-100 hover:text-rose-400 transition-colors dir-ltr"
                  >
                    0964809575
                  </a>
                  <button
                    onClick={() => handleCopy(phone, "phone")}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title={lang === "ar" ? "نسخ الرقم" : "Copy Phone"}
                  >
                    {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Email card */}
              <div className={`p-4 rounded-2xl border text-center space-y-1.5 transition-all ${
                theme === "dark" ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
              }`}>
                <span className="text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === "ar" ? "البريد الإلكتروني الرسمى:" : "Official Email:"}</span>
                </span>
                <div className="flex items-center justify-center gap-2">
                  <a 
                    href={`mailto:${email}`} 
                    className="font-black text-xs text-slate-100 hover:text-indigo-400 transition-colors dir-ltr"
                  >
                    {email}
                  </a>
                  <button
                    onClick={() => handleCopy(email, "email")}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                    title={lang === "ar" ? "نسخ البريد" : "Copy Email"}
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Login Gatekeeper Button */}
            {onOpenAdminAuth && (
              <div className="pt-4">
                <button
                  onClick={onOpenAdminAuth}
                  className="text-xs text-slate-400 hover:text-rose-400 font-bold flex items-center justify-center gap-1.5 mx-auto transition-colors group"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-500" />
                  <span>{lang === "ar" ? "تسجيل دخول المشرفين والمسؤولين (Admin Access)" : "Administrator Login Gate"}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto p-4 sm:p-6 border-t border-slate-800/40 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>CardioVision System Operations & Security Protocol © {new Date().getFullYear()}</span>
        </p>
        <p className="font-bold text-slate-400">
          {lang === "ar" ? "شغوفون بخدمتكم وتوفير أعلى معايير الجودة والأمان" : "Dedicated to providing high security and performance"}
        </p>
      </footer>
    </div>
  );
};

export default MaintenancePage;
