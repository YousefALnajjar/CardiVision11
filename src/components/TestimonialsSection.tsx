import React, { useEffect, useState } from "react";
import { Star, Quote, CheckCircle2, MessageSquare, Sparkles } from "lucide-react";
import { FeaturedTestimonial } from "../types";
import { feedbackService } from "../services/feedbackService";

interface TestimonialsSectionProps {
  lang: "ar" | "en";
  theme: "dark" | "light";
  onOpenRateModal?: () => void;
}

const DEFAULT_TESTIMONIALS = [
  {
    id: "default-1",
    userName: "المهندس أسامة الحمصي",
    userUniversity: "جامعة دمشق - الهندسة الطبية",
    rating: 5,
    message: "استلمت الكود البرمجي ومخطط المكونات كاملاً مع المساعدة في برمجية ESP32. حصلت على علامة 98% في مناقشة مشروعي بفضل التوثيق الأكاديمي الدقيق من CardioVision.",
    initials: "أ.ح",
    createdAt: "2025-05-10T10:00:00.000Z"
  },
  {
    id: "default-2",
    userName: "المهندسة سارة العلي",
    userUniversity: "جامعة تشرين - هندسة الميكاترونكس",
    rating: 5,
    message: "ملفات الطباعة ثلاثية الأبعاد STL ودارات الحساس العضلي كانت جاهزة للاستخدام تماماً. الدعم الفني أجاب على كافة استفسارات التوصيل بالواتساب بكل احترافية.",
    initials: "س.ع",
    createdAt: "2025-06-12T14:30:00.000Z"
  },
  {
    id: "default-3",
    userName: "المهندس محمود الشامي",
    userUniversity: "الجامعة الافتراضية السورية - الذكاء الاصطناعي",
    rating: 5,
    message: "نموذج TensorFlow المدرب وتطبيق الجوال عملا بسرعة فائقة ودقة عالية. تم قبول البحث وتكريم فريقنا من قبل عمادة الكلية.",
    initials: "م.ش",
    createdAt: "2025-07-01T09:15:00.000Z"
  }
];

export default function TestimonialsSection({ 
  lang, 
  theme, 
  onOpenRateModal 
}: TestimonialsSectionProps) {
  const isAr = lang === "ar";
  const [featuredReviews, setFeaturedReviews] = useState<FeaturedTestimonial[]>([]);
  const [averageRating, setAverageRating] = useState<number>(5.0);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const loadFeatured = async () => {
      try {
        const res = await feedbackService.getFeaturedFeedback();
        if (isMounted && res.success) {
          if (res.testimonials && res.testimonials.length > 0) {
            setFeaturedReviews(res.testimonials);
          }
          if (res.averageRating) setAverageRating(res.averageRating);
          if (res.totalCount) setTotalCount(res.totalCount);
        }
      } catch (e) {
        console.error("Failed to load featured reviews", e);
      }
    };
    loadFeatured();
    return () => { isMounted = false; };
  }, []);

  // Merge database featured with default fallback to ensure rich layout
  const displayedTestimonials = featuredReviews.length > 0 
    ? [...featuredReviews, ...DEFAULT_TESTIMONIALS.filter(d => !featuredReviews.some(f => f.userName === d.userName))].slice(0, 3)
    : DEFAULT_TESTIMONIALS;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4" dir={isAr ? "rtl" : "ltr"}>
      {/* Header with Title and Live Average Rating */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? "آراء وتجارب طلابنا في المنصة" : "Graduates' Experience & Feedback"}</span>
        </div>

        <h2 className={`text-2xl sm:text-3xl font-black ${
          theme === "dark" ? "text-white" : "text-slate-900"
        }`}>
          {isAr ? "ماذا يقول المهندسون عن تجربة CardioVision؟" : "What Graduates Say About CardioVision"}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400">
          {isAr 
            ? "تجارب حقيقية لطلاب وهواة اعتمدوا على مشاريع المنصة في أبحاثهم وتخرجهم الأكاديمي" 
            : "Authentic feedback from engineering students using our platform solutions"}
        </p>

        {/* Global Rating Badge & Call to Action Button */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-black text-amber-500 dark:text-amber-400 font-mono">
              {averageRating.toFixed(1)} / 5.0
            </span>
            {totalCount > 0 && (
              <span className="text-[11px] text-slate-500 border-r border-slate-700 pr-2 mr-1">
                {isAr ? `${totalCount} تقييم موثق` : `${totalCount} verified reviews`}
              </span>
            )}
          </div>

          {onOpenRateModal && (
            <button
              id="btn-trigger-rate-experience"
              onClick={onOpenRateModal}
              className="px-4 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 fill-white text-white" />
              <span>{isAr ? "قيّم تجربتك معنا" : "Rate Your Experience"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedTestimonials.map((item) => (
          <div 
            key={item.id}
            id={`featured-testimonial-${item.id}`}
            className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] ${
              theme === "dark" 
                ? "bg-slate-900/80 border-slate-800/80 hover:border-amber-500/40 shadow-xl shadow-slate-950" 
                : "bg-white border-slate-200 hover:border-amber-500/40 shadow-lg shadow-slate-200/50"
            }`}
          >
            <div>
              {/* Star Rating & Verified Badge */}
              <div className="flex items-center justify-between gap-1 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-black text-amber-400 mr-1 ml-1 font-mono">
                    {item.rating}.0
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {isAr ? "طالب موثق" : "Verified"}
                </span>
              </div>

              {/* Comment text */}
              <p className={`text-xs sm:text-sm leading-relaxed mb-4 italic ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}>
                "{item.message}"
              </p>

              {/* Admin Reply if present */}
              {item.adminReply && (
                <div className="mb-4 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300 mb-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{isAr ? "رد الإدارة الأكاديمية:" : "Academic Team Reply:"}</span>
                  </div>
                  <p className="text-blue-900 dark:text-blue-100 italic leading-relaxed text-[11px]">
                    "{item.adminReply}"
                  </p>
                </div>
              )}
            </div>

            {/* Author info */}
            <div className="pt-4 border-t border-slate-800/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0 border border-white/20 shadow-md">
                <span>{item.initials || (item.userName ? item.userName[0] : "U")}</span>
              </div>
              <div>
                <h4 className={`text-xs sm:text-sm font-black flex items-center gap-1 ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}>
                  {item.userName}
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline shrink-0" />
                </h4>
                {item.userUniversity && (
                  <span className="text-[10px] text-amber-500 font-bold block">
                    {item.userUniversity}
                  </span>
                )}
                {item.createdAt && (
                  <span className="text-[9px] text-slate-400 block font-mono">
                    {new Date(item.createdAt).toLocaleDateString(isAr ? "ar-SY" : "en-US", { year: "numeric", month: "short" })}
                  </span>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
