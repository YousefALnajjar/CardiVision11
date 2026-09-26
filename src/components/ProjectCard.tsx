import React from "react";
import { motion } from "motion/react";
import { 
  Bookmark, 
  Clock, 
  MapPin, 
  Star, 
  BookOpen, 
  ArrowLeft, 
  ArrowRight,
  ShoppingCart,
  Eye,
  Code2,
  Cpu,
  Check, Plus,
  Square
} from "lucide-react";
import { Project } from "../types";
import DifficultyBadge from "./DifficultyBadge";

interface ProjectCardProps {
  key?: string;
  project: Project;
  lang: "ar" | "en";
  theme: "dark" | "light";
  isFavorited: boolean;
  onToggleFavorite: (projectId: string) => any;
  onViewDetails: (project: Project) => any;
  onPurchase: (projectId: string) => any;
  currentUser: any;
  isCompareMode?: boolean;
  isCompared?: boolean;
  onToggleCompare?: (projectId: string) => void;
  compareLimitReached?: boolean;
}

export default function ProjectCard({
  project,
  lang,
  theme,
  isFavorited,
  onToggleFavorite,
  onViewDetails,
  onPurchase,
  currentUser,
  isCompareMode,
  isCompared,
  onToggleCompare,
  compareLimitReached
}: ProjectCardProps) {
  
  // Format price
  const formatPrice = (price?: number) => {
    const val = price ?? (project as any)?.priceSyp ?? 0;
    return lang === "ar" ? `${val.toLocaleString()} ل.س` : `${val.toLocaleString()} SYP`;
  };

  // Find primary programming language and hardware component
  const softwareList = lang === "ar" ? (project.softwareAr || []) : (project.softwareEn || []);
  const fallbackSoftware = project.softwareEn || project.softwareAr || [];
  const primarySoftware = softwareList[0] || fallbackSoftware[0];

  const componentsList = lang === "ar" ? (project.componentsAr || []) : (project.componentsEn || []);
  const fallbackComponents = project.componentsEn || project.componentsAr || [];
  const primaryHardware = componentsList[0] || fallbackComponents[0];

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2, ease: "easeOut" } }}
      whileTap={{ scale: 0.99, transition: { duration: 0.1 } }}
      onClick={() => {
        if (isCompareMode && onToggleCompare) {
          onToggleCompare(project.id);
        }
      }}
      className={`w-full min-w-full rounded-2xl border overflow-hidden flex flex-col justify-between group transition-colors duration-300 relative ${
        theme === "dark" 
          ? "bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/50" 
          : "bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/60"
      } ${isCompareMode ? "cursor-pointer" : ""} ${
        isCompared ? "ring-4 ring-blue-500 border-blue-500 scale-[1.02] shadow-blue-500/20" : ""
      }`}
      id={`project-card-${project.id}`}
      title={
        isCompareMode
          ? isCompared
            ? lang === "ar"
              ? "محدد للمقارنة — انقر لإلغاء تحديده"
              : "Selected for comparison — Click to deselect"
            : compareLimitReached
            ? lang === "ar"
              ? "تم الوصول للحد الأقصى (مشروعين). استخدم زر 'إلغاء التحديد' من الشريط بالأسفل أو انقر على مشروع محدد لإزالته"
              : "2-project limit reached. Use 'Clear' in the bottom bar or click a selected project to replace"
            : lang === "ar"
            ? "انقر لتحديد هذا المشروع للمقارنة"
            : "Click to select this project for comparison"
          : undefined
      }
    >
      
      {/* Compare Visual Indicator */}
      {isCompareMode && (
        <div
          className={`absolute top-3 start-3 p-2 rounded-full z-10 transition-all backdrop-blur-md border ${
            isCompared 
              ? "bg-blue-600 border-blue-500 text-white shadow-lg" 
              : "bg-slate-900/50 border-slate-700/50 text-slate-300"
          }`}
          title={
            isCompared
              ? lang === "ar"
                ? "مشروع محدد للمقارنة — انقر لإلغائه"
                : "Selected — click to deselect"
              : compareLimitReached
              ? lang === "ar"
                ? "وصلت للحد الأقصى (2/2): اضغط 'إلغاء التحديد' بالأسفل لإفراغ القائمة"
                : "Limit reached (2/2): Use 'Clear' below to reset selection"
              : lang === "ar"
              ? "تحديد للمقارنة"
              : "Select for comparison"
          }
        >
          {isCompared ? <Check className="w-5 h-5 font-black" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-400" />}
        </div>
      )}

      {/* Favorite Toggle Button */}
      {currentUser && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(project.id);
          }}
          className={`absolute top-3 end-3 p-2 rounded-full z-10 transition-all ${
            isFavorited 
              ? "bg-rose-500 text-white shadow-lg" 
              : "bg-slate-950/40 text-slate-300 hover:text-white hover:scale-105"
          }`}
          title={lang === "ar" ? "حفظ المشروع" : "Quick Bookmark"}
          id={`fav-btn-${project.id}`}
        >
          <Bookmark className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
        </button>
      )}

      {/* View Count Badge to show project popularity */}
      <div 
        className={`absolute top-3 ${currentUser ? "end-12" : "end-3"} z-10 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-950/85 backdrop-blur-md text-slate-200 border border-slate-700/70 shadow-md flex items-center gap-1.5`}
        title={lang === "ar" ? `${(project.viewsCount || 145).toLocaleString()} مشاهدة` : `${(project.viewsCount || 145).toLocaleString()} views`}
        id={`view-count-badge-${project.id}`}
      >
        <Eye className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        <span className="font-mono tracking-tight font-black">
          {(project.viewsCount || 145).toLocaleString()}
        </span>
      </div>

      <div>
        {/* Project Thumbnail Image */}
        <div className="relative h-48 overflow-hidden bg-slate-950">
          <img 
            src={project.imageUrl} 
            alt={lang === "ar" ? project.titleAr : project.titleEn}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
          
          {/* Top Left Badges: Difficulty & Popularity */}
          <div className="absolute top-3 start-3 flex flex-col gap-1.5 z-10">
            {/* High-Tech Interactive Difficulty Gauge Badge */}
            <DifficultyBadge level={project.difficultyLevel} lang={lang} size="sm" />

            {/* Popular Badges */}
            {(project.isBestSeller || (project.salesCount && project.salesCount > 30)) && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 flex items-center gap-1 shadow-sm">
                🔥 {lang === "ar" ? "الأكثر مبيعاً" : "Best Seller"}
              </span>
            )}
            {(project.isMostViewed || (project.viewsCount && project.viewsCount > 1500)) && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-500 text-white flex items-center gap-1 shadow-sm">
                ⭐ {lang === "ar" ? "الأكثر مشاهدة" : "Most Viewed"}
              </span>
            )}
            {(project.isTopRated || (project.rating && project.rating >= 4.8)) && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                🏆 {lang === "ar" ? "الأعلى تقييماً" : "Top Rated"}
              </span>
            )}
          </div>

          {/* Category Chip */}
          <span className="absolute bottom-3 start-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white uppercase tracking-wider">
            {project.category === "biomedical" ? (lang === "ar" ? "طبية" : "Biomedical") :
             project.category === "software" ? (lang === "ar" ? "برمجيات وذكاء اصطناعي" : "Software & AI") :
             project.category === "electrical" ? (lang === "ar" ? "كهرباء وتحكم" : "Electrical") :
             project.category === "communications" ? (lang === "ar" ? "اتصالات" : "Communications") :
             (lang === "ar" ? "ميكانيك وميكاترونكس" : "Mechatronics")}
          </span>

          {/* Pricing Tag */}
          <span className="absolute bottom-3 end-3 px-2.5 py-0.5 rounded-lg text-xs font-black bg-slate-950/80 text-rose-400 border border-slate-800 backdrop-blur-sm">
            {formatPrice(project.price)}
          </span>
        </div>

        {/* Content Box */}
        <div className="p-5">
          {/* University and Type Row */}
          <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="truncate max-w-[120px]">
                {lang === "ar" ? (project.universityAr || "مؤسسة CardioVision") : (project.universityEn || "CardioVision Hub")}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-rose-500 shrink-0" />
              <span>{lang === "ar" ? project.durationAr : project.durationEn}</span>
            </span>
          </div>

          {/* Project Title */}
          <h3 className={`font-extrabold text-sm md:text-base mb-1.5 group-hover:text-rose-500 transition-colors line-clamp-1 ${
            theme === "dark" ? "text-slate-100" : "text-slate-900"
          }`}>
            {lang === "ar" ? project.titleAr : project.titleEn}
          </h3>

          {/* Description */}
          <p className={`text-xs leading-relaxed mb-2.5 line-clamp-2 ${
            theme === "dark" ? "text-slate-400" : "text-slate-700"
          }`}>
            {lang === "ar" ? project.descriptionAr : project.descriptionEn}
          </p>

          {/* Primary Programming Language / Hardware Component Tag Display */}
          {(primarySoftware || primaryHardware) && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3" id={`tech-tags-${project.id}`}>
              {primarySoftware && (
                <span 
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                    theme === "dark" 
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" 
                      : "bg-cyan-50 text-cyan-800 border-cyan-200"
                  }`}
                  title={lang === "ar" ? `البرمجيات ولغة البرمجة: ${primarySoftware}` : `Language / Software: ${primarySoftware}`}
                  id={`tag-software-${project.id}`}
                >
                  <Code2 className="w-3 h-3 text-cyan-500 shrink-0" />
                  <span className="truncate max-w-[130px]">{primarySoftware}</span>
                </span>
              )}
              {primaryHardware && (
                <span 
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                    theme === "dark" 
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                  title={lang === "ar" ? `المكون العتادي الأساسي: ${primaryHardware}` : `Primary Hardware: ${primaryHardware}`}
                  id={`tag-hardware-${project.id}`}
                >
                  <Cpu className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="truncate max-w-[130px]">{primaryHardware}</span>
                </span>
              )}
            </div>
          )}

          {/* Metrics Row: Views, Sales, Rating */}
          <div className={`flex items-center justify-between text-[11px] pt-2 border-t font-medium ${
            theme === "dark" ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-600"
          }`}>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1" title={lang === "ar" ? "عدد المشاهدات" : "Views count"}>
                <Eye className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className={`font-mono font-bold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>{(project.viewsCount || 145).toLocaleString()}</span>
              </span>
              <span className="flex items-center gap-1" title={lang === "ar" ? "عمليات الشراء" : "Purchases"}>
                🛒 <span className={`font-mono font-bold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>{project.salesCount || 12}</span>
              </span>
              <span className="flex items-center gap-1" title={lang === "ar" ? "الإعجابات" : "Likes"}>
                ❤️ <span className={`font-mono font-bold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>{project.likesCount || 48}</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-mono font-black text-amber-400">{project.rating || 4.8}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer CTA buttons */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-3 max-[359px]:flex max-[359px]:flex-col max-[359px]:min-w-full">
        {/* Details button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isCompareMode) onViewDetails(project);
          }}
          className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 border ${isCompareMode ? "opacity-50 cursor-not-allowed" : ""} ${
            theme === "dark"
              ? "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
          }`}
          id={`view-details-${project.id}`}
        >
          <span>{lang === "ar" ? "تفاصيل" : "Details"}</span>
          {lang === "ar" ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
        </button>

        {/* Order purchase button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isCompareMode) onPurchase(project.id);
          }}
          className={`w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-rose-600/10 ${isCompareMode ? "opacity-50 cursor-not-allowed" : ""}`}
          id={`buy-btn-${project.id}`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{lang === "ar" ? "شراء" : "Order"}</span>
        </button>
      </div>

    </motion.div>
  );
}
