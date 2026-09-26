import React, { useState, useEffect } from "react";
import { Star, X, CheckCircle2, MessageSquare, AlertCircle, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { User, PlatformFeedback } from "../types";
import { feedbackService } from "../services/feedbackService";

interface RateExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  language: "ar" | "en";
  theme?: "dark" | "light";
  onLoginRequest?: () => void;
  onFeedbackSubmitted?: () => void;
  isSmartPrompt?: boolean;
  onLater?: () => void;
}

export const RateExperienceModal: React.FC<RateExperienceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  language,
  theme = "dark",
  onLoginRequest,
  onFeedbackSubmitted,
  isSmartPrompt = false,
  onLater
}) => {
  const isAr = language === "ar";

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [existingFeedback, setExistingFeedback] = useState<PlatformFeedback | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Load existing feedback when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      loadMyFeedback();
    } else if (!currentUser) {
      setExistingFeedback(null);
      setRating(5);
      setMessage("");
      setIsEditing(false);
      setIsSuccess(false);
      setError(null);
    }
  }, [isOpen, currentUser]);

  const loadMyFeedback = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await feedbackService.getMyFeedback();
      if (res.success && res.feedback) {
        setExistingFeedback(res.feedback);
        setRating(res.feedback.rating);
        setMessage(res.feedback.message);
        setIsEditing(false);
      } else {
        setExistingFeedback(null);
        setRating(5);
        setMessage("");
        setIsEditing(true);
      }
    } catch (e: any) {
      console.error("Failed to load feedback", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleLaterClick = () => {
    try {
      // Snooze smart prompt for 7 days
      localStorage.setItem("cardiovision_feedback_dismissed_until", String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch {}
    if (onLater) onLater();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onLoginRequest) onLoginRequest();
      return;
    }

    if (rating < 1 || rating > 5) {
      setError(isAr ? "يرجى اختيار تقييم من 1 إلى 5 نجوم" : "Please select a rating between 1 and 5 stars");
      return;
    }

    if (message.trim().length < 3) {
      setError(isAr ? "يرجى كتابة ملاحظاتك وتجربتك بالتفصيل (3 أحرف على الأقل)" : "Please enter at least 3 characters about your experience");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await feedbackService.submitFeedback(rating, message.trim());
      if (res.success) {
        setIsSuccess(true);
        if (res.feedback) {
          setExistingFeedback(res.feedback);
        }
        setIsEditing(false);
        try {
          // Mark that user has submitted feedback so smart prompt never bugs them again
          localStorage.setItem("cardiovision_feedback_submitted", "true");
        } catch {}
        if (onFeedbackSubmitted) onFeedbackSubmitted();
        setTimeout(() => {
          setIsSuccess(false);
        }, 4000);
      } else {
        setError(res.error || (isAr ? "حدث خطأ أثناء إرسال التقييم" : "Error submitting feedback"));
      }
    } catch (err: any) {
      setError(isAr ? "تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً" : "Network error, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return isAr ? "تجربة رائعة ⭐⭐⭐⭐⭐" : "Exceptional experience ⭐⭐⭐⭐⭐";
      case 4:
        return isAr ? "تجربة ممتازة ⭐⭐⭐⭐" : "Great experience ⭐⭐⭐⭐";
      case 3:
        return isAr ? "تجربة جيدة ⭐⭐⭐" : "Good experience ⭐⭐⭐";
      case 2:
        return isAr ? "يمكننا تقديم تجربة أفضل ⭐⭐" : "Could be better ⭐⭐";
      case 1:
        return isAr ? "تحتاج التجربة إلى تحسين ⭐" : "Needs improvement ⭐";
      default:
        return "";
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div 
        id="rate-experience-modal"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Star className="w-5 h-5 fill-emerald-500 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isAr ? "كيف كانت تجربتك مع CardioVision؟" : "How was your experience with CardioVision?"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? "نحن نهتم برأيك، وملاحظاتك تساعدنا على تطوير المنصة." : "We value your opinion, and your feedback helps us improve the platform."}
              </p>
            </div>
          </div>
          <button
            id="btn-close-feedback-modal"
            onClick={isSmartPrompt ? handleLaterClick : onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isAr ? "إغلاق" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <RefreshCw className="w-7 h-7 animate-spin text-emerald-500" />
              <p className="text-sm font-medium">{isAr ? "جاري التحقق من التقييم..." : "Checking feedback..."}</p>
            </div>
          ) : !currentUser ? (
            /* Unauthenticated View */
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {isAr ? "تسجيل الدخول مطلوب لإرسال التقييم" : "Sign In Required"}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {isAr 
                    ? "لضمان مصداقية التقييمات وحماية المنصة، يرجى تسجيل الدخول بحسابك الأكاديمي أولاً." 
                    : "To guarantee authentic feedback and maintain platform integrity, please sign in first."}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  id="btn-login-to-rate"
                  onClick={() => {
                    onClose();
                    if (onLoginRequest) onLoginRequest();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all inline-flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isAr ? "تسجيل الدخول بحساب Google" : "Sign In with Google"}
                </button>
                {isSmartPrompt && (
                  <button
                    type="button"
                    onClick={handleLaterClick}
                    className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-semibold transition-colors"
                  >
                    {isAr ? "لاحقاً" : "Later"}
                  </button>
                )}
              </div>
            </div>
          ) : existingFeedback && !isEditing ? (
            /* View Existing Feedback (ReadOnly + Admin Reply) */
            <div className="space-y-5">
              {isSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">
                    {isAr ? "تم إرسال وحفظ التقييم بنجاح! شكراً لمساهمتك في تطوير المنصة." : "Your feedback has been saved successfully! Thank you."}
                  </div>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {isAr ? "تقييمك الحالي:" : "Your Current Rating:"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(existingFeedback.createdAt).toLocaleDateString(isAr ? "ar-SY" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= existingFeedback.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mr-2 ml-2">
                    {existingFeedback.rating} / 5
                  </span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    ({getRatingLabel(existingFeedback.rating)})
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    {isAr ? "ورأيك:" : "Your Feedback:"}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-white dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    {existingFeedback.message}
                  </p>
                </div>

                {/* Admin Reply Section if available */}
                {existingFeedback.adminReply && (
                  <div className="mt-4 p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isAr ? "رد إدارة منصة CardioVision:" : "CardioVision Administration Response:"}</span>
                      {existingFeedback.repliedAt && (
                        <span className="text-[11px] font-normal text-blue-500 mr-auto ml-auto">
                          {new Date(existingFeedback.repliedAt).toLocaleDateString(isAr ? "ar-SY" : "en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-blue-900 dark:text-blue-100 italic leading-relaxed">
                      "{existingFeedback.adminReply}"
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  id="btn-edit-feedback"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {isAr ? "تعديل التقييم" : "Edit Rating"}
                </button>
                <button
                  id="btn-close-feedback-view"
                  onClick={onClose}
                  className="px-5 py-2 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all"
                >
                  {isAr ? "إغلاق" : "Done"}
                </button>
              </div>
            </div>
          ) : (
            /* Feedback Form (New or Editing) */
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-sm text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Star Rating Picker */}
              <div className="space-y-2 text-center py-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isAr ? "حدد تقييمك (1 - 5 نجوم)" : "Select Your Rating (1 - 5 Stars)"}
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        id={`btn-star-rating-${star}`}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 rounded-xl transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        title={`${star} / 5`}
                      >
                        <Star
                          className={`w-9 h-9 transition-colors ${
                            active
                              ? "text-amber-400 fill-amber-400 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.3)]"
                              : "text-slate-300 dark:text-slate-700 hover:text-slate-400"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="h-6">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-all">
                    {getRatingLabel(hoverRating || rating)}
                  </p>
                </div>
              </div>

              {/* Experience Message Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="feedback-message-textarea"
                    className="text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    {isAr ? "اكتب لنا رأيك أو اقتراحك" : "Write your feedback or suggestion"}
                  </label>
                  <span className={`text-[11px] ${message.length > 1400 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                    {message.length} / 1500
                  </span>
                </div>
                <textarea
                  id="feedback-message-textarea"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={1500}
                  placeholder={
                    isAr
                      ? "ما الذي أعجبك؟ وما الذي يمكننا تحسينه؟"
                      : "What did you like? What can we improve?"
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                {existingFeedback ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setRating(existingFeedback.rating);
                      setMessage(existingFeedback.message);
                    }}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {isAr ? "إلغاء التعديل" : "Cancel Edit"}
                  </button>
                ) : (isSmartPrompt || onLater) ? (
                  <button
                    type="button"
                    onClick={handleLaterClick}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {isAr ? "لاحقاً" : "Later"}
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    id="btn-submit-feedback"
                    type="submit"
                    disabled={isSubmitting || message.trim().length < 3}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isAr ? "جاري الإرسال..." : "Submitting..."}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isAr ? "إرسال التقييم" : "Submit Feedback"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RateExperienceModal;
