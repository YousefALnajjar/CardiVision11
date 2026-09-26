import React, { useState } from "react";
import { 
  X, 
  Layers, 
  Check, 
  AlertCircle, 
  Gauge, 
  FolderCheck, 
  Power,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { Project } from "../types";

interface BulkEditProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProjectIds: string[];
  selectedProjects: Project[];
  categories: any[];
  lang: "ar" | "en";
  theme: "dark" | "light";
  onSuccess: () => void;
}

export const BulkEditProjectsModal: React.FC<BulkEditProjectsModalProps> = ({
  isOpen,
  onClose,
  selectedProjectIds,
  selectedProjects,
  categories,
  lang,
  theme,
  onSuccess
}) => {
  // Field toggles
  const [updateCategory, setUpdateCategory] = useState(false);
  const [newCategory, setNewCategory] = useState(categories[0]?.id || "biomedical");

  const [updateDifficulty, setUpdateDifficulty] = useState(false);
  const [newDifficulty, setNewDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const [updateStatus, setUpdateStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<"active" | "draft" | "archived">("active");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!updateCategory && !updateDifficulty && !updateStatus) {
      setError(
        lang === "ar"
          ? "يرجى تحديد حقل واحد على الأقل لتحديثه"
          : "Please select at least one field to update"
      );
      return;
    }

    const updates: any = {};
    if (updateCategory) updates.category = newCategory;
    if (updateDifficulty) updates.difficultyLevel = newDifficulty;
    if (updateStatus) updates.status = newStatus;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects/bulk-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          projectIds: selectedProjectIds,
          updates
        })
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Failed to update selected projects");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all text-left ${
          theme === "dark" 
            ? "bg-slate-900 border-slate-800 text-slate-100" 
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">
                {lang === "ar" ? "التعديل الجماعي للمشاريع" : "Batch Edit Projects"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === "ar" 
                  ? `تعديل ${selectedProjectIds.length} مشاريع محددة في عملية واحدة`
                  : `Update ${selectedProjectIds.length} selected projects in one operation`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected projects pill list preview */}
        <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
            {lang === "ar" ? "المشاريع المحددة للتعديل:" : "Selected Projects:"}
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {selectedProjects.map((p) => (
              <span
                key={p.id}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-850 border border-slate-750 text-slate-300 truncate max-w-[200px]"
                title={p.titleAr || p.titleEn}
              >
                {lang === "ar" ? p.titleAr : p.titleEn}
              </span>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-5 text-xs">
          
          {/* FIELD 1: CATEGORY */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            updateCategory 
              ? "border-rose-500/40 bg-rose-500/5" 
              : "border-slate-800 bg-slate-950/30 opacity-70"
          }`}>
            <label className="flex items-center gap-2.5 cursor-pointer font-bold select-none mb-2">
              <input
                type="checkbox"
                checked={updateCategory}
                onChange={(e) => setUpdateCategory(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-700 bg-slate-900"
              />
              <span className="flex items-center gap-1.5 text-slate-200">
                <FolderCheck className="w-3.5 h-3.5 text-rose-400" />
                {lang === "ar" ? "تعديل القسم الهندسي (Category)" : "Update Category"}
              </span>
            </label>

            {updateCategory && (
              <div className="pt-1.5 pl-6">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-rose-500"
                >
                  <option value="biomedical">{lang === "ar" ? "الهندسة الطبية (Biomedical)" : "Biomedical"}</option>
                  <option value="software">{lang === "ar" ? "البرمجيات والذكاء الاصطناعي (Software & AI)" : "Software & AI"}</option>
                  <option value="electrical">{lang === "ar" ? "الكهربائية والتحكم (Electrical)" : "Electrical"}</option>
                  <option value="communications">{lang === "ar" ? "الاتصالات (Communications)" : "Communications"}</option>
                  <option value="mechatronics">{lang === "ar" ? "الميكاترونكس (Mechatronics)" : "Mechatronics"}</option>
                  {categories.map((c: any) => (
                    !["biomedical", "software", "electrical", "communications", "mechatronics"].includes(c.id) && (
                      <option key={c.id} value={c.id}>
                        {lang === "ar" ? c.labelAr : c.labelEn}
                      </option>
                    )
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* FIELD 2: DIFFICULTY LEVEL */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            updateDifficulty 
              ? "border-amber-500/40 bg-amber-500/5" 
              : "border-slate-800 bg-slate-950/30 opacity-70"
          }`}>
            <label className="flex items-center gap-2.5 cursor-pointer font-bold select-none mb-2">
              <input
                type="checkbox"
                checked={updateDifficulty}
                onChange={(e) => setUpdateDifficulty(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-700 bg-slate-900"
              />
              <span className="flex items-center gap-1.5 text-slate-200">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                {lang === "ar" ? "تعديل مستوى الصعوبة (Difficulty Level)" : "Update Difficulty Level"}
              </span>
            </label>

            {updateDifficulty && (
              <div className="pt-1.5 pl-6 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewDifficulty("easy")}
                  className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                    newDifficulty === "easy"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  🟢 {lang === "ar" ? "سهل (Easy)" : "Easy"}
                </button>
                <button
                  type="button"
                  onClick={() => setNewDifficulty("medium")}
                  className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                    newDifficulty === "medium"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  🟡 {lang === "ar" ? "متوسط (Med)" : "Medium"}
                </button>
                <button
                  type="button"
                  onClick={() => setNewDifficulty("hard")}
                  className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                    newDifficulty === "hard"
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  🔴 {lang === "ar" ? "صعب (Hard)" : "Hard"}
                </button>
              </div>
            )}
          </div>

          {/* FIELD 3: STATUS */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            updateStatus 
              ? "border-indigo-500/40 bg-indigo-500/5" 
              : "border-slate-800 bg-slate-950/30 opacity-70"
          }`}>
            <label className="flex items-center gap-2.5 cursor-pointer font-bold select-none mb-2">
              <input
                type="checkbox"
                checked={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 border-slate-700 bg-slate-900"
              />
              <span className="flex items-center gap-1.5 text-slate-200">
                <Power className="w-3.5 h-3.5 text-indigo-400" />
                {lang === "ar" ? "تعديل حالة النشر (Project Status)" : "Update Status"}
              </span>
            </label>

            {updateStatus && (
              <div className="pt-1.5 pl-6 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewStatus("active")}
                  className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                    newStatus === "active"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  ✓ {lang === "ar" ? "نشط (Active)" : "Active"}
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatus("draft")}
                  className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                    newStatus === "draft"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  ✎ {lang === "ar" ? "مسودة (Draft)" : "Draft"}
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatus("archived")}
                  className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                    newStatus === "archived"
                      ? "bg-slate-700 text-slate-300 border-slate-600"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  ✕ {lang === "ar" ? "مؤرشف (Archived)" : "Archived"}
                </button>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * {lang === "ar" 
                ? "سيتم تطبيق الحقول المفعلة فقط على جميع المشاريع المحددة دون المساس بباقي البيانات." 
                : "Only enabled fields will be updated across all selected projects."}
          </p>

          {/* Action buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              disabled={loading || (!updateCategory && !updateDifficulty && !updateStatus)}
              className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-600/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{lang === "ar" ? "جاري تطبيق التعديلات..." : "Applying Updates..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "تطبيق التعديلات الجماعية" : "Apply Batch Updates"}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs transition-colors border border-slate-700"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkEditProjectsModal;
