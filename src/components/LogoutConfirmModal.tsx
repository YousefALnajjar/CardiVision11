import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut, X, AlertTriangle, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lang: "ar" | "en";
  theme: "dark" | "light";
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  isLoggingOut?: boolean;
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  lang,
  theme,
  userName,
  userEmail,
  userAvatar,
  isLoggingOut = false
}: LogoutConfirmModalProps) {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoggingOut) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoggingOut, onClose]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalNode = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
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
        zIndex: 99999,
        pointerEvents: "auto"
      }}
      id="logout-confirm-modal-wrapper"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      {/* 50% Semi-transparent dark overlay covering whole page */}
      <div
        onClick={() => {
          if (!isLoggingOut) onClose();
        }}
        className="fixed inset-0 z-[99998] transition-opacity cursor-pointer animate-fade-in"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 99998
        }}
        id="logout-modal-backdrop"
      />

      {/* Modal Card: Absolute Center, White Background, Border-radius, Box-shadow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={`relative z-[99999] w-full max-w-md m-auto rounded-3xl p-6 sm:p-8 overflow-hidden transition-all ${
          theme === "dark"
            ? "bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl shadow-black/60"
            : "bg-white border border-slate-100 text-slate-900 shadow-2xl shadow-slate-900/20"
        }`}
        style={{
          position: "relative",
          zIndex: 99999,
          borderRadius: "1.5rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)"
        }}
        id="logout-confirm-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoggingOut}
          className={`absolute top-4 ${lang === "ar" ? "left-4" : "right-4"} p-2 rounded-xl transition-all cursor-pointer ${
            theme === "dark"
              ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
          }`}
          title={lang === "ar" ? "إغلاق" : "Close"}
          id="logout-modal-close-btn"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          {/* Centered Icon Frame */}
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-md shadow-rose-500/10">
              <LogOut className={`w-7 h-7 ${lang === "ar" ? "-scale-x-100" : ""}`} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center border-2 border-white dark:border-slate-900 font-black shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-950" />
            </div>
          </div>

          {/* Modal Title */}
          <h3 
            id="logout-modal-title"
            className="text-xl sm:text-2xl font-black tracking-tight"
          >
            {lang === "ar" ? "تأكيد تسجيل الخروج" : "Confirm Logout"}
          </h3>

          {/* Inquisitive Prompt */}
          <p className="text-sm font-semibold text-rose-500 dark:text-rose-400 mt-1">
            {lang === "ar" 
              ? "هل أنت متأكد من رغبتك في تسجيل الخروج؟" 
              : "Are you sure you want to log out?"}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm leading-relaxed">
            {lang === "ar"
              ? "ستحتاج إلى تسجيل الدخول مجدداً لاحقاً للوصول إلى مشاريعك وطلباتك واستشاراتك الهندسية."
              : "You will need to sign in again to access your orders, downloads, and consultations."}
          </p>

          {/* User Preview Badge */}
          {userName && (
            <div className={`w-full mt-4 p-3 rounded-2xl border flex items-center gap-3 ${
              lang === "ar" ? "text-right" : "text-left"
            } ${
              theme === "dark"
                ? "bg-slate-950/60 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}>
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover border border-rose-500/40 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 text-white text-sm font-black flex items-center justify-center shrink-0">
                  {userName[0] || "U"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black truncate">{userName}</div>
                {userEmail && (
                  <div className="text-[11px] text-slate-400 font-mono truncate">{userEmail}</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons: Cancel and Confirm */}
          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoggingOut}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
              id="logout-modal-cancel-btn"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoggingOut}
              className="py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              id="logout-modal-confirm-btn"
            >
              {isLoggingOut ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogOut className={`w-4 h-4 ${lang === "ar" ? "-scale-x-100" : ""}`} />
              )}
              <span>
                {isLoggingOut
                  ? (lang === "ar" ? "جارِ الخروج..." : "Logging out...")
                  : (lang === "ar" ? "تأكيد" : "Confirm")
                }
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalNode, document.body)
    : modalNode;
}
