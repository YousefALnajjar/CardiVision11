import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface QRCodeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "ar" | "en";
  theme: "dark" | "light";
}

export default function QRCodeShareModal({ isOpen, onClose, lang, theme }: QRCodeShareModalProps) {
  const [copied, setCopied] = useState(false);
  const url = "https://ais-pre-etzp72ucvbepzlzvzuibcw-316175649701.us-east5.run.app";

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-sm p-6 rounded-3xl shadow-2xl border transition-all ${
          theme === "dark" 
            ? "bg-slate-900 border-slate-800 text-white" 
            : "bg-white border-slate-200 text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-full hover:bg-slate-500/20 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="text-center space-y-5">
          <h3 className="text-lg font-black mt-2">
            {lang === "ar" ? "امسح الكود لزيارة المنصة" : "Scan to visit platform"}
          </h3>

          {/* حاوية الـ QR البيضاء لضمان التباين */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-3xl shadow-sm inline-block border border-slate-100">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}&margin=10`}
                alt="Platform QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>
          </div>

          {/* زر نسخ الرابط */}
          <div className="pt-2 flex items-center justify-center">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border shadow-sm hover:scale-105 active:scale-95 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500">{lang === "ar" ? "تم النسخ!" : "Copied!"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>{lang === "ar" ? "نسخ رابط المنصة" : "Copy Platform Link"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}