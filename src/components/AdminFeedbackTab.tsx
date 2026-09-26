import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Star, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Trash2, 
  Send, 
  Check, 
  Sparkles, 
  Calendar, 
  User, 
  TrendingUp, 
  Eye, 
  CornerDownLeft,
  XCircle,
  Archive,
  Clock,
  Download,
  Flag,
  CheckSquare,
  Square,
  Zap,
  BarChart2
} from "lucide-react";
import { PlatformFeedback, FeedbackStats, FeedbackStatus } from "../types";
import { feedbackService } from "../services/feedbackService";
import { RatingTrendsChart } from "./RatingTrendsChart";

interface AdminFeedbackTabProps {
  lang: "ar" | "en";
  theme?: "dark" | "light";
}

export const AdminFeedbackTab: React.FC<AdminFeedbackTabProps> = ({ lang, theme = "dark" }) => {
  const isAr = lang === "ar";

  // Data states
  const [feedbackList, setFeedbackList] = useState<PlatformFeedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters and pagination
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Reply drawer/modal state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);

  // Export CSV state
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Bulk action selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);

  // 3-second subtle pulsing animation state for newly added entries
  const [pulsingIds, setPulsingIds] = useState<Set<string>>(new Set());
  const prevFeedbackIdsRef = useRef<Set<string>>(new Set());

  // Show/hide Rating Trends chart toggle
  const [showTrendsChart, setShowTrendsChart] = useState<boolean>(true);

  // Load Feedback Data
  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedbackService.getAdminFeedback({
        page,
        limit,
        rating: ratingFilter,
        status: statusFilter,
        search: search.trim(),
        dateFilter
      });

      if (res.success) {
        setFeedbackList(res.feedback);
        setTotalPages(res.pagination.totalPages || 1);
        setTotalCount(res.pagination.total || 0);
      } else {
        setError(res.error || (isAr ? "فشل استرجاع التقييمات" : "Failed to load feedback"));
      }
    } catch (e: any) {
      setError(e.message || (isAr ? "خطأ في الاتصال بالخادم" : "Network error"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, ratingFilter, statusFilter, search, dateFilter, isAr]);

  // Load Stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await feedbackService.getAdminFeedbackStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (e) {
      console.error("Failed to load feedback stats", e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Initial and reactive fetch
  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 3-second subtle pulsing animation when new entries arrive
  useEffect(() => {
    if (feedbackList.length === 0) return;

    const currentIds = new Set(feedbackList.map(item => item.id));

    // Detect newly appeared items when comparing against previous list
    if (prevFeedbackIdsRef.current.size > 0) {
      const brandNewIds: string[] = [];
      feedbackList.forEach(item => {
        if (!prevFeedbackIdsRef.current.has(item.id)) {
          brandNewIds.push(item.id);
        }
      });

      if (brandNewIds.length > 0) {
        setPulsingIds(prev => new Set([...Array.from(prev), ...brandNewIds]));
        const timer = setTimeout(() => {
          setPulsingIds(prev => {
            const next = new Set(prev);
            brandNewIds.forEach(id => next.delete(id));
            return next;
          });
        }, 3000); // 3 seconds pulsing duration
        return () => clearTimeout(timer);
      }
    } else {
      // First load: pulse any item created within the last 30 minutes that is NEW
      const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
      const initialNew = feedbackList
        .filter(item => item.status === "NEW" && new Date(item.createdAt).getTime() > thirtyMinAgo)
        .map(i => i.id);

      if (initialNew.length > 0) {
        setPulsingIds(new Set(initialNew));
        const timer = setTimeout(() => {
          setPulsingIds(new Set());
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    prevFeedbackIdsRef.current = currentIds;
  }, [feedbackList]);

  // Real-time SSE listener for instant feedback updates
  useEffect(() => {
    const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
    const sseUrl = token ? `/api/admin/events?token=${encodeURIComponent(token)}` : "/api/admin/events";
    let es: EventSource | null = null;
    try {
      es = new EventSource(sseUrl);
      es.addEventListener("FEEDBACK_SUBMITTED", (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data);
          if (data && data.id) {
            // Add ID to pulsing set for 3 seconds
            setPulsingIds(prev => new Set([...Array.from(prev), data.id]));
            setTimeout(() => {
              setPulsingIds(prev => {
                const next = new Set(prev);
                next.delete(data.id);
                return next;
              });
            }, 3000);
            fetchFeedback();
            fetchStats();
          }
        } catch (e) {
          console.error("SSE parse error:", e);
        }
      });
    } catch (err) {
      console.warn("SSE connection error:", err);
    }
    return () => {
      if (es) es.close();
    };
  }, [fetchFeedback, fetchStats]);

  // Manual test trigger to preview the 3-second pulsing animation on the newest item
  const handleTriggerPulseTest = () => {
    if (feedbackList.length === 0) return;
    const targetId = feedbackList[0].id;
    setPulsingIds(prev => new Set([...Array.from(prev), targetId]));
    setSuccess(isAr ? "تم تفعيل تأثير الوميض للتقييم الأحدث لمدة 3 ثوانٍ ✨" : "Pulsing animation triggered for 3 seconds ✨");
    setTimeout(() => {
      setPulsingIds(prev => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
      setSuccess(null);
    }, 3000);
  };

  // Export Feedback CSV handler
  const handleExportCsv = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const res = await feedbackService.exportFeedbackCsv();
      if (res.success) {
        setSuccess(isAr ? "تم تصدير ملف التقييمات بنجاح بصيغة CSV" : "Feedback CSV exported successfully");
        setTimeout(() => setSuccess(null), 3500);
      } else {
        setError(res.error || (isAr ? "فشل تصدير التقييمات" : "Failed to export CSV"));
      }
    } catch (e: any) {
      setError(e.message || "Export error");
    } finally {
      setIsExporting(false);
    }
  };

  // Toggle selection for an individual item
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Toggle Select All / Deselect All on current page
  const handleToggleSelectAll = () => {
    if (selectedIds.length === feedbackList.length && feedbackList.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(feedbackList.map(item => item.id));
    }
  };

  // Bulk Flag for Review
  const handleBulkFlag = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      const res = await feedbackService.bulkAction(selectedIds, "flag", "REVIEWED");
      if (res.success) {
        setSuccess(
          isAr
            ? `تم تمييز ${res.affectedCount || selectedIds.length} تقييم للمراجعة بنجاح`
            : `Flagged ${res.affectedCount || selectedIds.length} feedback items for review`
        );
        // Update local status
        setFeedbackList(prev =>
          prev.map(item => selectedIds.includes(item.id) ? { ...item, status: "REVIEWED" } : item)
        );
        setSelectedIds([]);
        fetchStats();
        setTimeout(() => setSuccess(null), 3500);
      } else {
        setError(res.error || (isAr ? "فشل تحديث التقييمات المحددة" : "Failed to flag selected items"));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmMsg = isAr
      ? `هل أنت متأكد من حذف ${selectedIds.length} تقييم نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.`
      : `Are you sure you want to permanently delete ${selectedIds.length} feedback items? This action cannot be undone.`;
    
    if (!window.confirm(confirmMsg)) return;

    setIsBulkProcessing(true);
    try {
      const res = await feedbackService.bulkAction(selectedIds, "delete");
      if (res.success) {
        setSuccess(
          isAr
            ? `تم حذف ${res.affectedCount || selectedIds.length} تقييم بنجاح`
            : `Successfully deleted ${res.affectedCount || selectedIds.length} feedback items`
        );
        // Remove from local list
        setFeedbackList(prev => prev.filter(item => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        fetchStats();
        setTimeout(() => setSuccess(null), 3500);
      } else {
        setError(res.error || (isAr ? "فشل حذف التقييمات المحددة" : "Failed to delete selected items"));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Handle individual status update
  const handleStatusChange = async (id: string, newStatus: FeedbackStatus) => {
    try {
      const res = await feedbackService.updateStatus(id, newStatus);
      if (res.success) {
        setSuccess(isAr ? "تم تحديث حالة التقييم بنجاح" : "Status updated successfully");
        setFeedbackList(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(res.error || (isAr ? "فشل التحديث" : "Failed to update"));
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Handle Feature Toggle
  const handleToggleFeature = async (id: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      const res = await feedbackService.toggleFeature(id, nextStatus);
      if (res.success) {
        setSuccess(nextStatus ? (isAr ? "تم تمييز التقييم للعرض العام" : "Featured for public display") : (isAr ? "تم إلغاء التمييز" : "Unfeatured"));
        setFeedbackList(prev => prev.map(item => item.id === id ? { ...item, isFeatured: nextStatus } : item));
        fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(res.error || (isAr ? "فشل تعديل التمييز" : "Failed to toggle feature"));
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Handle individual delete
  const handleDelete = async (id: string) => {
    if (!window.confirm(isAr ? "هل أنت متأكد من حذف هذا التقييم نهائياً من قاعدة البيانات؟" : "Are you sure you want to permanently delete this feedback?")) {
      return;
    }

    try {
      const res = await feedbackService.deleteFeedback(id);
      if (res.success) {
        setSuccess(isAr ? "تم حذف التقييم نهائياً" : "Feedback deleted");
        setFeedbackList(prev => prev.filter(item => item.id !== id));
        fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(res.error || (isAr ? "فشل حذف التقييم" : "Failed to delete"));
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Handle Submit Reply
  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    try {
      const res = await feedbackService.reply(id, replyText.trim());
      if (res.success && res.feedback) {
        setSuccess(isAr ? "تم إرسال وحفظ الرد بنجاح وإشعار المستخدم" : "Reply sent and user notified");
        setFeedbackList(prev => prev.map(item => item.id === id ? { 
          ...item, 
          adminReply: res.feedback?.adminReply, 
          repliedAt: res.feedback?.repliedAt,
          status: "REPLIED" 
        } : item));
        setReplyingToId(null);
        setReplyText("");
        fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(res.error || (isAr ? "فشل إرسال الرد" : "Failed to send reply"));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Banner & Title & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>{isAr ? "تقييمات وآراء المستخدمين في المنصة" : "Platform User Feedback & Ratings"}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                PostgreSQL Live
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr 
                ? "متابعة تجارب الطلاب والمهندسين الحقيقية، والرد المباشر، وتصدير التقارير، والعمليات الجماعية" 
                : "Real-time user feedback tracking, rating trends analysis, CSV exports, and batch moderation"}
            </p>
          </div>
        </div>

        {/* Action Buttons: Export Feedback CSV, Refresh, Pulse Test */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export Feedback Button */}
          <button
            id="btn-export-feedback-csv"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold transition-all border border-emerald-500/30 flex items-center gap-2 disabled:opacity-50 shadow-sm"
            title={isAr ? "تصدير جميع التقييمات كملف CSV عبر المسار المباشر" : "Stream feedback CSV via /api/admin/export/feedback"}
          >
            {isExporting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{isAr ? "تصدير التقييمات CSV" : "Export Feedback"}</span>
          </button>

          {/* Toggle Rating Trends Chart */}
          <button
            id="btn-toggle-rating-trends"
            onClick={() => setShowTrendsChart(prev => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              showTrendsChart
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isAr ? "منحنى التوجهات" : "Rating Trends"}</span>
          </button>

          {/* Simulate/Test 3s Pulse Animation */}
          {feedbackList.length > 0 && (
            <button
              id="btn-test-pulse-animation"
              onClick={handleTriggerPulseTest}
              className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all border border-amber-500/20 flex items-center gap-1.5"
              title={isAr ? "محاكاة تأثير الوميض للتقييم الأحدث لمدة 3 ثوانٍ" : "Test 3-second pulsing animation on the newest entry"}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? "وميض 3 ثوانٍ" : "Test 3s Pulse"}</span>
            </button>
          )}

          {/* Refresh Data */}
          <button
            id="btn-refresh-feedback-stats"
            onClick={() => { fetchFeedback(); fetchStats(); }}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            <span>{isAr ? "تحديث" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards & Star Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Average Rating Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>{isAr ? "متوسط التقييم العام" : "Average Rating"}</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="my-3 flex items-baseline gap-3">
              <span className="text-4xl font-black text-amber-400 font-mono">
                {stats.averageRating ? stats.averageRating.toFixed(1) : "5.0"}
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(stats.averageRating || 5)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              {isAr ? `من إجمالي ${stats.totalFeedback} تقييم مسجل` : `From ${stats.totalFeedback} verified submissions`}
            </div>
          </div>

          {/* Stars Distribution Mini Bars */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
            <div className="text-slate-400 text-xs font-bold mb-1">
              {isAr ? "توزيع النجوم" : "Star Distribution"}
            </div>
            {[5, 4, 3, 2, 1].map((s) => {
              const count = (stats.starsBreakdown as any)[s] || 0;
              const pct = stats.totalFeedback > 0 ? Math.round((count / stats.totalFeedback) * 100) : 0;
              return (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="w-6 font-mono text-slate-400 flex items-center gap-0.5">
                    {s} <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        s >= 4 ? "bg-emerald-500" : s === 3 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 font-mono text-slate-500 text-[11px] text-left">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Activity Over Time */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>{isAr ? "نشاط الإرسال" : "Submission Activity"}</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="my-2 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60">
                <span className="text-slate-400">{isAr ? "اليوم:" : "Today:"}</span>
                <span className="font-mono font-bold text-emerald-400">+{stats.periodCounts.today}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60">
                <span className="text-slate-400">{isAr ? "آخر 7 أيام:" : "Last 7 days:"}</span>
                <span className="font-mono font-bold text-blue-400">+{stats.periodCounts.week}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60">
                <span className="text-slate-400">{isAr ? "آخر 30 يوماً:" : "Last 30 days:"}</span>
                <span className="font-mono font-bold text-indigo-400">+{stats.periodCounts.month}</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown & Featured */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>{isAr ? "حالات المراجعة" : "Moderation Pipeline"}</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="grid grid-cols-2 gap-2 my-2 text-xs">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <div className="text-[10px] text-amber-300 font-bold">{isAr ? "جديد" : "NEW"}</div>
                <div className="text-lg font-black text-amber-400 font-mono">{stats.statusCounts.new}</div>
              </div>
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                <div className="text-[10px] text-blue-300 font-bold">{isAr ? "تم الرد" : "REPLIED"}</div>
                <div className="text-lg font-black text-blue-400 font-mono">{stats.statusCounts.replied}</div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-[10px] text-emerald-300 font-bold">{isAr ? "تمت المراجعة" : "REVIEWED"}</div>
                <div className="text-lg font-black text-emerald-400 font-mono">{stats.statusCounts.reviewed}</div>
              </div>
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <div className="text-[10px] text-purple-300 font-bold">{isAr ? "مميز للعرض" : "FEATURED"}</div>
                <div className="text-lg font-black text-purple-400 font-mono">{stats.featuredCount}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RATING TRENDS LINE CHART (Recharts) */}
      {showTrendsChart && (
        <RatingTrendsChart 
          lang={lang} 
          theme={theme} 
          onRefreshTrigger={fetchStats} 
        />
      )}

      {/* Sticky Bulk Action Floating Toolbar */}
      {selectedIds.length > 0 && (
        <div 
          id="bulk-feedback-action-bar"
          className="sticky top-4 z-30 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/50 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold shadow-inner">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                <span>{isAr ? `تم تحديد ${selectedIds.length} تقييم` : `${selectedIds.length} feedback items selected`}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                  {isAr ? "إجراء جماعي فوري" : "Batch Operation"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {isAr ? "اختر عملية جماعية لتطبيقها دفعة واحدة على التقييمات المختارة" : "Choose a bulk action to apply across all selected items"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Flag for Review Button */}
            <button
              id="btn-bulk-flag-feedback"
              onClick={handleBulkFlag}
              disabled={isBulkProcessing}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              {isBulkProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
              <span>{isAr ? "تحديد للمراجعة (Flag for Review)" : "Flag for Review"}</span>
            </button>

            {/* Delete Batch Button */}
            <button
              id="btn-bulk-delete-feedback"
              onClick={handleBulkDelete}
              disabled={isBulkProcessing}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              {isBulkProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>{isAr ? "حذف المحدد (Delete)" : "Delete Selected"}</span>
            </button>

            {/* Cancel/Deselect All */}
            <button
              id="btn-bulk-cancel-selection"
              onClick={() => setSelectedIds([])}
              disabled={isBulkProcessing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
            >
              {isAr ? "إلغاء التحديد" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar with Select All Toggle */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[200px] sm:min-w-[300px]">
          {/* Select All Toggle Checkbox */}
          {feedbackList.length > 0 && (
            <button
              id="btn-select-all-toggle"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 transition-all shrink-0"
              title={isAr ? "تحديد أو إلغاء تحديد كافة التقييمات في الصفحة الحالية" : "Select or deselect all items on this page"}
            >
              {selectedIds.length === feedbackList.length && feedbackList.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-amber-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {selectedIds.length === feedbackList.length && feedbackList.length > 0
                  ? (isAr ? "إلغاء تحديد الكل" : "Deselect All")
                  : (isAr ? `تحديد الكل (${feedbackList.length})` : `Select All (${feedbackList.length})`)}
              </span>
            </button>
          )}

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`w-4 h-4 absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500`} />
            <input
              id="input-search-feedback"
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={isAr ? "ابحث باسم الطالب، الإيميل، أو نص التقييم..." : "Search user name, email, or message..."}
              className={`w-full ${isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500`}
            />
          </div>

          {/* Status Filter */}
          <select
            id="select-status-filter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">{isAr ? "كافة الحالات" : "All Statuses"}</option>
            <option value="NEW">{isAr ? "جديد (لم تتم مراجعته)" : "NEW (Unreviewed)"}</option>
            <option value="REVIEWED">{isAr ? "تمت مراجعته" : "Reviewed"}</option>
            <option value="REPLIED">{isAr ? "تم الرد عليه" : "Replied"}</option>
            <option value="ARCHIVED">{isAr ? "مؤرشف" : "Archived"}</option>
          </select>

          {/* Rating Filter */}
          <select
            id="select-rating-filter"
            value={ratingFilter || ""}
            onChange={(e) => { setRatingFilter(e.target.value ? parseInt(e.target.value, 10) : undefined); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">{isAr ? "كافة النجوم (1-5)" : "All Ratings"}</option>
            <option value="5">5 ★★★★★</option>
            <option value="4">4 ★★★★☆</option>
            <option value="3">3 ★★★☆☆</option>
            <option value="2">2 ★★☆☆☆</option>
            <option value="1">1 ★☆☆☆☆</option>
          </select>

          {/* Date Filter */}
          <select
            id="select-date-filter"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">{isAr ? "كافة الأوقات" : "All Time"}</option>
            <option value="today">{isAr ? "اليوم" : "Today"}</option>
            <option value="week">{isAr ? "آخر أسبوع" : "Past 7 Days"}</option>
            <option value="month">{isAr ? "آخر شهر" : "Past 30 Days"}</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {isAr ? `إجمالي النتائج: ${totalCount}` : `Total results: ${totalCount}`}
        </div>
      </div>

      {/* Recent Feedback List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-sm text-slate-400">{isAr ? "جاري تحميل تقييمات المنصة من PostgreSQL..." : "Loading feedback from PostgreSQL..."}</span>
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">
              {isAr ? "لا توجد تقييمات مطابقة لمعايير البحث" : "No feedback found matching criteria"}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isAr ? "يمكنك تعديل خيارات الفلترة أو إعادة تعيين البحث لعرض التقييمات المسجلة." : "Try adjusting your filters or search terms."}
            </p>
          </div>
        ) : (
          feedbackList.map((item) => {
            const isReplying = replyingToId === item.id;
            const isPulsing = pulsingIds.has(item.id);
            const isSelected = selectedIds.includes(item.id);

            return (
              <div 
                key={item.id}
                id={`admin-feedback-card-${item.id}`}
                className={`p-5 rounded-2xl transition-all duration-300 relative ${
                  isPulsing
                    ? "ring-2 ring-amber-400 bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 shadow-2xl shadow-amber-500/25 animate-pulse"
                    : isSelected
                    ? "border-2 border-amber-500 bg-slate-850 shadow-md shadow-amber-500/10"
                    : item.status === "NEW" 
                    ? "border border-amber-500/40 shadow-lg shadow-amber-500/5 bg-gradient-to-r from-amber-950/10 via-slate-900 to-slate-900" 
                    : item.isFeatured 
                    ? "border border-purple-500/30 bg-slate-900" 
                    : "border border-slate-800 bg-slate-900 hover:border-slate-700"
                }`}
              >
                {/* Header: Bulk Checkbox + User Info & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    {/* Bulk Selection Checkbox */}
                    <input
                      type="checkbox"
                      id={`checkbox-feedback-${item.id}`}
                      checked={isSelected}
                      onChange={() => handleToggleSelect(item.id)}
                      className="w-4 h-4 rounded cursor-pointer accent-amber-500 focus:ring-amber-500 shrink-0"
                      title={isAr ? "تحديد هذا التقييم للعمليات الجماعية" : "Select this feedback for bulk actions"}
                    />

                    {item.userAvatar ? (
                      <img src={item.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm">
                        {item.userName ? item.userName[0] : "U"}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{item.userName || "طالب مهندس"}</span>
                        
                        {/* 3-second subtle pulsing badge for new entries */}
                        {isPulsing && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/50 flex items-center gap-1 animate-pulse shadow-sm">
                            <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                            <span>{isAr ? "✨ جديد الآن (وميض 3ث)" : "✨ New Arrival"}</span>
                          </span>
                        )}

                        {item.isFeatured && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            {isAr ? "مميز في الواجهة" : "Featured"}
                          </span>
                        )}

                        {item.status === "NEW" && !isPulsing && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {isAr ? "جديد" : "NEW"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{item.userEmail}</span>
                        {item.userUniversity && <span>• {item.userUniversity}</span>}
                        {item.userPhone && <span>• 📱 {item.userPhone}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Rating & Date */}
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= item.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-700"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-amber-400 font-mono ml-1 mr-1">
                        {item.rating}/5
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleString(isAr ? "ar-SY" : "en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="my-3.5 text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                  {item.message}
                </div>

                {/* Existing Admin Reply */}
                {item.adminReply && (
                  <div className="my-3 p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isAr ? "رد إدارة CardioVision:" : "CardioVision Reply:"}</span>
                        {item.adminUserName && (
                          <span className="text-slate-400 font-normal">({item.adminUserName})</span>
                        )}
                      </div>
                      {item.repliedAt && (
                        <span className="text-[10px] text-blue-500 font-mono">
                          {new Date(item.repliedAt).toLocaleDateString(isAr ? "ar-SY" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-200 italic leading-relaxed">
                      "{item.adminReply}"
                    </p>
                  </div>
                )}

                {/* Inline Reply Form */}
                {isReplying && (
                  <div className="my-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>{isAr ? "كتابة رد رسمي من الإدارة للطالب:" : "Write Official Admin Reply:"}</span>
                      <button 
                        onClick={() => { setReplyingToId(null); setReplyText(""); }}
                        className="text-slate-400 hover:text-slate-200 text-xs"
                      >
                        {isAr ? "إلغاء" : "Cancel"}
                      </button>
                    </div>
                    <textarea
                      id={`textarea-reply-${item.id}`}
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={isAr ? "اكتب ردك الأكاديمي أو الترحيبي وسيصل للمستخدم كإشعار فوري..." : "Type your reply to notify the student..."}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        id={`btn-send-reply-${item.id}`}
                        onClick={() => handleSendReply(item.id)}
                        disabled={isSendingReply || !replyText.trim()}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSendingReply ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{isAr ? "إرسال الرد وحفظه" : "Submit Reply"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Status Picker */}
                    <span className="text-slate-500">{isAr ? "الحالة:" : "Status:"}</span>
                    <select
                      id={`select-status-${item.id}`}
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as FeedbackStatus)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        item.status === "NEW" 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : item.status === "REPLIED"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : item.status === "REVIEWED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      } focus:outline-none`}
                    >
                      <option value="NEW">{isAr ? "جديد" : "NEW"}</option>
                      <option value="REVIEWED">{isAr ? "تمت المراجعة" : "REVIEWED"}</option>
                      <option value="REPLIED">{isAr ? "تم الرد" : "REPLIED"}</option>
                      <option value="ARCHIVED">{isAr ? "أرشفة" : "ARCHIVED"}</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Reply button */}
                    <button
                      id={`btn-open-reply-${item.id}`}
                      onClick={() => {
                        if (replyingToId === item.id) {
                          setReplyingToId(null);
                        } else {
                          setReplyingToId(item.id);
                          setReplyText(item.adminReply || "");
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/20 transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{item.adminReply ? (isAr ? "تعديل الرد" : "Edit Reply") : (isAr ? "الرد على الطالب" : "Reply")}</span>
                    </button>

                    {/* Feature toggle */}
                    <button
                      id={`btn-toggle-featured-${item.id}`}
                      onClick={() => handleToggleFeature(item.id, item.isFeatured)}
                      className={`px-3 py-1.5 rounded-lg font-semibold border transition-all flex items-center gap-1.5 ${
                        item.isFeatured
                          ? "bg-purple-600/20 text-purple-300 border-purple-500/40 hover:bg-purple-600/30"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{item.isFeatured ? (isAr ? "إلغاء التمييز" : "Unfeature") : (isAr ? "تمييز في الواجهة" : "Feature")}</span>
                    </button>

                    {/* Delete button */}
                    <button
                      id={`btn-delete-feedback-${item.id}`}
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title={isAr ? "حذف التقييم" : "Delete Feedback"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            id="btn-feedback-prev-page"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            {isAr ? "← الصفحة السابقة" : "← Previous Page"}
          </button>

          <span className="text-xs text-slate-400 font-mono">
            {isAr ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
          </span>

          <button
            id="btn-feedback-next-page"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            {isAr ? "الصفحة التالية →" : "Next Page →"}
          </button>
        </div>
      )}
    </div>
  );
};
