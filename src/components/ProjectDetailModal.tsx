import React, { useState, useEffect } from "react";
import { 
  X, 
  Video, 
  CheckCircle, 
  BookOpen, 
  MapPin, 
  Clock, 
  ShoppingCart, 
  MessageSquare, 
  Star, 
  User, 
  Send,
  Trash2,
  Sparkles,
  Loader2,
  Bot,
  AlertCircle,
  RefreshCw,
  Share2,
  Milestone,
  ArrowRightCircle,
  MessageCircle, Heart, Eye
} from "lucide-react";
import { Project } from "../types";
import DifficultyBadge from "./DifficultyBadge";

function ProjectAiQaSection({ projectId, lang, theme }: { projectId: string; lang: "ar" | "en"; theme: "dark" | "light" }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ai/project-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, question, lang })
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setAnswer(data.answer);
      } else {
        setAnswer(lang === "ar" ? "تعذر الرد، يرجى إعادة المحاولة." : "Could not get an answer, please try again.");
      }
    } catch (err: any) {
      setAnswer(err.message || "حدث خطأ في الاتصال.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleAsk} className="flex gap-2">
        <input 
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={lang === "ar" ? "مثال: كيف يتم ربط الحساس مع اللوحة؟" : "e.g., How to connect sensor to ESP32?"}
          className={`flex-1 text-xs border outline-none rounded-xl px-3 py-2 ${
            theme === "dark" 
              ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-rose-500" 
              : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-rose-500"
          }`}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-90 text-white font-bold text-xs disabled:opacity-40 flex items-center gap-1 shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" /> : <Bot className="w-3.5 h-3.5 shrink-0" />}
          <span>{lang === "ar" ? "اسأل" : "Ask"}</span>
        </button>
      </form>

      {answer && (
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 dark:bg-slate-900/50 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed animate-fade-in">
          <span className="font-black text-indigo-700 dark:text-indigo-400 block mb-1">🤖 {lang === "ar" ? "إجابة المساعد الفني:" : "Technical Response:"}</span>
          <div className="prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
}

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
  lang: "ar" | "en";
  theme: "dark" | "light";
  currentUser: any;
  onPurchase: (projectId: string) => void;
  onOpenConsult: () => void;
  onOpenAuth?: () => void;
  allProjects?: Project[];
  onSelectProject?: (project: Project) => void;
}

const getYouTubeEmbedUrl = (url?: string) => {
  if (!url) return "";
  if (url.includes("/embed/")) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
};


export default function ProjectDetailModal({
  project,
  onClose,
  lang,
  theme,
  currentUser,
  onPurchase,
  onOpenConsult,
  onOpenAuth,
  allProjects = [],
  onSelectProject,
}: ProjectDetailModalProps) {
  const recommendedProjects = (allProjects || [])
    .filter(p => p.id !== project.id && p.category === project.category)
    .slice(0, 3);

  const [reviews, setReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");
  const [guestName, setGuestName] = useState<string>("");
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Direct PostgreSQL rating states
  const [userExistingRating, setUserExistingRating] = useState<number | null>(null);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState<boolean>(false);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string | null>(null);
  const [ratingErrorMsg, setRatingErrorMsg] = useState<string | null>(null);
  const [localViews, setLocalViews] = useState<number>(project.viewsCount || 0);
  const [localLikes, setLocalLikes] = useState<number>(project.likesCount || 0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const initInteractions = async () => {
      try {
        const res = await fetch(`/api/projects/${project.id}/view`, { method: "PATCH" });
        const data = await res.json();
        if (data.success && isMounted) {
          setLocalViews(data.viewsCount);
        }
      } catch (err) {}
      
      if (currentUser?.id || currentUser?.userId) {
        const uid = currentUser.id || currentUser.userId;
        try {
          const res = await fetch(`/api/favorites?userId=${uid}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.favorites) && isMounted) {
            setIsLiked(data.favorites.includes(project.id));
          }
        } catch(err) {}
      }
    };
    initInteractions();
    return () => { isMounted = false; };
  }, [project.id, currentUser]);

  const handleLikeToggle = async () => {
    const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
    if (!token) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    const prevLiked = isLiked;
    const prevLikes = localLikes;
    
    setIsLiked(!prevLiked);
    setLocalLikes(prev => prevLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
      const res = await fetch(`/api/projects/${project.id}/like`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIsLiked(data.isLiked);
        setLocalLikes(data.likesCount);
      } else {
        setIsLiked(prevLiked);
        setLocalLikes(prevLikes);
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLocalLikes(prevLikes);
    }
  };

  const fetchUserRating = async () => {
    const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/projects/${project.id}/my-review`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.review) {
        setUserExistingRating(data.review.rating);
        setNewRating(data.review.rating);
      }
    } catch (e) {
      // silent
    }
  };

  const handleDirectRatingSubmit = async (star: number) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setIsRatingSubmitting(true);
    setRatingSuccessMsg(null);
    setRatingErrorMsg(null);
    try {
      const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/projects/${project.id}/reviews`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ rating: star })
      });
      const data = await res.json();
      if (data.success) {
        setUserExistingRating(star);
        setNewRating(star);
        setRatingSuccessMsg(lang === "ar" ? `تم حفظ تقييمك (${star} نجوم) في قاعدة بيانات PostgreSQL بنجاح!` : `Rating (${star} stars) saved successfully!`);
        setTimeout(() => setRatingSuccessMsg(null), 4000);
        if (data.averageRating) {
          project.rating = data.averageRating;
        }
        if (data.reviewsCount !== undefined) {
          project.reviewsCount = data.reviewsCount;
        }
      } else {
        setRatingErrorMsg(data.error || (lang === "ar" ? "تعذر حفظ التقييم، يرجى المحاولة مرة أخرى." : "Failed to save rating"));
        setTimeout(() => setRatingErrorMsg(null), 4000);
      }
    } catch (e) {
      setRatingErrorMsg(lang === "ar" ? "تعذر حفظ التقييم، يرجى المحاولة مرة أخرى." : "Failed to save rating");
      setTimeout(() => setRatingErrorMsg(null), 4000);
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  // Fetch reviews for this project with live polling
  useEffect(() => {
    fetchReviews();
    fetchUserRating();
    const interval = setInterval(() => {
      fetchReviews();
    }, 4000);
    return () => clearInterval(interval);
  }, [project.id, currentUser?.id]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/comments`);
      const data = await res.json();
      if (data.success && Array.isArray(data.comments)) {
        setReviews(data.comments.map((c: any) => ({
          id: c.id,
          userName: c.userName || c.user_name,
          userAvatar: c.userAvatar || c.user_avatar || null,
          comment: c.commentText || c.content || c.reviewText || c.comment,
          rating: c.rating || 5,
          createdAt: c.createdAt || c.created_at,
          userId: c.userId || c.user_id
        })));
      }
    } catch (e) {
      console.error("❌ Error fetching comments from PostgreSQL:", e);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا التعليق؟" : "Are you sure you want to delete this comment?")) return;
    try {
      const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/comments/${reviewId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
        body: JSON.stringify({ requesterUserId: currentUser?.id })
      });
      const data = await res.json();
      if (data.success) {
        await fetchReviews();
      } else {
        console.error("❌ Delete Comment Error:", data.error);
      }
    } catch (e) {
      console.error("❌ Error deleting comment:", e);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setReviewLoading(true);
    setReviewSuccess(false);
    try {
      const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const payload: any = {
        projectId: project.id,
        rating: newRating,
        commentText: newComment.trim(),
        comment: newComment.trim(),
      };

      console.log("📤 Submitting comment payload:", payload);

      const res = await fetch(`/api/projects/${project.id}/comments`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("📥 Comment response from backend:", data);

      if (data.success) {
        setNewComment("");
        setNewRating(5);
        setGuestName("");
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 3000);
        await fetchReviews();
        if (data.averageRating) {
          project.rating = data.averageRating;
        }
      } else {
        console.error("❌ Failed to post comment:", data.error);
        alert(lang === "ar" ? `فشل نشر التعليق: ${data.error}` : `Failed to post comment: ${data.error}`);
      }
    } catch (err) {
      console.error("❌ Exception during comment submission:", err);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
      id="project-detail-modal"
    >
      <div 
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 md:p-8 relative ${
          theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-full bg-slate-950/20 dark:bg-slate-800 hover:opacity-80 transition-all text-slate-400 hover:text-slate-200"
          title={lang === "ar" ? "إغلاق" : "Close"}
        >
          <X className="w-5 h-5 shrink-0" />
        </button>

        {/* Header Title */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {project.category === "biomedical" ? (lang === "ar" ? "الهندسة الطبية" : "Biomedical") :
               project.category === "software" ? (lang === "ar" ? "البرمجيات والذكاء" : "Software & AI") :
               project.category === "electrical" ? (lang === "ar" ? "الكهرباء والتحكم" : "Electrical & Control") :
               project.category === "communications" ? (lang === "ar" ? "الاتصالات" : "Communications") :
               (lang === "ar" ? "الميكاترونكس" : "Mechatronics")}
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {lang === "ar" ? (project.projectTypeAr || "مشروع تخرج") : (project.projectTypeEn || "Graduation Project")}
            </span>

            {/* High-Tech Interactive Difficulty Badge */}
            <DifficultyBadge level={project.difficultyLevel} lang={lang} size="md" />

            {/* Special Badges */}
            {(project.isBestSeller || (project.salesCount && project.salesCount > 30)) && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 flex items-center gap-1 shadow-sm">
                🔥 {lang === "ar" ? "الأكثر مبيعاً" : "Best Seller"}
              </span>
            )}
            {(project.isMostViewed || (project.viewsCount && project.viewsCount > 1500)) && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-500 text-white flex items-center gap-1 shadow-sm">
                ⭐ {lang === "ar" ? "الأكثر مشاهدة" : "Most Viewed"}
              </span>
            )}
            {(project.isTopRated || (project.rating && project.rating >= 4.8)) && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                🏆 {lang === "ar" ? "الأعلى تقييماً" : "Top Rated"}
              </span>
            )}
          </div>
          <div className="flex items-start justify-between gap-4 mt-3">
            <h2 className={`text-xl md:text-3xl font-black ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}>
              {lang === "ar" ? project.titleAr : project.titleEn}
            </h2>
            <button
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(lang === "ar" ? `تحقق من هذا المشروع الهندسي الرائع: ${project.titleAr}` : `Check out this engineering project: ${project.titleEn}`);
                window.open(`https://api.whatsapp.com/send?text=${text}%0A${url}`, '_blank');
              }}
              className="p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95 bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white"
              title={lang === "ar" ? "مشاركة عبر واتساب" : "Share via WhatsApp"}
            >
              <Share2 className="w-5 h-5 shrink-0" />
            </button>
          </div>
          
          <div className={`flex flex-wrap items-center gap-4 text-xs font-bold mt-2.5 ${
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          }`}>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-500" />
              <span>{lang === "ar" ? (project.universityAr || "مؤسسة CardioVision") : (project.universityEn || "CardioVision Hub")}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
              <span>{lang === "ar" ? project.durationAr : project.durationEn}</span>
            </span>
            <span className="flex items-center gap-1" title={lang === "ar" ? "عدد المشاهدات" : "Views"}>
              <Eye className="w-4 h-4 shrink-0 text-indigo-400" /> <span className="font-mono text-slate-700 dark:text-slate-300">{localViews}</span>
            </span>
            <span className="flex items-center gap-1" title={lang === "ar" ? "طلبات الشراء" : "Purchases"}>
              <ShoppingCart className="w-3.5 h-3.5 shrink-0 text-emerald-500" /> <span className="font-mono text-slate-700 dark:text-slate-300">{project.salesCount || 12}</span>
            </span>
            <button 
              onClick={handleLikeToggle}
              className={`flex items-center gap-1 transition-all group ${isLiked ? 'text-rose-500' : 'hover:text-rose-400'}`}
              title={lang === "ar" ? "إعجاب" : "Like"}
            >
              <Heart className={`w-4 h-4 shrink-0 transition-all ${isLiked ? 'fill-current text-rose-500 scale-110' : 'text-slate-400 group-hover:scale-110'}`} /> 
              <span className={`font-mono ${isLiked ? 'text-rose-500 font-black' : 'text-slate-700 dark:text-slate-300'}`}>{localLikes}</span>
            </button>
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 shrink-0 fill-amber-400" />
              <span className="font-mono font-black">{project.rating || 4.8} / 5</span>
            </span>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Hand: Texts and Technical Specs */}
          <div className="space-y-6">
            
            {/* Description/Summary */}
            <div>
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
                💡 {lang === "ar" ? "نبذة كاملة ومخطط العمل" : "About & Architecture"}
              </h3>
              <p className={`text-xs leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                {lang === "ar" ? (project.detailsAr || project.descriptionAr) : (project.detailsEn || project.descriptionEn)}
              </p>
            </div>

            {/* Features list */}
            {project.featuresAr && project.featuresAr.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                  🚀 {lang === "ar" ? "الميزات والخصائص الفنية" : "Key Project Features"}
                </h3>
                <ul className="space-y-2">
                  {(lang === "ar" ? project.featuresAr : project.featuresEn).map((feat, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hardware parts used */}
            {project.componentsAr && project.componentsAr.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">
                  🛠️ {lang === "ar" ? "المكونات والعناصر المستخدمة" : "Electronic & Hardware Parts"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(lang === "ar" ? project.componentsAr : project.componentsEn).map((comp, index) => (
                    <span key={index} className={`text-[11px] px-3 py-1.5 rounded-xl border font-medium ${
                      theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}>
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Software used */}
            {project.softwareAr && project.softwareAr.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                  💻 {lang === "ar" ? "البرامج والبيئات المستخدمة" : "Software & Environments"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(lang === "ar" ? project.softwareAr : project.softwareEn).map((soft, index) => (
                    <span key={index} className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                      {soft}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Schematic details */}
            {project.diagramsAr && project.diagramsAr.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
                  📐 {lang === "ar" ? "مخطط التوصيلات (Schematic)" : "Wiring & Schematics"}
                </h3>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {(lang === "ar" ? project.diagramsAr : project.diagramsEn).map((diag, i) => (
                    <li key={i}>{diag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Implementation Steps (Visual Roadmap) */}
            {project.implementationAr && project.implementationAr.length > 0 && (
              <div className="mt-6 mb-4">
                <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Milestone className="w-4 h-4 shrink-0" />
                  {lang === "ar" ? "خارطة طريق التنفيذ" : "Execution Roadmap"}
                </h3>
                <div className="relative ps-4 sm:ps-6 border-s-2 border-indigo-500/20 space-y-6">
                  {(lang === "ar" ? project.implementationAr : project.implementationEn).map((step, index) => (
                    <div key={index} className="relative">
                      {/* Milestone Node */}
                      <span className="absolute -start-[23px] sm:-start-[31px] top-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-indigo-500 border-[3px] border-slate-900 shadow-[0_0_10px_rgba(99,102,241,0.5)] z-10" />
                      <div className={`p-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${
                        theme === "dark" 
                          ? "bg-slate-950/40 border-slate-800 hover:border-indigo-500/50" 
                          : "bg-white border-slate-200 hover:border-indigo-400 shadow-sm"
                      }`}>
                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-1">
                          {lang === "ar" ? "مرحلة" : "Phase"} 0{index + 1}
                        </div>
                        <p className={`text-xs sm:text-sm font-medium leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                          {step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Deliverables (Outputs) */}
            {project.outputsAr && project.outputsAr.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  🎁 {lang === "ar" ? "المخرجات التي ستستلمها مع المشروع" : "What is included (Deliverables)"}
                </h3>
                <ul className="space-y-1.5">
                  {(lang === "ar" ? project.outputsAr : project.outputsEn).map((out, index) => (
                    <li key={index} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technical AI QA Assistant for this specific project */}
            <div className={`p-4 rounded-2xl border ${
              theme === "dark" ? "bg-slate-950/80 border-slate-800" : "bg-indigo-50/60 border-indigo-200"
            }`}>
              <h3 className="text-xs font-black text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
                <span>{lang === "ar" ? "مساعد الذكاء الاصطناعي التقني للمشروع" : "Project AI Technical Assistant"}</span>
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                {lang === "ar" 
                  ? "اطرح أي سؤال تقني حول الربط، الحساسات أو الأكواد وسيجيبك المساعد فوراً:" 
                  : "Ask any technical question about pinouts, sensors, or code firmware:"}
              </p>

              <ProjectAiQaSection projectId={project.id} lang={lang} theme={theme} />
            </div>

          </div>

          {/* Right Hand: Video, Direct actions, and Reviews */}
          <div className="space-y-6">
            
            {/* Embedded Demonstration Video */}
            <div>
              <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Video className="w-4 h-4 shrink-0" />
                <span>{lang === "ar" ? "فيديو توضيحي للمشروع" : "Project Demonstration"}</span>
              </h3>
              
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-video shadow-lg">
                <iframe
                  src={getYouTubeEmbedUrl(project.videoUrl)}
                  title={lang === "ar" ? project.titleAr : project.titleEn}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                ></iframe>
              </div>
            </div>

            {/* Direct purchase action details */}
            <div className={`p-5 rounded-2xl border ${
              theme === "dark" ? "bg-slate-950/60 border-slate-800/80" : "bg-slate-100 border-slate-200"
            }`}>
              <h4 className={`font-extrabold text-sm mb-2 ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
                💵 {lang === "ar" ? "سعر المشروع الكامل والملفات:" : "Full Project Price & Files:"}
              </h4>
              <p className="text-2xl font-black text-rose-500 mb-3">
                ${(project?.price ?? (project as any)?.priceSyp ?? 0).toLocaleString()}
              </p>
              <p className={`text-[11px] leading-relaxed mb-4 ${theme === "dark" ? "text-slate-400" : "text-slate-700"}`}>
                {lang === "ar" 
                  ? "تواصل مباشرة لحجز وتنزيل الأكواد البرمجية، والمخططات المطبوعة PCB والمحاكاة، بالإضافة إلى ملف الوثيقة العلمية المتكاملة." 
                  : "Request immediate purchase. Includes complete source code, hardware connection maps, PCB printout files, and full scientific report."}
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={() => onPurchase(project.id)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs text-center flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  <span>{lang === "ar" ? "طلب شراء وتحميل الملفات" : "Place Purchase Order"}</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenConsult();
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs text-center block border ${
                    theme === "dark" 
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700" 
                      : "bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-xs"
                  }`}
                >
                  {lang === "ar" ? "استشارة تعديل أو إضافة ميزات للمشروع" : "Request Custom Modifications"}
                </button>
              </div>
            </div>

            {/* Ratings & Reviews Workspace */}
            <div className={`p-5 rounded-2xl border ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>{lang === "ar" ? "آراء وتعليقات الطلاب" : "Student Reviews & Feedback"}</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {reviews.length} {lang === "ar" ? "تعليق" : "reviews"}
                </span>
              </div>

              {/* Success badge for comment */}
              {reviewSuccess && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 shrink-0" />
                  <span>{lang === "ar" ? "تم نشر تعليقك وتقييمك بنجاح للجميع في PostgreSQL!" : "Review submitted successfully to PostgreSQL!"}</span>
                </div>
              )}

              {/* Direct Star Rating Section (Immediate 1-Click PostgreSQL Sync) */}
              <div className={`p-3.5 rounded-2xl border mb-4 space-y-2.5 ${
                theme === "dark" ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 shrink-0 text-amber-400 fill-amber-400" />
                      <span className={`text-xs font-black ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                        {lang === "ar" ? "تقييمك الأكاديمي للمشروع:" : "Your Rating for this Project:"}
                      </span>
                    </div>
                    {userExistingRating ? (
                      <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
                        {lang === "ar" 
                          ? `⭐ تقييمك المسجل حالياً: ${userExistingRating} من 5 نجوم (انقر لتعديله)` 
                          : `⭐ Your current rating: ${userExistingRating} of 5 stars (click to change)`}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                        {lang === "ar" 
                          ? "انقر على النجوم لحفظ تقييمك مباشرة في قاعدة بيانات PostgreSQL" 
                          : "Click stars to save your rating directly to PostgreSQL database"}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        disabled={isRatingSubmitting}
                        onClick={() => handleDirectRatingSubmit(star)}
                        className="text-amber-400 transition-all hover:scale-125 focus:outline-none p-1 disabled:opacity-50"
                        title={lang === "ar" ? `تقييم ${star} نجوم` : `Rate ${star} stars`}
                      >
                        <Star className={`w-4 h-4 ${star <= (newRating || userExistingRating || 5) ? "fill-amber-400 text-amber-400" : "opacity-30 text-slate-500"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating state messages */}
                {isRatingSubmitting && (
                  <div className="text-[11px] text-amber-400 flex items-center gap-1.5 font-bold animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin" />
                    <span>{lang === "ar" ? "جاري حفظ التقييم في PostgreSQL وتحديث إحصائيات المشروع..." : "Saving rating to PostgreSQL..."}</span>
                  </div>
                )}

                {ratingSuccessMsg && (
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0 shrink-0" />
                    <span>{ratingSuccessMsg}</span>
                  </div>
                )}

                {ratingErrorMsg && (
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 shrink-0" />
                    <span>{ratingErrorMsg}</span>
                  </div>
                )}
              </div>

              {/* Add comment / discussion form */}
              <form onSubmit={handleSubmitReview} className="space-y-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">

                {currentUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      {currentUser.avatarUrl ? (
                        <img
                          src={currentUser.avatarUrl}
                          alt={currentUser.name}
                          className="w-6 h-6 rounded-full object-cover border border-rose-500/40"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold flex items-center justify-center">
                          {currentUser.name?.[0] || "U"}
                        </div>
                      )}
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {lang === "ar" ? `التعليق باسم: ${currentUser.name}` : `Posting as: ${currentUser.name}`}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={lang === "ar" ? "اكتب تعليقك أو استفسارك وسيظهر فوراً للجميع..." : "Write your review..."}
                        className={`flex-1 text-xs border outline-none rounded-xl px-3.5 py-2.5 ${
                          theme === "dark" 
                            ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-rose-500" 
                            : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-rose-500"
                        }`}
                        required
                      />
                      <button
                        type="submit"
                        disabled={reviewLoading || !newComment.trim()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-90 text-white font-black text-xs disabled:opacity-40 flex items-center gap-1.5 shrink-0 shadow-md"
                      >
                        <Send className="w-3.5 h-3.5 shrink-0" />
                        <span>{lang === "ar" ? "نشر للجميع" : "Post"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2.5 ${
                    theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-slate-100 border-slate-200"
                  }`}>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {lang === "ar"
                        ? "يرجى تسجيل الدخول بحساب Google المعتمد لتتمكن من إضافة تقييم أو تعليق أكاديمي على المشروع."
                        : "Please sign in with your verified Google account to post a review or question."}
                    </p>
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>{lang === "ar" ? "تسجيل الدخول بواسطة Google" : "Sign in with Google"}</span>
                    </button>
                  </div>
                )}
              </form>

              {/* Reviews feedback items list */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto scrollbar-thin pe-1">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev.id} className={`p-3 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                      theme === "dark" 
                        ? "bg-slate-950 border-slate-800/80 hover:border-slate-700" 
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          {rev.userAvatar ? (
                            <img
                              src={rev.userAvatar}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {rev.userName?.[0] || "U"}
                            </div>
                          )}
                          <span className={`text-xs font-bold ${
                            theme === "dark" ? "text-indigo-300" : "text-indigo-900"
                          }`}>
                            {rev.userName}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {rev.createdAt && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(rev.createdAt).toLocaleDateString("ar-EG")}
                            </span>
                          )}
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < rev.rating ? "fill-current" : "opacity-25"}`} 
                              />
                            ))}
                          </div>
                          {(currentUser?.role === "admin" || (currentUser?.id && currentUser.id === rev.userId)) && (
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title={lang === "ar" ? "حذف التعليق" : "Delete comment"}
                            >
                              <Trash2 className="w-3 h-3 shrink-0" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className={`text-xs font-medium leading-relaxed ${
                        theme === "dark" ? "text-slate-200" : "text-slate-800"
                      }`}>{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
                    <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                      {lang === "ar" ? "لا توجد تعليقات على هذا المشروع حتى الآن. كن أول من يضيف انطباعه!" : "No reviews yet. Be the first to share your feedback!"}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* RECOMMENDED PROJECTS SECTION */}
            {recommendedProjects.length > 0 && (
              <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-rose-500" />
                    <h3 className={`text-sm font-black uppercase tracking-wider ${
                      theme === "dark" ? "text-slate-200" : "text-slate-800"
                    }`}>
                      {lang === "ar" ? "مشاريع مقترحة من نفس التخصص" : "Recommended Projects in this Category"}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {recommendedProjects.length} {lang === "ar" ? "مقترح" : "suggested"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {recommendedProjects.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => onSelectProject?.(rec)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                        theme === "dark"
                          ? "bg-slate-900/70 border-slate-800 hover:border-rose-500/50 hover:bg-slate-900"
                          : "bg-slate-50/80 border-slate-200 hover:border-rose-500/50 hover:bg-white"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            {rec.category}
                          </span>
                          <span className="text-[11px] font-extrabold text-amber-500 flex items-center gap-0.5">
                            ★ {(rec.rating || 5.0).toFixed(1)}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold line-clamp-2 group-hover:text-rose-500 transition-colors">
                          {lang === "ar" ? rec.titleAr : rec.titleEn}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {lang === "ar" ? rec.descriptionAr : rec.descriptionEn}
                        </p>
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between text-[11px]">
                        <span className="font-mono font-black text-rose-600 dark:text-rose-400">
                          {rec.price?.toLocaleString()} {lang === "ar" ? "ل.س" : "SYP"}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-500 group-hover:underline">
                          {lang === "ar" ? "عرض التفاصيل ←" : "View Details →"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
