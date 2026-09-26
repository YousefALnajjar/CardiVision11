const fs = require('fs');
let content = fs.readFileSync('src/components/ProjectCard.tsx', 'utf8');

// 1. Add onClick and update className of the main div
const targetDiv = `  return (
    <div
      className={\`w-full min-w-full rounded-2xl border overflow-hidden flex flex-col justify-between group transition-all duration-300 relative \${
        theme === "dark" 
          ? "bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/40" 
          : "bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
      } \${isCompared ? "ring-2 ring-indigo-500 border-indigo-500" : ""}\`}
      id={\`project-card-\${project.id}\`}
    >`;

const replacementDiv = `  return (
    <div
      onClick={() => {
        if (isCompareMode && onToggleCompare) {
          onToggleCompare(project.id);
        }
      }}
      className={\`w-full min-w-full rounded-2xl border overflow-hidden flex flex-col justify-between group transition-all duration-300 relative \${
        theme === "dark" 
          ? "bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/40" 
          : "bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
      } \${isCompareMode ? "cursor-pointer" : ""} \${
        isCompared ? "ring-4 ring-blue-500 border-blue-500 scale-[1.02] shadow-blue-500/20" : ""
      }\`}
      id={\`project-card-\${project.id}\`}
    >`;

content = content.replace(targetDiv, replacementDiv);

// 2. Replace Compare Checkbox with Visual Indicator
const targetCheckbox = `      {/* Compare Checkbox */}
      {isCompareMode && onToggleCompare && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(project.id);
          }}
          className={\`absolute top-3 start-3 p-2 rounded-full z-10 transition-all backdrop-blur-md border \${
            isCompared 
              ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" 
              : "bg-slate-900/50 border-slate-700/50 text-slate-300 hover:text-white"
          }\`}
          title={lang === "ar" ? "اختر للمقارنة" : "Select for Compare"}
        >
          {isCompared ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      )}`;

const replacementCheckbox = `      {/* Compare Visual Indicator */}
      {isCompareMode && (
        <div
          className={\`absolute top-3 start-3 p-2 rounded-full z-10 transition-all backdrop-blur-md border \${
            isCompared 
              ? "bg-blue-600 border-blue-500 text-white shadow-lg" 
              : "bg-slate-900/50 border-slate-700/50 text-slate-300"
          }\`}
        >
          {isCompared ? <Check className="w-5 h-5 font-black" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-400" />}
        </div>
      )}`;

content = content.replace(targetCheckbox, replacementCheckbox);

// 3. Stop propagation on footer buttons
const targetFooterBtn1 = `        <button
          onClick={() => onViewDetails(project)}
          className={\`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 border \${`;

const replacementFooterBtn1 = `        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isCompareMode) onViewDetails(project);
          }}
          className={\`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 border \${isCompareMode ? "opacity-50 cursor-not-allowed" : ""} \${`;

content = content.replace(targetFooterBtn1, replacementFooterBtn1);

const targetFooterBtn2 = `        <button
          onClick={() => onPurchase(project.id)}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-rose-600/10"
          id={\`buy-btn-\${project.id}\`}
        >`;

const replacementFooterBtn2 = `        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isCompareMode) onPurchase(project.id);
          }}
          className={\`w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-rose-600/10 \${isCompareMode ? "opacity-50 cursor-not-allowed" : ""}\`}
          id={\`buy-btn-\${project.id}\`}
        >`;

content = content.replace(targetFooterBtn2, replacementFooterBtn2);

fs.writeFileSync('src/components/ProjectCard.tsx', content);
