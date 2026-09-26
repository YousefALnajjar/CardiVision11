import React, { useEffect, useState, useRef } from "react";
import { 
  X, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  RotateCw, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft
} from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthModalProps {
  onClose: () => void;
  lang: "ar" | "en";
  theme: "dark" | "light";
  onLoginSuccess: (user: any, token?: string) => void;
  prefetchedClientId?: string;
}

export default function AuthModal({
  onClose,
  lang,
  theme,
  onLoginSuccess,
  prefetchedClientId,
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>(prefetchedClientId || "");
  const [gisRendered, setGisRendered] = useState<boolean>(false);
  
  // Credentials Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("الهندسة الطبية والحيوية");
  const [showPassword, setShowPassword] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Google Client ID from backend if not prefetched
  useEffect(() => {
    let isMounted = true;
    if (prefetchedClientId) {
      setClientId(prefetchedClientId);
      return;
    }

    async function fetchConfig() {
      try {
        const res = await fetch("/api/auth/google/config");
        const data = await res.json();
        if (isMounted && data?.clientId) {
          setClientId(data.clientId);
        }
      } catch (err) {
        console.error("Config fetch error:", err);
      }
    }
    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, [prefetchedClientId]);

  // 2. Handle Google Credential Response from GIS
  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      console.warn("No credential in Google response");
      setStatus("error");
      setErrorMessage(
        lang === "ar"
          ? "تعذر تسجيل الدخول باستخدام Google. يرجى المحاولة مرة أخرى."
          : "Could not sign in with Google. Please try again."
      );
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Backend auth failure:", data?.error);
        setStatus("error");
        setErrorMessage(
          lang === "ar"
            ? (data?.error || "تعذر تسجيل الدخول باستخدام Google. يرجى المحاولة مرة أخرى.")
            : (data?.error || "Could not sign in with Google. Please try again.")
        );
        return;
      }

      // Success
      setStatus("success");
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
        onClose();
      }, 500);
    } catch (err) {
      console.error("Authentication network error:", err);
      setStatus("error");
      setErrorMessage(
        lang === "ar"
          ? "تعذر تسجيل الدخول باستخدام Google. يرجى المحاولة مرة أخرى."
          : "Unable to sign in with Google. Please try again."
      );
    }
  };

  // 3. Initialize Google Identity Services with strict Popup mode
  useEffect(() => {
    if (!clientId) return;

    let isMounted = true;

    const setupGis = () => {
      if (window.google?.accounts?.id && isMounted) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            ux_mode: "popup",
            auto_select: false,
            cancel_on_tap_outside: true,
            context: "signin",
          });

          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = "";
            const dynamicWidth = Math.min(280, Math.max(220, (typeof window !== "undefined" ? window.innerWidth : 360) - 72));
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              type: "standard",
              shape: "pill",
              theme: theme === "dark" ? "filled_black" : "outline",
              text: lang === "ar" ? "signin_with" : "continue_with",
              size: "large",
              width: dynamicWidth,
              locale: lang === "ar" ? "ar" : "en",
              logo_alignment: "left",
            });
            setGisRendered(true);
          }
        } catch (err) {
          console.error("GIS initialization error:", err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGis();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          setupGis();
        }
      }, 200);
      return () => {
        isMounted = false;
        clearInterval(timer);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [clientId, theme, lang]);

  // Handle direct Form Submit (Email / Password)
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage(lang === "ar" ? "يرجى إدخال عنوان بريد إلكتروني صالح" : "Please enter a valid email address");
      return;
    }
    if (!password || password.length < 4) {
      setStatus("error");
      setErrorMessage(lang === "ar" ? "يرجى إدخال كلمة مرور مكونة من 4 أحرف على الأقل" : "Password must be at least 4 characters");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          name: name.trim() || email.split("@")[0],
          specialty,
          university: lang === "ar" ? "جامعة دمشق" : "Damascus University"
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatus("error");
        setErrorMessage(data?.error || (lang === "ar" ? "فشل تسجيل الدخول، يرجى التحقق من البيانات" : "Login failed, please check credentials"));
        return;
      }

      setStatus("success");
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error("Login request error:", err);
      setStatus("error");
      setErrorMessage(
        lang === "ar"
          ? "تعذر الاتصال بخادم تسجيل الدخول، يرجى المحاولة لاحقاً"
          : "Could not connect to the authentication server, please try again"
      );
    }
  };

  // Trigger Google Sign-In fallback
  const triggerGoogleSignIn = () => {
    if (status === "loading" || status === "success") return;
    setStatus("loading");
    setErrorMessage(null);

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (
            notification?.isNotDisplayed?.() ||
            notification?.isSkippedMoment?.() ||
            notification?.isDismissedMoment?.()
          ) {
            if (status === "loading") {
              setStatus("idle");
            }
          }
        });
      } catch (e) {
        console.error("GIS prompt error:", e);
        setStatus("idle");
      }
    } else {
      setTimeout(() => {
        if (status === "loading") setStatus("idle");
      }, 2000);
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setErrorMessage(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={status === "loading" ? undefined : onClose}
      dir={lang === "ar" ? "rtl" : "ltr"}
      id="auth-modal-overlay"
    >
      <div
        className={`relative w-full max-w-sm sm:max-w-md my-auto max-h-[92dvh] overflow-y-auto rounded-3xl p-5 sm:p-7 border shadow-2xl transition-all ${
          theme === "dark"
            ? "bg-slate-900/95 border-slate-800 text-slate-100 shadow-rose-950/30"
            : "bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60"
        }`}
        onClick={(e) => e.stopPropagation()}
        id="auth-modal-card"
      >
        {/* Close Button */}
        {status !== "loading" && (
          <button
            onClick={onClose}
            className={`absolute top-4 sm:top-5 end-4 sm:end-5 p-2 rounded-full transition-colors ${
              theme === "dark"
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            }`}
            aria-label={lang === "ar" ? "إغلاق" : "Close"}
            id="close-auth-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ===================================================================
            1. CENTERED RESPONSIVE LOGO & BRAND HEADER
            =================================================================== */}
        <div className="flex flex-col items-center text-center pt-1 mb-5 sm:mb-6" id="auth-modal-header-area">
          
          {/* Centered Responsive Official CardioVision Logo */}
          <div className="mb-3 flex justify-center items-center">
            <img
              src="/logo.png"
              alt="CardioVision Logo"
              className="w-24 sm:w-28 h-auto object-contain"
              referrerPolicy="no-referrer"
              id="auth-modal-logo-img"
            />
          </div>

          {/* Platform Title */}
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5" id="auth-modal-title">
            <span>CardioVision</span>
            <span className="text-rose-500 text-xs px-2 py-0.5 rounded-full bg-rose-500/10 font-bold border border-rose-500/20">AI</span>
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mt-1" id="auth-modal-subtitle">
            {lang === "ar"
              ? "بوابة مهندسي المستقبل لمشاريع التخرج والحلول الطبية الحيوية"
              : "Next-gen engineering hub for graduation projects & medical AI"}
          </p>

          {/* Mode Switcher Tabs (Sign In / New Account) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 mt-3.5 border border-slate-200/80 dark:border-slate-700/60 w-full max-w-[280px]">
            <button
              type="button"
              onClick={() => { setAuthMode("login"); setErrorMessage(null); }}
              className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
                authMode === "login"
                  ? "bg-white dark:bg-slate-900 text-rose-500 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              id="auth-mode-login-btn"
            >
              {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("register"); setErrorMessage(null); }}
              className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
                authMode === "register"
                  ? "bg-white dark:bg-slate-900 text-indigo-500 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              id="auth-mode-register-btn"
            >
              {lang === "ar" ? "حساب جديد" : "New Account"}
            </button>
          </div>
        </div>

        {/* Error State Banner */}
        {status === "error" && (
          <div
            className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex flex-col items-center text-center gap-2 animate-fadeIn"
            id="auth-error-container"
          >
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {errorMessage ||
                  (lang === "ar"
                    ? "حدث خطأ أثناء العملية. يرجى المحاولة مرة أخرى."
                    : "An error occurred. Please try again.")}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-xs cursor-pointer"
              id="retry-auth-btn"
            >
              <RotateCw className="w-3 h-3" />
              <span>{lang === "ar" ? "إعادة المحاولة" : "Try again"}</span>
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {status === "loading" && (
          <div
            className="w-full mb-4 flex items-center justify-center gap-2.5 p-3 rounded-2xl text-xs font-bold border bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse"
            id="auth-loading-banner"
          >
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{lang === "ar" ? "جارٍ التحقق وتوثيق الحساب..." : "Verifying credentials..."}</span>
          </div>
        )}

        {/* Success Indicator */}
        {status === "success" && (
          <div
            className="w-full mb-4 flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 animate-fadeIn"
            id="auth-success-banner"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{lang === "ar" ? "تم تسجيل الدخول بنجاح! جاري الانتقال..." : "Signed in successfully! Redirecting..."}</span>
          </div>
        )}

        {/* ===================================================================
            2. PROFESSIONAL CREDENTIALS FORM
            =================================================================== */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-3.5 mb-5" id="auth-credentials-form">
          
          {/* Full Name Input (Register mode only) */}
          {authMode === "register" && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-500" />
                <span>{lang === "ar" ? "الاسم الكامل (لشهادة المشروع)" : "Full Name"}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === "ar" ? "مثال: م. أحمد السوري" : "e.g., Eng. Ahmed Al-Souri"}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border transition-all outline-none bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  required={authMode === "register"}
                  id="auth-input-name"
                />
              </div>
            </div>
          )}

          {/* Specialty Input (Register mode only) */}
          {authMode === "register" && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                <span>{lang === "ar" ? "التخصص الجامعي / الهندسي" : "Engineering Specialty"}</span>
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border transition-all outline-none bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                id="auth-select-specialty"
              >
                <option value="الهندسة الطبية والحيوية">{lang === "ar" ? "الهندسة الطبية والحيوية" : "Biomedical Engineering"}</option>
                <option value="هندسة الذكاء الاصطناعي والحواسيب">{lang === "ar" ? "هندسة الذكاء الاصطناعي والحواسيب" : "AI & Computer Engineering"}</option>
                <option value="هندسة الاتصالات والإلكترونيات">{lang === "ar" ? "هندسة الاتصالات والإلكترونيات" : "Electronics & Communications"}</option>
                <option value="هندسة الميكاترونكس والتحكم">{lang === "ar" ? "هندسة الميكاترونكس والتحكم" : "Mechatronics & Control"}</option>
              </select>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-rose-500" />
              <span>{lang === "ar" ? "البريد الإلكتروني" : "Email Address"}</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang === "ar" ? "engineer@cardiovision.sy" : "engineer@cardiovision.sy"}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border transition-all outline-none bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                required
                id="auth-input-email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{lang === "ar" ? "كلمة المرور" : "Password"}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border transition-all outline-none bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                required
                id="auth-input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${lang === "ar" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="w-full py-2.5 px-4 mt-2 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-md shadow-rose-600/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            id="auth-submit-btn"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{authMode === "login" ? (lang === "ar" ? "تسجيل الدخول" : "Sign In") : (lang === "ar" ? "إنشاء الحساب" : "Create Account")}</span>
                {lang === "ar" ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </>
            )}
          </button>
        </form>

        {/* Divider with subtle styling */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <span className="relative px-3 text-[10px] font-black uppercase text-slate-400 bg-white dark:bg-slate-900">
            {lang === "ar" ? "أو المتابعة السريعة عبر Google" : "Or Continue With Google"}
          </span>
        </div>

        {/* ===================================================================
            3. GOOGLE SIGN-IN ACTION AREA
            =================================================================== */}
        <div className="flex flex-col items-center justify-center min-h-[46px]">
          {/* Official Google Identity Services Render Target */}
          <div
            ref={googleBtnContainerRef}
            id="google-signin-btn-target"
            className={`flex justify-center w-full min-h-[44px] ${!gisRendered ? "hidden" : ""}`}
          />

          {/* Styled Fallback Button if GIS is loading or rendered custom */}
          {!gisRendered && (
            <button
              type="button"
              onClick={triggerGoogleSignIn}
              disabled={status === "loading" || status === "success"}
              className={`w-full max-w-[280px] flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-black border shadow-xs transition-all active:scale-[0.99] cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800 hover:border-slate-300"
              }`}
              id="google-signin-custom-btn"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{lang === "ar" ? "متابعة باستخدام حساب Google" : "Continue with Google"}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

