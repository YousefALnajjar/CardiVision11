import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { 
  BookOpen, 
  Search, 
  X, 
  Database, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  Award,
  Phone,
  DollarSign,
  Home,
  Layers,
  Cpu,
  MessageSquare,
  Wrench,
  LayoutDashboard,
  User,
  Gauge,
  LogIn,
  Clock,
  ArrowUpDown,
  Activity,
  Mic,
  MicOff,
  RotateCcw,
  Info
} from "lucide-react";

// Types & Static Data
import { Project, Category } from "./types";
import { PROJECTS as fallbackProjects, CATEGORIES, TRANSLATIONS } from "./data";

// Extracted Modular Components
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProjectCard from "./components/ProjectCard";
import ProjectCardSkeleton from "./components/ProjectCardSkeleton";
import ProjectDetailModal from "./components/ProjectDetailModal";
import ProjectCompareModal from "./components/ProjectCompareModal";
import AuthModal from "./components/AuthModal";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { MaintenanceGuard } from "./components/MaintenanceGuard";
import ConsultationSection from "./components/ConsultationSection";
import ContactSection from "./components/ContactSection";
import AboutServicesSection from "./components/AboutServicesSection";
import MaintenancePage from "./components/MaintenancePage";
import { SyriatelPaymentModal } from "./components/SyriatelPaymentModal";

// Commercial Level Showcase & AI Components
import FeaturedProjectsCarousel from "./components/FeaturedProjectsCarousel";
import StatsCounterSection from "./components/StatsCounterSection";
import TestimonialsSection from "./components/TestimonialsSection";
import PartnersSection from "./components/PartnersSection";
import AiProjectAdvisorModal from "./components/AiProjectAdvisorModal";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import LogoutConfirmModal from "./components/LogoutConfirmModal";
import UserProfileModal from "./components/UserProfileModal";
import RateExperienceModal from "./components/RateExperienceModal";
import { feedbackService } from "./services/feedbackService";
import ProjectStatistics from "./components/ProjectStatistics";

