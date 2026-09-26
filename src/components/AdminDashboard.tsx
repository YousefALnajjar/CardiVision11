import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Layers, 
  ShoppingCart, 
  CheckCircle, 
  TrendingUp, 
  Activity, 
  Trash2, 
  Edit3, 
  Plus, 
  Send, 
  AlertCircle,
  FileText,
  Video,
  XCircle,
  FolderPlus,
  RefreshCw,
  UserCheck,
  UserX,
  Search,
  Mail,
  ShieldCheck,
  UserPlus,
  Star,
  User,
  CreditCard,
  Wrench,
  Power,
  AlertTriangle,
  Gauge,
  MessageSquare,
  Filter,
  Check,
  BarChart2,
  Download,
  CheckSquare,
  Square,
  FileSpreadsheet
} from "lucide-react";
import { Project, Order, SystemStats } from "../types";
import DifficultyBadge from "./DifficultyBadge";
import { AdminFeedbackTab } from "./AdminFeedbackTab";
import ProjectPopularityChart from "./ProjectPopularityChart";
import { RatingTrendsChart } from "./RatingTrendsChart";
import BulkEditProjectsModal from "./BulkEditProjectsModal";

interface AdminDashboardProps {
  lang: "ar" | "en";
  theme: "dark" | "light";
  allProjects: Project[];
  categories?: any[];
  onRefreshProjects: () => void;
  onRefreshCategories?: () => void;
}

