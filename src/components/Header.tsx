import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
const companyLogo = "/logo.png";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { 
  Sun, 
  Moon, 
  Languages, 
  User, 
  LogOut, 
  LogIn,
  Bell, 
  LayoutDashboard,
  Share2,
  Check
} from "lucide-react";

interface HeaderProps {
  lang: "ar" | "en";
  setLang: (lang: "ar" | "en") => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  currentUser: any;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  notifications: any[];
  onMarkNotificationsRead: () => void;
  onSelectTab: (tab: string) => void;
  activeTab: string;
  onUpdateAvatar?: (avatarUrl: string) => void;
  onOpenProfile?: () => void;
}

export default function Header({
  lang,
  setLang,
  theme,
  setTheme,
  currentUser,
  onLogout,
  onOpenAuth,
  onOpenAdmin,
  isAdmin,
  notifications,
  onMarkNotificationsRead,
  onSelectTab,
  activeTab
}: HeaderProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleShareClick = () => {
    const currentOrigin = window.location.origin;
    let sharedUrl = currentOrigin;
    if (currentOrigin.includes("ais-dev-")) {
      sharedUrl = currentOrigin.replace("ais-dev-", "ais-pre-");
    }
    
    navigator.clipboard.writeText(sharedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Could not copy text: ", err);
    });
  };

  const handleNotifClick = () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown && unreadCount > 0) {
      onMarkNotificationsRead();
    }
  };

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-sm transition-all duration-300 ${
      theme === "dark" 
        ? "bg-slate-950/95 border-slate-900 text-slate-100" 
        : "bg-white/95 border-slate-100 text-slate-900 shadow-sm"
    }`}>
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectTab("home")} 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0"
          id="brand-logo"
        >
          {/* Official CardioVision Logo */}
          <div className="shrink-0 flex items-center justify-center">
            <img 
              src={companyLogo} 
              alt="CardioVision Logo" 
              className="shrink-0"
              style={{ height: '60px', width: 'auto', objectFit: 'contain', maxWidth: '100%' }}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="shrink-0 flex flex-col justify-center">
            <h1 className={`font-black text-xs sm:text-base tracking-tight leading-none transition-colors ${
              theme === "dark" ? "text-white font-black" : "text-slate-900 font-black"
            }`}>
              CardioVision
            </h1>
            <span className={`text-[10px] sm:text-xs font-black block mt-1 tracking-tight ${
              theme === "dark" ? "text-rose-400" : "text-rose-600"
            }`}>
              {lang === "ar" ? "المشاريع الهندسية" : "Engineering Hub"}
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Quick links) */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => onSelectTab("home")}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeTab === "home" 
                ? "bg-rose-500/10 text-rose-500 font-black" 
                : theme === "dark" 
                  ? "text-slate-400 hover:text-slate-200" 
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            {lang === "ar" ? "الصفحة الرئيسية" : "Home"}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("projects")}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeTab === "projects" 
                ? "bg-rose-500/10 text-rose-500 font-black" 
                : theme === "dark" 
                  ? "text-slate-400 hover:text-slate-200" 
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            {lang === "ar" ? "تصفح المشاريع" : "Browse Projects"}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("services")}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeTab === "services" 
                ? "bg-rose-500/10 text-rose-500 font-black" 
                : theme === "dark" 
                  ? "text-slate-400 hover:text-slate-200" 
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            {lang === "ar" ? "خدماتنا ونبذة عنا" : "Services & About"}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("consultations")}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeTab === "consultations" 
                ? "bg-rose-500/10 text-rose-500 font-black" 
                : theme === "dark" 
                  ? "text-slate-400 hover:text-slate-200" 
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            {lang === "ar" ? "الاستشارات الفنية" : "AI Consultations"}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("contact")}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeTab === "contact" 
                ? "bg-rose-500/10 text-rose-500 font-black" 
                : theme === "dark" 
                  ? "text-slate-400 hover:text-slate-200" 
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            {lang === "ar" ? "اتصل بنا" : "Contact Us"}
          </button>
        </nav>

        {/* Utility Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Share Website Button */}
          <button
            onClick={handleShareClick}
            className={`w-8 h-8 sm:w-auto sm:px-3 sm:py-2 rounded-xl border font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 ${
              copied 
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
                : theme === "dark" 
                  ? "bg-slate-900 border-slate-800 text-rose-400 hover:bg-slate-800 hover:border-rose-500/30" 
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-rose-500/30"
            }`}
            title={lang === "ar" ? "نسخ رابط المشاركة العام للموقع" : "Copy public share link for others"}
            id="share-website-btn"
          >
            {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-pulse" /> : <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline">
              {copied 
                ? (lang === "ar" ? "تم نسخ الرابط!" : "Copied Link!") 
                : (lang === "ar" ? "مشاركة الموقع" : "Share Site")
              }
            </span>
          </button>

          {/* Toggle Theme with Smooth Animated Feedback */}
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center relative overflow-hidden transition-all duration-300 active:scale-90 shrink-0 ${
              theme === "dark" 
                ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800 hover:border-amber-500/40 shadow-xs" 
                : "bg-slate-50 border-slate-200 text-indigo-600 hover:bg-indigo-50/70 hover:border-indigo-200 shadow-xs"
            }`}
            title={lang === "ar" ? (theme === "dark" ? "التحويل للوضع الفاتح" : "التحويل للوضع الداكن") : (theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode")}
            aria-label={lang === "ar" ? "تبديل المظهر" : "Toggle Theme"}
            id="theme-toggler"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.div
                  key="dark-sun"
                  initial={{ rotate: -90, scale: 0.2, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.2, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex items-center justify-center text-amber-400"
                >
                  <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="light-moon"
                  initial={{ rotate: 90, scale: 0.2, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.2, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex items-center justify-center text-indigo-600"
                >
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Toggle Language */}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className={`w-8 h-8 sm:w-auto sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 text-xs font-bold shrink-0 ${
              theme === "dark" 
                ? "bg-slate-900 border-slate-800 text-indigo-400 hover:bg-slate-800" 
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title={lang === "ar" ? "English" : "العربية"}
            id="lang-toggler"
          >
            <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{lang === "ar" ? "EN" : "AR"}</span>
          </button>

          {/* Notifications Inbox Trigger */}
          {currentUser && (
            <div className="relative shrink-0">
              <button
                onClick={handleNotifClick}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all relative shrink-0 ${
                  theme === "dark"
                    ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
                id="notification-bell"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -end-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-[8px] font-black text-white flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {showNotifDropdown && (
                <>
                  {/* Backdrop Overlay for mobile devices */}
                  <div 
                    onClick={() => setShowNotifDropdown(false)}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 sm:hidden"
                  />

                  <div className={`fixed start-3 end-3 top-16 sm:absolute sm:inset-auto sm:end-0 sm:top-full sm:mt-2 sm:w-80 rounded-2xl border shadow-2xl p-4 z-50 ${
                    theme === "dark" 
                      ? "bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/80" 
                      : "bg-white border-slate-200 text-slate-900 shadow-slate-300/50"
                  }`}>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
                      <span className="text-xs font-black flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-rose-500" />
                        {lang === "ar" ? "صندوق الإشعارات" : "Notifications"}
                      </span>
                      <button 
                        onClick={() => setShowNotifDropdown(false)} 
                        className="text-[10px] text-slate-400 hover:text-slate-200 font-bold px-2 py-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                      >
                        {lang === "ar" ? "إغلاق" : "Close"}
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-2.5 rounded-xl border transition-all ${
                              lang === "ar" ? "text-right" : "text-left"
                            } ${
                              theme === "dark" 
                                ? "bg-slate-950/60 border-slate-800/60 hover:border-slate-700" 
                                : "bg-slate-50 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <p className="text-[11px] font-bold text-rose-500 dark:text-rose-400">
                              {lang === "ar" ? notif.titleAr : notif.titleEn}
                            </p>
                            <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              {lang === "ar" ? notif.messageAr : notif.messageEn}
                            </p>
                            <span className="text-[8px] text-slate-400 dark:text-slate-500 block mt-1.5 font-mono">
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-center text-slate-500 py-6 font-medium">
                          {lang === "ar" ? "لا يوجد إشعارات جديدة" : "No new notifications"}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User Section / Auth State */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 md:gap-2">
              {/* If Admin, show desktop workspace button */}
              {isAdmin && (
                <button
                  onClick={() => onSelectTab("admin")}
                  className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 hover:scale-105 active:scale-95 transition-all ${
                    activeTab === "admin" ? "bg-indigo-600 text-white" : ""
                  }`}
                  id="admin-dashboard-tab-trigger"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "لوحة الإدارة" : "Admin Panel"}</span>
                </button>
              )}

              {/* Student Workspace button (Desktop) */}
              {!isAdmin && (
                <button
                  onClick={() => onSelectTab("student")}
                  className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:scale-105 active:scale-95 transition-all ${
                    activeTab === "student" ? "bg-rose-600 text-white" : ""
                  }`}
                  id="student-workspace-tab-trigger"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "طلباتي ومشاريعي" : "My Orders"}</span>
                </button>
              )}

              {/* Logout Button (Opens Confirmation Modal) */}
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all duration-300 shrink-0 hover:scale-105 active:scale-95 group ${
                  theme === "dark" 
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/25 hover:border-rose-500/60 shadow-xs hover:shadow-rose-950/40" 
                    : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300 shadow-xs hover:shadow-rose-200"
                }`}
                title={lang === "ar" ? "تسجيل الخروج" : "Logout"}
                id="header-logout-btn"
              >
                <LogOut className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 transition-transform duration-300 group-hover:-translate-x-0.5 ${lang === "ar" ? "-scale-x-100 group-hover:translate-x-0.5" : ""}`} />
              </button>
            </div>
          ) : (
            /* Desktop Login Button with Interactive Hover Motion & Gradient */
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex py-2 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-500 text-white font-black text-xs transition-all duration-300 items-center gap-2 shadow-md shadow-rose-600/20 hover:shadow-rose-600/40 hover:scale-105 active:scale-95 group cursor-pointer"
              id="header-login-btn"
            >
              <LogIn className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              <span>{lang === "ar" ? "تسجيل الدخول" : "Sign In"}</span>
            </button>
          )}

        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        lang={lang}
        theme={theme}
        userName={currentUser?.name}
        userEmail={currentUser?.email}
        userAvatar={currentUser?.avatarUrl}
        isLoggingOut={isLoggingOut}
      />
    </header>
  );
}
