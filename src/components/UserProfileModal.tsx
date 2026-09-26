import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  Camera, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  LogOut, 
  ExternalLink, 
  Check, 
  Copy, 
  User as UserIcon,
  Sparkles,
  FolderDown,
  Layers,
  Heart,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  lang: "ar" | "en";
  theme: "dark" | "light";
  onUpdateAvatar?: (avatarUrl: string) => void;
  onNavigateToDesk?: () => void;
  onRequestLogout?: () => void;
  onOpenPlatformRate?: () => void;
  stats?: {
    ordersCount?: number;
    favoritesCount?: number;
    consultationsCount?: number;
  };
}

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  lang,
  theme,
  onUpdateAvatar,
  onNavigateToDesk,
  onRequestLogout,
  onOpenPlatformRate,
  stats
}: UserProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleCopyEmail = () => {
    if (currentUser.email) {
      navigator.clipboard.writeText(currentUser.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(lang === "ar" ? "يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)" : "Please choose a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(lang === "ar" ? "حجم الصورة كبير جداً، الحد الأقصى هو 5 ميغابايت" : "Image is too large (max 5MB)");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onUpdateAvatar?.(base64);
      }
      setIsUploading(false);
      e.target.value = "";
    };
    reader.onerror = () => {
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const isAdmin = currentUser.role === "admin";
  const userRoleTitle = isAdmin
    ? (lang === "ar" ? "مدير النظام والمنصة" : "System Administrator")
    : (lang === "ar" ? "مهندس / طالب" : "Engineering Student");

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-x-hidden overflow-y-auto"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999
      }}
      id="user-profile-modal-wrapper"
      role="dialog"
      aria-modal="true"
    >
      {/* 50% Semi-transparent dark overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[99998] transition-opacity cursor-pointer animate-fade-in"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 99998
        }}
        id="user-profile-modal-backdrop"
      />

      {/* Main Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`relative z-[99999] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all ${
          theme === "dark"
            ? "bg-slate-900 border border-slate-800 text-slate-100 shadow-black/60"
            : "bg-white border border-slate-100 text-slate-900 shadow-slate-900/20"
        }`}
        style={{
          position: "relative",
          zIndex: 99999,
          borderRadius: "1.5rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)"
        }}
        id="user-profile-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Header Banner */}
        <div className="relative h-28 sm:h-32 bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-3.5 ${lang === "ar" ? "left-3.5" : "right-3.5"} p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition-all cursor-pointer`}
            title={lang === "ar" ? "إغلاق" : "Close"}
            id="user-profile-close-btn"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Account Status Badge */}
          <div className={`absolute top-3.5 ${lang === "ar" ? "right-3.5" : "left-3.5"} px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-white text-[11px] font-black flex items-center gap-1.5 border border-white/10`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{lang === "ar" ? "حساب موثق نشط" : "Verified Account"}</span>
          </div>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 relative">
          
          {/* Large Interactive Avatar */}
          <div className="flex justify-between items-end -mt-14 sm:-mt-16 mb-4">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                id="user-profile-file-input"
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl bg-slate-800 cursor-pointer group-hover:shadow-rose-500/20 transition-all duration-300 transform group-hover:scale-105"
                title={lang === "ar" ? "انقر لتغيير الصورة الشخصية" : "Click to change profile picture"}
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-rose-500 via-rose-600 to-indigo-600 text-white font-black text-3xl sm:text-4xl flex items-center justify-center">
                    {currentUser.name?.[0] || "U"}
                  </div>
                )}

                {/* Hover Camera Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                  <Camera className="w-6 h-6 text-white drop-shadow-md" />
                  <span className="text-[10px] font-black">
                    {isUploading 
                      ? (lang === "ar" ? "جارِ الرفع..." : "Uploading...")
                      : (lang === "ar" ? "تغيير الصورة" : "Change")}
                  </span>
                </div>
              </div>

              {/* Floating Camera Icon Badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`absolute bottom-0 ${lang === "ar" ? "left-0" : "right-0"} w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 hover:bg-rose-500 transition-all cursor-pointer hover:scale-110`}
                title={lang === "ar" ? "تغيير الصورة" : "Change photo"}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-rose-500" />
              <span>{lang === "ar" ? "تعديل الصورة" : "Update Photo"}</span>
            </button>
          </div>

          {/* User Name & Badges */}
          <div className={lang === "ar" ? "text-right" : "text-left"}>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {currentUser.name || (lang === "ar" ? "مستخدم CardioVision" : "CardioVision User")}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black inline-flex items-center gap-1 ${
                isAdmin 
                  ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" 
                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              }`}>
                <ShieldCheck className="w-3 h-3" />
                <span>{userRoleTitle}</span>
              </span>
            </div>

            {/* Email with One-Click Copy */}
            {currentUser.email && (
              <div className="mt-2 flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono max-w-full truncate ${
                  theme === "dark" 
                    ? "bg-slate-950/60 border-slate-800 text-slate-300" 
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}>
                  <Mail className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1 hover:text-rose-500 transition-colors shrink-0 cursor-pointer ml-1"
                    title={lang === "ar" ? "نسخ البريد" : "Copy email"}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className={`p-3 rounded-2xl border text-center transition-all ${
              theme === "dark" ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="text-base sm:text-lg font-black text-rose-500">
                {stats?.ordersCount ?? 0}
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5">
                {lang === "ar" ? "الطلبات" : "Orders"}
              </div>
            </div>

            <div className={`p-3 rounded-2xl border text-center transition-all ${
              theme === "dark" ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="text-base sm:text-lg font-black text-indigo-500">
                {stats?.consultationsCount ?? 0}
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5">
                {lang === "ar" ? "الاستشارات" : "Consults"}
              </div>
            </div>

            <div className={`p-3 rounded-2xl border text-center transition-all ${
              theme === "dark" ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="text-base sm:text-lg font-black text-amber-500">
                {stats?.favoritesCount ?? 0}
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5">
                {lang === "ar" ? "المفضلة" : "Favorites"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 mt-5">
            {/* Rate CardioVision Platform Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPlatformRate?.();
              }}
              className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                theme === "dark"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                  : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
              }`}
              id="user-profile-rate-platform-btn"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{lang === "ar" ? "⭐ تقييم منصة CardioVision" : "⭐ Rate CardioVision"}</span>
            </button>

            {/* Go to Student Desk / Admin Panel */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToDesk?.();
              }}
              className="w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              id="user-profile-goto-desk-btn"
            >
              <FolderDown className="w-4 h-4" />
              <span>
                {isAdmin
                  ? (lang === "ar" ? "فتح لوحة تحكم الإدارة" : "Open Admin Panel")
                  : (lang === "ar" ? "مكتبي الهندسي والتحميلات" : "My Desk & Downloads")}
              </span>
            </button>

            {/* Logout Trigger */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestLogout?.();
              }}
              className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-800/60 border-slate-700/80 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                  : "bg-slate-100 border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200"
              }`}
              id="user-profile-logout-btn"
            >
              <LogOut className={`w-3.5 h-3.5 ${lang === "ar" ? "-scale-x-100" : ""}`} />
              <span>{lang === "ar" ? "تسجيل الخروج من الحساب" : "Log out from account"}</span>
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
