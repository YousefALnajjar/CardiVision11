import fs from 'fs';
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const newModal = `      {isEditModalOpen && selectedEditProject && (
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
                  <textarea value={(selectedEditProject.featuresAr || []).join(',\\n')} onChange={(e) => setSelectedEditProject({...selectedEditProject, featuresAr: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={3} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "الميزات (إنجليزي) - افصل بفاصلة" : "Features (En) - Comma separated"}</label>
                  <textarea value={(selectedEditProject.featuresEn || []).join(',\\n')} onChange={(e) => setSelectedEditProject({...selectedEditProject, featuresEn: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={3} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "المكونات العتادية (عربي)" : "Hardware Components (Ar)"}</label>
                  <textarea value={(selectedEditProject.componentsAr || selectedEditProject.hardwareComponents || []).join(',\\n')} onChange={(e) => setSelectedEditProject({...selectedEditProject, componentsAr: e.target.value.split(',').map(s=>s.trim()).filter(Boolean), hardwareComponents: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={3} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "المكونات العتادية (إنجليزي)" : "Hardware Components (En)"}</label>
                  <textarea value={(selectedEditProject.componentsEn || []).join(',\\n')} onChange={(e) => setSelectedEditProject({...selectedEditProject, componentsEn: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={3} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "البرمجيات المستخدمة (عربي)" : "Software Used (Ar)"}</label>
                  <textarea value={(selectedEditProject.softwareAr || selectedEditProject.softwareUsed || []).join(',\\n')} onChange={(e) => setSelectedEditProject({...selectedEditProject, softwareAr: e.target.value.split(',').map(s=>s.trim()).filter(Boolean), softwareUsed: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={3} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{lang === "ar" ? "البرمجيات المستخدمة (إنجليزي)" : "Software Used (En)"}</label>
                  <textarea value={(selectedEditProject.softwareEn || []).join(',\\n')} onChange={(e) => setSelectedEditProject({...selectedEditProject, softwareEn: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" rows={3} />
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
                      const res = await fetch(\`/api/projects/\${selectedEditProject.id}\`, {
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
      )}`;

const startString = "{isEditModalOpen && selectedEditProject && (";
const endString = "      )}";

const startIndex = code.indexOf(startString);
const endIndex = code.indexOf(endString, startIndex) + endString.length;

if (startIndex !== -1 && endIndex !== -1) {
  const newCode = code.substring(0, startIndex) + newModal + code.substring(endIndex);
  fs.writeFileSync('src/components/AdminDashboard.tsx', newCode);
  console.log("Modal replaced successfully");
} else {
  console.error("Could not find modal boundary");
}
