import fs from 'fs';

let code = fs.readFileSync('src/components/ProjectCard.tsx', 'utf8');

const oldDivStart = `className={\`rounded-2xl border overflow-hidden flex flex-col justify-between group transition-all duration-300 relative \${
        theme === "dark" 
          ? "bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/40" 
          : "bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
      }\`}`;

const newDivStart = `className={\`rounded-2xl border overflow-hidden flex flex-col justify-between group transition-all duration-300 relative \${
        theme === "dark" 
          ? "bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/40" 
          : "bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
      } \${isCompared ? "ring-2 ring-indigo-500 border-indigo-500" : ""}\`}`;

code = code.replace(oldDivStart, newDivStart);

const oldButton = `<button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(project.id);
          }}
          className={\`absolute top-3 start-3 p-2 rounded-xl z-10 transition-all backdrop-blur-md border \${
            isCompared 
              ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" 
              : "bg-slate-950/40 border-slate-700/50 text-slate-300 hover:text-white"
          }\`}
          title={lang === "ar" ? "اختر للمقارنة" : "Select for Compare"}
        >
          {isCompared ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </button>`;

const newButton = `<button
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
        </button>`;

code = code.replace(oldButton, newButton);

fs.writeFileSync('src/components/ProjectCard.tsx', code);
console.log('Done!');