export default function App() {
  // Global States
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("cardiovision_theme");
    return (saved === "dark" || saved === "light") ? saved : "light";
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    const path = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
    if (path === "/privacy" || path.startsWith("/privacy")) return "privacy";
    if (path === "/terms" || path.startsWith("/terms")) return "terms";
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    return hash || "home";
  });
  const [googleClientId, setGoogleClientId] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

  // Sync activeTab with hash changes (e.g., back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setActiveTab(hash);
      } else {
        const path = window.location.pathname.toLowerCase();
        if (path !== "/privacy" && path !== "/terms" && !path.startsWith("/privacy") && !path.startsWith("/terms")) {
          navigateTo("home");
        }
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update hash when activeTab changes (optional but good for sync)
  useEffect(() => {
    if (activeTab !== "privacy" && activeTab !== "terms") {
      const currentHash = window.location.hash.replace("#", "");
      if (currentHash !== activeTab) {
        window.history.pushState(null, "", `#${activeTab}`);
      }
    }
  }, [activeTab]);

  // Lists & Filters
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeDifficulty, setActiveDifficulty] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");
  const [budgetLimit, setBudgetLimit] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<"newest" | "popularity" | "price_asc">("newest");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("cardiovision_recent_searches");
      return saved ? JSON.parse(saved).slice(0, 5) : [];
    } catch {
      return [];
    }
  });

  const addRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      try {
        localStorage.setItem("cardiovision_recent_searches", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("cardiovision_recent_searches");
    } catch {}
  };

  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Modals & UI States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Recently Viewed Tracking
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("cardiovision_recent_projects");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (selectedProject) {
      setRecentlyViewedIds(prev => {
        const filtered = prev.filter(id => id !== selectedProject.id);
        const next = [selectedProject.id, ...filtered].slice(0, 5);
        localStorage.setItem("cardiovision_recent_projects", JSON.stringify(next));
        return next;
      });
    }
  }, [selectedProject]);

  // Voice-to-Text Search States
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const [compareProjectIds, setCompareProjectIds] = useState<string[]>([]);
  const [lastClearedCompareIds, setLastClearedCompareIds] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const hasShownAdminLoginRef = useRef(false);
  const [pendingPurchaseProjectId, setPendingPurchaseProjectId] = useState<string | null>(null);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [activePaymentOrder, setActivePaymentOrder] = useState<any | null>(null);
  const [systemNotification, setSystemNotification] = useState<{
    message: string;
    action?: {
      label: string;
      onAction: () => void;
    };
  } | string | null>(null);
  const systemNotificationTimeoutRef = useRef<any>(null);
  const [showQuickAdmin, setShowQuickAdmin] = useState(false);

  // Guest Google Auth Banner Dismiss State
  const [isAuthBannerDismissed, setIsAuthBannerDismissed] = useState<boolean>(false);

  // Platform Feedback States
  const [isPlatformFeedbackOpen, setIsPlatformFeedbackOpen] = useState(false);
  const [isSmartFeedbackPrompt, setIsSmartFeedbackPrompt] = useState(false);

  // Smart Feedback Prompt Trigger (Non-intrusive, checks dismissal and prior submission)
  const triggerSmartFeedbackPrompt = async () => {
    try {
      const dismissedUntil = localStorage.getItem("cardiovision_feedback_dismissed_until");
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        return;
      }
      const alreadySubmitted = localStorage.getItem("cardiovision_feedback_submitted");
      if (alreadySubmitted === "true") {
        return;
      }
      if (currentUser) {
        const res = await feedbackService.getMyFeedback();
        if (res.success && res.feedback) {
          localStorage.setItem("cardiovision_feedback_submitted", "true");
          return;
        }
      }
      setTimeout(() => {
        setIsSmartFeedbackPrompt(true);
        setIsPlatformFeedbackOpen(true);
      }, 1500);
    } catch (err) {
      console.debug("Smart feedback check error:", err);
    }
  };

  // Maintenance System States
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceReason, setMaintenanceReason] = useState("");
  const [isMaintenanceAllowedForUser, setIsMaintenanceAllowedForUser] = useState(false);
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true);

  // Check Maintenance Mode from Server
  const checkMaintenanceStatus = async () => {
    try {
      const headers: Record<string, string> = {
        "Cache-Control": "no-cache"
      };
      if (currentUser?.id) {
        headers["x-user-id"] = currentUser.id;
        headers["x-user-role"] = currentUser.role || "student";
      }

      const res = await fetch(`/api/maintenance-status?t=${Date.now()}`, { 
        headers,
        cache: "no-store"
      });
      const data = await res.json();
      if (data.success) {
        const active = Boolean(data.maintenanceMode);
        
        // If maintenance mode was active and just got disabled, refresh projects and categories
        setIsMaintenanceMode((prev) => {
          if (prev && !active) {
            fetchProjects();
            fetchCategories();
          }
          return active;
        });

        if (data.reason) setMaintenanceReason(data.reason);

        const allowed = Boolean(data.allowedForUser) || (currentUser?.role === "admin");
        setIsMaintenanceAllowedForUser(allowed);
      }
    } catch (e) {
      console.warn("Could not check maintenance status", e);
    } finally {
      setIsCheckingMaintenance(false);
    }
  };

  useEffect(() => {
    checkMaintenanceStatus();
    const interval = setInterval(checkMaintenanceStatus, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Translations
  const t = TRANSLATIONS[lang];

  // Load persistent user and config
  useEffect(() => {
    // Theme setup on body tag
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("cardiovision_theme", theme);
  }, [theme]);

  useEffect(() => {
    // Restore authenticated session securely from backend via HttpOnly cookie or stored JWT
    const token = localStorage.getItem("cardiovision_token");
    setIsAuthLoading(true);
    fetch("/api/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
          localStorage.removeItem("cardiovision_token");
        }
      })
      .catch((err) => {
        console.warn("Session check error:", err);
        setCurrentUser(null);
      })
      .finally(() => {
        setIsAuthLoading(false);
      });

    // Owner Mode Check
    const params = new URLSearchParams(window.location.search);
    if (params.get("owner") === "yousef" || params.get("admin") === "true") {
      localStorage.setItem("cardiovision_owner_mode", "true");
      setShowQuickAdmin(true);
      // Clean up URL query parameters safely so others don't see it
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (localStorage.getItem("cardiovision_owner_mode") === "true") {
      setShowQuickAdmin(true);
    }

    // Load initial projects and categories from server database
    fetchProjects();
    fetchCategories();

    // Prefetch Google OAuth Client ID for zero-latency GIS button rendering
    fetch("/api/auth/google/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.clientId) {
          setGoogleClientId(data.clientId);
        }
      })
      .catch(() => {});
  }, []);

  // Handle browser back/forward buttons and clean navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === "/privacy" || path.startsWith("/privacy")) {
        setActiveTab("privacy");
      } else if (path === "/terms" || path.startsWith("/terms")) {
        setActiveTab("terms");
      }
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const navigateTo = (tab: string, pathUrl?: string) => {
    setActiveTab(tab);
    if (pathUrl) {
      window.history.pushState({}, "", pathUrl);
    } else {
      window.location.hash = tab;
    }
  };
  // Scroll to top when activeTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab]);

  // Fetch notifications and favorites when user logs in
  useEffect(() => {
    if (currentUser?.id) {
      fetchNotifications();
      fetchFavorites();
      
      // Setup periodic checks for notifications (every 30 seconds for optimal performance)
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setFavorites([]);
    }
  }, [currentUser?.id]);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success && data.projects && data.projects.length > 0) {
        setProjects(data.projects);
      }
    } catch (e) {
      console.warn("Server backend loading delayed. Utilizing high-fidelity local static project catalog.", e);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success && data.categories && data.categories.length > 0) {
        // Ensure "all" field is prepended if not exists
        const cats = data.categories;
        const hasAll = cats.some((c: any) => c.id === "all");
        if (!hasAll) {
          setCategories([{ id: "all", labelEn: "All Fields", labelAr: "كل المجالات" }, ...cats]);
        } else {
          setCategories(cats);
        }
      }
    } catch (e) {
      console.warn("Could not load dynamic categories", e);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser?.id) return;
    try {
      const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
      const res = await fetch(`/api/notifications?userId=${currentUser.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include"
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(prev => {
          if (prev.length === data.notifications.length && JSON.stringify(prev) === JSON.stringify(data.notifications)) {
            return prev;
          }
          return data.notifications;
        });
      }
    } catch (e) {
      console.warn("Could not fetch notifications (network deferred):", e);
    }
  };

  const fetchFavorites = async () => {
    if (!currentUser?.id) return;
    try {
      const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
      const res = await fetch(`/api/favorites?userId=${currentUser.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include"
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.favorites)) {
        setFavorites(prev => {
          if (prev.length === data.favorites.length && JSON.stringify(prev) === JSON.stringify(data.favorites)) {
            return prev;
          }
          return data.favorites;
        });
      }
    } catch (e) {
      console.warn("Could not fetch favorites (network deferred):", e);
    }
  };

  const handleToggleFavorite = async (projectId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
      const res = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify({ userId: currentUser.id, projectId })
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        if (data.favorited) {
          setFavorites([...favorites, projectId]);
          triggerSystemAlert(lang === "ar" ? "تم حفظ المشروع بنجاح!" : "Project saved successfully!");
        } else {
          setFavorites(favorites.filter(id => id !== projectId));
          triggerSystemAlert(lang === "ar" ? "تمت إزالة المشروع من المحفوظات" : "Project removed from saved list");
        }
      }
    } catch (err) {
      console.warn("Could not toggle favorite:", err);
    }
  };

  const handleToggleCompare = (projectId: string) => {
    setLastClearedCompareIds([]);
    setCompareProjectIds(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      }
      if (prev.length >= 2) {
        triggerSystemAlert(
          lang === "ar"
            ? "وصلت للحد الأقصى (مشروعين). اضغط على 'إلغاء التحديد' بالأسفل أو انقر على مشروع محدد لإزالته"
            : "Limit reached (2 projects). Click 'Clear' in the bar below or click a selected project to replace it"
        );
        return prev;
      }
      return [...prev, projectId];
    });
  };

  const handleClearCompare = () => {
    if (compareProjectIds.length === 0) return;
    const previouslySelected = [...compareProjectIds];
    setLastClearedCompareIds(previouslySelected);
    setCompareProjectIds([]);

    triggerSystemAlert(
      lang === "ar"
        ? `تم إلغاء تحديد ${previouslySelected.length} ${previouslySelected.length === 1 ? "مشروع" : "مشاريع"} من المقارنة`
        : `Cleared ${previouslySelected.length} project${previouslySelected.length > 1 ? "s" : ""} from comparison`,
      {
        label: lang === "ar" ? "تراجع" : "Undo",
        onAction: () => {
          setCompareProjectIds(previouslySelected);
          setLastClearedCompareIds([]);
          setSystemNotification(null);
        }
      },
      6500
    );
  };

  const handleUndoClearCompare = () => {
    if (lastClearedCompareIds.length > 0) {
      setCompareProjectIds(lastClearedCompareIds);
      setLastClearedCompareIds([]);
      setSystemNotification(null);
    }
  };

  const compareProjects = projects.filter(p => compareProjectIds.includes(p.id));

  const handlePurchaseOrder = async (projectId: string, userOverride?: any) => {
    const activeUser = userOverride || currentUser;
    if (!activeUser) {
      setPendingPurchaseProjectId(projectId);
      setIsAuthOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify({ userId: activeUser.id, projectId })
      });
      const data = await res.json();
      if (data.success && data.order) {
        if (selectedProject) {
          setSelectedProject(null);
        }
        setActivePaymentOrder(data.order);
      } else {
        triggerSystemAlert(data.error || (lang === "ar" ? "تعذر إنشاء الطلب" : "Could not create order"));
      }
    } catch (e) {
      console.warn("Order creation network error:", e);
      triggerSystemAlert(lang === "ar" ? "حدث خطأ في الاتصال بالسيرفر" : "Server connection error");
    }
  };

  const handleMarkNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify({ userId: currentUser.id })
      });
      fetchNotifications();
    } catch (e) {
      console.warn("Could not mark notifications as read:", e);
    }
  };

  const handleLoginSuccess = (user: any, token?: string) => {
    setCurrentUser(user);
    if (token) {
      localStorage.setItem("cardiovision_token", token);
    }
    triggerSystemAlert(lang === "ar" ? `مرحباً بك ${user.name} في منصة CardioVision!` : `Welcome to CardioVision, ${user.name}!`);
    
    // If user was attempting to purchase a project before login, resume purchase seamlessly
    if (pendingPurchaseProjectId) {
      const pId = pendingPurchaseProjectId;
      setPendingPurchaseProjectId(null);
      handlePurchaseOrder(pId, user);
    } else if (!selectedProject && !activePaymentOrder) {
      // Otherwise return to home
      navigateTo("home");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.warn("Logout request error:", e);
    }
    localStorage.removeItem("cardiovision_token");
    localStorage.removeItem("cardiovision_session");
    setCurrentUser(null);
    triggerSystemAlert(lang === "ar" ? "تم تسجيل الخروج بنجاح. نتمنى لك التوفيق!" : "Logged out successfully. Good luck!");
    navigateTo("home");
  };

  const handleUpdateAvatar = async (newAvatarUrl: string) => {
    if (!currentUser) return;

    // Instantly update UI avatar
    setCurrentUser((prev: any) => prev ? { ...prev, avatarUrl: newAvatarUrl } : prev);

    // Update stored session if present
    try {
      const storedSession = localStorage.getItem("cardiovision_session");
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        parsed.avatarUrl = newAvatarUrl;
        localStorage.setItem("cardiovision_session", JSON.stringify(parsed));
      }
    } catch (e) {}

    // Persist to backend database
    try {
      const token = localStorage.getItem("cardiovision_token");
      await fetch("/api/users/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify({ avatarUrl: newAvatarUrl })
      });
    } catch (err) {
      console.warn("Avatar server sync error:", err);
    }

    triggerSystemAlert(lang === "ar" ? "تم تحديث صورتك الشخصية بنجاح!" : "Profile picture updated successfully!");
  };

  const triggerSystemAlert = (
    msg: string, 
    action?: { label: string; onAction: () => void }, 
    duration: number = 4500
  ) => {
    if (systemNotificationTimeoutRef.current) {
      clearTimeout(systemNotificationTimeoutRef.current);
    }
    setSystemNotification(action ? { message: msg, action } : msg);
    systemNotificationTimeoutRef.current = setTimeout(() => {
      setSystemNotification(null);
    }, duration);
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Failed to stop recognition:", e);
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      triggerSystemAlert(
        lang === "ar"
          ? "خاصية التعرف الصوتي غير مدعومة في هذا المتصفح. يرجى استخدام متصفح Google Chrome أو Microsoft Edge."
          : "Voice recognition is not supported in this browser. Please try Google Chrome or Edge."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "ar" ? "ar-SA" : "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const transcript = (finalTranscript || interimTranscript).trim();
        if (transcript) {
          setSearchText(transcript);
          if (finalTranscript.trim().length >= 2) {
            addRecentSearch(finalTranscript.trim());
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          triggerSystemAlert(
            lang === "ar"
              ? "تم رفض إذن الوصول إلى الميكروفون. يرجى السماح بالميكروفون لتفعيل البحث الصوتي."
              : "Microphone permission was denied. Please allow microphone access in your browser."
          );
        } else if (event.error === "no-speech") {
          triggerSystemAlert(
            lang === "ar"
              ? "لم يتم سماع أي صوت. يرجى التحدث بوضوح في الميكروفون."
              : "No speech detected. Please speak clearly into your microphone."
          );
        } else if (event.error !== "aborted") {
          triggerSystemAlert(
            lang === "ar"
              ? "حدث خطأ أثناء الاستماع، يرجى المحاولة مرة أخرى."
              : "An error occurred during voice recognition. Please try again."
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Speech recognition initialization error:", err);
      setIsListening(false);
      triggerSystemAlert(
        lang === "ar"
          ? "تعذر تشغيل الميكروفون، يرجى التأكد من صلاحيات المتصفح."
          : "Could not activate microphone, please check browser settings."
      );
    }
  };

  const highestPrice = React.useMemo(() => {
    return projects.length > 0 ? Math.max(...projects.map(p => p.price || 0)) : 10000;
  }, [projects]);
  
  const currentLimit = budgetLimit === "" ? highestPrice : budgetLimit;

  // Filtering projects based on search criteria
  const filteredProjects = projects.filter((project) => {
    const matchesCategory = activeCategory === "all" || project.category === activeCategory;
    const matchesDifficulty = activeDifficulty === "all" || (project.difficultyLevel || "medium") === activeDifficulty;
    const matchesBudget = (project.price || 0) <= currentLimit;
    
    const searchLow = searchText.toLowerCase().trim();
    if (!searchLow) return matchesCategory && matchesDifficulty && matchesBudget;

    const matchesSearch = 
      project.titleAr.toLowerCase().includes(searchLow) ||
      project.titleEn.toLowerCase().includes(searchLow) ||
      project.descriptionAr.toLowerCase().includes(searchLow) ||
      project.descriptionEn.toLowerCase().includes(searchLow) ||
      project.universityAr?.toLowerCase().includes(searchLow) ||
      project.universityEn?.toLowerCase().includes(searchLow) ||
      project.softwareAr?.some(s => s.toLowerCase().includes(searchLow)) ||
      project.softwareEn?.some(s => s.toLowerCase().includes(searchLow)) ||
      project.componentsAr?.some(c => c.toLowerCase().includes(searchLow)) ||
      project.componentsEn?.some(c => c.toLowerCase().includes(searchLow));

    return matchesCategory && matchesDifficulty && matchesBudget && matchesSearch;
  });

  // Sorting filtered projects by selected criteria ('Newest', 'Popularity', 'Price: low-to-high')
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "popularity") {
      const popA = (a.likesCount || 0) + (favorites.includes(a.id) ? 3 : 0) + (a.viewsCount || 0) * 0.1;
      const popB = (b.likesCount || 0) + (favorites.includes(b.id) ? 3 : 0) + (b.viewsCount || 0) * 0.1;
      return popB - popA;
    }
    if (sortBy === "price_asc") {
      return (a.price || 0) - (b.price || 0);
    }
    // Default: 'newest'
    return b.id.localeCompare(a.id, undefined, { numeric: true });
  });

  const featuredProjects = (projects || []).slice(0, 3);
  const isAdmin = Boolean(currentUser && currentUser.role === "admin");
  const shouldShowMaintenance = isMaintenanceMode && !isAdmin;

  useEffect(() => {
    if (isAuthLoading || isCheckingMaintenance) return;

    if (isMaintenanceMode && !isAdmin) {
      if (typeof window !== "undefined" && window.location.pathname !== "/maintenance.html") {
        if (document.referrer.includes("/maintenance.html") && !hasShownAdminLoginRef.current) {
          hasShownAdminLoginRef.current = true;
          setIsAuthOpen(true);
        } else if (!isAuthOpen) {
          window.location.replace("/maintenance.html");
        }
      }
    }
  }, [isMaintenanceMode, isAdmin, isAuthLoading, isCheckingMaintenance, isAuthOpen]);

  return (
    <MaintenanceGuard
      isMaintenanceMode={isMaintenanceMode}
      isAdmin={isAdmin}
      isCheckingMaintenance={isCheckingMaintenance}
      lang={lang}
      theme={theme}
      setLang={setLang}
      setTheme={setTheme}
      maintenanceReason={maintenanceReason}
      isAuthOpen={isAuthOpen}
      setIsAuthOpen={setIsAuthOpen}
      handleLoginSuccess={handleLoginSuccess}
    >
      <div className={`min-h-screen font-sans transition-colors duration-300 w-full overflow-x-hidden ${
        theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`} dir={lang === "ar" ? "rtl" : "ltr"}>

      {/* Admin Maintenance Mode Banner */}
      {isMaintenanceMode && isAdmin && (
        <div className="bg-amber-600/90 text-white font-black text-xs px-4 py-2.5 text-center flex items-center justify-center gap-2 border-b border-amber-500 shadow-md">
          <Wrench className="w-4 h-4 animate-bounce" />
          <span>
            {lang === "ar" 
              ? "⚠️ تنبيه المسؤول: وضع الصيانة مفعّل حالياً للموقع. الزوار يرون صفحة الصيانة بينما تملك أنت إمكانية الوصول الكاملة للعمل والتحديثات."
              : "⚠️ ADMIN ALERT: Maintenance mode is ACTIVE for visitors. You have full access."}
          </span>
          <button
            onClick={() => navigateTo("admin")}
            className="px-2.5 py-1 rounded bg-slate-950 text-amber-400 font-bold hover:bg-slate-900 text-[10px]"
          >
            {lang === "ar" ? "إعدادات الصيانة ⚙️" : "Settings"}
          </button>
        </div>
      )}

      {/* Smart Google Auth Banner for Guests */}
      <AnimatePresence>
        {!currentUser && !isAuthBannerDismissed && (
          <motion.aside
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-b z-40 relative bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 dark:from-blue-950/70 dark:via-slate-900/90 dark:to-indigo-950/70 border-blue-200/80 dark:border-blue-500/25 shadow-xs"
            id="guest-google-auth-banner"
            aria-label={lang === "ar" ? "تنبيه تسجيل الدخول بحساب Google" : "Google Sign-in Notification"}
          >
            <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-blue-200/90 dark:border-blue-700/60 flex items-center justify-center shadow-xs shrink-0">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                  {lang === "ar"
                    ? "للحصول على تجربة متكاملة وحفظ تقدمك في المشاريع، يرجى تسجيل الدخول باستخدام حساب Google الخاص بك."
                    : "To get a complete experience and save your project progress, please sign in with your Google account."}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  id="banner-google-signin-btn"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "تسجيل الدخول بحساب Google" : "Sign in with Google"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthBannerDismissed(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-blue-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={lang === "ar" ? "إغلاق التنبيه" : "Dismiss"}
                  aria-label={lang === "ar" ? "إغلاق التنبيه" : "Dismiss"}
                  id="dismiss-auth-banner-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Top Header Integration */}
      <Header 
        lang={lang} 
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => navigateTo("admin")}
        isAdmin={isAdmin}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onSelectTab={setActiveTab}
        activeTab={activeTab}
        onUpdateAvatar={handleUpdateAvatar}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Toast Notification Floating Banner */}
      <AnimatePresence>
        {systemNotification && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 text-white font-black text-xs px-5 py-2.5 rounded-full shadow-2xl border flex items-center gap-3 max-w-[92vw] sm:max-w-md ${
              typeof systemNotification === "object" && systemNotification?.action
                ? "bg-slate-950/95 border-slate-700/80 shadow-slate-950/50 backdrop-blur-md"
                : "bg-rose-600 border-rose-500 shadow-rose-600/30"
            }`}
            id="system-toast-banner"
          >
            <Sparkles className="w-4 h-4 text-rose-400 animate-spin-slow shrink-0" />
            <span className="text-slate-100 line-clamp-1 truncate">
              {typeof systemNotification === "string" ? systemNotification : systemNotification.message}
            </span>
            {typeof systemNotification === "object" && systemNotification?.action && (
              <button
                type="button"
                onClick={() => {
                  systemNotification.action?.onAction();
                }}
                className="ms-1 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/30 hover:scale-105 shrink-0 cursor-pointer"
                id="toast-undo-btn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{systemNotification.action.label}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (systemNotificationTimeoutRef.current) clearTimeout(systemNotificationTimeoutRef.current);
                setSystemNotification(null);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer"
              title={lang === "ar" ? "إغلاق" : "Dismiss"}
              aria-label={lang === "ar" ? "إغلاق" : "Dismiss"}
              id="close-toast-btn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Workspace */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 pb-28 md:pb-8 w-full overflow-x-hidden">

        {/* 1. HOME TAB */}
        {activeTab === "home" && (
          <div className="space-y-12 animate-fade-in">
            {/* Presentation Hero Banner */}
            <Hero 
              lang={lang} 
              theme={theme}
              onBrowseProjects={() => navigateTo("projects")}
              onRequestConsult={() => setIsAiAdvisorOpen(true)}
              onOpenServices={() => navigateTo("services")}
            />

            {/* Featured Projects Interactive Showcase Carousel */}
            <FeaturedProjectsCarousel
              projects={projects}
              lang={lang}
              theme={theme}
              onSelectProject={setSelectedProject}
              onBuyProject={handlePurchaseOrder}
            />

            {/* Live Stats Counters */}
            <StatsCounterSection
              lang={lang}
              theme={theme}
              totalProjects={projects.length}
            />

            {/* Partner Universities & Accreditation */}
            <PartnersSection
              lang={lang}
              theme={theme}
            />

            {/* Student Reviews & Testimonials */}
            <TestimonialsSection
              lang={lang}
              theme={theme}
            />

            {/* Info Bento Grid (Syriatel cash and direct supervisor details) */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              
              {/* Payment details */}
              <div className={`p-6 rounded-3xl border relative overflow-hidden ${
                theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <div className="absolute top-0 end-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                    <DollarSign className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 mb-2">{t.paymentTitle}</h3>
                    <p className={`text-xs leading-relaxed mb-4 ${theme === "dark" ? "text-slate-400" : "text-slate-700 font-medium"}`}>
                      {t.paymentSub}
                    </p>
                    <div className={`p-3.5 rounded-xl border font-mono text-center mb-2 ${
                      theme === "dark" ? "bg-slate-950/80 border-slate-850" : "bg-slate-100 border-slate-200"
                    }`}>
                      <span className="text-base font-semibold text-gray-800 dark:text-slate-100 block mb-1">{t.syriatelCash}</span>
                      <strong className="text-xl font-black text-rose-500">{t.syriatelCashNumber}</strong>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center font-semibold">
                      ⚠️ {lang === "ar" ? "يرجى الحفاظ على لقطة شاشة من عملية التحويل لرفعها لتأكيد الحجز فوراً." : "Please keep your payment screenshot reference to activate files."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Founder/Admin details */}
              <div className={`p-6 rounded-3xl border relative overflow-hidden ${
                theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <div className="absolute top-0 end-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                    <Phone className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 mb-2">{t.contactTitle}</h3>
                    <p className={`text-xs leading-relaxed mb-4 ${theme === "dark" ? "text-slate-400" : "text-slate-700 font-medium"}`}>
                      {lang === "ar" ? "تلتزم CardioVision بالإشراف المباشر والتعديل البرمجي وكتابة التقارير العلمية وتسليم الدارات المطبوعة PCB لكافة طلاب كليات الهندسة." : "CardioVision provides direct software adjustments, hardware wiring calibrations, PCB printing, and defense assistance."}
                    </p>
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/40">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-bold">{t.companyContact}</span>
                        <strong className="text-slate-900 dark:text-slate-200 font-mono text-sm">0964809575</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </section>
          </div>
        )}

        {/* 2. PROJECTS TAB */}
        {activeTab === "projects" && (
          <div className="space-y-6 animate-fade-in">
            <ProjectStatistics projects={projects} lang={lang} />
            {/* Header filters */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{lang === "ar" ? "أرشيف المشاريع الهندسية" : "Engineering Project Catalog"}</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {lang === "ar" ? "ابحث وتصفح مشاريع التخرج بالاسم، الحساسات، البرامج أو الجامعة." : "Filter graduation plans by components, universities, or software used."}
                </p>
              </div>

              {/* Dynamic search input, recent searches, and sorting dropdown */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-80">
                  <div className="relative flex items-center">
                    <span className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addRecentSearch(searchText);
                      }}
                      onBlur={() => {
                        if (searchText.trim().length >= 2) addRecentSearch(searchText);
                      }}
                      placeholder={t.searchPlaceholder}
                      className={`w-full text-xs ps-9 pe-16 py-2.5 rounded-xl border outline-none transition-all ${
                        theme === "dark"
                          ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
                          : "bg-white border-slate-200 text-slate-850 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
                      } ${isListening ? "border-rose-500 ring-2 ring-rose-500/30" : ""}`}
                      id="projects-search-input"
                    />
                    <div className="absolute inset-y-0 end-2 flex items-center gap-1">
                      {searchText.length > 0 && (
                        <button 
                          type="button"
                          onClick={() => setSearchText("")} 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          title={lang === "ar" ? "مسح البحث" : "Clear search"}
                          aria-label={lang === "ar" ? "مسح البحث" : "Clear search"}
                          id="clear-search-btn"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={toggleVoiceSearch}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isListening
                            ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/40 ring-2 ring-rose-400 dark:ring-rose-900"
                            : "text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                        }`}
                        title={
                          isListening
                            ? (lang === "ar" ? "إيقاف الاستماع الصوتي" : "Stop voice listening")
                            : (lang === "ar" ? "البحث بالصوت" : "Search by voice")
                        }
                        aria-label={
                          isListening
                            ? (lang === "ar" ? "إيقاف الاستماع الصوتي" : "Stop voice listening")
                            : (lang === "ar" ? "البحث بالصوت" : "Search by voice")
                        }
                        id="voice-search-btn"
                      >
                        {isListening ? (
                          <MicOff className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Mic className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Active Voice Search Feedback */}
                  {isListening && (
                    <div className="flex items-center justify-between gap-2 mt-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold animate-pulse">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        <span>{lang === "ar" ? "جارِ الاستماع... تحدث الآن للبحث" : "Listening... speak now to search"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleVoiceSearch}
                        className="text-[10px] text-rose-400 hover:text-rose-600 underline font-medium cursor-pointer"
                      >
                        {lang === "ar" ? "إلغاء" : "Cancel"}
                      </button>
                    </div>
                  )}

                  {/* Recent Searches Chips (last 5 searches) */}
                  {recentSearches.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {lang === "ar" ? "عمليات البحث الأخيرة:" : "Recent Searches:"}
                      </span>
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSearchText(term)}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                            searchText === term
                              ? "bg-rose-500/20 text-rose-500 border-rose-500/40"
                              : theme === "dark"
                              ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                          }`}
                        >
                          {term}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-[10px] text-rose-500 hover:text-rose-600 font-bold px-1"
                        title={lang === "ar" ? "مسح السجل" : "Clear recent"}
                      >
                        {lang === "ar" ? "مسح" : "Clear"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Compare Mode Toggle */}
                <button
                  onClick={() => setIsCompareMode(!isCompareMode)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    isCompareMode 
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-500" 
                      : theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200" : "bg-white border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">{lang === "ar" ? "وضع المقارنة" : "Compare Mode"}</span>
                </button>

                {/* Sorting Dropdown */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className={`text-xs px-3 py-2.5 rounded-xl border outline-none font-bold cursor-pointer transition-all ${
                      theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-rose-500"
                        : "bg-white border-slate-200 text-slate-800 focus:border-rose-500"
                    }`}
                    title={lang === "ar" ? "ترتيب المشاريع" : "Sort Projects"}
                  >
                    <option value="newest">{lang === "ar" ? "الأحدث" : "Newest"}</option>
                    <option value="popularity">{lang === "ar" ? "الأكثر شعبية" : "Popularity (Saved)"}</option>
                    <option value="price_asc">{lang === "ar" ? "السعر: من الأقل للأعلى" : "Price: Low to High"}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category chips list */}
            {isLoadingCategories ? (
              <div className="flex flex-wrap items-center gap-1.5 pb-2 overflow-x-auto scrollbar-none" id="categories-skeleton-bar">
                {[80, 140, 160, 130, 150, 145].map((w, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${w}px` }}
                    className={`h-9 rounded-xl animate-pulse ${
                      theme === "dark" ? "bg-slate-800/80" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 pb-2 overflow-x-auto scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                      activeCategory === cat.id
                        ? "bg-rose-600 border-rose-500 text-white shadow-lg"
                        : theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {lang === "ar" ? cat.labelAr : cat.labelEn}
                  </button>
                ))}
              </div>
            )}

            {/* Difficulty Level Interactive Segmented Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 pb-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  {lang === "ar" ? "مستوى تعقيد المشاريع:" : "Project Complexity Level:"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", code: "ALL", labelAr: "جميع المستويات", labelEn: "All Levels", bars: 0 },
                  { id: "easy", code: "LVL-01", labelAr: "مبتدئ · سهل", labelEn: "Easy Level", bars: 1 },
                  { id: "medium", code: "LVL-02", labelAr: "متوسط · متقدم", labelEn: "Medium Level", bars: 2 },
                  { id: "hard", code: "LVL-03", labelAr: "صعب · احترافي", labelEn: "Advanced Level", bars: 3 }
                ].map((diff) => {
                  const isActive = activeDifficulty === diff.id;
                  return (
                    <button
                      key={diff.id}
                      onClick={() => setActiveDifficulty(diff.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 border font-mono ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-600 to-rose-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20 scale-105"
                          : theme === "dark"
                          ? "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700"
                          : "bg-slate-100 border-slate-250 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {/* Segmented bar mini indicator */}
                      {diff.bars > 0 && (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((b) => (
                            <span
                              key={b}
                              className={`w-1 h-2 rounded-xs transition-colors ${
                                b <= diff.bars
                                  ? isActive ? "bg-white" : "bg-indigo-400"
                                  : "bg-slate-700/50"
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      <span className="font-sans font-black">{lang === "ar" ? diff.labelAr : diff.labelEn}</span>

                      <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-mono ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        {diff.id === "all" ? projects.length : projects.filter(p => (p.difficultyLevel || "medium") === diff.id).length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 pb-3 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  {lang === "ar" ? "الميزانية القصوى للمشروع:" : "Max Project Budget:"}
                </span>
                <span className="text-sm font-black text-rose-500 ms-2">
                  ${currentLimit}
                </span>
              </div>
              
              <div className="flex-1 flex items-center min-w-[200px] max-w-md w-full ms-auto">
                <input
                  type="range"
                  min="0"
                  max={highestPrice}
                  step="50"
                  value={currentLimit}
                  onChange={(e) => setBudgetLimit(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>

            {/* Main grid of cards animated with Framer Motion layout prop or skeleton screen loading */}
            {isLoadingProjects ? (
              <div className="w-full flex flex-col">
                <div className={`w-full max-w-sm mx-auto mb-8 h-1 overflow-hidden rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <motion.div
                    className="h-full bg-indigo-500 rounded-full w-1/2"
                    initial={{ x: "-100%" }}
                    animate={{ x: "250%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-[359px]:flex max-[359px]:flex-col max-[359px]:min-w-full" id="projects-skeleton-grid">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <ProjectCardSkeleton key={n} theme={theme} />
                  ))}
                </div>
              </div>
            ) : sortedProjects.length > 0 ? (
              <motion.div id="projects-skeleton-grid" layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-[359px]:flex max-[359px]:flex-col max-[359px]:min-w-full">
                <AnimatePresence>
                  {sortedProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ProjectCard 
                        project={project}
                        lang={lang}
                        theme={theme}
                        isFavorited={favorites.includes(project.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onViewDetails={setSelectedProject}
                        onPurchase={handlePurchaseOrder}
                        currentUser={currentUser}
                        isCompareMode={isCompareMode}
                        isCompared={compareProjectIds.includes(project.id)}
                        onToggleCompare={handleToggleCompare}
                        compareLimitReached={compareProjectIds.length >= 2}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="py-20 text-center border border-dashed border-slate-800 rounded-3xl text-slate-500">
                <Database className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                <p className="text-sm font-medium">{t.noProjectsFound}</p>
              </div>
            )}
          </div>
        )}

        {/* 3. CONSULTATIONS AI TAB */}
        {activeTab === "consultations" && (
          <div className="animate-fade-in">
            <ConsultationSection 
              lang={lang} 
              theme={theme}
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthOpen(true)}
              onConsultationSubmitted={triggerSmartFeedbackPrompt}
            />
          </div>
        )}

        {/* 4. STUDENT WORKSPACE TAB */}
        {activeTab === "student" && currentUser && (
          <div className="animate-fade-in">
            <UserDashboard 
              currentUser={currentUser}
              lang={lang}
              theme={theme}
              allProjects={projects}
              recentlyViewedIds={recentlyViewedIds}
              onViewDetails={setSelectedProject}
              onUpdateAvatar={handleUpdateAvatar}
            />
          </div>
        )}

        {/* 5. ADMIN WORKSPACE TAB */}
        {activeTab === "admin" && isAdmin && (
          <div className="animate-fade-in">
            <AdminDashboard 
              lang={lang}
              theme={theme}
              allProjects={projects}
              categories={categories}
              onRefreshProjects={fetchProjects}
              onRefreshCategories={fetchCategories}
            />
          </div>
        )}

        {/* SERVICES AND ABOUT COMPANY TAB */}
        {activeTab === "services" && (
          <div className="animate-fade-in">
            <AboutServicesSection 
              lang={lang} 
              theme={theme} 
              onSelectTab={(tab) => navigateTo(tab)}
            />
          </div>
        )}

        {/* 6. CONTACT SECTION TAB */}
        {activeTab === "contact" && (
          <div className="animate-fade-in">
            <ContactSection lang={lang} theme={theme} />
          </div>
        )}

        {/* 7. PRIVACY POLICY TAB */}
        {activeTab === "privacy" && (
          <div className="animate-fade-in">
            <PrivacyPolicy 
              lang={lang} 
              theme={theme} 
              onBack={() => navigateTo("home", "/")} 
            />
          </div>
        )}

        {/* 8. TERMS OF SERVICE TAB */}
        {activeTab === "terms" && (
          <div className="animate-fade-in">
            <TermsOfService 
              lang={lang} 
              theme={theme} 
              onBack={() => navigateTo("home", "/")} 
            />
          </div>
        )}

      </main>

      {/* Footer Area */}
      <footer className={`border-t py-12 transition-colors duration-300 ${
        theme === "dark" ? "bg-slate-950 border-slate-900 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-700 shadow-xs"
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5 text-center md:text-left rtl:md:text-right">
            <img 
              src="/logo.png" 
              alt="CardioVision Logo" 
              className="w-12 h-12 object-contain shrink-0" 
              referrerPolicy="no-referrer"
              id="footer-brand-logo"
            />
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-300 text-sm">CardioVision Platform</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-500 mt-1">
                © 2026 CardioVision. {lang === "ar" ? "جميع الحقوق محفوظة. إدارة وإشراف CardioVision." : "All Rights Reserved. Administered by CardioVision."}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
            <button
              onClick={() => navigateTo("privacy", "/privacy")}
              className="hover:text-rose-500 transition-colors cursor-pointer"
              id="footer-privacy-btn"
            >
              {lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
            </button>
            <span>•</span>
            <button
              onClick={() => navigateTo("terms", "/terms")}
              className="hover:text-rose-500 transition-colors cursor-pointer"
              id="footer-terms-btn"
            >
              {lang === "ar" ? "شروط الاستخدام" : "Terms of Service"}
            </button>
            <span>•</span>
            <span>{lang === "ar" ? "الدعم والواتساب:" : "WhatsApp Support:"} 0964809575</span>
            <span>•</span>
            <span>{lang === "ar" ? "سيريتيل كاش:" : "Syriatel Cash:"} 0982257195</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setIsSmartFeedbackPrompt(false);
                setIsPlatformFeedbackOpen(true);
              }}
              className="text-amber-500 hover:text-amber-400 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              id="footer-rate-platform-btn"
              title={lang === "ar" ? "تقييم منصة CardioVision" : "Rate CardioVision Platform"}
            >
              <span>⭐</span>
              <span>{lang === "ar" ? "قيّم تجربتك مع CardioVision" : "Rate CardioVision"}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Compare Modal */}
      <ProjectCompareModal 
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        projects={compareProjects}
        lang={lang}
        theme={theme}
      />

      {/* Floating Compare Action Bar */}
      <AnimatePresence>
        {isCompareMode && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl shadow-2xl backdrop-blur-md border flex flex-col gap-2.5 w-[92%] max-w-lg bg-slate-950/95 border-slate-700/60"
            id="floating-compare-bar"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-sm">
                    {lang === "ar" ? "وضع المقارنة مفعل" : "Compare Mode Active"}
                  </span>
                  {compareProjectIds.length === 2 && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse shrink-0"
                      id="compare-limit-badge"
                    >
                      {lang === "ar" ? "الحد الأقصى (2/2)" : "Limit (2/2)"}
                    </span>
                  )}
                </div>
                <span className="text-slate-400 text-xs">
                  {compareProjectIds.length} / 2 {lang === "ar" ? "تم تحديدهم" : "selected"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {lastClearedCompareIds.length > 0 && compareProjectIds.length === 0 && (
                  <button
                    type="button"
                    onClick={handleUndoClearCompare}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1.5 transition-all shadow-sm"
                    id="bar-undo-compare-btn"
                    title={lang === "ar" ? "تراجع عن إلغاء التحديد" : "Undo clear selection"}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "تراجع" : "Undo"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClearCompare}
                  disabled={compareProjectIds.length === 0}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  id="clear-compare-btn"
                  title={
                    compareProjectIds.length === 2
                      ? lang === "ar"
                        ? "إلغاء تحديد المشروعين للبدء من جديد"
                        : "Clear both projects to start over"
                      : lang === "ar"
                      ? "إلغاء التحديد الحالي"
                      : "Clear selection"
                  }
                >
                  {lang === "ar" ? "إلغاء التحديد" : "Clear"}
                </button>
                <button
                  disabled={compareProjectIds.length !== 2}
                  onClick={() => setIsCompareModalOpen(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md ${
                    compareProjectIds.length === 2
                      ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30 cursor-pointer"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                  id="open-compare-modal-btn"
                >
                  {lang === "ar" ? "قارن الآن" : "Compare Now"}
                </button>
              </div>
            </div>

            {/* Informational Tooltip / Label when 2-project limit is reached */}
            <AnimatePresence>
              {compareProjectIds.length === 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px] text-slate-300 overflow-hidden"
                  id="compare-limit-helper"
                >
                  <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
                    <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>
                      {lang === "ar"
                        ? "وصلت للحد الأقصى: اضغط 'إلغاء التحديد' بالأعلى أو انقر على أي مشروع لإلغائه وتغيير اختيارك."
                        : "Limit reached: Click 'Clear' above or click any selected project to deselect and choose again."}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCompare}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-2 shrink-0 cursor-pointer"
                    id="compare-limit-clear-link"
                  >
                    {lang === "ar" ? "مسح التحديد" : "Clear now"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL POPUP */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal 
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            lang={lang}
            theme={theme}
            currentUser={currentUser}
            onPurchase={handlePurchaseOrder}
            onOpenConsult={() => navigateTo("consultations")}
            onOpenAuth={() => setIsAuthOpen(true)}
            allProjects={projects}
            onSelectProject={setSelectedProject}
          />
        )}
      </AnimatePresence>

      {/* AUTHENTICATION MODAL */}
      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal 
            onClose={() => setIsAuthOpen(false)}
            lang={lang}
            theme={theme}
            onLoginSuccess={handleLoginSuccess}
            prefetchedClientId={googleClientId}
          />
        )}
      </AnimatePresence>

      {/* AI PROJECT ADVISOR MODAL */}
      <AnimatePresence>
        {isAiAdvisorOpen && (
          <AiProjectAdvisorModal
            isOpen={isAiAdvisorOpen}
            onClose={() => setIsAiAdvisorOpen(false)}
            lang={lang}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* SYRIATEL CASH PAYMENT MODAL */}
      {activePaymentOrder && (
        <SyriatelPaymentModal 
          order={activePaymentOrder}
          isOpen={Boolean(activePaymentOrder)}
          onClose={() => {
            setActivePaymentOrder(null);
            navigateTo("student");
          }}
          lang={lang}
          theme={theme}
          onSuccess={() => {
            setActivePaymentOrder(null);
            triggerSystemAlert(lang === "ar" ? "تم رفع إيصال التحويل بنجاح! طلبك قيد المراجعة لدى إدارة المنصة." : "Receipt uploaded successfully! Order is under review.");
            navigateTo("student");
            triggerSmartFeedbackPrompt();
          }}
        />
      )}

      {/* Floating Glassmorphic Mobile Bottom Navigation Bar */}
      <div 
        className="md:hidden fixed bottom-2.5 start-2 end-2 sm:start-4 sm:end-4 z-40 max-w-md mx-auto pointer-events-none"
        id="mobile-bottom-nav-wrapper"
      >
        <nav 
          className={`pointer-events-auto flex items-center justify-around w-full px-1 py-1.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 overflow-x-hidden ${
            theme === "dark" 
              ? "bg-slate-950/95 border-slate-800/90 text-slate-400 shadow-black/60" 
              : "bg-white/95 border-slate-200/90 text-slate-600 shadow-slate-900/10"
          }`}
          style={{ overflowX: "hidden" }}
          aria-label={lang === "ar" ? "شريط التنقل السفلي" : "Mobile Navigation"}
        >
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => navigateTo("home")}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 group ${
              activeTab === "home" 
                ? "text-rose-500 font-black scale-105" 
                : "hover:text-slate-900 dark:hover:text-slate-300 opacity-80 hover:opacity-100"
            }`}
            title={lang === "ar" ? "الرئيسية" : "Home"}
          >
            <div className="relative flex items-center justify-center">
              <Home className="w-5 h-5 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
              {activeTab === "home" && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-rose-500" />
              )}
            </div>
            <span className="hidden min-[360px]:block text-[8.5px] sm:text-[9.5px] font-bold tracking-tight truncate max-w-full text-center leading-none mt-1">
              {lang === "ar" ? "الرئيسية" : "Home"}
            </span>
          </button>
          
          {/* 2. Projects */}
          <button
            type="button"
            onClick={() => navigateTo("projects")}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 group ${
              activeTab === "projects" 
                ? "text-rose-500 font-black scale-105" 
                : "hover:text-slate-900 dark:hover:text-slate-300 opacity-80 hover:opacity-100"
            }`}
            title={lang === "ar" ? "المشاريع" : "Projects"}
          >
            <div className="relative flex items-center justify-center">
              <Layers className="w-5 h-5 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
              {activeTab === "projects" && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-rose-500" />
              )}
            </div>
            <span className="hidden min-[360px]:block text-[8.5px] sm:text-[9.5px] font-bold tracking-tight truncate max-w-full text-center leading-none mt-1">
              {lang === "ar" ? "المشاريع" : "Projects"}
            </span>
          </button>

          {/* 3. Services */}
          <button
            type="button"
            onClick={() => navigateTo("services")}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 group ${
              activeTab === "services" 
                ? "text-rose-500 font-black scale-105" 
                : "hover:text-slate-900 dark:hover:text-slate-300 opacity-80 hover:opacity-100"
            }`}
            title={lang === "ar" ? "خدماتنا" : "Services"}
          >
            <div className="relative flex items-center justify-center">
              <Wrench className="w-5 h-5 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
              {activeTab === "services" && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-rose-500" />
              )}
            </div>
            <span className="hidden min-[360px]:block text-[8.5px] sm:text-[9.5px] font-bold tracking-tight truncate max-w-full text-center leading-none mt-1">
              {lang === "ar" ? "خدماتنا" : "Services"}
            </span>
          </button>

          {/* 4. AI Consult */}
          <button
            type="button"
            onClick={() => navigateTo("consultations")}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 group ${
              activeTab === "consultations" 
                ? "text-rose-500 font-black scale-105" 
                : "hover:text-slate-900 dark:hover:text-slate-300 opacity-80 hover:opacity-100"
            }`}
            title={lang === "ar" ? "استشارة AI" : "AI Consult"}
          >
            <div className="relative flex items-center justify-center">
              <Cpu className="w-5 h-5 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
              {activeTab === "consultations" && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-rose-500" />
              )}
            </div>
            <span className="hidden min-[360px]:block text-[8.5px] sm:text-[9.5px] font-bold tracking-tight truncate max-w-full text-center leading-none mt-1">
              {lang === "ar" ? "استشارة AI" : "Consult"}
            </span>
          </button>

          {/* 5. Contact */}
          <button
            type="button"
            onClick={() => navigateTo("contact")}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 group ${
              activeTab === "contact" 
                ? "text-rose-500 font-black scale-105" 
                : "hover:text-slate-900 dark:hover:text-slate-300 opacity-80 hover:opacity-100"
            }`}
            title={lang === "ar" ? "اتصل بنا" : "Contact"}
          >
            <div className="relative flex items-center justify-center">
              <MessageSquare className="w-5 h-5 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
              {activeTab === "contact" && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-rose-500" />
              )}
            </div>
            <span className="hidden min-[360px]:block text-[8.5px] sm:text-[9.5px] font-bold tracking-tight truncate max-w-full text-center leading-none mt-1">
              {lang === "ar" ? "اتصل بنا" : "Contact"}
            </span>
          </button>

          {/* 6. Profile / Auth */}
          {currentUser ? (
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 group ${
                isProfileModalOpen || activeTab === "student" || activeTab === "admin"
                  ? "text-indigo-400 font-black scale-105" 
                  : "hover:text-slate-900 dark:hover:text-slate-300 opacity-80 hover:opacity-100"
              }`}
              title={lang === "ar" ? "الملف الشخصي" : "Profile"}
              id="mobile-bottom-profile-btn"
            >
              <div className="relative flex items-center justify-center">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-5 h-5 sm:w-5 sm:h-5 rounded-full object-cover border border-rose-500/70"
                  />
                ) : (
                  <div className="w-5 h-5 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 text-white text-[9px] font-black flex items-center justify-center">
                    {currentUser.name?.[0] || "U"}
                  </div>
                )}
                {(isProfileModalOpen || activeTab === "student" || activeTab === "admin") && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-indigo-500" />
                )}
              </div>
              <span className="hidden min-[360px]:block text-[8.5px] sm:text-[9.5px] font-bold tracking-tight truncate max-w-full text-center leading-none mt-1">
                {lang === "ar" ? "ملفي" : "Profile"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 group text-rose-500 hover:text-rose-400"
              title={lang === "ar" ? "تسجيل الدخول" : "Sign In"}
              id="mobile-bottom-login-btn"
            >
              <div className="relative flex items-center justify-center">
                <LogIn className="w-5 h-5 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
              </div>
              <span className="hidden min-[360px]:block text-[8.5px] sm:text-[9.5px] font-bold tracking-tight truncate max-w-full text-center leading-none mt-1">
                {lang === "ar" ? "دخول" : "Login"}
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* User Profile Card Modal (Directly opened when clicking avatar or profile button) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        lang={lang}
        theme={theme}
        onUpdateAvatar={handleUpdateAvatar}
        onNavigateToDesk={() => navigateTo(isAdmin ? "admin" : "student")}
        onRequestLogout={() => setShowLogoutConfirmModal(true)}
        onOpenPlatformRate={() => {
          setIsSmartFeedbackPrompt(false);
          setIsPlatformFeedbackOpen(true);
        }}
        stats={{
          ordersCount: 0,
          favoritesCount: favorites.length,
          consultationsCount: 0
        }}
      />

      {/* App-level Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirmModal}
        onClose={() => setShowLogoutConfirmModal(false)}
        onConfirm={handleLogout}
        lang={lang}
        theme={theme}
      />

      {/* CardioVision Platform Rating Modal */}
      <RateExperienceModal
        isOpen={isPlatformFeedbackOpen}
        onClose={() => setIsPlatformFeedbackOpen(false)}
        currentUser={currentUser}
        language={lang}
        theme={theme}
        onLoginRequest={() => {
          setIsPlatformFeedbackOpen(false);
          setIsAuthOpen(true);
        }}
        onFeedbackSubmitted={() => {
          triggerSystemAlert(lang === "ar" ? "تم إرسال وحفظ التقييم بنجاح! شكراً لمساهمتك." : "Your feedback has been submitted successfully! Thank you.");
        }}
        isSmartPrompt={isSmartFeedbackPrompt}
        onLater={() => {
          setIsPlatformFeedbackOpen(false);
        }}
      />

    </div>
    </MaintenanceGuard>
  );
}
