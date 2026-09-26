import React from 'react';
import { MaintenancePage } from './MaintenancePage';
import AuthModal from './AuthModal';
import { AnimatePresence } from 'framer-motion';

interface MaintenanceGuardProps {
  isMaintenanceMode: boolean;
  isAdmin: boolean;
  isCheckingMaintenance: boolean;
  lang: 'ar' | 'en';
  theme: 'dark' | 'light';
  setLang: (lang: 'ar' | 'en') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  maintenanceReason: string;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  handleLoginSuccess: (user: any) => void;
  children: React.ReactNode;
}

export const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({
  isMaintenanceMode,
  isAdmin,
  isCheckingMaintenance,
  lang,
  theme,
  setLang,
  setTheme,
  maintenanceReason,
  isAuthOpen,
  setIsAuthOpen,
  handleLoginSuccess,
  children
}) => {
  if (isCheckingMaintenance) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm animate-pulse">{lang === "ar" ? "جاري التحقق من حالة النظام..." : "Checking system status..."}</p>
        </div>
      </div>
    );
  }

  if (isMaintenanceMode && !isAdmin) {
    return (
      <div className={`min-h-screen font-sans ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`} dir={lang === "ar" ? "rtl" : "ltr"}>
        <MaintenancePage 
          lang={lang}
          theme={theme}
          setLang={setLang}
          setTheme={setTheme}
          customReason={maintenanceReason}
          onOpenAdminAuth={() => setIsAuthOpen(true)}
        />
        <AnimatePresence>
          {isAuthOpen && (
            <AuthModal
              onClose={() => setIsAuthOpen(false)}
              lang={lang}
              theme={theme}
              onLoginSuccess={(user) => {
                handleLoginSuccess(user);
                setIsAuthOpen(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return <>{children}</>;
};