export default function AdminDashboard({
  lang,
  theme,
  allProjects,
  categories = [],
  onRefreshProjects,
  onRefreshCategories
}: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"stats" | "receipts" | "projects" | "categories" | "users" | "reviews" | "feedback" | "broadcast" | "maintenance">("stats");
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearchText, setUserSearchText] = useState("");

  // Reviews & Comments management state
  const [allReviewsList, setAllReviewsList] = useState<any[]>([]);
  const [allCommentsList, setAllCommentsList] = useState<any[]>([]);
  const [reviewsStats, setReviewsStats] = useState<any>(null);
  const [reviewsViewMode, setReviewsViewMode] = useState<"reviews" | "comments" | "ratings">("reviews");
  const [reviewSearchText, setReviewSearchText] = useState("");
  const [reviewProjectFilter, setReviewProjectFilter] = useState<string>("all");
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>("all");
  const [reviewRatingFilter, setReviewRatingFilter] = useState<string>("all");
  const [isRefreshingReviews, setIsRefreshingReviews] = useState(false);

  // Create student user form state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");
  const [addUserLoading, setAddUserLoading] = useState(false);

  // Category management states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catId, setCatId] = useState("");
  const [catLabelAr, setCatLabelAr] = useState("");
  const [catLabelEn, setCatLabelEn] = useState("");

  // Add/Edit project form state
  // Selected project for Quick Edit Modal
  const [selectedEditProject, setSelectedEditProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [category, setCategory] = useState("biomedical");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [detailsAr, setDetailsAr] = useState("");
  const [detailsEn, setDetailsEn] = useState("");
  const [price, setPrice] = useState("");
  const [durationAr, setDurationAr] = useState("");
  const [durationEn, setDurationEn] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [projectFileUrl, setProjectFileUrl] = useState("");
  const [universityAr, setUniversityAr] = useState("");
  const [universityEn, setUniversityEn] = useState("");
  const [projectTypeAr, setProjectTypeAr] = useState("");
  const [projectTypeEn, setProjectTypeEn] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState<"easy" | "medium" | "hard">("medium");
  const [difficultyStats, setDifficultyStats] = useState<{ easy: number; medium: number; hard: number; total: number } | null>(null);
  
  // Lists as comma-separated string inputs for ease of form submission
  const [featuresAr, setFeaturesAr] = useState("");
  const [featuresEn, setFeaturesEn] = useState("");
  const [componentsAr, setComponentsAr] = useState("");
  const [componentsEn, setComponentsEn] = useState("");
  const [softwareAr, setSoftwareAr] = useState("");
  const [softwareEn, setSoftwareEn] = useState("");

  // Broadcast form state
  const [broadcastTitleAr, setBroadcastTitleAr] = useState("");
  const [broadcastTitleEn, setBroadcastTitleEn] = useState("");
  const [broadcastMsgAr, setBroadcastMsgAr] = useState("");
  const [broadcastMsgEn, setBroadcastMsgEn] = useState("");
  const [targetUserId, setTargetUserId] = useState("all");

  // Status state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<"all" | "Under Review" | "Pending" | "Approved" | "Rejected">("all");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Syriatel Cash receipt rejection modal state
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Helper to categorize order status consistently
  const getOrderStatusCategory = (status: string): "all" | "Under Review" | "Pending" | "Approved" | "Rejected" => {
    const s = (status || "").toLowerCase();
    if (["approved", "paid", "completed"].includes(s)) return "Approved";
    if (["under review", "pending_verification", "payment_submitted", "verifying_payment"].includes(s)) return "Under Review";
    if (["rejected", "payment_rejected"].includes(s)) return "Rejected";
    return "Pending";
  };

  // Maintenance mode control states
  const [maintenanceModeActive, setMaintenanceModeActive] = useState(false);
  const [maintenanceReasonInput, setMaintenanceReasonInput] = useState(
    "نعمل حالياً على إجراء تحديثات وتحسينات لنوفر لكم تجربة أفضل وأكثر أماناً."
  );
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  // Batch editing & CSV Export state
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  const handleToggleSelectProject = (projectId: string) => {
    setSelectedProjectIds(prev =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedProjectIds.length === allProjects.length && allProjects.length > 0) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(allProjects.map(p => p.id));
    }
  };

  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    setError(null);
    try {
      const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Accept": "text/csv"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/export/projects", {
        headers,
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error(`Export failed with status: ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cardiovision_projects_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSuccess(
        lang === "ar"
          ? "تم تصدير ملف بيانات المشاريع بنجاح وبدء التنزيل"
          : "Projects CSV exported and downloaded successfully"
      );
    } catch (err: any) {
      console.error("Export error:", err);
      setError(err.message || "Failed to export CSV");
    } finally {
      setIsExportingCsv(false);
    }
  };

  // In-flight guard to prevent duplicate overlapping network requests
  const inFlightRef = useRef<{
    stats?: boolean;
    orders?: boolean;
    users?: boolean;
    reviews?: boolean;
    audit?: boolean;
    maintenance?: boolean;
  }>({});

  const getAdminHeaders = (extraHeaders: Record<string, string> = {}) => {
    const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...extraHeaders
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  // Resilient fetch helper with JWT auth and session cookie credentials
  const safeAdminFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {})
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        credentials: "include"
      });
      if (!res.ok) {
        try {
          const errData = await res.json();
          return { ok: false, status: res.status, data: errData };
        } catch {
          return { ok: false, status: res.status, data: null };
        }
      }
      const data = await res.json();
      return { ok: true, status: res.status, data };
    } catch (err: any) {
      // Quietly log network interruptions without crashing console
      if (err?.name !== "AbortError") {
        console.warn(`[AdminSync] Connection temporarily paused for ${url} (will resume):`, err.message || err);
      }
      return null;
    }
  };

  useEffect(() => {
    // 1. Immediate fetch of overview stats and data for the current active subtab
    fetchStats();
    if (activeSubTab === "stats") {
      fetchAuditLogs();
    } else if (activeSubTab === "receipts") {
      fetchPendingOrders();
    } else if (activeSubTab === "users") {
      fetchUsers();
    } else if (activeSubTab === "reviews") {
      fetchReviewsAdmin();
    } else if (activeSubTab === "maintenance") {
      fetchMaintenanceInfo();
    }

    // 2. Intelligent, non-blocking polling:
    // Only polls when window is visible, every 8 seconds, focused on active tab
    const pollInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (typeof navigator !== "undefined" && !navigator.onLine) return;

      fetchStats();
      if (activeSubTab === "stats") {
        fetchAuditLogs();
      } else if (activeSubTab === "receipts") {
        fetchPendingOrders();
      } else if (activeSubTab === "users") {
        fetchUsers(true);
      } else if (activeSubTab === "reviews") {
        fetchReviewsAdmin();
      } else if (activeSubTab === "maintenance") {
        fetchMaintenanceInfo();
      }
    }, 8000);

    return () => clearInterval(pollInterval);
  }, [activeSubTab]);

  const fetchMaintenanceInfo = async () => {
    if (inFlightRef.current.maintenance) return;
    inFlightRef.current.maintenance = true;
    try {
      const res = await safeAdminFetch("/api/maintenance-status");
      if (res?.ok && res.data?.success) {
        setMaintenanceModeActive(Boolean(res.data.maintenanceMode));
        if (res.data.reason) setMaintenanceReasonInput(res.data.reason);
      }
    } finally {
      inFlightRef.current.maintenance = false;
    }
  };

  const handleToggleMaintenanceMode = async (enable?: boolean) => {
    const targetState = enable !== undefined ? enable : !maintenanceModeActive;
    
    // Optimistic UI Update
    setMaintenanceModeActive(targetState);
    setTogglingMaintenance(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await safeAdminFetch("/api/admin/maintenance", {
        method: "POST",
        body: JSON.stringify({
          maintenanceMode: targetState,
          reason: maintenanceReasonInput,
          adminId: "admin-id"
        })
      });
      if (res?.ok && res.data?.success) {
        // Confirm from server response
        setMaintenanceModeActive(Boolean(res.data.maintenanceMode));
        setSuccess(lang === "ar" ? res.data.message : "Maintenance status updated!");
        fetchAuditLogs();
      } else {
        // Rollback on API failure
        setMaintenanceModeActive(!targetState);
        setError(res?.data?.error || "Failed to update maintenance mode");
      }
    } catch (err: any) {
      // Rollback on network failure
      setMaintenanceModeActive(!targetState);
      setError(lang === "ar" ? "فشل الاتصال بالخادم" : "Connection failed");
    } finally {
      setTogglingMaintenance(false);
    }
  };

  const fetchAuditLogs = async () => {
    if (inFlightRef.current.audit) return;
    inFlightRef.current.audit = true;
    try {
      const res = await safeAdminFetch("/api/admin/audit-logs");
      if (res?.ok && res.data?.success && Array.isArray(res.data.logs)) {
        setAuditLogs(res.data.logs);
      }
    } finally {
      inFlightRef.current.audit = false;
    }
  };

  const fetchStats = async () => {
    if (inFlightRef.current.stats) return;
    inFlightRef.current.stats = true;
    try {
      const res = await safeAdminFetch("/api/admin/stats");
      if (res?.ok && res.data?.success && res.data.stats) {
        setStats(res.data.stats);
      }
    } finally {
      inFlightRef.current.stats = false;
    }
  };

  const fetchUsers = async (silent = false) => {
    if (inFlightRef.current.users) return;
    inFlightRef.current.users = true;
    if (!silent) setIsRefreshingUsers(true);
    try {
      const res = await safeAdminFetch("/api/admin/users");
      if (res?.ok && res.data?.success && res.data.users) {
        setUsersList(res.data.users);
      }
    } finally {
      inFlightRef.current.users = false;
      if (!silent) {
        setTimeout(() => setIsRefreshingUsers(false), 400);
      }
    }
  };

  const fetchReviewsAdmin = async () => {
    if (inFlightRef.current.reviews) return;
    inFlightRef.current.reviews = true;
    setIsRefreshingReviews(true);
    try {
      const [commentsRes, reviewsRes] = await Promise.all([
        safeAdminFetch("/api/admin/comments", {
          headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" }
        }),
        safeAdminFetch("/api/admin/reviews", {
          headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" }
        })
      ]);

      if (commentsRes?.ok && commentsRes.data?.success && Array.isArray(commentsRes.data.comments)) {
        setAllCommentsList(commentsRes.data.comments);
      }
      if (reviewsRes?.ok && reviewsRes.data?.success) {
        if (Array.isArray(reviewsRes.data.reviews)) {
          setAllReviewsList(reviewsRes.data.reviews);
        }
        if (reviewsRes.data.stats) {
          setReviewsStats(reviewsRes.data.stats);
        }
      }
    } finally {
      inFlightRef.current.reviews = false;
      setTimeout(() => setIsRefreshingReviews(false), 300);
    }
  };

  const handleDeleteCommentAdmin = async (commentId: string) => {
    if (!window.confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا التعليق نهائياً من قاعدة البيانات؟" : "Are you sure you want to delete this comment?")) return;
    try {
      setError(null);
      setSuccess(null);
      const res = await fetch(`/api/admin/comments/${commentId}`, { 
        method: "DELETE",
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(lang === "ar" ? "تم حذف التعليق بنجاح من قاعدة البيانات وتحديث العداد" : "Comment deleted successfully");
        fetchReviewsAdmin();
        fetchStats();
      } else {
        setError(data.error || "فشل حذف التعليق");
      }
    } catch (e) {
      setError(lang === "ar" ? "فشل الاتصال بالخادم" : "Connection failed");
    }
  };

  const handleDeleteReviewAdmin = async (reviewId: string) => {
    if (!window.confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا التقييم نهائياً من قاعدة البيانات؟" : "Are you sure you want to delete this review?")) return;
    try {
      setError(null);
      setSuccess(null);
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { 
        method: "DELETE",
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(lang === "ar" ? "تم حذف التقييم وتحديث متوسط تقييم المشروع بنجاح" : "Review deleted successfully");
        fetchReviewsAdmin();
        fetchStats();
      } else {
        setError(data.error || "فشل حذف التقييم");
      }
    } catch (e) {
      setError(lang === "ar" ? "فشل الاتصال بالخادم" : "Connection failed");
    }
  };

  const handleUpdateCommentStatus = async (commentId: string, newStatus: "active" | "reviewed" | "hidden") => {
    try {
      const res = await fetch(`/api/admin/comments/${commentId}/status`, {
        method: "PATCH",
        headers: {
          ...getAdminHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchReviewsAdmin();
      }
    } catch (e) {
      console.warn("Could not update comment status:", e);
    }
  };

  const handleCreateStudentUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail || !newStudentPassword) return;

    setAddUserLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          name: newStudentName,
          email: newStudentEmail,
          password: newStudentPassword,
          role: "student"
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(lang === "ar" ? "تم إنشاء حساب الطالب بنجاح وحفظه في قاعدة البيانات!" : "Student account created successfully!");
        setNewStudentName("");
        setNewStudentEmail("");
        setNewStudentPassword("");
        setShowAddUserModal(false);
        fetchUsers();
        fetchStats();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(lang === "ar" ? "حدث خطأ أثناء الاتصال بالخادم" : "Error connecting to server");
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleToggleVerifyUser = async (userId: string) => {
    try {
      setError(null);
      setSuccess(null);
      const res = await fetch(`/api/admin/users/${userId}/toggle-verify`, {
        method: "POST",
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(lang === "ar" ? data.message : "User verification status updated!");
        fetchUsers();
        fetchStats();
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(lang === "ar" ? "فشل الاتصال بالخادم" : "Connection failed");
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      setError(null);
      setSuccess(null);
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "POST",
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(lang === "ar" ? data.message : "User status updated!");
        fetchUsers();
        fetchStats();
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(lang === "ar" ? "فشل الاتصال بالخادم" : "Connection failed");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا المستخدم نهائياً من قاعدة البيانات؟" : "Are you sure you want to permanently delete this user?")) return;
    try {
      setError(null);
      setSuccess(null);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(lang === "ar" ? data.message : "User deleted successfully");
        fetchUsers();
        fetchStats();
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(lang === "ar" ? "فشل الاتصال بالخادم" : "Connection failed");
    }
  };

  const fetchPendingOrders = async () => {
    if (inFlightRef.current.orders) return;
    inFlightRef.current.orders = true;
    try {
      const res = await safeAdminFetch("/api/orders");
      if (res?.ok && res.data?.success) {
        setAllOrders(res.data.orders || []);
        setPendingOrders(res.data.orders || []);
      }
    } finally {
      inFlightRef.current.orders = false;
    }
  };

  const handleApproveReceipt = async (orderId: string) => {
    try {
      const res = await safeAdminFetch(`/api/orders/${orderId}/approve`, { 
        method: "POST",
        body: JSON.stringify({ adminId: "admin-id" })
      });
      if (res?.ok && res.data?.success) {
        setSuccess(lang === "ar" ? "تم قبول الطلب وتفعيل تنزيل الملفات وتوجيه إشعار للمستخدم وتسجيل العملية بسجل التدقيق!" : "Order approved! Download activated and audit logged.");
        fetchPendingOrders();
        fetchStats();
        fetchAuditLogs();
      } else {
        setError(res?.data?.error || "Failed to approve order");
      }
    } catch (err) {
      console.warn("Could not approve receipt:", err);
    }
  };

  const handleRejectReceipt = (orderId: string, customReason?: string) => {
    const targetOrder = allOrders.find(o => o.id === orderId);
    if (!targetOrder) return;
    if (customReason !== undefined) {
      executeRejectOrder(targetOrder.id, customReason);
    } else {
      setRejectModalOrder(targetOrder);
      setRejectReasonInput("");
    }
  };

  const executeRejectOrder = async (orderId: string, reasonText: string) => {
    setIsRejecting(true);
    try {
      const cleanReason = reasonText.trim() || (lang === "ar" ? "بيانات التحويل غير مطابقة، يرجى إعادة التحقق" : "Receipt details invalid");
      const res = await safeAdminFetch(`/api/orders/${orderId}/reject`, { 
        method: "POST",
        body: JSON.stringify({ 
          reason: cleanReason, 
          adminFeedback: cleanReason, 
          adminId: "admin-id" 
        })
      });
      if (res?.ok && res.data?.success) {
        setSuccess(lang === "ar" ? "تم رفض الإيصال وإرسال سبب الرفض للطالب وتوثيق العملية بسجل التدقيق" : "Receipt rejected and logged.");
        setRejectModalOrder(null);
        setRejectReasonInput("");
        fetchPendingOrders();
        fetchStats();
        fetchAuditLogs();
      } else {
        setError(res?.data?.error || "Failed to reject order");
      }
    } catch (err: any) {
      console.warn("Could not reject receipt:", err);
      setError(err?.message || "Failed to reject order");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!titleAr || !titleEn || !price) {
      setError(lang === "ar" ? "يرجى تعبئة الحقول الأساسية" : "Primary fields required");
      return;
    }

    const projectPayload = {
      titleAr,
      titleEn,
      category,
      difficultyLevel,
      descriptionAr,
      descriptionEn,
      detailsAr: detailsAr || descriptionAr,
      detailsEn: detailsEn || descriptionEn,
      price: Number(price),
      durationAr: durationAr || "7 أيام",
      durationEn: durationEn || "7 Days",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=800",
      videoUrl: videoUrl || "https://www.youtube.com/embed/9XInbVka77w",
      projectFileUrl: projectFileUrl || "/downloads/project.zip",
      universityAr,
      universityEn,
      projectTypeAr,
      projectTypeEn,
      featuresAr: featuresAr.split(",").map(x => x.trim()).filter(Boolean),
      featuresEn: featuresEn.split(",").map(x => x.trim()).filter(Boolean),
      componentsAr: componentsAr.split(",").map(x => x.trim()).filter(Boolean),
      componentsEn: componentsEn.split(",").map(x => x.trim()).filter(Boolean),
      softwareAr: softwareAr.split(",").map(x => x.trim()).filter(Boolean),
      softwareEn: softwareEn.split(",").map(x => x.trim()).filter(Boolean)
    };

    setLoading(true);
    try {
      let res;
      if (editingProjectId) {
        // PUT update
        res = await fetch(`/api/projects/${editingProjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectPayload)
        });
      } else {
        // POST create
        res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectPayload)
        });
      }

      const data = await res.json();
      if (data.success) {
        setSuccess(editingProjectId ? "تم تحديث المشروع الهندسية بنجاح" : "تم إضافة المشروع الجديد بنجاح ونشره بالمنصة");
        clearProjectForm();
        onRefreshProjects();
        fetchStats();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Connection failure");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProjectId(project.id);
    setTitleAr(project.titleAr);
    setTitleEn(project.titleEn);
    setCategory(project.category);
    setDifficultyLevel(project.difficultyLevel || "medium");
    setDescriptionAr(project.descriptionAr);
    setDescriptionEn(project.descriptionEn);
    setDetailsAr(project.detailsAr || "");
    setDetailsEn(project.detailsEn || "");
    setPrice(project.price.toString());
    setDurationAr(project.durationAr);
    setDurationEn(project.durationEn);
    setImageUrl(project.imageUrl);
    setVideoUrl(project.videoUrl);
    setProjectFileUrl(project.projectFileUrl || "");
    setUniversityAr(project.universityAr || "");
    setUniversityEn(project.universityEn || "");
    setProjectTypeAr(project.projectTypeAr || "");
    setProjectTypeEn(project.projectTypeEn || "");
    setFeaturesAr(project.featuresAr?.join(", ") || "");
    setFeaturesEn(project.featuresEn?.join(", ") || "");
    setComponentsAr(project.componentsAr?.join(", ") || "");
    setComponentsEn(project.componentsEn?.join(", ") || "");
    setSoftwareAr(project.softwareAr?.join(", ") || "");
    setSoftwareEn(project.softwareEn?.join(", ") || "");
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا المشروع نهائياً؟" : "Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSuccess(lang === "ar" ? "تم حذف المشروع بنجاح" : "Project deleted.");
        onRefreshProjects();
        fetchStats();
      }
    } catch (e) {
      console.warn("Could not delete project:", e);
    }
  };

  const clearProjectForm = () => {
    setEditingProjectId(null);
    setTitleAr("");
    setTitleEn("");
    setCategory("biomedical");
    setDifficultyLevel("medium");
    setDescriptionAr("");
    setDescriptionEn("");
    setDetailsAr("");
    setDetailsEn("");
    setPrice("");
    setDurationAr("");
    setDurationEn("");
    setImageUrl("");
    setVideoUrl("");
    setProjectFileUrl("");
    setUniversityAr("");
    setUniversityEn("");
    setProjectTypeAr("");
    setProjectTypeEn("");
    setFeaturesAr("");
    setFeaturesEn("");
    setComponentsAr("");
    setComponentsEn("");
    setSoftwareAr("");
    setSoftwareEn("");
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!broadcastTitleAr || !broadcastMsgAr) {
      setError(lang === "ar" ? "العنوان والرسالة مطلوبان للبث" : "Title and Message are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleAr: broadcastTitleAr,
          titleEn: broadcastTitleEn || broadcastTitleAr,
          messageAr: broadcastMsgAr,
          messageEn: broadcastMsgEn || broadcastMsgAr,
          userId: targetUserId === "all" ? "all" : targetUserId
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(lang === "ar" ? "تم بث وإرسال الإشعارات للطلاب بنجاح!" : "Alert broadcasted successfully!");
        setBroadcastTitleAr("");
        setBroadcastTitleEn("");
        setBroadcastMsgAr("");
        setBroadcastMsgEn("");
      }
    } catch (e) {
      setError("Broadcast failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!catLabelAr || !catLabelEn) {
      setError(lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "All fields are required");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (editingCategoryId) {
        // PUT edit
        res = await fetch(`/api/categories/${editingCategoryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ labelAr: catLabelAr, labelEn: catLabelEn })
        });
      } else {
        // POST add
        if (!catId) {
          setError(lang === "ar" ? "رمز القسم التعريفي مطلوب للقسم الجديد" : "Category ID code is required");
          setLoading(false);
          return;
        }
        res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: catId.trim().toLowerCase().replace(/\s+/g, "-"), labelAr: catLabelAr, labelEn: catLabelEn })
        });
      }

      const data = await res.json();
      if (data.success) {
        setSuccess(editingCategoryId ? (lang === "ar" ? "تم تحديث القسم بنجاح" : "Category updated successfully") : (lang === "ar" ? "تمت إضافة القسم الجديد بنجاح" : "New category added successfully"));
        setEditingCategoryId(null);
        setCatId("");
        setCatLabelAr("");
        setCatLabelEn("");
        if (onRefreshCategories) onRefreshCategories();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setError(null);
    setSuccess(null);
    if (!window.confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا القسم نهائياً؟" : "Are you sure you want to delete this category?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(lang === "ar" ? "تم حذف القسم بنجاح" : "Category deleted successfully");
        if (onRefreshCategories) onRefreshCategories();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategoryClick = (cat: any) => {
    setEditingCategoryId(cat.id);
    setCatId(cat.id);
    setCatLabelAr(cat.labelAr);
    setCatLabelEn(cat.labelEn);
  };

  const fetchDifficultyStats = async () => {
    try {
      const res = await safeAdminFetch("/api/admin/difficulty-stats");
      if (res?.ok && res.data?.success && (res.data.difficultyStats || res.data.stats)) {
        setDifficultyStats(res.data.difficultyStats || res.data.stats);
      }
    } catch (e) {
      console.warn("Could not load difficulty stats:", e);
    }
  };

  const handleSeedDemoData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/seed-demo-data", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({ force: true })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        onRefreshProjects();
        fetchDifficultyStats();
        fetchStats();
        fetchReviewsAdmin();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("فشل توليد البيانات التجريبية");
    } finally {
      setLoading(false);
    }
  };

  const handleClearDemoData = async () => {
    if (!window.confirm("هل أنت متأكد من مسح جميع التعليقات والبيانات التجريبية؟")) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/clear-demo-data", {
        method: "POST",
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        fetchReviewsAdmin();
        fetchStats();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("فشل مسح البيانات التجريبية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" id="admin-workspace-panel">
      
      {/* Supervisor Welcome Header */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="CardioVision Logo" 
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0" 
              referrerPolicy="no-referrer"
              id="admin-dashboard-brand-logo"
            />
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full">
                👑 {lang === "ar" ? "لوحة الإشراف العليا لـ CardioVision" : "Chief Director Control Room"}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-100 mt-2">
                {lang === "ar" ? "أهلاً بك في إدارة CardioVision" : "Welcome, CardioVision Admin"}
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {lang === "ar" ? "أدر مبيعات مشاريع التخرج، وافحص إيصالات سيرتيل كاش للطلاب، وقدم الاستشارات المخصصة بكل سهولة." : "Administer your engineering platform, verify Syriatel Cash transfers, and add/edit projects."}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end md:items-center gap-2 shrink-0">
            <button
              onClick={handleSeedDemoData}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              title="توليد تقييمات وتعليقات ومستويات صعوبة تجريبية للعرض والتطوير"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{lang === "ar" ? "🌱 توليد بيانات تجريبية" : "🌱 Seed Demo Data"}</span>
            </button>

            <button
              onClick={handleClearDemoData}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              title="مسح البيانات والتعليقات التجريبية للتحضير لبيئة الإنتاج المباشرة"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "🧹 مسح البيانات التجريبية" : "🧹 Clear Demo Data"}</span>
            </button>

            <div className="text-xs font-mono font-bold bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-emerald-400">
              🟢 Status: Live Container
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap border-b border-slate-800/40 gap-1">
        <button
          onClick={() => { setActiveSubTab("stats"); setError(null); setSuccess(null); }}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 ${
            activeSubTab === "stats" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          📈 {lang === "ar" ? "التحليلات والإيرادات" : "Analytics & Sales"}
        </button>

        <button
          onClick={() => { setActiveSubTab("receipts"); setError(null); setSuccess(null); }}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 relative ${
            activeSubTab === "receipts" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          💵 {lang === "ar" ? "إيصالات سيرتيل المعلقة" : "Verify Payments"}
          {pendingOrders.filter(o => o.status === "pending").length > 0 && (
            <span className="ms-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-[9px] text-white font-mono">
              {pendingOrders.filter(o => o.status === "pending").length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveSubTab("projects"); setError(null); setSuccess(null); }}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 ${
            activeSubTab === "projects" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          🛠️ {lang === "ar" ? "إدارة المشاريع والتعديل" : "Manage Project Catalog"}
        </button>

        <button
          onClick={() => { setActiveSubTab("categories"); setError(null); setSuccess(null); }}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 ${
            activeSubTab === "categories" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          📁 {lang === "ar" ? "إدارة الأقسام والـ category" : "Category Management"}
        </button>

        <button
          onClick={() => { setActiveSubTab("users"); setError(null); setSuccess(null); }}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 ${
            activeSubTab === "users" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          👥 {lang === "ar" ? "قاعدة بيانات المستخدمين" : "User Database"}
        </button>

        <button
          onClick={() => { setActiveSubTab("reviews"); setError(null); setSuccess(null); fetchReviewsAdmin(); }}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 relative ${
            activeSubTab === "reviews" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          💬 {lang === "ar" ? "إدارة التعليقات والتقييمات" : "Reviews & Comments"}
          {allReviewsList.length > 0 && (
            <span className="ms-1 px-1.5 py-0.5 rounded-full bg-indigo-600 text-[9px] text-white font-mono">
              {allReviewsList.length}
            </span>
          )}
        </button>

        <button
          id="tab-admin-feedback"
          onClick={() => { setActiveSubTab("feedback"); setError(null); setSuccess(null); }}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 relative ${
            activeSubTab === "feedback" ? "border-amber-500 text-amber-400 font-black" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          ⭐ {lang === "ar" ? "تقييمات المنصة (Feedback)" : "Platform Feedback"}
        </button>

        <button
          onClick={() => { setActiveSubTab("broadcast"); setError(null); setSuccess(null); }}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 ${
            activeSubTab === "broadcast" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          📢 {lang === "ar" ? "بث إشعارات عامة" : "Broadcast System Alerts"}
        </button>

        <button
          onClick={() => { setActiveSubTab("maintenance"); setError(null); setSuccess(null); fetchMaintenanceInfo(); }}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === "maintenance" 
              ? "border-amber-500 text-amber-500 font-extrabold" 
              : maintenanceModeActive 
              ? "border-transparent text-rose-400 hover:text-rose-300 animate-pulse font-black" 
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>{lang === "ar" ? "نظام وضع الصيانة" : "Maintenance Control"}</span>
          {maintenanceModeActive && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-[9px] text-white font-mono font-bold">
              ON
            </span>
          )}
        </button>
      </div>

      {/* Alerts box */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* SUB-TABS INTERACTIVE CLIENT LOGIC */}
      <div className="mt-4">
        
        {/* SUB-TAB 1: ANALYTICS STATS */}
        {activeSubTab === "stats" && stats && (
          <div className="space-y-8">
            
            {/* Grid stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              
              <div className="flex flex-col p-4 bg-gray-900 rounded-xl shadow-md border border-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm text-gray-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {lang === "ar" ? "الطلاب المسجلين" : "Active Students"}
                  </h3>
                  <Users className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
                <p className="text-2xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  {stats.usersCount}
                </p>
              </div>

              <div className="flex flex-col p-4 bg-gray-900 rounded-xl shadow-md border border-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm text-gray-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {lang === "ar" ? "المشاريع بالمنصة" : "Total Projects"}
                  </h3>
                  <Layers className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
                <p className="text-2xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  {stats.projectsCount}
                </p>
              </div>

              <div className="flex flex-col p-4 bg-gray-900 rounded-xl shadow-md border border-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm text-gray-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {lang === "ar" ? "تعليقات المشاريع" : "Project Comments"}
                  </h3>
                  <MessageSquare className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
                <p className="text-2xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  {stats.commentsCount ?? stats.totalComments ?? 0}
                </p>
              </div>

              <div className="flex flex-col p-4 bg-gray-900 rounded-xl shadow-md border border-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm text-gray-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {lang === "ar" ? "تقييمات المشاريع" : "Total Reviews"}
                  </h3>
                  <Star className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
                <div className="flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  <span className="text-2xl font-bold text-white">
                    {stats.reviewsCount ?? stats.totalReviews ?? 0}
                  </span>
                  <span className="text-sm text-gray-400 font-bold">
                    ({Number(stats.averageProjectRating ?? 5.0).toFixed(1)}★)
                  </span>
                </div>
              </div>

              <div className="flex flex-col p-4 bg-gray-900 rounded-xl shadow-md border border-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm text-gray-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {lang === "ar" ? "طلبات الشراء الفعالة" : "Approved Sales"}
                  </h3>
                  <ShoppingCart className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
                <p className="text-2xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  {stats.paymentsCount}
                </p>
              </div>

              <div className="flex flex-col p-4 bg-gray-900 rounded-xl shadow-md border border-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm text-gray-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {lang === "ar" ? "إجمالي الإيرادات ($)" : "Total Revenue ($)"}
                  </h3>
                  <TrendingUp className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
                <p className="text-2xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  ${(stats.revenue ?? (stats as any).totalRevenueSyp ?? 0).toLocaleString()}
                </p>
              </div>

            </div>

            {/* Difficulty Level Distribution Stats Cards */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-850">
              <h3 className="font-extrabold text-xs text-slate-300 mb-3 flex items-center justify-between">
                <span>📊 {lang === "ar" ? "توزيع المشاريع حسب مستوى الصعوبة:" : "Project Difficulty Distribution:"}</span>
                <button
                  onClick={fetchDifficultyStats}
                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{lang === "ar" ? "تحديث التوزيع" : "Refresh"}</span>
                </button>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/20 text-center flex flex-col items-center justify-center">
                  <DifficultyBadge level="easy" lang={lang} size="sm" className="mb-2" />
                  <span className="text-[10px] uppercase font-extrabold text-sky-400 block mb-1">
                    {lang === "ar" ? "مشاريع سهلة · LVL-01" : "Easy Level Projects"}
                  </span>
                  <strong className="text-2xl font-black text-sky-200 font-mono">
                    {allProjects.filter(p => p.difficultyLevel === "easy").length}
                  </strong>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-center flex flex-col items-center justify-center">
                  <DifficultyBadge level="medium" lang={lang} size="sm" className="mb-2" />
                  <span className="text-[10px] uppercase font-extrabold text-indigo-400 block mb-1">
                    {lang === "ar" ? "مشاريع متوسطة · LVL-02" : "Medium Level Projects"}
                  </span>
                  <strong className="text-2xl font-black text-indigo-200 font-mono">
                    {allProjects.filter(p => !p.difficultyLevel || p.difficultyLevel === "medium").length}
                  </strong>
                </div>

                <div className="p-4 rounded-2xl bg-fuchsia-950/20 border border-fuchsia-500/20 text-center flex flex-col items-center justify-center">
                  <DifficultyBadge level="hard" lang={lang} size="sm" className="mb-2" />
                  <span className="text-[10px] uppercase font-extrabold text-fuchsia-400 block mb-1">
                    {lang === "ar" ? "مشاريع صعبة · LVL-03" : "Hard Level Projects"}
                  </span>
                  <strong className="text-2xl font-black text-fuchsia-200 font-mono">
                    {allProjects.filter(p => p.difficultyLevel === "hard").length}
                  </strong>
                </div>
              </div>
            </div>

            {/* Recharts Project Popularity Trends & Engagement Visualizer */}
            <ProjectPopularityChart lang={lang} theme={theme} />

            {/* Recharts Platform Rating Trends Visualizer */}
            <RatingTrendsChart lang={lang} theme={theme} />

            {/* Custom SVG Growth Visual Chart */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-900 text-left">
              <h3 className="font-extrabold text-sm text-slate-300 mb-4 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-500" />
                <span>{lang === "ar" ? "مؤشر حركة نمو المبيعات الشهرية" : "Growth & Performance Indices"}</span>
              </h3>
              
              <div className="w-full h-48 relative flex items-end">
                {/* Simulated coordinate background grid lines */}
                <div className="absolute inset-x-0 bottom-0 border-b border-slate-900"></div>
                <div className="absolute inset-x-0 bottom-12 border-b border-slate-900/50"></div>
                <div className="absolute inset-x-0 bottom-24 border-b border-slate-900/50"></div>
                <div className="absolute inset-x-0 bottom-36 border-b border-slate-900/50"></div>

                <svg className="w-full h-full text-rose-500" viewBox="0 0 500 100" preserveAspectRatio="none">
                  {/* Chart fill area */}
                  <path 
                    d="M 0 95 Q 100 60 200 80 T 400 40 T 500 10 L 500 100 L 0 100 Z" 
                    fill="url(#grad)" 
                    opacity="0.15"
                  />
                  {/* Growth stroke line */}
                  <path 
                    d="M 0 95 Q 100 60 200 80 T 400 40 T 500 10" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#312e81" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Growth tags overlay */}
                <div className="absolute top-2 end-4 text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-0.5">
                  +14% Month-on-Month
                </div>
              </div>

              {/* Chart labels row */}
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-3">
                <span>March (آذار)</span>
                <span>April (نيسان)</span>
                <span>May (أيار)</span>
                <span>June (حزيران)</span>
                <span>July (تموز - الحالي)</span>
              </div>
            </div>

            {/* Best selling projects summary list */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left">
              <h3 className="font-extrabold text-sm text-slate-300 mb-4">
                👑 {lang === "ar" ? "المشاريع الأكثر مبيعاً ورواجاً" : "Top Performing Blueprints & Projects"}
              </h3>

              <div className="space-y-3">
                {stats.bestSellers && stats.bestSellers.length > 0 ? (
                  stats.bestSellers.map((seller, idx) => (
                    <div key={seller.projectId} className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 font-black text-xs flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-black text-slate-200">
                            {lang === "ar" ? seller.titleAr : seller.titleEn}
                          </h4>
                        </div>
                      </div>

                      <div className="flex gap-4 text-xs font-mono font-black shrink-0">
                        <span className="text-slate-400">
                          {lang === "ar" ? `مبيعات: ${seller.salesCount}` : `Sales: ${seller.salesCount}`}
                        </span>
                        <span className="text-emerald-400">
                          ${(seller.revenue ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3">{lang === "ar" ? "لا توجد مبيعات مسجلة ومقبولة حالياً." : "No sales recorded yet."}</p>
                )}
              </div>
            </div>

            {/* Live Registered Student Accounts Summary on Main Overview */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>{lang === "ar" ? "أحدث الطلاب والمستخدمين المسجلين بالموقع" : "Newly Registered Student Accounts"}</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-black">
                      {usersList.length} {lang === "ar" ? "مستخدم" : "Users"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === "ar" ? "يتم تحديث هذه القائمة تلقائياً فور قيام أي شخص بإنشاء حساب لدى الموقع." : "Live real-time updates whenever a new user registers on CardioVision."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchUsers()}
                    disabled={isRefreshingUsers}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-extrabold flex items-center gap-1.5 transition-all"
                    title={lang === "ar" ? "تحديث قائمة المستخدمين الآن" : "Refresh users list"}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshingUsers ? "animate-spin" : ""}`} />
                    <span>{lang === "ar" ? "تحديث" : "Refresh"}</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab("users")}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition-all shadow-sm"
                  >
                    {lang === "ar" ? "عرض كافة حسابات الطلاب ←" : "View All Users →"}
                  </button>
                </div>
              </div>

              {/* Quick Table of recent registered users */}
              <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-extrabold">
                      <th className="p-3 text-right rtl:text-right">{lang === "ar" ? "اسم الطالب / المستخدم" : "Student Name"}</th>
                      <th className="p-3 text-right rtl:text-right">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</th>
                      <th className="p-3 text-center">{lang === "ar" ? "تاريخ إنشاء الحساب" : "Registered At"}</th>
                      <th className="p-3 text-center">{lang === "ar" ? "حالة الحساب" : "Status"}</th>
                      <th className="p-3 text-center">{lang === "ar" ? "إجراءات التفعيل" : "Verification"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {(usersList || []).slice(0, 8).map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3 text-right rtl:text-right font-bold text-slate-200">
                          <div className="flex items-center gap-2 rtl:flex-row-reverse justify-end">
                            <span>{u.name}</span>
                            {u.role === "admin" && (
                              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black">
                                {lang === "ar" ? "مشرف" : "Admin"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right rtl:text-right font-mono text-[11px] text-slate-400">{u.email}</td>
                        <td className="p-3 text-center text-[11px] text-slate-400 font-mono">
                          {u.createdAt ? new Date(u.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
                            dateStyle: "short",
                            timeStyle: "short"
                          }) : "-"}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                            u.isVerified 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {u.isVerified ? "✓ " + (lang === "ar" ? "نشط ومفعل" : "Verified") : "✗ " + (lang === "ar" ? "معلق" : "Unverified")}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleVerifyUser(u.id)}
                            disabled={u.id === "admin-id"}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all border bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500/40 hover:text-indigo-400 disabled:opacity-40"
                          >
                            {u.isVerified ? (lang === "ar" ? "تعطيل الحساب" : "Disable") : (lang === "ar" ? "تفعيل الحساب" : "Enable")}
                          </button>
                        </td>
                      </tr>
                    ))}

                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-500 text-xs">
                          {lang === "ar" ? "لا يوجد أي مستخدم مسجل في قاعدة البيانات حالياً." : "No registered users found in database."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SUB-TAB 2: VERIFY PAYMENTS & SLIPS */}
        {activeSubTab === "receipts" && (
          <div className="space-y-6">
            
            {/* Header bar with Filter & Export buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rose-500" />
                  <span>{lang === "ar" ? "نظام تدقيق ومراجعة دفعات سيريتل كاش (0982257195)" : "Syriatel Cash Payment Auditing System"}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === "ar" ? "مراجعة إيصالات التحويل، التحقق من المبالغ، وتفعيل تنزيل ملفات التخرج للمستخدمين" : "Verify transfer receipts, validate reference numbers, and unlock download access."}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="/api/admin/payment-reports"
                  target="_blank"
                  download
                  className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs flex items-center gap-2 transition-all shadow"
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>{lang === "ar" ? "تصدير كشف الدفعات (CSV)" : "Export Payment CSV"}</span>
                </a>
              </div>
            </div>

            {/* Status Filter buttons */}
            <div className="flex border-b border-slate-800 text-xs font-bold gap-2">
              {(["all", "Under Review", "Pending", "Approved", "Rejected"] as const).map((filterKey) => {
                const count = filterKey === "all" 
                  ? allOrders.length 
                  : allOrders.filter(o => getOrderStatusCategory(o.status) === filterKey).length;
                
                return (
                  <button
                    key={filterKey}
                    onClick={() => setOrderFilter(filterKey)}
                    className={`pb-3 px-4 flex items-center gap-1.5 border-b-2 transition-all ${
                      orderFilter === filterKey 
                        ? "border-rose-500 text-rose-500 font-black" 
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>
                      {filterKey === "all" && (lang === "ar" ? "كافة الطلبات" : "All Orders")}
                      {filterKey === "Under Review" && (lang === "ar" ? "قيد التدقيق" : "Under Review")}
                      {filterKey === "Pending" && (lang === "ar" ? "بانتظار التحويل" : "Pending")}
                      {filterKey === "Approved" && (lang === "ar" ? "مقبول ومدفوع" : "Approved")}
                      {filterKey === "Rejected" && (lang === "ar" ? "مرفوض" : "Rejected")}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* List of orders for review */}
            {allOrders.filter(o => orderFilter === "all" || getOrderStatusCategory(o.status) === orderFilter).length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {allOrders
                  .filter(o => orderFilter === "all" || getOrderStatusCategory(o.status) === orderFilter)
                  .map((order) => {
                    const orderCategory = getOrderStatusCategory(order.status);
                    const isPaid = orderCategory === "Approved";
                    const isUnderReview = orderCategory === "Under Review";
                    const isPending = orderCategory === "Pending";
                    const isRejected = orderCategory === "Rejected";
                    const feedback = order.adminFeedback || order.rejectionReason || (order as any).admin_feedback;

                    return (
                      <div 
                        key={order.id}
                        className={`p-6 rounded-3xl border text-left space-y-4 relative overflow-hidden transition-all ${
                          isUnderReview 
                            ? "border-sky-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/20" 
                            : isPaid 
                            ? "border-emerald-500/30 bg-slate-900" 
                            : isRejected 
                            ? "border-rose-500/30 bg-slate-900"
                            : "border-slate-800 bg-slate-900/60"
                        }`}
                      >
                        {/* Header bar */}
                        <div className="flex justify-between items-start border-b border-slate-800/60 pb-3">
                          <div>
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full font-mono font-black uppercase border border-indigo-500/20">
                              Order ID: {order.id}
                            </span>
                            <h4 className="font-black text-base text-slate-100 mt-1.5">{order.projectTitle}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {lang === "ar" ? `معرف الطالب: ${order.userId}` : `Student ID: ${order.userId}`} • {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                            </p>
                          </div>

                          <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${
                            isPaid 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : isUnderReview 
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20 animate-pulse" 
                              : isRejected 
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {isPaid && (lang === "ar" ? "مقبول ومفعل" : "Approved & Active")}
                            {isUnderReview && (lang === "ar" ? "قيد المراجعة والتدقيق" : "Under Review")}
                            {isPending && (lang === "ar" ? "بانتظار رفع الإيصال" : "Awaiting Receipt")}
                            {isRejected && (lang === "ar" ? "مرفوض" : "Rejected")}
                          </span>
                        </div>

                        {/* Transaction Info Grid */}
                        {order.paymentReceipt ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">{lang === "ar" ? "الرقم المرجعي للتحويل:" : "Transaction Ref Number:"}</span>
                              <strong className="text-sm font-mono text-rose-400 block mt-1 tracking-wider">
                                {order.paymentReceipt.transactionNumber || (lang === "ar" ? "لم يُحدد (أرفق صورة فقط)" : "Not specified (Image only)")}
                              </strong>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">{lang === "ar" ? "رقم الهاتف المحول منه:" : "Sender Phone Number:"}</span>
                              <strong className="text-sm font-mono text-slate-200 block mt-1">{order.paymentReceipt.phoneSender || "0982257195"}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">{lang === "ar" ? "المبلغ المستحق / المحول:" : "Required Price:"}</span>
                              <strong className="text-sm font-mono text-emerald-400 block mt-1">${(order.price ?? (order as any).amountSyp ?? 0).toLocaleString()}</strong>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 font-medium">
                            {lang === "ar" ? "لم يقم الطالب برفع صورة الإيصال أو الرقم المرجعي للتحويل بعد." : "No receipt uploaded by student yet."}
                          </div>
                        )}

                        {/* Receipt Image Display */}
                        {order.paymentReceipt?.receiptImageUrl && (
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">{lang === "ar" ? "صورة إيصال التحويل المرفقة:" : "Attached Receipt Image:"}</span>
                            <div className="relative max-h-56 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2 w-fit">
                              <img 
                                src={order.paymentReceipt.receiptImageUrl} 
                                alt="Receipt slip" 
                                referrerPolicy="no-referrer"
                                className="max-h-52 object-contain rounded-xl" 
                              />
                            </div>
                          </div>
                        )}

                        {/* Rejection Reason display */}
                        {isRejected && feedback && (
                          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold space-y-1">
                            <div className="flex items-center gap-1.5 text-rose-300">
                              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                              <span>{lang === "ar" ? "سبب الرفض الموجه للطالب (admin_feedback):" : "Admin Feedback sent to student:"}</span>
                            </div>
                            <p className="ps-5 text-rose-200 font-semibold">{feedback}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          {!isPaid && (
                            <button
                              id={`btn-admin-approve-${order.id}`}
                              onClick={() => handleApproveReceipt(order.id)}
                              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-extrabold text-xs text-center flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>{lang === "ar" ? "قبول وتأكيد عملية التحويل" : "Approve Receipt & Activate"}</span>
                            </button>
                          )}

                          {!isRejected && (
                            <button
                              id={`btn-admin-reject-${order.id}`}
                              onClick={() => handleRejectReceipt(order.id)}
                              className="flex-1 py-3 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 font-extrabold text-xs text-center border border-rose-800 flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>{lang === "ar" ? "رفض الإيصال وتحديد السبب" : "Reject Receipt"}</span>
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-slate-800 rounded-3xl text-slate-500">
                <ShoppingCart className="w-12 h-12 mx-auto text-slate-700 mb-2" />
                <p className="text-xs font-bold">{lang === "ar" ? "لا توجد طلبات في هذا القسم حالياً." : "No orders matching filter."}</p>
              </div>
            )}

            {/* In-App Rejection Modal (Replacing window.prompt) */}
            {rejectModalOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-rose-500 font-black text-sm">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <span>{lang === "ar" ? "رفض إيصال الدفع وتوجيه سبب الرفض" : "Reject Syriatel Cash Receipt"}</span>
                    </div>
                    <button
                      onClick={() => setRejectModalOrder(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <p className="text-xs text-slate-300 font-bold mb-1">
                      {lang === "ar" ? `الطلب: ${rejectModalOrder.projectTitle}` : `Order: ${rejectModalOrder.projectTitle}`}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {lang === "ar" 
                        ? `معرف الطالب: ${rejectModalOrder.userId} | المبلغ: $${(rejectModalOrder.price ?? (rejectModalOrder as any).amountSyp ?? 0).toLocaleString()}`
                        : `Student: ${rejectModalOrder.userId} | Price: $${(rejectModalOrder.price ?? (rejectModalOrder as any).amountSyp ?? 0).toLocaleString()}`}
                    </p>
                  </div>

                  {/* Predefined Quick Reasons */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 block">
                      {lang === "ar" ? "أسباب شائعة (اختر للتعبئة السريعة):" : "Quick Selection Reasons:"}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        lang === "ar" ? "الرقم المرجعي للتحويل غير مطابق أو لم يتم العثور على العملية" : "Transaction reference ID not found or invalid",
                        lang === "ar" ? "صورة الإيصال غير واضحة المعالم، يرجى إعادة التقاطها بوضوح" : "Receipt screenshot is unclear or incomplete",
                        lang === "ar" ? "المبلغ المحول غير مطابق لسعر المشروع المطلوب" : "Transferred amount is insufficient",
                        lang === "ar" ? "التحويل تم إلى حساب غير معتمد لدى المنصة" : "Transfer was made to an unauthorized recipient"
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRejectReasonInput(preset)}
                          className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 border border-slate-700/80 transition-all text-left"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Input Field for admin_feedback */}
                  <div>
                    <label 
                      htmlFor="admin-rejection-feedback-input"
                      className="block text-xs font-black text-slate-300 mb-1.5"
                    >
                      {lang === "ar" ? "سبب الرفض الموجه للطالب (admin_feedback) *" : "Rejection Reason (admin_feedback) *"}
                    </label>
                    <textarea
                      id="admin-rejection-feedback-input"
                      rows={3}
                      value={rejectReasonInput}
                      onChange={(e) => setRejectReasonInput(e.target.value)}
                      placeholder={lang === "ar" ? "اكتب سبب الرفض بالتفصيل ليتمكن الطالب من تصحيحه..." : "Explain why the receipt was rejected..."}
                      className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none font-medium"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {lang === "ar" 
                        ? "سيظهر هذا السبب للطالب مباشرة في لوحة تحكمه وسيتيح له إعادة رفع الإيصال المصحح." 
                        : "This message will be shown to the student with an option to resubmit."}
                    </p>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isRejecting}
                      onClick={() => executeRejectOrder(rejectModalOrder.id, rejectReasonInput)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{isRejecting ? (lang === "ar" ? "جاري الإرسال..." : "Processing...") : (lang === "ar" ? "تأكيد الرفض وإشعار الطالب" : "Confirm Rejection")}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isRejecting}
                      onClick={() => setRejectModalOrder(null)}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                    >
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Logs Table Section */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-500" />
                    <span>{lang === "ar" ? "سجل التوثيق والأمان (Audit Log & Traceability)" : "Security & Audit Log"}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === "ar" ? "تسجيل آلي لكافة العمليات الحساسة (إنشاء الطلب، إرفاق الإيصال، مراجعة المشرف، قبول الدفع، رفض الدفع، وتحميل الملفات)." : "Automated log of all critical operations and file access attempts."}
                  </p>
                </div>
                <button
                  onClick={fetchAuditLogs}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  title={lang === "ar" ? "تحديث السجلات" : "Refresh Logs"}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "تحديث" : "Refresh"}</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl max-h-[32rem] overflow-y-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900/90 backdrop-blur text-slate-300 border-b border-slate-800 font-bold text-xs uppercase tracking-wider sticky top-0 z-10">
                      <th className="p-4 text-center whitespace-nowrap min-w-[170px] w-48">{lang === "ar" ? "التاريخ والوقت" : "Date & Time"}</th>
                      <th className="p-4 text-start whitespace-nowrap min-w-[140px]">{lang === "ar" ? "نوع الإجراء" : "Action"}</th>
                      <th className="p-4 text-start min-w-[200px]">{lang === "ar" ? "الطلب / المشروع" : "Order / Project"}</th>
                      <th className="p-4 text-start whitespace-nowrap min-w-[150px]">{lang === "ar" ? "البيانات المالية" : "Financial Data"}</th>
                      <th className="p-4 text-start min-w-[220px]">{lang === "ar" ? "الرقم المرجعي / الملاحظات" : "Reference & Notes"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {auditLogs.map((log) => {
                      // 1. Safe parsing of details
                      let parsedDetails: Record<string, any> | null = null;
                      if (log.details) {
                        if (typeof log.details === "object") {
                          parsedDetails = log.details;
                        } else if (typeof log.details === "string") {
                          try {
                            const parsed = JSON.parse(log.details);
                            if (typeof parsed === "string") {
                              try {
                                parsedDetails = JSON.parse(parsed);
                              } catch {
                                parsedDetails = { message: parsed };
                              }
                            } else if (typeof parsed === "object" && parsed !== null) {
                              parsedDetails = parsed;
                            } else {
                              parsedDetails = { value: String(parsed) };
                            }
                          } catch {
                            parsedDetails = { raw: log.details };
                          }
                        }
                      }

                      // 2. Shorten UUID / IDs helper
                      const shortenId = (id?: string) => {
                        if (!id) return "";
                        if (id.length <= 10) return `#${id}`;
                        if (id.startsWith("ord_")) return `#ord_${id.slice(4, 8)}`;
                        if (id.startsWith("proj_")) return `#proj_${id.slice(5, 10)}`;
                        if (id.startsWith("usr_")) return `#usr_${id.slice(4, 8)}`;
                        if (id.startsWith("log_")) return `#log_${id.slice(4, 8)}`;
                        return `#${id.slice(0, 8)}`;
                      };

                      // Resolve related Order and Project
                      const rawOrderId = log.orderId || parsedDetails?.orderId;
                      const matchingOrder = rawOrderId ? allOrders.find(o => o.id === rawOrderId) : null;
                      const rawProjectId = parsedDetails?.projectId || matchingOrder?.projectId;
                      const matchingProject = rawProjectId ? allProjects.find(p => p.id === rawProjectId) : null;
                      const projectTitle = matchingProject ? (lang === "ar" ? matchingProject.titleAr : matchingProject.titleEn) : null;

                      // 3. Unified Timestamp Formatting (YYYY/MM/DD HH:mm:ss AM/PM)
                      const rawTimestamp = log.timestamp || (log as any).createdAt;
                      let formattedDate = "-";
                      if (rawTimestamp) {
                        const d = new Date(rawTimestamp);
                        if (!isNaN(d.getTime())) {
                          const year = d.getFullYear();
                          const month = String(d.getMonth() + 1).padStart(2, "0");
                          const day = String(d.getDate()).padStart(2, "0");
                          let hours = d.getHours();
                          const minutes = String(d.getMinutes()).padStart(2, "0");
                          const seconds = String(d.getSeconds()).padStart(2, "0");
                          const isPm = hours >= 12;
                          const period = lang === "ar" ? (isPm ? "م" : "ص") : (isPm ? "PM" : "AM");
                          hours = hours % 12 || 12;
                          const hoursStr = String(hours).padStart(2, "0");
                          formattedDate = `${year}/${month}/${day} ${hoursStr}:${minutes}:${seconds} ${period}`;
                        }
                      }

                      // 4. Action Translation & Badge Styling
                      const actUpper = String(log.action || "").toUpperCase();
                      let actionLabel = log.action;
                      let actionColor = "bg-slate-800 text-slate-300 border-slate-700";

                      if (actUpper === "PAYMENT_VERIFIED") {
                        actionLabel = lang === "ar" ? "تحقق من الدفع" : "Payment Verified";
                        actionColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
                      } else if (actUpper === "PAYMENT_REJECTED") {
                        actionLabel = lang === "ar" ? "رفض الدفع" : "Payment Rejected";
                        actionColor = "bg-rose-500/15 text-rose-400 border-rose-500/30";
                      } else if (actUpper === "PAYMENT_SUBMITTED") {
                        actionLabel = lang === "ar" ? "تقديم إيصال الدفع" : "Payment Submitted";
                        actionColor = "bg-amber-500/15 text-amber-400 border-amber-500/30";
                      } else if (actUpper === "ORDER_CREATED") {
                        actionLabel = lang === "ar" ? "إنشاء طلب جديد" : "Order Created";
                        actionColor = "bg-blue-500/15 text-blue-400 border-blue-500/30";
                      } else if (actUpper === "USER_REGISTERED") {
                        actionLabel = lang === "ar" ? "تسجيل مستخدم" : "User Registered";
                        actionColor = "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
                      } else if (actUpper === "OWNER_LOGGED_IN" || actUpper === "ADMIN_LOGGED_IN") {
                        actionLabel = lang === "ar" ? "دخول المشرف" : "Admin Login";
                        actionColor = "bg-purple-500/15 text-purple-400 border-purple-500/30";
                      } else if (actUpper.includes("GOOGLE_USER")) {
                        actionLabel = lang === "ar" ? "دخول عبر Google" : "Google Login";
                        actionColor = "bg-sky-500/15 text-sky-400 border-sky-500/30";
                      } else if (actUpper === "PROJECT_COMMENT_POSTED") {
                        actionLabel = lang === "ar" ? "تعليق على مشروع" : "Comment Posted";
                        actionColor = "bg-teal-500/15 text-teal-400 border-teal-500/30";
                      } else if (actUpper === "PROJECT_RATING_SUBMITTED") {
                        actionLabel = lang === "ar" ? "تقييم مشروع" : "Rating Submitted";
                        actionColor = "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
                      } else if (actUpper === "PLATFORM_FEEDBACK_SUBMITTED" || actUpper === "BULK_FLAG_FEEDBACK") {
                        actionLabel = lang === "ar" ? "تقييم المنصة" : "Platform Feedback";
                        actionColor = "bg-orange-500/15 text-orange-400 border-orange-500/30";
                      } else {
                        if (actUpper.includes("APPROVED") || actUpper.includes("SUCCESS")) {
                          actionColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
                        } else if (actUpper.includes("REJECT") || actUpper.includes("FAIL")) {
                          actionColor = "bg-rose-500/15 text-rose-400 border-rose-500/30";
                        } else if (actUpper.includes("PENDING")) {
                          actionColor = "bg-amber-500/15 text-amber-400 border-amber-500/30";
                        }
                      }

                      // 5. Financial Data (Amount & Status)
                      const effectiveAmount = parsedDetails?.amountSyp !== undefined && parsedDetails?.amountSyp !== null
                        ? Number(parsedDetails.amountSyp)
                        : (matchingOrder?.amountSyp !== undefined ? Number(matchingOrder.amountSyp) : null);

                      const rawStatus = parsedDetails?.status || matchingOrder?.status;
                      let statusBadge: { label: string; className: string } | null = null;
                      if (rawStatus) {
                        const s = String(rawStatus).toLowerCase();
                        if (s === "approved" || s === "paid" || s === "completed" || s === "success") {
                          statusBadge = {
                            label: lang === "ar" ? "مقبول (Approved)" : "Approved",
                            className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          };
                        } else if (s === "pending_verification" || s === "pending" || s === "under review") {
                          statusBadge = {
                            label: lang === "ar" ? "قيد التدقيق (Pending)" : "Pending",
                            className: "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          };
                        } else if (s === "rejected" || s === "payment_rejected" || s === "failed") {
                          statusBadge = {
                            label: lang === "ar" ? "مرفوض (Rejected)" : "Rejected",
                            className: "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          };
                        } else {
                          statusBadge = {
                            label: String(rawStatus),
                            className: "bg-slate-800 text-slate-300 border-slate-700"
                          };
                        }
                      }

                      // Rejection feedback / reason
                      const rejectionReason = parsedDetails?.reason || parsedDetails?.adminFeedback;

                      return (
                        <tr key={log.id} className="hover:bg-slate-900/70 transition-colors">
                          {/* 1. Date & Time */}
                          <td className="p-4 text-center font-mono text-xs text-slate-300 whitespace-nowrap">
                            {formattedDate}
                          </td>

                          {/* 2. Action Type */}
                          <td className="p-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${actionColor}`}>
                              {actionLabel}
                            </span>
                          </td>

                          {/* 3. Order / Project */}
                          <td className="p-4">
                            <div className="flex flex-col gap-1 max-w-xs">
                              {projectTitle && (
                                <span className="font-semibold text-slate-100 text-xs sm:text-sm line-clamp-1" title={projectTitle}>
                                  {projectTitle}
                                </span>
                              )}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {rawOrderId && (
                                  <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60 font-mono text-xs text-indigo-300 font-semibold" title={rawOrderId}>
                                    {shortenId(rawOrderId)}
                                  </span>
                                )}
                                {rawProjectId && !projectTitle && (
                                  <span className="inline-block px-1.5 py-0.5 rounded bg-slate-850 border border-slate-750 font-mono text-xs text-slate-300" title={rawProjectId}>
                                    {shortenId(rawProjectId)}
                                  </span>
                                )}
                                {parsedDetails?.email && (
                                  <span className="text-xs font-mono text-violet-300">
                                    {parsedDetails.email}
                                  </span>
                                )}
                                {!rawOrderId && !rawProjectId && !parsedDetails?.email && log.userId && (
                                  <span className="text-xs font-mono text-slate-400" title={log.userId}>
                                    {shortenId(log.userId)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 4. Financial Data (Amount & Status stacked) */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1 items-start">
                              {effectiveAmount !== null ? (
                                <span className="text-sm font-bold font-mono text-emerald-400">
                                  {effectiveAmount.toLocaleString()} {lang === "ar" ? "ل.س" : "SYP"}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500 font-mono">-</span>
                              )}
                              {statusBadge && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusBadge.className}`}>
                                  {statusBadge.label}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 5. Reference & Notes */}
                          <td className="p-4">
                            <div className="flex flex-col gap-1.5 max-w-sm">
                              {/* Transaction ID */}
                              {parsedDetails?.transactionId && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-slate-400 text-xs">
                                    {lang === "ar" ? "رقم الحوالة:" : "Tx ID:"}
                                  </span>
                                  <span className="font-mono font-bold text-cyan-300 text-xs bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded-md">
                                    {parsedDetails.transactionId}
                                  </span>
                                </div>
                              )}

                              {/* Sender Phone */}
                              {parsedDetails?.senderPhone && (
                                <div className="text-xs font-mono text-slate-400">
                                  <span className="text-slate-500">{lang === "ar" ? "المرسل: " : "From: "}</span>
                                  <span className="text-slate-300">{parsedDetails.senderPhone}</span>
                                </div>
                              )}

                              {/* Payment Method */}
                              {parsedDetails?.method && (
                                <div className="text-[11px] text-indigo-300">
                                  {parsedDetails.method === "syriatel_cash" ? (lang === "ar" ? "سيريتل كاش" : "Syriatel Cash") : parsedDetails.method}
                                </div>
                              )}

                              {/* Rejection Feedback / Reason in small red text */}
                              {rejectionReason && (
                                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs">
                                  <div className="font-bold text-[11px] text-rose-400 flex items-center gap-1">
                                    <span>⚠</span>
                                    <span>{lang === "ar" ? "سبب الرفض:" : "Rejection Reason:"}</span>
                                  </div>
                                  <div className="mt-0.5 text-rose-200">
                                    {rejectionReason}
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {parsedDetails?.notes && String(parsedDetails.notes).trim() !== "" && (
                                <div className="text-xs text-slate-400">
                                  <span className="text-slate-500">{lang === "ar" ? "ملاحظات: " : "Notes: "}</span>
                                  <span>{parsedDetails.notes}</span>
                                </div>
                              )}

                              {/* Feedback message snippet */}
                              {parsedDetails?.messageSnippet && (
                                <div className="text-xs text-slate-300 italic">
                                  "{parsedDetails.messageSnippet}"
                                </div>
                              )}

                              {/* Rating */}
                              {parsedDetails?.rating !== undefined && (
                                <div className="text-xs font-semibold text-amber-300">
                                  ⭐ {parsedDetails.rating}/5
                                </div>
                              )}

                              {/* Fallback if no reference/notes info */}
                              {!parsedDetails?.transactionId && !parsedDetails?.senderPhone && !parsedDetails?.method && !rejectionReason && !parsedDetails?.notes && !parsedDetails?.messageSnippet && parsedDetails?.rating === undefined && (
                                <span className="text-slate-500 text-xs">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-500 text-sm">
                          {lang === "ar" ? "لا توجد سجلات أمنية بعد." : "No audit logs found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SUB-TAB 3: MANAGE PROJECTS CATALOG */}
        {activeSubTab === "projects" && (
          <div className="space-y-8">
            
            {/* Project Creator Form */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-rose-500" />
                  <span>
                    {editingProjectId ? (lang === "ar" ? `تعديل المشروع: ${titleAr}` : `Edit Project: ${titleEn}`) : (lang === "ar" ? "إضافة مشروع تخرج جديد" : "Add New Graduation Project")}
                  </span>
                </h3>
                {editingProjectId && (
                  <button 
                    onClick={clearProjectForm} 
                    className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold"
                  >
                    {lang === "ar" ? "إلغاء التعديل" : "Cancel Edit"}
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4 text-xs text-slate-300">
                
                {/* Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "اسم المشروع باللغة العربية:" : "Project Name (Arabic):"}</label>
                    <input
                      type="text"
                      value={titleAr}
                      onChange={(e) => setTitleAr(e.target.value)}
                      placeholder="CardioVision: تتبع نبضات القلب..."
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "اسم المشروع باللغة الإنجليزية:" : "Project Name (English):"}</label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="CardioVision: IoT Heart Rate..."
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                      required
                    />
                  </div>
                </div>

                {/* Categories, Difficulty & Price */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "قسم المشروع الهندسية:" : "Engineering Field Category:"}</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                    >
                      <option value="biomedical">{lang === "ar" ? "الهندسة الطبية" : "Biomedical"}</option>
                      <option value="software">{lang === "ar" ? "البرمجيات والذكاء الاصطناعي" : "Software & AI"}</option>
                      <option value="electrical">{lang === "ar" ? "الكهربائية والتحكم" : "Electrical"}</option>
                      <option value="communications">{lang === "ar" ? "الاتصالات" : "Communications"}</option>
                      <option value="mechatronics">{lang === "ar" ? "الميكاترونكس" : "Mechatronics"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "مستوى الصعوبة:" : "Difficulty Level:"}</label>
                    <select
                      value={difficultyLevel}
                      onChange={(e) => setDifficultyLevel(e.target.value as any)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100 font-bold"
                    >
                      <option value="easy">{lang === "ar" ? "LVL-01 · سهل (Easy)" : "LVL-01 · Easy"}</option>
                      <option value="medium">{lang === "ar" ? "LVL-02 · متوسط (Medium)" : "LVL-02 · Medium"}</option>
                      <option value="hard">{lang === "ar" ? "LVL-03 · صعب (Hard / Advanced)" : "LVL-03 · Hard / Advanced"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "سعر المشروع بالدولار ($):" : "Price (USD $):"}</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 149"
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "مدة التسليم التقريبية:" : "Delivery / Assembly Duration:"}</label>
                    <input
                      type="text"
                      value={durationAr}
                      onChange={(e) => setDurationAr(e.target.value)}
                      placeholder="e.g. 7 أيام"
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                    />
                  </div>
                </div>

                {/* Universities & Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "الجامعة (اختياري):" : "University (Optional):"}</label>
                    <input
                      type="text"
                      value={universityAr}
                      onChange={(e) => setUniversityAr(e.target.value)}
                      placeholder="جامعة دمشق"
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "نوع ومخرجات المشروع:" : "Project Deliverable Type:"}</label>
                    <input
                      type="text"
                      value={projectTypeAr}
                      onChange={(e) => setProjectTypeAr(e.target.value)}
                      placeholder="مشروع تخرج عتادي برمجي متكامل"
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                    />
                  </div>
                </div>

                {/* Short Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "الوصف القصير بالعربية:" : "Description (Arabic):"}</label>
                    <textarea
                      value={descriptionAr}
                      onChange={(e) => setDescriptionAr(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100 h-20"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "الوصف القصير بالإنجليزية:" : "Description (English):"}</label>
                    <textarea
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100 h-20"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Media assets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "رابط الصورة المصغرة (Thumbnail URL):" : "Thumbnail Image URL:"}</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "رابط فيديو يوتيوب للتوضيح (Embed Video URL):" : "YouTube Video URL (embed format):"}</label>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/..."
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "رابط تنزيل ملفات المشروع (ZIP/PDF Link):" : "ZIP/PDF Download Path:"}</label>
                    <input
                      type="text"
                      value={projectFileUrl}
                      onChange={(e) => setProjectFileUrl(e.target.value)}
                      placeholder="/downloads/my_project.zip"
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                    />
                  </div>
                </div>

                {/* Lists parameters - Comma separated inputs */}
                <div>
                  <h4 className="font-bold text-rose-400 border-b border-slate-850 pb-1 mb-2">
                    ⚡ {lang === "ar" ? "قوائم الخصائص والمكونات (يرجى فصل العناصر بفاصلة لوضعها كبطاقات):" : "Fidelity technical matrices (separate by commas):"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "المكونات المادية والعناصر المستعملة (عربي):" : "Hardware elements (Arabic comma separated):"}</label>
                      <input
                        type="text"
                        value={componentsAr}
                        onChange={(e) => setComponentsAr(e.target.value)}
                        placeholder="ESP32, حساس نبضات AD8232, شاشة OLED"
                        className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "البرامج والبيئات المستخدمة (عربي):" : "Software libraries (Arabic comma separated):"}</label>
                      <input
                        type="text"
                        value={softwareAr}
                        onChange={(e) => setSoftwareAr(e.target.value)}
                        placeholder="بيئة أردوينو, ريأكت, نود"
                        className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-black text-xs hover:opacity-95"
                  id="admin-save-project-btn"
                >
                  {loading ? "Saving..." : (editingProjectId ? (lang === "ar" ? "حفظ وتعديل التغييرات" : "Update Project") : (lang === "ar" ? "نشر المشروع الهندسية بالمنصة" : "Publish Project"))}
                </button>

              </form>
            </div>

            {/* Recharts Project Popularity Trends in Projects Tab */}
            <ProjectPopularityChart 
              lang={lang} 
              theme={theme} 
              onSelectProject={(id) => {
                const p = allProjects.find(x => x.id === id);
                if (p) { setSelectedEditProject(p); setIsEditModalOpen(true); }
              }}
            />

            {/* List of existing projects with delete / edit controls and batch operations */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-100">
                      📋 {lang === "ar" ? "أرشيف المشاريع المتاحة للتعديل والحذف" : "Active Catalog Inventory"}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {allProjects.length}
                    </span>
                    {selectedProjectIds.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold animate-pulse">
                        {lang === "ar" ? `${selectedProjectIds.length} محدد` : `${selectedProjectIds.length} selected`}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {lang === "ar"
                      ? "إدارة وتعديل وتصدير كافة المشاريع البرمجية والهندسية المسجلة"
                      : "Manage, batch-edit, and export all platform engineering projects"}
                  </p>
                </div>

                {/* Batch Actions & CSV Export Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Select All Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                      selectedProjectIds.length === allProjects.length && allProjects.length > 0
                        ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {selectedProjectIds.length === allProjects.length && allProjects.length > 0 ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
                        <span>{lang === "ar" ? "إلغاء التحديد" : "Deselect All"}</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lang === "ar" ? "تحديد الكل" : "Select All"}</span>
                      </>
                    )}
                  </button>

                  {/* Bulk Edit Trigger Button */}
                  {selectedProjectIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowBulkEditModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>
                        {lang === "ar"
                          ? `تعديل جماعي (${selectedProjectIds.length})`
                          : `Bulk Edit (${selectedProjectIds.length})`}
                      </span>
                    </button>
                  )}

                  {/* Export CSV Button */}
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    disabled={isExportingCsv}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                    title={lang === "ar" ? "تنزيل ملف CSV يحتوي كافة بيانات المشاريع" : "Export project inventory as CSV"}
                  >
                    <Download className={`w-3.5 h-3.5 ${isExportingCsv ? "animate-bounce" : ""}`} />
                    <span>
                      {isExportingCsv
                        ? (lang === "ar" ? "جاري التصدير..." : "Exporting...")
                        : (lang === "ar" ? "تصدير CSV" : "Export CSV")}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {allProjects.map((project) => {
                  const isSelected = selectedProjectIds.includes(project.id);
                  const status = project.status || "active";
                  return (
                    <div 
                      key={project.id} 
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                        isSelected 
                          ? "bg-rose-500/5 border-rose-500/40 shadow-sm" 
                          : "bg-slate-950 border-slate-850 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox for batch editing selection */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectProject(project.id)}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-700 bg-slate-900 cursor-pointer shrink-0"
                          title={lang === "ar" ? "تحديد المشروع للتعديل الجماعي" : "Select project for batch edit"}
                        />

                        <img 
                          src={project.imageUrl} 
                          alt={project.titleAr} 
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover shrink-0" 
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-black text-slate-200">
                              {lang === "ar" ? project.titleAr : project.titleEn}
                            </h4>

                            {/* Status badge */}
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : status === "draft"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}>
                              {status === "active" ? (lang === "ar" ? "نشط" : "Active") : status === "draft" ? (lang === "ar" ? "مسودة" : "Draft") : (lang === "ar" ? "مؤرشف" : "Archived")}
                            </span>

                            {/* Category badge */}
                            {project.category && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                {project.category}
                              </span>
                            )}

                            {/* Difficulty level badge */}
                            {project.difficultyLevel && (
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                project.difficultyLevel === "easy"
                                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                  : project.difficultyLevel === "hard"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              }`}>
                                {project.difficultyLevel}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1">
                            <span className="text-rose-400 font-bold">
                              Price: ${(project?.price ?? (project as any)?.priceSyp ?? 0).toLocaleString()}
                            </span>
                            <span>•</span>
                            <span>ID: {project.id}</span>
                            <span>•</span>
                            <span>{project.viewsCount ?? 0} {lang === "ar" ? "مشاهدة" : "views"}</span>
                            <span>•</span>
                            <span>{project.likesCount ?? 0} {lang === "ar" ? "إعجاب" : "likes"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => { setSelectedEditProject(project); setIsEditModalOpen(true); }}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 transition-colors"
                          title="Edit Project"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-500 border border-slate-800 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bulk Edit Modal */}
            <BulkEditProjectsModal
              isOpen={showBulkEditModal}
              onClose={() => setShowBulkEditModal(false)}
              selectedProjectIds={selectedProjectIds}
              selectedProjects={allProjects.filter(p => selectedProjectIds.includes(p.id))}
              categories={categories}
              lang={lang}
              theme={theme}
              onSuccess={() => {
                setSelectedProjectIds([]);
                onRefreshProjects();
                setSuccess(
                  lang === "ar"
                    ? "تم تطبيق التعديلات الجماعية على المشاريع بنجاح"
                    : "Batch updates applied successfully to selected projects"
                );
              }}
            />

          </div>
        )}

        {/* SUB-TAB: CATEGORY MANAGEMENT */}
        {activeSubTab === "categories" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form to Add / Edit Category */}
            <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left h-fit space-y-4">
              <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                📂 {editingCategoryId ? (lang === "ar" ? "تعديل اسم القسم" : "Edit Category Label") : (lang === "ar" ? "إضافة قسم جديد" : "Create New Category")}
              </h3>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="font-bold text-slate-400 block mb-1 text-xs">
                    {lang === "ar" ? "رمز القسم الفريد (ID - لا يمكن تعديله لاحقاً):" : "Unique ID Code (ID - Cannot be changed later):"}
                  </label>
                  <input
                    type="text"
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    disabled={!!editingCategoryId}
                    placeholder="e.g. electrical-power"
                    className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-400 block mb-1 text-xs">
                    {lang === "ar" ? "الاسم باللغة العربية:" : "Name in Arabic:"}
                  </label>
                  <input
                    type="text"
                    value={catLabelAr}
                    onChange={(e) => setCatLabelAr(e.target.value)}
                    placeholder="e.g. القوى الكهربائية"
                    className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-400 block mb-1 text-xs">
                    {lang === "ar" ? "الاسم باللغة الإنكليزية:" : "Name in English:"}
                  </label>
                  <input
                    type="text"
                    value={catLabelEn}
                    onChange={(e) => setCatLabelEn(e.target.value)}
                    placeholder="e.g. Electrical Power"
                    className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white transition-all disabled:opacity-50"
                  >
                    {loading ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ القسم" : "Save Category")}
                  </button>

                  {editingCategoryId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(null);
                        setCatId("");
                        setCatLabelAr("");
                        setCatLabelEn("");
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-400 border border-slate-850"
                    >
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List of Existing Categories */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left space-y-4">
              <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                📋 {lang === "ar" ? "أقسام التخرج المتوفرة بالمنصة" : "Active Engineering Fields"}
              </h3>

              <div className="space-y-2">
                {(categories || []).filter(c => c.id !== "all").map((cat) => (
                  <div key={cat.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-black text-slate-200 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-[9px] text-rose-400 font-mono">
                          {cat.id}
                        </span>
                        {lang === "ar" ? cat.labelAr : cat.labelEn}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        AR: {cat.labelAr} | EN: {cat.labelEn}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategoryClick(cat)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800"
                        title="Edit Category Label"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-500 border border-slate-800"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB: USER DATABASE MANAGEMENT */}
        {activeSubTab === "users" && (
          <div className="space-y-6">
            
            {/* Quick Summary Pill Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {lang === "ar" ? "إجمالي المسجلين" : "Total Users"}
                </span>
                <span className="text-2xl font-black text-white mt-0.5 block font-mono">{usersList.length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {lang === "ar" ? "حسابات الطلاب" : "Students"}
                </span>
                <span className="text-2xl font-black text-indigo-400 mt-0.5 block font-mono">
                  {usersList.filter(u => u.role !== "admin").length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {lang === "ar" ? "الحسابات المفعّلة" : "Verified Accounts"}
                </span>
                <span className="text-2xl font-black text-emerald-400 mt-0.5 block font-mono">
                  {usersList.filter(u => u.isVerified).length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {lang === "ar" ? "المشرفين" : "Admins"}
                </span>
                <span className="text-2xl font-black text-rose-500 mt-0.5 block font-mono">
                  {usersList.filter(u => u.role === "admin").length}
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                    👥 <span>{lang === "ar" ? "سجل كافة حسابات الطلاب والمستخدمين" : "User Database & Registry"}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {lang === "ar" ? "تتبع مباشر وآنية لكافة الأشخاص الذين قاموا بإنشاء حساب لدى الموقع." : "Live real-time monitoring of all users registered on the platform."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setShowAddUserModal(!showAddUserModal)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:opacity-90 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-md"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "إضافة حساب طالب جديد" : "Add New Student"}</span>
                  </button>

                  <button
                    onClick={() => fetchUsers()}
                    disabled={isRefreshingUsers}
                    className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshingUsers ? "animate-spin" : ""}`} />
                    <span>{lang === "ar" ? "تحديث السجل" : "Refresh Registry"}</span>
                  </button>

                  {/* User search bar */}
                  <div className="relative w-full md:w-64">
                    <input
                      type="text"
                      value={userSearchText}
                      onChange={(e) => setUserSearchText(e.target.value)}
                      placeholder={lang === "ar" ? "بحث بالاسم أو البريد..." : "Search by name or email..."}
                      className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500"
                    />
                    {userSearchText && (
                      <button
                        onClick={() => setUserSearchText("")}
                        className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Student Modal / Form inline collapsible */}
              {showAddUserModal && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3">
                  <h4 className="text-xs font-black text-indigo-400 flex items-center justify-between">
                    <span>{lang === "ar" ? "➕ إنشاء طالب جديد يدوياً وتخزينه بالحاسوب" : "➕ Create New Student"}</span>
                    <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
                  </h4>
                  <form onSubmit={handleCreateStudentUser} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">{lang === "ar" ? "اسم الطالب الثلاثي:" : "Full Name:"}</label>
                      <input
                        type="text"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        placeholder="مثال: أحمد خالد المحمود"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">{lang === "ar" ? "البريد الإلكتروني:" : "Email Address:"}</label>
                      <input
                        type="email"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        placeholder="student@gmail.com"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">{lang === "ar" ? "كلمة المرور الحساب:" : "Password:"}</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newStudentPassword}
                          onChange={(e) => setNewStudentPassword(e.target.value)}
                          placeholder="كلمة مرور السر"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none"
                          required
                        />
                        <button
                          type="submit"
                          disabled={addUserLoading}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shrink-0 disabled:opacity-50"
                        >
                          {addUserLoading ? "جاري..." : (lang === "ar" ? "حفظ" : "Save")}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Table of users */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-extrabold">
                      <th className="p-3 text-right rtl:text-right">{lang === "ar" ? "الاسم" : "Name"}</th>
                      <th className="p-3 text-right rtl:text-right">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</th>
                      <th className="p-3 text-right rtl:text-right">{lang === "ar" ? "الدور" : "Role"}</th>
                      <th className="p-3 text-center">{lang === "ar" ? "الطلبات" : "Orders"}</th>
                      <th className="p-3 text-center">{lang === "ar" ? "تاريخ التسجيل" : "Joined"}</th>
                      <th className="p-3 text-center">{lang === "ar" ? "آخر دخول" : "Last Login"}</th>
                      <th className="p-3 text-center">{lang === "ar" ? "التفعيل" : "Verification"}</th>
                      <th className="p-3 text-center">{lang === "ar" ? "حالة الحساب" : "Account Status"}</th>
                      <th className="p-3 text-center">{lang === "ar" ? "الإجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {usersList.filter(u => {
                      const search = userSearchText.toLowerCase();
                      return u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
                    }).length > 0 ? (
                      usersList.filter(u => {
                        const search = userSearchText.toLowerCase();
                        return u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
                      }).map((user) => (
                        <tr key={user.id} className="hover:bg-slate-900/55 transition-colors">
                          <td className="p-3 text-right rtl:text-right font-bold text-slate-200">{user.name}</td>
                          <td className="p-3 text-right rtl:text-right font-mono text-[11px] text-slate-400">{user.email}</td>
                          <td className="p-3 text-right rtl:text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              user.role === "admin" 
                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            }`}>
                              {user.role === "admin" ? (lang === "ar" ? "مشرف" : "Admin") : (lang === "ar" ? "طالب" : "Student")}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-indigo-400 text-[11px]">
                            {user.ordersCount || 0}
                          </td>
                          <td className="p-3 text-center text-[11px] text-slate-500 font-mono">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                          </td>
                          <td className="p-3 text-center text-[11px] text-slate-400 font-mono">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(user.lastLoginAt).toLocaleDateString() : (lang === "ar" ? "لم يدخل بعد" : "Never")}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleToggleVerifyUser(user.id)}
                              disabled={user.id === "admin-id"}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all border ${
                                user.isVerified 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                              }`}
                              title={lang === "ar" ? "اضغط لتغيير حالة توثيق البريد" : "Click to toggle verification"}
                            >
                              {user.isVerified ? (lang === "ar" ? "✓ موثق" : "Verified") : (lang === "ar" ? "✗ غير موثق" : "Unverified")}
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              disabled={user.id === "admin-id"}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all border ${
                                user.status === "disabled"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20" 
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              }`}
                              title={lang === "ar" ? "اضغط لتعطيل أو تنشيط قدرة الحساب على الدخول" : "Toggle active/disabled status"}
                            >
                              {user.status === "disabled" ? (lang === "ar" ? "⛔ معطل" : "Disabled") : (lang === "ar" ? "🟢 نشط" : "Active")}
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.id === "admin-id"}
                              className={`p-1.5 rounded-xl border transition-all ${
                                user.id === "admin-id" 
                                  ? "opacity-30 cursor-not-allowed text-slate-600 border-transparent" 
                                  : "text-rose-500 border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/20 bg-slate-900"
                              }`}
                              title={lang === "ar" ? "حذف الحساب نهائياً" : "Delete user"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-slate-500">
                          {lang === "ar" ? "لا يوجد مستخدمين يطابقون معايير البحث." : "No users matched your query."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB: REVIEWS & COMMENTS MANAGEMENT */}
        {activeSubTab === "reviews" && (
          <div className="space-y-6">
            
            {/* Quick Summary Pill Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {lang === "ar" ? "إجمالي التعليقات" : "Total Comments"}
                </span>
                <span className="text-2xl font-black text-cyan-400 mt-0.5 block font-mono">{allCommentsList.length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {lang === "ar" ? "إجمالي التقييمات" : "Total Reviews"}
                </span>
                <span className="text-2xl font-black text-amber-400 mt-0.5 block font-mono">
                  {reviewsStats?.totalReviews ?? stats?.reviewsCount ?? 0}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {lang === "ar" ? "متوسط التقييم العام" : "Average Rating"}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-2xl font-black text-white font-mono">
                    {reviewsStats?.averageRating ? Number(reviewsStats.averageRating).toFixed(1) : (stats?.averageProjectRating ? Number(stats.averageProjectRating).toFixed(1) : "5.0")}
                  </span>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {lang === "ar" ? "التعليقات النشطة" : "Active Comments"}
                </span>
                <span className="text-2xl font-black text-emerald-400 mt-0.5 block font-mono">
                  {allCommentsList.filter(c => (c.status || "active") === "active").length}
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                    💬 <span>{lang === "ar" ? "إدارة التعليقات وتقييمات الطلاب (مزامنة PostgreSQL)" : "Project Feedback & Reviews (PostgreSQL Live)"}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {lang === "ar" ? "مزامنة لحظية مباشرة مع قاعدة بيانات PostgreSQL / Neon — يمكنك مراجعة وحذف كافة الآراء وتعديل حالتها." : "Live synchronized records with PostgreSQL Neon database — moderate, update statuses, or delete."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* View Mode Switcher */}
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setReviewsViewMode("reviews")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        reviewsViewMode === "reviews"
                          ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{lang === "ar" ? `تقييمات المشاريع (${allReviewsList.length})` : `Reviews (${allReviewsList.length})`}</span>
                    </button>
                    <button
                      onClick={() => setReviewsViewMode("comments")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        reviewsViewMode === "comments"
                          ? "bg-indigo-600 text-white font-black shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{lang === "ar" ? `التعليقات (${allCommentsList.length})` : `Comments (${allCommentsList.length})`}</span>
                    </button>
                    <button
                      onClick={() => setReviewsViewMode("ratings")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        reviewsViewMode === "ratings"
                          ? "bg-indigo-600 text-white font-black shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>{lang === "ar" ? "تحليل النجوم" : "Star Ratings"}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => fetchReviewsAdmin()}
                    disabled={isRefreshingReviews}
                    className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshingReviews ? "animate-spin" : ""}`} />
                    <span>{lang === "ar" ? "تحديث" : "Refresh"}</span>
                  </button>
                </div>
              </div>

              {/* VIEW 0: REVIEWS LIST (Direct from PostgreSQL reviews table) */}
              {reviewsViewMode === "reviews" && (
                <div className="space-y-4">
                  {/* Filter & Search Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={reviewSearchText}
                        onChange={(e) => setReviewSearchText(e.target.value)}
                        placeholder={lang === "ar" ? "بحث باسم الطالب، البريد، المشروع، أو نص التقييم..." : "Search by student, email, project, or review text..."}
                        className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl ps-9 pe-8 py-2 text-slate-100 placeholder-slate-500"
                      />
                      {reviewSearchText && (
                        <button
                          onClick={() => setReviewSearchText("")}
                          className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Project filter dropdown */}
                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <select
                        value={reviewProjectFilter}
                        onChange={(e) => setReviewProjectFilter(e.target.value)}
                        className="text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl px-2.5 py-2 text-slate-200 cursor-pointer max-w-[180px]"
                      >
                        <option value="all">{lang === "ar" ? "جميع المشاريع" : "All Projects"}</option>
                        {allProjects.map(p => (
                          <option key={p.id} value={p.id}>
                            {lang === "ar" ? p.titleAr : p.titleEn}
                          </option>
                        ))}
                      </select>

                      {/* Rating star filter dropdown */}
                      <select
                        value={reviewRatingFilter}
                        onChange={(e) => setReviewRatingFilter(e.target.value)}
                        className="text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl px-2.5 py-2 text-slate-200 cursor-pointer"
                      >
                        <option value="all">{lang === "ar" ? "جميع النجوم" : "All Stars"}</option>
                        <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                        <option value="4">⭐⭐⭐⭐ (4)</option>
                        <option value="3">⭐⭐⭐ (3)</option>
                        <option value="2">⭐⭐ (2)</option>
                        <option value="1">⭐ (1)</option>
                      </select>
                    </div>
                  </div>

                  {/* Reviews Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-inner">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-extrabold uppercase tracking-wider text-[11px]">
                          <th className="p-3 text-right rtl:text-right">{lang === "ar" ? "الطالب" : "Student"}</th>
                          <th className="p-3 text-right rtl:text-right">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</th>
                          <th className="p-3 text-right rtl:text-right">{lang === "ar" ? "المشروع المستهدف" : "Target Project"}</th>
                          <th className="p-3 text-center">{lang === "ar" ? "التقييم" : "Rating"}</th>
                          <th className="p-3 text-right rtl:text-right">{lang === "ar" ? "نص التقييم / ملاحظات" : "Review Text"}</th>
                          <th className="p-3 text-center">{lang === "ar" ? "تاريخ التقييم" : "Date"}</th>
                          <th className="p-3 text-center">{lang === "ar" ? "إجراء" : "Action"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {allReviewsList.filter((r) => {
                          const matchesSearch = !reviewSearchText || 
                            (r.userName && r.userName.toLowerCase().includes(reviewSearchText.toLowerCase())) ||
                            (r.userEmail && r.userEmail.toLowerCase().includes(reviewSearchText.toLowerCase())) ||
                            (r.projectTitleAr && r.projectTitleAr.toLowerCase().includes(reviewSearchText.toLowerCase())) ||
                            (r.projectTitleEn && r.projectTitleEn.toLowerCase().includes(reviewSearchText.toLowerCase())) ||
                            (r.reviewText && r.reviewText.toLowerCase().includes(reviewSearchText.toLowerCase()));
                          const matchesProject = reviewProjectFilter === "all" || r.projectId === reviewProjectFilter || r.project_id === reviewProjectFilter;
                          const matchesRating = reviewRatingFilter === "all" || String(r.rating) === reviewRatingFilter;
                          return matchesSearch && matchesProject && matchesRating;
                        }).length > 0 ? (
                          allReviewsList.filter((r) => {
                            const matchesSearch = !reviewSearchText || 
                              (r.userName && r.userName.toLowerCase().includes(reviewSearchText.toLowerCase())) ||
                              (r.userEmail && r.userEmail.toLowerCase().includes(reviewSearchText.toLowerCase())) ||
                              (r.projectTitleAr && r.projectTitleAr.toLowerCase().includes(reviewSearchText.toLowerCase())) ||
                              (r.projectTitleEn && r.projectTitleEn.toLowerCase().includes(reviewSearchText.toLowerCase())) ||
                              (r.reviewText && r.reviewText.toLowerCase().includes(reviewSearchText.toLowerCase()));
                            const matchesProject = reviewProjectFilter === "all" || r.projectId === reviewProjectFilter || r.project_id === reviewProjectFilter;
                            const matchesRating = reviewRatingFilter === "all" || String(r.rating) === reviewRatingFilter;
                            return matchesSearch && matchesProject && matchesRating;
                          }).map((rev) => (
                            <tr key={rev.id} className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-3 text-right rtl:text-right">
                                <div className="flex items-center gap-2">
                                  {rev.userAvatar ? (
                                    <img 
                                      src={rev.userAvatar} 
                                      alt="" 
                                      className="w-7 h-7 rounded-full object-cover border border-amber-500/30 shrink-0" 
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
                                      {rev.userName?.[0] || "U"}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-extrabold text-slate-100">{rev.userName || "طالب CardioVision"}</div>
                                    {(rev.userUniversity || rev.userSpecialty) && (
                                      <div className="text-[10px] text-slate-400">
                                        {[rev.userUniversity, rev.userSpecialty].filter(Boolean).join(" - ")}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-right rtl:text-right font-mono text-[11px] text-slate-400">
                                {rev.userEmail || "-"}
                              </td>
                              <td className="p-3 text-right rtl:text-right text-slate-200 font-bold max-w-[200px]">
                                <div className="truncate" title={lang === "ar" ? rev.projectTitleAr : rev.projectTitleEn}>
                                  {lang === "ar" ? rev.projectTitleAr || rev.projectTitleEn : rev.projectTitleEn || rev.projectTitleAr || rev.projectId}
                                </div>
                                {rev.projectCategory && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono mt-0.5 inline-block">
                                    {rev.projectCategory}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                                  <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`w-3.5 h-3.5 ${i < (rev.rating || 5) ? "fill-amber-400 text-amber-400" : "text-slate-700"}`} 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs font-black text-amber-300 font-mono me-1">
                                    {rev.rating || 5}/5
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 text-right rtl:text-right text-slate-300 max-w-sm">
                                {rev.reviewText ? (
                                  <p className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-[11px] leading-relaxed break-words text-slate-200">
                                    "{rev.reviewText}"
                                  </p>
                                ) : (
                                  <span className="text-[11px] text-slate-500 italic">
                                    {lang === "ar" ? "تقييم مباشر بالنجوم بدون تعليق" : "Direct star rating without text"}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center text-[10px] text-slate-400 font-mono whitespace-nowrap">
                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" }) : "-"}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleDeleteReviewAdmin(rev.id)}
                                  className="p-1.5 rounded-xl border border-slate-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 bg-slate-900 transition-all shadow-sm"
                                  title={lang === "ar" ? "حذف التقييم نهائياً من قاعدة البيانات" : "Permanently delete review"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-slate-500">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Star className="w-8 h-8 text-slate-700" />
                                <span className="text-sm font-bold text-slate-400">
                                  {lang === "ar" ? "لا توجد تقييمات مطابقة لمعايير البحث الحالية." : "No reviews match the current criteria."}
                                </span>
                                {(reviewSearchText || reviewProjectFilter !== "all" || reviewRatingFilter !== "all") && (
                                  <button
                                    onClick={() => { setReviewSearchText(""); setReviewProjectFilter("all"); setReviewRatingFilter("all"); }}
                                    className="text-xs text-indigo-400 hover:underline mt-1"
                                  >
                                    {lang === "ar" ? "إعادة تعيين الفلاتر" : "Reset filters"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 1: COMMENTS LIST */}
              {reviewsViewMode === "comments" && (
                <div className="space-y-4">
                  {/* Filter & Search Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={reviewSearchText}
                        onChange={(e) => setReviewSearchText(e.target.value)}
                        placeholder={lang === "ar" ? "بحث بالطالب، البريد، المشروع، أو نص التعليق..." : "Search by student, email, project, or text..."}
                        className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl ps-9 pe-8 py-2 text-slate-100 placeholder-slate-500"
                      />
                      {reviewSearchText && (
                        <button
                          onClick={() => setReviewSearchText("")}
                          className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Project filter dropdown */}
                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <select
                        value={reviewProjectFilter}
                        onChange={(e) => setReviewProjectFilter(e.target.value)}
                        className="text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl px-2.5 py-2 text-slate-200 cursor-pointer max-w-[180px]"
                      >
                        <option value="all">{lang === "ar" ? "جميع المشاريع" : "All Projects"}</option>
                        {allProjects.map(p => (
                          <option key={p.id} value={p.id}>
                            {lang === "ar" ? p.titleAr : p.titleEn}
                          </option>
                        ))}
                      </select>

                      {/* Status filter dropdown */}
                      <select
                        value={reviewStatusFilter}
                        onChange={(e) => setReviewStatusFilter(e.target.value)}
                        className="text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl px-2.5 py-2 text-slate-200 cursor-pointer"
                      >
                        <option value="all">{lang === "ar" ? "جميع الحالات" : "All Statuses"}</option>
                        <option value="active">{lang === "ar" ? "🟢 نشط (Active)" : "🟢 Active"}</option>
                        <option value="reviewed">{lang === "ar" ? "🔵 تمت المراجعة (Reviewed)" : "🔵 Reviewed"}</option>
                        <option value="hidden">{lang === "ar" ? "🟡 مخفي (Hidden)" : "🟡 Hidden"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Table of Comments */}
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-extrabold">
                          <th className="p-3 text-right rtl:text-right">{lang === "ar" ? "الطالب" : "Student"}</th>
                          <th className="p-3 text-right rtl:text-right">{lang === "ar" ? "المشروع" : "Project"}</th>
                          <th className="p-3 text-center">{lang === "ar" ? "التقييم" : "Rating"}</th>
                          <th className="p-3 text-right rtl:text-right">{lang === "ar" ? "نص التعليق" : "Comment"}</th>
                          <th className="p-3 text-center">{lang === "ar" ? "الحالة" : "Status"}</th>
                          <th className="p-3 text-center">{lang === "ar" ? "التاريخ" : "Date"}</th>
                          <th className="p-3 text-center">{lang === "ar" ? "حذف" : "Delete"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {allCommentsList.filter(c => {
                          const search = reviewSearchText.toLowerCase();
                          const matchesSearch = (
                            (c.userName && c.userName.toLowerCase().includes(search)) ||
                            (c.userEmail && c.userEmail.toLowerCase().includes(search)) ||
                            (c.comment && c.comment.toLowerCase().includes(search)) ||
                            (c.commentText && c.commentText.toLowerCase().includes(search)) ||
                            (c.projectTitleAr && c.projectTitleAr.toLowerCase().includes(search)) ||
                            (c.projectTitleEn && c.projectTitleEn.toLowerCase().includes(search))
                          );
                          const matchesProject = reviewProjectFilter === "all" || c.projectId === reviewProjectFilter;
                          const currentStatus = c.status || "active";
                          const matchesStatus = reviewStatusFilter === "all" || currentStatus === reviewStatusFilter;
                          return matchesSearch && matchesProject && matchesStatus;
                        }).length > 0 ? (
                          allCommentsList.filter(c => {
                            const search = reviewSearchText.toLowerCase();
                            const matchesSearch = (
                              (c.userName && c.userName.toLowerCase().includes(search)) ||
                              (c.userEmail && c.userEmail.toLowerCase().includes(search)) ||
                              (c.comment && c.comment.toLowerCase().includes(search)) ||
                              (c.commentText && c.commentText.toLowerCase().includes(search)) ||
                              (c.projectTitleAr && c.projectTitleAr.toLowerCase().includes(search)) ||
                              (c.projectTitleEn && c.projectTitleEn.toLowerCase().includes(search))
                            );
                            const matchesProject = reviewProjectFilter === "all" || c.projectId === reviewProjectFilter;
                            const currentStatus = c.status || "active";
                            const matchesStatus = reviewStatusFilter === "all" || currentStatus === reviewStatusFilter;
                            return matchesSearch && matchesProject && matchesStatus;
                          }).map((c) => {
                            const commentStatus = c.status || "active";
                            return (
                              <tr key={c.id} className="hover:bg-slate-900/55 transition-colors">
                                <td className="p-3 text-right rtl:text-right">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-bold text-[11px] shrink-0">
                                      {c.userAvatar ? (
                                        <img src={c.userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        (c.userName || "U").charAt(0).toUpperCase()
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-bold text-indigo-300">{c.userName || "طالب"}</div>
                                      {c.userEmail && (
                                        <div className="text-[10px] text-slate-500 font-mono">{c.userEmail}</div>
                                      )}
                                      {(c.userUniversity || c.userSpecialty) && (
                                        <div className="text-[9px] text-slate-400">
                                          {[c.userUniversity, c.userSpecialty].filter(Boolean).join(" - ")}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-right rtl:text-right text-slate-300 font-bold max-w-[170px]">
                                  <div className="truncate" title={lang === "ar" ? c.projectTitleAr : c.projectTitleEn}>
                                    {lang === "ar" ? c.projectTitleAr || c.projectTitleEn : c.projectTitleEn || c.projectTitleAr || c.projectId}
                                  </div>
                                  {c.projectCategory && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono mt-0.5 inline-block">
                                      {c.projectCategory}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex justify-center text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`w-3 h-3 ${i < (c.rating || 5) ? "fill-current" : "opacity-20"}`} 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[9px] text-amber-300/80 font-mono mt-0.5 block">{c.rating || 5}/5</span>
                                </td>
                                <td className="p-3 text-right rtl:text-right text-slate-200 font-medium max-w-sm">
                                  <p className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 text-[11px] leading-relaxed break-words">
                                    "{c.comment || c.commentText}"
                                  </p>
                                </td>
                                <td className="p-3 text-center">
                                  <select
                                    value={commentStatus}
                                    onChange={(e) => handleUpdateCommentStatus(c.id, e.target.value as any)}
                                    className={`text-[10px] font-bold rounded-lg px-2 py-1 outline-none border cursor-pointer ${
                                      commentStatus === "active"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : commentStatus === "reviewed"
                                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    }`}
                                  >
                                    <option value="active" className="bg-slate-900 text-emerald-400">{lang === "ar" ? "🟢 نشط" : "Active"}</option>
                                    <option value="reviewed" className="bg-slate-900 text-indigo-400">{lang === "ar" ? "🔵 تمت المراجعة" : "Reviewed"}</option>
                                    <option value="hidden" className="bg-slate-900 text-amber-400">{lang === "ar" ? "🟡 مخفي" : "Hidden"}</option>
                                  </select>
                                </td>
                                <td className="p-3 text-center text-[10px] text-slate-500 font-mono whitespace-nowrap">
                                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleDeleteCommentAdmin(c.id)}
                                    className="p-1.5 rounded-xl border border-slate-800 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 bg-slate-900 transition-all"
                                    title={lang === "ar" ? "حذف التعليق نهائياً" : "Delete comment"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center py-10 text-slate-500">
                              {lang === "ar" ? "لا توجد تعليقات تطابق معايير البحث والفلترة." : "No comments matched your filter criteria."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 2: STAR RATINGS & BREAKDOWN */}
              {reviewsViewMode === "ratings" && (
                <div className="space-y-6">
                  {/* Star Distribution Summary */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-amber-400" />
                      <span>{lang === "ar" ? "توزيع تقييمات النجوم على المنصة:" : "Platform Star Distribution:"}</span>
                    </h4>

                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const total = Number(reviewsStats?.totalReviews || 1);
                        const count = Number(reviewsStats?.distribution?.[String(stars)] || 0);
                        const pct = Math.round((count / (total || 1)) * 100);
                        return (
                          <div key={stars} className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1 w-16 text-amber-400 font-mono font-bold shrink-0">
                              <span>{stars}</span>
                              <Star className="w-3 h-3 fill-amber-400" />
                            </div>
                            <div className="flex-1 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500" 
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 w-16 text-left shrink-0">
                              {count} ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Projects Star Ratings Summary */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-300">
                      📋 {lang === "ar" ? "متوسط تقييمات المشاريع المسجلة:" : "Project Average Ratings:"}
                    </h4>

                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-extrabold">
                            <th className="p-3 text-right rtl:text-right">{lang === "ar" ? "المشروع" : "Project"}</th>
                            <th className="p-3 text-center">{lang === "ar" ? "القسم" : "Category"}</th>
                            <th className="p-3 text-center">{lang === "ar" ? "عدد التقييمات" : "Reviews Count"}</th>
                            <th className="p-3 text-center">{lang === "ar" ? "متوسط التقييم" : "Average Rating"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-slate-300">
                          {allProjects.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-900/50">
                              <td className="p-3 text-right rtl:text-right font-bold text-slate-200">
                                {lang === "ar" ? p.titleAr : p.titleEn}
                              </td>
                              <td className="p-3 text-center font-mono text-slate-400 text-[11px]">
                                {p.category}
                              </td>
                              <td className="p-3 text-center font-mono text-indigo-400 font-bold">
                                {p.reviewsCount || 0}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <span className="font-mono font-bold text-amber-400">{Number(p.rating || 5).toFixed(1)}</span>
                                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* SUB-TAB: PLATFORM USER FEEDBACK & RATINGS */}
        {activeSubTab === "feedback" && (
          <AdminFeedbackTab lang={lang} theme={theme} />
        )}

        {/* SUB-TAB 4: BROADCAST NOTIFICATIONS */}
        {activeSubTab === "broadcast" && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left space-y-4">
            <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <Send className="w-4 h-4 text-rose-500" />
              <span>{lang === "ar" ? "بث إشعارات عامة لجميع الطلاب المسجلين بالمنصة" : "Send Global Broadcast Message"}</span>
            </h3>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              {lang === "ar" 
                ? "سيظهر هذا الإشعار فوراً في حساب كافة الطلاب المسجلين بالمنصة في صندوق الإشعارات الخاص بهم لتنبيههم بالمستجدات أو العروض." 
                : "This message will be dispatched immediately to all registered student workstations."}
            </p>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs text-slate-300">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "عنوان الإشعار باللغة العربية:" : "Notification Title (Arabic):"}</label>
                  <input
                    type="text"
                    value={broadcastTitleAr}
                    onChange={(e) => setBroadcastTitleAr(e.target.value)}
                    placeholder="مثال: خصم خاص 20% بمناسبة مناقشة..."
                    className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "عنوان الإشعار باللغة الإنجليزية:" : "Notification Title (English):"}</label>
                  <input
                    type="text"
                    value={broadcastTitleEn}
                    onChange={(e) => setBroadcastTitleEn(e.target.value)}
                    placeholder="e.g. Special offer for all graduation..."
                    className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">{lang === "ar" ? "مضمون الإشعار بالكامل (عربي):" : "Alert Message Content (Arabic):"}</label>
                <textarea
                  value={broadcastMsgAr}
                  onChange={(e) => setBroadcastMsgAr(e.target.value)}
                  placeholder="اكتب رسالتك للطلاب بالتفصيل..."
                  className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-xl p-2.5 text-slate-100 h-28"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-black text-xs hover:opacity-95"
              >
                {loading ? "Sending..." : (lang === "ar" ? "إرسال وبث الإشعار فوراً" : "Broadcast Alert")}
              </button>

            </form>
          </div>
        )}

        {/* SUB-TAB 5: MAINTENANCE MODE SYSTEM CONTROL */}
        {activeSubTab === "maintenance" && (
          <div className="space-y-6">
            
            {/* Maintenance Live Status Card */}
            <div className={`p-6 rounded-3xl border ${
              maintenanceModeActive 
                ? "bg-rose-950/40 border-rose-500/50 shadow-2xl shadow-rose-950/50" 
                : "bg-emerald-950/30 border-emerald-500/30"
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-2xl ${
                    maintenanceModeActive ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    <Wrench className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full animate-ping ${maintenanceModeActive ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                      <h3 className="font-extrabold text-lg text-slate-100">
                        {maintenanceModeActive 
                          ? (lang === "ar" ? "🔴 وضع الصيانة مفعّل حالياً (الموقع مغلق)" : "🔴 Maintenance Mode ACTIVE")
                          : (lang === "ar" ? "🟢 وضع الصيانة غير مفعّل (الموقع متاح للجميع)" : "🟢 Maintenance Mode INACTIVE")}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {maintenanceModeActive
                        ? (lang === "ar" ? "المنصة مغلقة أمام جميع المستخدمين والزوار، يظهر لهم صفحة الصيانة الاحترافية لـ CardioVision. بصفتك مديراً، يمكنك التصفح وإدارة المنصة بنجاح." : "Website is blocked for visitors with CardioVision branded screen. Admin has full access.")
                        : (lang === "ar" ? "جميع خدمات CardioVision، متجر المشاريع، ونظام الدفع بسيرتيل كاش تعمل بشكل طبيعي ومتاحة للجمهور." : "All CardioVision services are running live and accessible to all visitors.")}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  {maintenanceModeActive ? (
                    <button
                      onClick={() => handleToggleMaintenanceMode(false)}
                      disabled={togglingMaintenance}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all"
                    >
                      <Power className="w-4 h-4" />
                      <span>{togglingMaintenance ? "جاري التغيير..." : (lang === "ar" ? "إيقاف الصيانة وفتح الموقع للجمهور" : "Disable Maintenance Mode")}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleMaintenanceMode(true)}
                      disabled={togglingMaintenance}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 transition-all"
                    >
                      <Power className="w-4 h-4" />
                      <span>{togglingMaintenance ? "جاري التغيير..." : (lang === "ar" ? "تفعيل وضع الصيانة وإغلاق الموقع" : "Enable Maintenance Mode")}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Maintenance Message Form */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{lang === "ar" ? "تخصيص رسالة الصيانة المقروءة للزوار:" : "Customize Visitor Maintenance Message:"}</span>
              </h4>
              <p className="text-xs text-slate-400">
                {lang === "ar" 
                  ? "اكتب النص أو السبب الذي سيظهر للعملاء والطلاب على صفحة الصيانة عند محاولتهم زيارة أي رابط بالمنصة."
                  : "Enter the announcement text displayed to visitors when maintenance mode is active."}
              </p>

              <textarea
                value={maintenanceReasonInput}
                onChange={(e) => setMaintenanceReasonInput(e.target.value)}
                placeholder="نعمل حالياً على إجراء تحديثات وتحسينات لنوفر لكم تجربة أفضل وأكثر أماناً..."
                className="w-full text-xs bg-slate-950 border border-slate-800 outline-none rounded-2xl p-4 text-slate-100 h-28 focus:border-amber-500 transition-all"
              ></textarea>

              <div className="flex justify-between items-center flex-wrap gap-4 pt-2">
                <button
                  onClick={() => handleToggleMaintenanceMode(maintenanceModeActive)}
                  disabled={togglingMaintenance}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                >
                  {lang === "ar" ? "حفظ النص المخصص فقط" : "Save Message Only"}
                </button>

                <a
                  href="/maintenance.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline flex items-center gap-1"
                >
                  <span>{lang === "ar" ? "معاينة صفحة الصيانة الثابتة (Static Preview 🔗)" : "Preview Static HTML Page"}</span>
                </a>
              </div>
            </div>

            {/* Security Notice Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 text-xs text-slate-400 space-y-2">
              <h5 className="font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>{lang === "ar" ? "معايير الأمان والتوافق الفني لـ CardioVision" : "CardioVision Protection Guarantee"}</span>
              </h5>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                <li>{lang === "ar" ? "تم حظر كافة رسائل الأخطاء البرمجية الخادمة (500, 502, 503, 504, Database Connection Error) بالكامل." : "All backend raw errors (500, 502, 503) are fully suppressed and shielded."}</li>
                <li>{lang === "ar" ? "تم تخصيص صفحة احتياطية مستقلة عن الخادم وقاعدة البيانات (/maintenance.html) تمنع ظهور أي صفحة بيضاء." : "Includes serverless static HTML fallback page ensuring zero white screens or raw crashes."}</li>
                <li>{lang === "ar" ? "حساب المدير (Admin) مستثنى تلقائياً ويمكنه الدخول عبر بوابة دخول المسؤول في صفحة الصيانة." : "Admin users bypass maintenance restrictions via the secure Admin Gate."}</li>
              </ul>
            </div>
          </div>
        )}
            {isEditModalOpen && selectedEditProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-900 py-2 border-b border-slate-800 z-10">
              <h3 className="text-lg font-black text-white">
                {lang === "ar" ? "تعديل تفاصيل المشروع بالكامل" : "Edit Full Project Details"}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Titles & Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "عنوان المشروع (عربي)" : "Title (Arabic)"}</label>
                  <input type="text" value={selectedEditProject.titleAr} onChange={(e) => setSelectedEditProject({...selectedEditProject, titleAr: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "عنوان المشروع (إنجليزي)" : "Title (English)"}</label>
                  <input type="text" value={selectedEditProject.titleEn} onChange={(e) => setSelectedEditProject({...selectedEditProject, titleEn: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "وصف المشروع (عربي)" : "Description (Arabic)"}</label>
                  <textarea value={selectedEditProject.descriptionAr} onChange={(e) => setSelectedEditProject({...selectedEditProject, descriptionAr: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={2} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "وصف المشروع (إنجليزي)" : "Description (English)"}</label>
                  <textarea value={selectedEditProject.descriptionEn} onChange={(e) => setSelectedEditProject({...selectedEditProject, descriptionEn: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={2} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "تفاصيل إضافية (عربي)" : "Details (Arabic)"}</label>
                  <textarea value={selectedEditProject.detailsAr || selectedEditProject.summaryAr || ''} onChange={(e) => setSelectedEditProject({...selectedEditProject, detailsAr: e.target.value, summaryAr: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={2} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "تفاصيل إضافية (إنجليزي)" : "Details (English)"}</label>
                  <textarea value={selectedEditProject.detailsEn || selectedEditProject.summaryEn || ''} onChange={(e) => setSelectedEditProject({...selectedEditProject, detailsEn: e.target.value, summaryEn: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={2} />
                </div>
              </div>

              {/* Classification & Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "التصنيف" : "Category"}</label>
                  <select value={selectedEditProject.category} onChange={(e) => setSelectedEditProject({...selectedEditProject, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm">
                    {categories.map(c => <option key={c.id} value={c.id}>{lang === "ar" ? c.labelAr : c.labelEn}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "مستوى الصعوبة" : "Difficulty Level"}</label>
                  <select value={selectedEditProject.difficultyLevel || "medium"} onChange={(e) => setSelectedEditProject({...selectedEditProject, difficultyLevel: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm">
                    <option value="easy">{lang === "ar" ? "سهل" : "Easy"}</option>
                    <option value="medium">{lang === "ar" ? "متوسط" : "Medium"}</option>
                    <option value="hard">{lang === "ar" ? "متقدم" : "Hard"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "السعر (ل.س)" : "Price (SYP)"}</label>
                  <input type="number" value={selectedEditProject.priceSyp || selectedEditProject.price || 0} onChange={(e) => setSelectedEditProject({...selectedEditProject, priceSyp: Number(e.target.value), price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm font-mono" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "مدة التنفيذ (عربي)" : "Duration (Ar)"}</label>
                    <input type="text" value={selectedEditProject.durationAr || ""} onChange={(e) => setSelectedEditProject({...selectedEditProject, durationAr: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "مدة التنفيذ (إنجليزي)" : "Duration (En)"}</label>
                    <input type="text" value={selectedEditProject.durationEn || ""} onChange={(e) => setSelectedEditProject({...selectedEditProject, durationEn: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "الجامعة (عربي)" : "University (Ar)"}</label>
                  <input type="text" value={selectedEditProject.universityAr || ""} onChange={(e) => setSelectedEditProject({...selectedEditProject, universityAr: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "الجامعة (إنجليزي)" : "University (En)"}</label>
                  <input type="text" value={selectedEditProject.universityEn || ""} onChange={(e) => setSelectedEditProject({...selectedEditProject, universityEn: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "نوع المشروع (عربي)" : "Project Type (Ar)"}</label>
                  <input type="text" value={selectedEditProject.projectTypeAr || ""} onChange={(e) => setSelectedEditProject({...selectedEditProject, projectTypeAr: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "نوع المشروع (إنجليزي)" : "Project Type (En)"}</label>
                  <input type="text" value={selectedEditProject.projectTypeEn || ""} onChange={(e) => setSelectedEditProject({...selectedEditProject, projectTypeEn: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                </div>
              </div>

              {/* Media & Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "رابط الصورة (صورة الغلاف)" : "Cover Image URL"}</label>
                  <input type="text" value={selectedEditProject.imageUrl || (selectedEditProject.images?.[0] || "")} onChange={(e) => setSelectedEditProject({...selectedEditProject, imageUrl: e.target.value, images: [e.target.value, ...(selectedEditProject.images?.slice(1) || [])]})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "رابط الفيديو (يوتيوب)" : "Video URL"}</label>
                  <input type="text" value={selectedEditProject.videoUrl || ""} onChange={(e) => setSelectedEditProject({...selectedEditProject, videoUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm font-mono" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "رابط ملف المشروع (رابط التحميل المباشر بعد الدفع)" : "Project File Download URL"}</label>
                  <input type="text" value={selectedEditProject.projectFileUrl || selectedEditProject.downloadUrl || ""} onChange={(e) => setSelectedEditProject({...selectedEditProject, projectFileUrl: e.target.value, downloadUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm font-mono" />
                </div>
              </div>

              {/* Arrays */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "الميزات (عربي) - افصل بفاصلة" : "Features (Ar) - Comma separated"}</label>
                  <textarea value={(selectedEditProject.featuresAr || []).join(',\n')} onChange={(e) => setSelectedEditProject({...selectedEditProject, featuresAr: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={3} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "الميزات (إنجليزي) - افصل بفاصلة" : "Features (En) - Comma separated"}</label>
                  <textarea value={(selectedEditProject.featuresEn || []).join(',\n')} onChange={(e) => setSelectedEditProject({...selectedEditProject, featuresEn: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={3} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "المكونات العتادية (عربي)" : "Hardware Components (Ar)"}</label>
                  <textarea value={(selectedEditProject.componentsAr || selectedEditProject.hardwareComponents || []).join(',\n')} onChange={(e) => setSelectedEditProject({...selectedEditProject, componentsAr: e.target.value.split(',').map(s=>s.trim()).filter(Boolean), hardwareComponents: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={3} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "المكونات العتادية (إنجليزي)" : "Hardware Components (En)"}</label>
                  <textarea value={(selectedEditProject.componentsEn || []).join(',\n')} onChange={(e) => setSelectedEditProject({...selectedEditProject, componentsEn: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={3} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "البرمجيات المستخدمة (عربي)" : "Software Used (Ar)"}</label>
                  <textarea value={(selectedEditProject.softwareAr || selectedEditProject.softwareUsed || []).join(',\n')} onChange={(e) => setSelectedEditProject({...selectedEditProject, softwareAr: e.target.value.split(',').map(s=>s.trim()).filter(Boolean), softwareUsed: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={3} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "البرمجيات المستخدمة (إنجليزي)" : "Software Used (En)"}</label>
                  <textarea value={(selectedEditProject.softwareEn || []).join(',\n')} onChange={(e) => setSelectedEditProject({...selectedEditProject, softwareEn: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={3} />
                </div>
              </div>
                
              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-slate-900 py-4 border-t border-slate-800 z-10">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/projects/${selectedEditProject.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(selectedEditProject)
                      });
                      if (res.ok) {
                        setIsEditModalOpen(false);
                        onRefreshProjects();
                      } else {
                        console.error("Failed to update project");
                        alert(lang === "ar" ? "فشل تحديث المشروع" : "Failed to update project");
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg"
                >
                  {lang === "ar" ? "حفظ التعديلات" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
