import React, { useState } from "react";
import { Order } from "../types";
import QRCode from "react-qr-code";
import { 
  X, 
  Copy, 
  Check, 
  UploadCloud, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Smartphone, 
  Clock, 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Receipt,
  CheckCircle,
  QrCode
} from "lucide-react";

interface SyriatelPaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  lang: "ar" | "en";
  theme: "dark" | "light";
  onSuccess: () => void;
}

export const SyriatelPaymentModal: React.FC<SyriatelPaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  lang,
  theme,
  onSuccess
}) => {
  const isAr = lang === "ar";
  const [copied, setCopied] = useState(false);
  const isRejectedState = order.status === "rejected" || order.status === "Rejected" || order.status === "PAYMENT_REJECTED";
  const [step, setStep] = useState<1 | 2>(isRejectedState ? 2 : 1);

  // Form states - Prepopulate with any existing order payment details
  const [transactionNumber, setTransactionNumber] = useState(
    order.transferTransactionId || order.paymentReceipt?.transactionNumber || ""
  );
  const [phoneSender, setPhoneSender] = useState(
    order.userPhone || order.paymentReceipt?.phoneSender || ""
  );
  const [paidAt, setPaidAt] = useState(
    order.paymentReceipt?.paidAt 
      ? new Date(order.paymentReceipt.paidAt).toISOString().slice(0, 16) 
      : new Date().toISOString().slice(0, 16)
  );
  const [receiptImage, setReceiptImage] = useState<string>(
    order.receiptUrl || order.paymentReceipt?.receiptImageUrl || ""
  );
  const [receiptFileName, setReceiptFileName] = useState<string>(
    order.paymentReceipt?.originalFileName || (order.receiptUrl ? "receipt_attachment.jpg" : "")
  );

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccessState, setIsSuccessState] = useState(false);

  if (!isOpen || !order) return null;

  const syriatelNumber = "0982257195";
  const beneficiaryName = isAr ? "المهندس يوسف النجار - CardioVision" : "Eng. Youssef Al-Najjar - CardioVision";

  // Safe clipboard copy with fallback
  const handleCopyNumber = () => {
    const text = syriatelNumber;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg(isAr ? "يرجى اختيار ملف صورة أصلي (JPG/PNG/WEBP)" : "Please select an image file (JPG/PNG/WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(isAr ? "حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت" : "File size too large. Maximum 5MB");
      return;
    }

    setErrorMsg(null);
    setReceiptFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const hasTx = Boolean(transactionNumber.trim());
    const hasImg = Boolean(receiptImage);

    if (!hasTx && !hasImg) {
      setErrorMsg(
        isAr 
          ? "يرجى إدخال الرقم المرجعي للتحويل أو إرفاق صورة الإيصال على الأقل لمتابعة الطلب" 
          : "Please enter the transaction reference number or upload a receipt image"
      );
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
      const res = await fetch(`/api/orders/${order.id}/submit-payment`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: order.userId,
          transactionId: transactionNumber.trim() || undefined,
          phoneSender: phoneSender.trim() || order.userPhone || "0982257195",
          paidAt: new Date(paidAt).toISOString(),
          receiptImageUrl: receiptImage || undefined,
          originalFileName: receiptFileName || "syriatel_cash_receipt.jpg"
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccessState(true);
        onSuccess();
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setErrorMsg(data.error || data.message || (isAr ? "فشل إرسال بيانات التحويل، يرجى إعادة المحاولة" : "Failed to submit payment details"));
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? "حدث خطأ في الاتصال بالخادم، تحقق من الاتصال بالإنترنت" : "Server connection error"));
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    {
      num: 1,
      title: isAr ? "فتح التطبيق أو التوجه لنقطة كاش" : "Open App or Visit Agent",
      desc: isAr 
        ? "اذهب إلى أقرب نقطة Syriatel Cash أو افتح تطبيق Syriatel Cash على هاتفك المحمول."
        : "Open the Syriatel Cash app on your smartphone or visit the nearest authorized agent."
    },
    {
      num: 2,
      title: isAr ? "تحويل قيمة المشروع" : "Transfer Project Fee",
      desc: isAr 
        ? "حوّل مبلغ المشروع إلى الرقم (0982257195) باسم: المهندس يوسف النجار - CardioVision."
        : "Transfer the project amount to 0982257195 under: Eng. Youssef Al-Najjar - CardioVision."
    },
    {
      num: 3,
      title: isAr ? "حفظ الرقم المرجعي وتصوير الإيصال" : "Save Ref Number & Receipt Photo",
      desc: isAr 
        ? "احتفظ برقم العملية/المرجع (الموجود في رسالة التأكيد) وقم بتصوير إيصال التحويل بوضوح."
        : "Save the transaction reference number and take a clear photo or screenshot of the receipt."
    },
    {
      num: 4,
      title: isAr ? "إرفاق الإيصال للمراجعة الفورية" : "Attach Receipt for Review",
      desc: isAr 
        ? "اضغط على زر 'الانتقال لرفع الإيصال' بالأسفل وارفع صورة الإيصال لإرسال طلب الدفع للمراجعة."
        : "Click 'Proceed to Upload Receipt' below and attach the photo to submit for instant review."
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div 
        id="syriatel-payment-modal-card"
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all ${
          theme === "dark" 
            ? "bg-slate-900 border-slate-800 text-slate-100" 
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-red-600/15 via-rose-600/10 to-indigo-600/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md shadow-rose-500/20 shrink-0">
              Cash
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {isAr ? "بوابة الدفع الإلكتروني - سيريتل كاش" : "Syriatel Cash Payment Gateway"}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {isAr ? `رقم الطلب: ${order.id}` : `Order ID: ${order.id}`}
              </p>
            </div>
          </div>
          <button 
            id="btn-close-payment-modal"
            onClick={onClose}
            aria-label={isAr ? "إغلاق" : "Close"}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-bold bg-slate-50/70 dark:bg-slate-950/40">
          <button
            id="btn-tab-step-1"
            type="button"
            onClick={() => setStep(1)}
            className={`flex-1 py-3 px-3 sm:px-4 text-center flex items-center justify-center gap-2 border-b-2 transition-all ${
              step === 1 
                ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/10 font-black" 
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold shrink-0 ${
              step === 1 ? "bg-rose-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}>
              1
            </span>
            <span className="truncate">{isAr ? "بيانات التحويل والخطوات" : "Transfer & Steps"}</span>
          </button>
          <button
            id="btn-tab-step-2"
            type="button"
            onClick={() => setStep(2)}
            className={`flex-1 py-3 px-3 sm:px-4 text-center flex items-center justify-center gap-2 border-b-2 transition-all ${
              step === 2 
                ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/10 font-black" 
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold shrink-0 ${
              step === 2 ? "bg-rose-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}>
              2
            </span>
            <span className="truncate">{isAr ? "إرفاق إيصال التحويل" : "Attach Receipt"}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Success Submission State */}
          {isSuccessState ? (
            <div className="py-10 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {isAr ? "تم إرسال إيصال الدفع بنجاح!" : "Payment Receipt Submitted Successfully!"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  {isAr 
                    ? "تم تسجيل بياناتك وإرسال الإشعار إلى لوحة الإدارة. سيتم تدقيق الإيصال وتفعيل روابط تنزيل المشروع في حسابك خلال دقائق." 
                    : "Your payment details have been recorded. Our team will verify your receipt and activate the download links shortly."}
                </p>
              </div>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                >
                  {isAr ? "تم، حسناً" : "Done"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Error Notice */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
              )}

              {step === 1 ? (
                <div className="space-y-5">
                  {/* Order Summary Strip */}
                  <div className={`p-4 rounded-2xl border ${
                    theme === "dark" 
                      ? "bg-slate-950/60 border-slate-800" 
                      : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {isAr ? "المشروع المطلوب:" : "Project Title:"}
                      </span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 max-w-[65%] truncate text-left dir-auto">
                        {order.projectTitle}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {isAr ? "المبلغ النهائي المطلوب:" : "Total Amount:"}
                      </span>
                      <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 font-mono dir-ltr">
                        {(order?.amountSyp ?? order?.price ?? 0).toLocaleString()} {isAr ? "ل.س" : "SYP"}
                      </span>
                    </div>
                  </div>

                  {/* Syriatel Cash Card with Compact Copy Button */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-500/5 via-slate-50 to-indigo-500/5 dark:from-rose-950/30 dark:via-slate-900 dark:to-indigo-950/30 border border-rose-300/80 dark:border-rose-500/30 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-rose-500" />
                        {isAr ? "رقم حساب التحويل المعتمد:" : "Official Syriatel Cash Account:"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold">
                        ✓ {isAr ? "موثق ورسمي" : "Verified Official"}
                      </span>
                    </div>

                    {/* Phone Number Display + Compact Copy Button */}
                    <div className="flex items-center justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wider font-mono dir-ltr select-all">
                        {syriatelNumber}
                      </span>

                      <div className="relative shrink-0">
                        <button
                          id="btn-copy-syriatel-number"
                          type="button"
                          onClick={handleCopyNumber}
                          aria-label={isAr ? "نسخ رقم سيريتل كاش" : "Copy Syriatel Cash number"}
                          className={`h-8 sm:h-9 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                            copied
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                          }`}
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white shrink-0" />
                              <span>{isAr ? "تم النسخ ✓" : "Copied ✓"}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 shrink-0" />
                              <span>{isAr ? "نسخ الرقم" : "Copy"}</span>
                            </>
                          )}
                        </button>

                        {/* Floating Toast Notice */}
                        {copied && (
                          <div 
                            role="status"
                            aria-live="polite"
                            className="absolute -top-9 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[10px] font-bold shadow-lg whitespace-nowrap animate-fade-in flex items-center gap-1 z-20"
                          >
                            <CheckCircle2 className="w-3 h-3 text-white shrink-0" />
                            <span>{isAr ? "تم نسخ رقم التحويل ✓" : "Transfer number copied ✓"}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                      <p className="flex flex-wrap items-center gap-1.5">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {isAr ? "اسم المستفيد المعتمد:" : "Beneficiary Name:"}
                        </span>
                        <strong className="text-slate-900 dark:text-rose-300 font-black">
                          {beneficiaryName}
                        </strong>
                      </p>
                    </div>

                    {/* Dynamic Syriatel Cash QR Code */}
                    <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        <QrCode className="w-4 h-4 text-rose-500" />
                        <span>{isAr ? "مسح رمز QR للتحويل السريع:" : "Scan QR for instant transfer:"}</span>
                      </div>
                      <div className="flex justify-center items-center my-2">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                          <QRCode 
                            size={160} 
                            value={syriatelNumber}
                            viewBox="0 0 160 160"
                          />
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {syriatelNumber}
                      </span>
                    </div>
                  </div>

                  {/* Redesigned High-Contrast Secure Transfer Steps */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-indigo-400 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-indigo-500" />
                      <span>{isAr ? "خطوات التحويل الآمن:" : "Secure Transfer Steps:"}</span>
                    </h3>

                    <div className="grid grid-cols-1 gap-2.5">
                      {stepsList.map((st) => (
                        <div 
                          key={st.num}
                          className="flex items-start gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 shadow-xs"
                        >
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-black shrink-0 mt-0.5 shadow-sm">
                            {st.num}
                          </span>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                              {st.title}
                            </h4>
                            <p className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                              {st.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Proceed to Upload Receipt Button */}
                  <div className="pt-2">
                    <button
                      id="btn-proceed-to-receipt-upload"
                      type="button"
                      onClick={() => {
                        setStep(2);
                        setErrorMsg(null);
                      }}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-500 active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 transition-all cursor-pointer"
                    >
                      <span>{isAr ? "الانتقال لرفع الإيصال" : "Proceed to Upload Receipt"}</span>
                      {isAr ? (
                        <ArrowLeft className="w-4 h-4 shrink-0" />
                      ) : (
                        <ArrowRight className="w-4 h-4 shrink-0 rtl:rotate-180" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: Upload Receipt Form */
                <form onSubmit={handleSubmitReceipt} className="space-y-4">
                  {/* Admin Rejection Notice if applicable */}
                  {(order.adminFeedback || order.rejectionReason || (order as any).admin_feedback) && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{isAr ? "ملاحظة الإدارة السابقة حول هذا الطلب:" : "Previous Admin Feedback:"}</span>
                      </div>
                      <p className="font-semibold text-rose-700 dark:text-rose-300 ps-5">
                        {order.adminFeedback || order.rejectionReason || (order as any).admin_feedback}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 ps-5">
                        {isAr 
                          ? "يرجى تعديل الرقم المرجعي أو إرفاق صورة إيصال واضحة لإعادة تدقيق الطلب ومطابقته." 
                          : "Please update the reference ID or attach a clear receipt image for re-verification."}
                      </p>
                    </div>
                  )}

                  {/* Informational tip about either reference number or receipt */}
                  <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-[11.5px] text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>
                      {isAr
                        ? "يكفي تزويدنا بالرقم المرجعي للتحويل أو إرفاق صورة الإيصال (أو كلاهما معاً) لإتمام التحقق بأسرع وقت."
                        : "You can provide the transaction reference number OR upload the receipt screenshot (or both) for faster verification."}
                    </span>
                  </div>

                  {/* Form Input: Transaction Ref Number */}
                  <div>
                    <label 
                      htmlFor="input-transaction-ref"
                      className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-rose-500" />
                        <span>{isAr ? "الرقم المرجعي للتحويل" : "Transaction Reference Number"}</span>
                      </span>
                      <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                        {isAr ? "(إجباري في حال عدم إرفاق صورة)" : "(Required if no image)"}
                      </span>
                    </label>
                    <input
                      id="input-transaction-ref"
                      type="text"
                      value={transactionNumber}
                      onChange={(e) => setTransactionNumber(e.target.value)}
                      placeholder={isAr ? "مثال: 98421057" : "E.g. 98421057"}
                      className={`w-full py-2.5 px-3.5 rounded-xl border font-bold text-xs transition-colors dir-ltr ${
                        theme === "dark" 
                          ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500" 
                          : "bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      }`}
                    />
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
                      {isAr 
                        ? "يوجد الرقم المرجعي في رسالة التأكيد النصية من سيريتل كاش أو مطبوعاً على إشعار التحويل." 
                        : "Reference ID is found in the Syriatel SMS confirmation or paper receipt."}
                    </p>
                  </div>

                  {/* Form Input: Phone Sender */}
                  <div>
                    <label 
                      htmlFor="input-sender-phone"
                      className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{isAr ? "رقم الهاتف المحول منه" : "Sender Phone Number"}</span>
                      </span>
                      <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                        {isAr ? "(اختياري)" : "(Optional)"}
                      </span>
                    </label>
                    <input
                      id="input-sender-phone"
                      type="tel"
                      value={phoneSender}
                      onChange={(e) => setPhoneSender(e.target.value)}
                      placeholder={isAr ? "مثال: 0991234567" : "E.g. 0991234567"}
                      className={`w-full py-2.5 px-3.5 rounded-xl border font-bold text-xs transition-colors dir-ltr ${
                        theme === "dark" 
                          ? "bg-slate-950 border-slate-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                          : "bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      }`}
                    />
                  </div>

                  {/* Form Input: Payment Date/Time */}
                  <div>
                    <label 
                      htmlFor="input-payment-datetime"
                      className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isAr ? "تاريخ ووقت التحويل" : "Payment Date & Time"}</span>
                    </label>
                    <input
                      id="input-payment-datetime"
                      type="datetime-local"
                      value={paidAt}
                      onChange={(e) => setPaidAt(e.target.value)}
                      className={`w-full py-2 px-3.5 rounded-xl border font-medium text-xs dir-ltr ${
                        theme === "dark" 
                          ? "bg-slate-950 border-slate-800 text-white focus:border-emerald-500" 
                          : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500"
                      }`}
                    />
                  </div>

                  {/* Upload Dropzone */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5 text-purple-500" />
                        <span>{isAr ? "صورة إيصال التحويل الرقمي" : "Receipt Image Upload"}</span>
                      </span>
                      <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                        {isAr ? "(إجباري في حال عدم إدخال الرقم المرجعي)" : "(Required if no reference number)"}
                      </span>
                    </label>
                    
                    <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      receiptImage 
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" 
                        : "border-slate-300 dark:border-slate-700 hover:border-rose-500 bg-slate-50 dark:bg-slate-950/50"
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="receipt-file-input"
                      />
                      <label htmlFor="receipt-file-input" className="cursor-pointer block">
                        {receiptImage ? (
                          <div className="space-y-2.5">
                            <div className="relative max-h-36 rounded-xl overflow-hidden border border-emerald-500/40 mx-auto w-fit">
                              <img src={receiptImage} alt="Receipt preview" className="max-h-36 object-contain" />
                              <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-emerald-600 text-white text-[9.5px] font-black shadow">
                                ✓ {isAr ? "تم تجهيز الصورة" : "Image Ready"}
                              </span>
                            </div>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[250px]">{receiptFileName || (isAr ? "تم اختيار الصورة" : "Image selected")}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 hover:underline">
                              {isAr ? "انقر هنا لتغيير الصورة" : "Click to change image"}
                            </p>
                          </div>
                        ) : (
                          <div className="py-3 space-y-1.5">
                            <UploadCloud className="w-7 h-7 text-rose-500 mx-auto" />
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {isAr ? "انقر هنا لاختيار صورة الإيصال أو اسحبها هنا" : "Click to choose receipt photo or drag here"}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              JPG, PNG, WEBP (Max 5MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors shrink-0"
                    >
                      {isAr ? "رجوع" : "Back"}
                    </button>
                    <button
                      id="btn-submit-payment-receipt"
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-500 active:scale-[0.98] text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{isAr ? "جاري الإرسال والتحقق..." : "Submitting..."}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>{isAr ? "تأكيد وإرسال الإيصال للمراجعة" : "Submit Receipt for Review"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
