import React from "react";
import { X, QrCode } from "lucide-react";
import { motion } from "motion/react";
import QRCode from "react-qr-code";

interface QRScannerModalProps {
  onClose: () => void;
  onScanSuccess?: (decodedText: string) => void;
  theme: "dark" | "light";
  lang: "ar" | "en";
}

export default function QRScannerModal({ onClose, theme, lang }: QRScannerModalProps) {
  const syriatelCashNumber = "0982257195";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ${
          theme === "dark" ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"
        }`}
      >
        <div className={`p-4 border-b flex items-center justify-between ${
          theme === "dark" ? "border-slate-800" : "border-slate-100"
        }`}>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-500" />
            <h3 className={`font-black ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
              {lang === "ar" ? "رمز QR للمشروع" : "Project QR Code"}
            </h3>
          </div>
          <button
            id="btn-close-qr-modal"
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              theme === "dark" ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
            }`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 text-center">
          <p className={`text-xs mb-3 font-medium ${
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          }`}>
            {lang === "ar" 
              ? "قم بمسح رمز QR الخاص بالمشروع لتحميل المخططات والوثائق والتحويل السريع."
              : "Scan the project QR code to download schematics and transfer directly."}
          </p>
          
          {/* Centered Dynamic QR Code Generator */}
          <div className="flex justify-center items-center my-6">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
              <QRCode 
                size={200} 
                value={syriatelCashNumber}
                viewBox="0 0 200 200"
              />
            </div>
          </div>

          <div className="text-center font-mono text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            {lang === "ar" ? `رقم سيريتل كاش: ${syriatelCashNumber}` : `Syriatel Cash: ${syriatelCashNumber}`}
          </div>

          <div className="mt-3">
            <button
              id="btn-close-qr-action"
              onClick={onClose}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${
                theme === "dark" 
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              }`}
            >
              {lang === "ar" ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
