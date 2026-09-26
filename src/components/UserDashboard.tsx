import React, { useState, useEffect, useRef } from "react";
import { 
  FolderDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  UploadCloud, 
  MapPin, 
  MessageSquare, 
  Heart, 
  Bell, 
  CreditCard,
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  AlertOctagon,
  ShieldCheck,
  RefreshCw,
  Camera,
  Upload,
  QrCode
} from "lucide-react";
import { Order, Consultation, Project } from "../types";
import { SyriatelPaymentModal } from "./SyriatelPaymentModal";
import ProjectProgressTracker from "./ProjectProgressTracker";
import QRScannerModal from "./QRScannerModal";

interface UserDashboardProps {
  currentUser: any;
  lang: "ar" | "en";
  theme: "dark" | "light";
  allProjects: Project[];
  recentlyViewedIds?: string[];
  onViewDetails?: (project: Project) => void;
  onUpdateAvatar?: (avatarUrl: string) => void;
}

export default function UserDashboard({
  currentUser,
  lang,
  theme,
  allProjects,
  recentlyViewedIds = [],
  onViewDetails,
  onUpdateAvatar
}: UserDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"orders" | "consultations" | "favorites" | "notifications">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Syriatel Payment Modal state
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // QR Scanner state
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      fetchOrders();
      fetchConsultations();
      fetchFavorites();
      fetchNotifications();
    }
  }, [currentUser?.id, activeSubTab]);

  const getUserHeaders = () => {
    const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${currentUser.id}`, {
        headers: getUserHeaders(),
        credentials: "include"
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (e) {
      console.warn("Could not load orders:", e);
    }
  };

  const fetchConsultations = async () => {
    try {
      const res = await fetch(`/api/consultations?userId=${currentUser.id}`, {
        headers: getUserHeaders(),
        credentials: "include"
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setConsultations(data.consultations);
    } catch (e) {
      console.warn("Could not load consultations:", e);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`/api/favorites?userId=${currentUser.id}`, {
        headers: getUserHeaders(),
        credentials: "include"
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setFavorites(data.favorites);
    } catch (e) {
      console.warn("Could not load favorites:", e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${currentUser.id}`, {
        headers: getUserHeaders(),
        credentials: "include"
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch (e) {
      console.warn("Could not load notifications:", e);
    }
  };

  const handleCopySyriatelNumber = () => {
    const text = "0982257195";
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedNumber(true);
          setTimeout(() => setCopiedNumber(false), 2500);
        })
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2500);
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
  };

  const handleDownloadProjectFile = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/download?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.success && data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      } else {
        alert(data.error || (lang === "ar" ? "وصول غير مصرح أو تعذر التحميل" : "Download authorization failed"));
      }
    } catch (err) {
      console.error("Download error", err);
    }
  };

  return (
    <div className="space-y-8" id="student-dashboard-workspace">
      
      {/* Student Profile Overview Card */}
      <div className={`p-6 rounded-3xl border ${
        theme === "dark" 
          ? "bg-gradient-to-br from-slate-900 to-indigo-950/20 border-slate-800" 
          : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const base64 = event.target?.result as string;
                  if (base64) onUpdateAvatar?.(base64);
                  e.target.value = "";
                };
                reader.readAsDataURL(file);
              }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-rose-500/50 hover:border-rose-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-rose-600/20 group shrink-0 cursor-pointer"
              title={lang === "ar" ? "انقر لرفع صورة شخصية جديدة من جهازك" : "Click to upload a new profile picture"}
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                  {currentUser.name?.[0] || "U"}
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <Camera className="w-4 h-4 shrink-0 text-white drop-shadow-sm" />
                <span className="text-[8px] font-bold mt-0.5">{lang === "ar" ? "تغيير" : "Edit"}</span>
              </div>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg font-black ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                  {currentUser.name}
                </h2>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 transition-colors"
                  title={lang === "ar" ? "تغيير الصورة الشخصية" : "Change Profile Photo"}
                >
                  <Camera className="w-2.5 h-2.5 shrink-0" />
                  <span>{lang === "ar" ? "تغيير الصورة" : "Change Photo"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQRScannerOpen(true)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1 transition-colors"
                  title={lang === "ar" ? "مسح رمز مشروع (QR)" : "Scan Project QR"}
                >
                  <QrCode className="w-2.5 h-2.5 shrink-0" />
                  <span>{lang === "ar" ? "مسح QR" : "Scan QR"}</span>
                </button>
              </div>
              <span className="text-xs text-rose-400 font-bold block mt-0.5">
                🎓 {lang === "ar" ? "حساب طالب هندسة معتمد" : "Verified Engineering Student"}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              {lang === "ar" ? `الطلبات: ${orders.length}` : `Orders: ${orders.length}`}
            </span>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              {lang === "ar" ? `الاستشارات: ${consultations.length}` : `Consults: ${consultations.length}`}
            </span>
          </div>
        </div>
      </div>

      {/* Graduation Project Progress Tracker */}
      <ProjectProgressTracker theme={theme} lang={lang} userId={currentUser.id} />

      {/* Recently Viewed Tracking Bar */}
      {recentlyViewedIds.length > 0 && (
        <div className={`p-4 sm:p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 shrink-0 text-indigo-500" />
            <h3 className="text-xs font-black uppercase tracking-wider">{lang === "ar" ? "شوهد مؤخراً" : "Recently Viewed"}</h3>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin">
            {recentlyViewedIds.map(id => {
              const p = allProjects.find(x => x.id === id);
              if (!p) return null;
              return (
                <div 
                  key={id}
                  onClick={() => onViewDetails && onViewDetails(p)}
                  className={`flex items-center gap-3 min-w-[240px] p-2.5 rounded-xl border cursor-pointer hover:border-rose-500 transition-all ${
                    theme === 'dark' ? 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <img src={p.imageUrl} alt={p.titleEn} className="w-10 h-10 shrink-0 rounded-lg object-cover bg-slate-200 dark:bg-slate-800" />
                  <div className="overflow-hidden">
                    <h4 className="text-[10px] font-bold truncate group-hover:text-rose-500 text-slate-700 dark:text-slate-200">
                      {lang === "ar" ? p.titleAr : p.titleEn}
                    </h4>
                    <p className={`text-[9px] mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{lang === "ar" ? (p.universityAr || p.category) : (p.universityEn || p.category)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Internal Navigation tabs */}
      <div className="flex border-b border-slate-800/40 mt-8">
        <button
          onClick={() => setActiveSubTab("orders")}
          className={`flex-1 md:flex-none px-6 pb-3 text-xs font-black transition-all border-b-2 ${
            activeSubTab === "orders" 
              ? "border-rose-500 text-rose-500" 
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          {lang === "ar" ? "مشترياتي والملفات" : "My Orders & Files"}
        </button>

        <button
          onClick={() => setActiveSubTab("consultations")}
          className={`flex-1 md:flex-none px-6 pb-3 text-xs font-black transition-all border-b-2 ${
            activeSubTab === "consultations" 
              ? "border-rose-500 text-rose-500" 
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          {lang === "ar" ? "استشاراتي الفنية" : "My Consultations"}
        </button>

        <button
          onClick={() => setActiveSubTab("favorites")}
          className={`flex-1 md:flex-none px-6 pb-3 text-xs font-black transition-all border-b-2 ${
            activeSubTab === "favorites" 
              ? "border-rose-500 text-rose-500" 
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          {lang === "ar" ? "مشاريعي المحفوظة" : "My Saved Projects"}
        </button>

        <button
          onClick={() => setActiveSubTab("notifications")}
          className={`flex-1 md:flex-none px-6 pb-3 text-xs font-black transition-all border-b-2 ${
            activeSubTab === "notifications" 
              ? "border-rose-500 text-rose-500" 
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          {lang === "ar" ? "الإشعارات المستلمة" : "My Alerts"}
        </button>
      </div>

      {/* Tab content area */}
      <div className="mt-4">

        {/* TAB 1: ORDERS & DOWNLOADS */}
        {activeSubTab === "orders" && (
          <div className="space-y-6">
            
            {/* Syriatel Cash Payment Info Box */}
            <div className={`p-4 sm:p-5 rounded-3xl border relative overflow-hidden ${
              theme === "dark" 
                ? "bg-gradient-to-r from-rose-950/30 via-slate-900 to-indigo-950/30 border-rose-500/30 text-slate-100" 
                : "bg-gradient-to-r from-rose-50/80 via-white to-indigo-50/80 border-rose-200 text-slate-900"
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-rose-500/20 shrink-0">
                    Cash
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm flex items-center gap-2">
                      <span>{lang === "ar" ? "وسيلة الدفع المعتمدة: سيريتل كاش" : "Official Payment Method: Syriatel Cash"}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold font-mono">
                        0982257195
                      </span>
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {lang === "ar" 
                        ? "قم بتحويل رسوم المشروع إلى الرقم (0982257195) ثم اضغط على (إرفاق إيصال الدفع) لرفع تفاصيل عملية التحويل لتفعيل التنزيل." 
                        : "Transfer project fees to (0982257195) then click (Upload Receipt) to verify and unlock full download."}
                    </p>
                  </div>
                </div>

                <div className="relative self-end sm:self-center shrink-0">
                  <button
                    id="btn-copy-userdashboard-number"
                    type="button"
                    onClick={handleCopySyriatelNumber}
                    aria-label={lang === "ar" ? "نسخ رقم سيريتل كاش" : "Copy Syriatel Cash number"}
                    className={`h-8 sm:h-9 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                      copiedNumber
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-rose-50 dark:bg-slate-950 hover:bg-rose-100 dark:hover:bg-slate-850 border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-300 shadow-xs"
                    }`}
                  >
                    {copiedNumber ? <Check className="w-3.5 h-3.5 shrink-0 text-white" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                    <span>{copiedNumber ? (lang === "ar" ? "تم النسخ ✓" : "Copied ✓") : (lang === "ar" ? "نسخ الرقم" : "Copy")}</span>
                  </button>

                  {copiedNumber && (
                    <div 
                      role="status"
                      className="absolute -top-8 end-0 sm:end-auto sm:left-1/2 sm:-translate-x-1/2 px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[10px] font-bold shadow-lg whitespace-nowrap animate-fade-in flex items-center gap-1 z-10"
                    >
                      <span>{lang === "ar" ? "تم نسخ رقم التحويل ✓" : "Copied ✓"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* List of orders */}
            {orders.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => {
                  const associatedProject = allProjects.find((p) => p.id === order.projectId);
                  const s = (order.status || "").toLowerCase();
                  const isPaid = ["approved", "paid", "completed"].includes(s);
                  const isUnderReview = ["under review", "pending_verification", "payment_submitted", "verifying_payment"].includes(s);
                  const isRejected = ["rejected", "payment_rejected"].includes(s);
                  const isPending = !isPaid && !isUnderReview && !isRejected;
                  const feedback = order.adminFeedback || order.rejectionReason || (order as any).admin_feedback || (order as any).failureReason;

                  return (
                    <div 
                      key={order.id}
                      className={`p-5 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                        theme === "dark" 
                          ? isRejected 
                            ? "bg-slate-900/90 border-rose-500/40" 
                            : isUnderReview 
                            ? "bg-slate-900/90 border-sky-500/40" 
                            : isPaid 
                            ? "bg-slate-900/90 border-emerald-500/40" 
                            : "bg-slate-900/80 border-slate-800"
                          : isRejected 
                            ? "bg-rose-50/40 border-rose-200" 
                            : isUnderReview 
                            ? "bg-sky-50/40 border-sky-200" 
                            : isPaid 
                            ? "bg-emerald-50/40 border-emerald-200" 
                            : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 shrink-0 text-rose-500 shrink-0" />
                          <h4 className={`font-black text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            {associatedProject ? (lang === "ar" ? associatedProject.titleAr : associatedProject.titleEn) : order.projectTitle}
                          </h4>
                        </div>
                        
                        <div className={`flex flex-wrap gap-3 text-[11px] font-bold dir-ltr ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span className="text-rose-400">{order.id}</span>
                          <span>•</span>
                          <span className="text-emerald-400">${(order.price ?? (order as any).amountSyp ?? 0).toLocaleString()}</span>
                          <span>•</span>
                          <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</span>
                        </div>

                        {/* Payment Receipt Info Box */}
                        {order.paymentReceipt && (
                          <div className={`p-3 rounded-2xl border text-xs font-medium space-y-1 ${
                            isPaid 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : isRejected 
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          }`}>
                            <div className="flex items-center justify-between font-bold text-[11px]">
                              <span>
                                {lang === "ar" ? `الرقم المرجعي: ${order.paymentReceipt.transactionNumber}` : `Tx Ref: ${order.paymentReceipt.transactionNumber}`}
                              </span>
                              <span>
                                {lang === "ar" ? `رقم المحول: ${order.paymentReceipt.phoneSender}` : `Sender: ${order.paymentReceipt.phoneSender}`}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Prominent Admin Rejection Feedback Banner */}
                        {isRejected && feedback && (
                          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold">
                              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-500" />
                              <span>{lang === "ar" ? "ملاحظة الإدارة لسبب رفض الإيصال:" : "Admin Rejection Reason:"}</span>
                            </div>
                            <p className="font-semibold text-rose-700 dark:text-rose-300 ps-5">
                              {feedback}
                            </p>
                            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 ps-5">
                              {lang === "ar" 
                                ? "يرجى الضغط على زر (إعادة رفع الإيصال) أدناه لإعادة إدخال الرقم المرجعي أو إرفاق صورة إيصال جديدة." 
                                : "Please click 'Resubmit Receipt' below to provide the corrected reference number or a new receipt image."}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        {/* Status Label badge */}
                        <div className="w-full sm:w-auto px-4 py-2 rounded-2xl border text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                          {isPending && (
                            <>
                              <Clock className="w-4 h-4 shrink-0 text-amber-500 shrink-0" />
                              <span className="text-amber-500">{lang === "ar" ? "بانتظار التحويل" : "Pending Transfer"}</span>
                            </>
                          )}
                          {isUnderReview && (
                            <>
                              <RefreshCw className="w-4 h-4 shrink-0 text-sky-400 animate-spin shrink-0" />
                              <span className="text-sky-400">{lang === "ar" ? "قيد التدقيق" : "Under Review"}</span>
                            </>
                          )}
                          {isPaid && (
                            <>
                              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 shrink-0" />
                              <span className="text-emerald-400">{lang === "ar" ? "مدفوع ومفعل" : "Paid & Verified"}</span>
                            </>
                          )}
                          {isRejected && (
                            <>
                              <XCircle className="w-4 h-4 shrink-0 text-rose-500 shrink-0" />
                              <span className="text-rose-500">{lang === "ar" ? "مرفوض" : "Rejected"}</span>
                            </>
                          )}
                        </div>

                        {/* Actions depending on status */}
                        {(isPending || isUnderReview || isRejected) && (
                          <button
                            id={`btn-order-action-${order.id}`}
                            onClick={() => setSelectedOrderForPayment(order)}
                            className={`w-full sm:w-auto py-2.5 px-4 rounded-2xl text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                              isRejected
                                ? "bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 shadow-rose-500/25 hover:opacity-95"
                                : "bg-gradient-to-r from-rose-500 to-indigo-600 shadow-rose-500/20 hover:opacity-95"
                            }`}
                          >
                            <UploadCloud className="w-4 h-4 shrink-0" />
                            <span>
                              {isRejected 
                                ? (lang === "ar" ? "إعادة رفع الإيصال" : "Resubmit Receipt") 
                                : isUnderReview 
                                ? (lang === "ar" ? "عرض / تعديل الإيصال" : "View / Edit Receipt")
                                : (lang === "ar" ? "إرفاق إيصال كاش" : "Upload Receipt")}
                            </span>
                          </button>
                        )}

                        {isPaid && (
                          <button
                            onClick={() => handleDownloadProjectFile(order.projectId)}
                            className="w-full sm:w-auto py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                          >
                            <FolderDown className="w-4 h-4 shrink-0" />
                            <span>{lang === "ar" ? "تحميل ملفات والمخططات (ZIP)" : "Download Files (ZIP)"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-slate-800 rounded-3xl text-slate-500">
                <FolderDown className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                <p className="text-xs font-bold">{lang === "ar" ? "لا تملك مشاريع محجوزة حالياً." : "No active orders found."}</p>
              </div>
            )}

            {/* Syriatel Payment Modal */}
            {selectedOrderForPayment && (
              <SyriatelPaymentModal
                order={selectedOrderForPayment}
                isOpen={!!selectedOrderForPayment}
                onClose={() => setSelectedOrderForPayment(null)}
                lang={lang}
                theme={theme}
                onSuccess={() => {
                  fetchOrders();
                  setSelectedOrderForPayment(null);
                }}
              />
            )}

          </div>
        )}

        {/* TAB 2: CONSULTATIONS HISTORY */}
        {activeSubTab === "consultations" && (
          <div className="space-y-4">
            {consultations.length > 0 ? (
              <div className="space-y-4">
                {consultations.map((consult) => (
                  <div 
                    key={consult.id}
                    className={`p-5 rounded-2xl border text-left ${
                      theme === "dark" ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-800/40">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {consult.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {consult.createdAt ? new Date(consult.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mb-3 bg-slate-100 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
                      <span className="text-indigo-400">{lang === "ar" ? "طلبك:" : "Your query:"}</span> {consult.idea}
                    </p>

                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-indigo-50 dark:bg-indigo-950/10 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/20 max-h-80 overflow-y-auto font-sans">
                      <span className="text-emerald-400 font-extrabold block mb-2">
                        💡 {lang === "ar" ? "مخطط العمل المقترح من مستشار CardioVision:" : "Consultant Proposal Summary:"}
                      </span>
                      <div className="whitespace-pre-line prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                        {consult.response}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                <p className="text-xs">{lang === "ar" ? "لم تطلب استشارات فورية بعد." : "No consultation logs found."}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FAVORITES LIST */}
        {activeSubTab === "favorites" && (
          <div>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allProjects.filter(p => favorites.includes(p.id)).map((project) => (
                  <div 
                    key={project.id}
                    className={`p-4 rounded-xl border flex items-center gap-3 justify-between ${
                      theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={project.imageUrl} 
                        alt={project.titleAr} 
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 shrink-0 rounded-lg object-cover" 
                      />
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                          {lang === "ar" ? project.titleAr : project.titleEn}
                        </h4>
                        <span className="text-[10px] text-rose-400 block mt-0.5">
                          ${(project.price ?? (project as any).priceSyp ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-slate-950 text-[10px] font-black text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-slate-850 uppercase">
                      {project.category}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500">
                <Heart className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                <p className="text-xs">{lang === "ar" ? "لا يوجد أي مشاريع محفوظة حالياً." : "No saved projects found."}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SYSTEM NOTIFICATIONS */}
        {activeSubTab === "notifications" && (
          <div className="space-y-3">
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-4 rounded-xl border text-left ${
                      theme === "dark" ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                    }`}
                  >
                    <h4 className="text-xs font-extrabold text-rose-500 mb-1">
                      {lang === "ar" ? notif.titleAr : notif.titleEn}
                    </h4>
                    <p className={`text-[11px] leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {lang === "ar" ? notif.messageAr : notif.messageEn}
                    </p>
                    <span className="text-[8px] text-slate-600 font-mono mt-2 block">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500">
                <Bell className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                <p className="text-xs">{lang === "ar" ? "لا يوجد إشعارات مستلمة حالياً." : "Inbox empty."}</p>
              </div>
            )}
          </div>
        )}

      </div>

      {isQRScannerOpen && (
        <QRScannerModal
          onClose={() => setIsQRScannerOpen(false)}
          onScanSuccess={(decodedText) => {
            setIsQRScannerOpen(false);
            // Simulating download/view based on decoded text
            alert(lang === "ar" ? `تم المسح بنجاح: ${decodedText}\nجاري تحميل المخططات...` : `Scanned successfully: ${decodedText}\nDownloading schematics...`);
          }}
          theme={theme}
          lang={lang}
        />
      )}
    </div>
  );
}
