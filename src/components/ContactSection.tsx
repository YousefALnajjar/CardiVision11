import React, { useState } from "react";
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  Send, 
  CheckCircle,
  ExternalLink
} from "lucide-react";

interface ContactSectionProps {
  lang: "ar" | "en";
  theme: "dark" | "light";
}

export default function ContactSection({ lang, theme }: ContactSectionProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getWhatsAppUrl = (n: string, e: string, s: string, m: string) => {
    const text = lang === "ar"
      ? `السلام عليكم، رسالة جديدة من موقع CardioVision:\n\n` +
        `👤 *الاسم:* ${n || "غير محدد"}\n` +
        `📧 *البريد/الهاتف:* ${e || "غير محدد"}\n` +
        `📌 *الموضوع:* ${s || "استفسار عام"}\n\n` +
        `📝 *نص الرسالة:*\n${m}`
      : `Hello CardioVision, new message from website:\n\n` +
        `👤 *Name:* ${n}\n` +
        `📧 *Email/Phone:* ${e}\n` +
        `📌 *Subject:* ${s}\n\n` +
        `📝 *Message:*\n${m}`;
    return `https://wa.me/963964809575?text=${encodeURIComponent(text)}`;
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    setSuccess(null);
    setError(null);

    const waUrl = getWhatsAppUrl(name, email, subject, message);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message })
      });
      const data = await res.json();
      
      // Always open WhatsApp to send the message directly to support number 0964809575
      window.open(waUrl, "_blank");

      if (data.success) {
        setSuccess(
          lang === "ar" 
            ? "تم تسجيل رسالتك بنجاح ونقلها إلى واتساب الدعم المباشر (0964809575) للتواصل السريع!"
            : "Your message has been registered and forwarded directly to WhatsApp support (0964809575)!"
        );
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setError(data.error);
      }
    } catch (err) {
      // If server fetch fails, still offer WhatsApp redirect
      window.open(waUrl, "_blank");
      setSuccess(
        lang === "ar"
          ? "جاري توجيه رسالتك مباشرة إلى واتساب الدعم (0964809575)..."
          : "Forwarding your message directly to WhatsApp support (0964809575)..."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="contact-info-hub">
      
      {/* 2/3 Column: Contact Form */}
      <div className={`lg:col-span-2 p-6 md:p-8 rounded-3xl border text-left space-y-4 ${
        theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div>
          <span className="text-[10px] uppercase font-black text-rose-500 tracking-wider">
            {lang === "ar" ? "بوابة التواصل الفوري والواتساب" : "Instant Support & WhatsApp Gateway"}
          </span>
          <h2 className={`text-xl md:text-2xl font-black mt-0.5 ${
            theme === "dark" ? "text-slate-100" : "text-slate-900"
          }`}>
            {lang === "ar" ? "أرسل استفسارك أو طلبك مباشرة" : "Leave a Direct Message"}
          </h2>
          <p className={`text-[11px] mt-1 leading-relaxed ${
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          }`}>
            {lang === "ar" 
              ? "عند إرسال الرسالة يتم حفظها بالنظام وتحويلك تلقائياً إلى رقم الواتساب المباشر (0964809575) لضمان الاستجابة السريعة لمشروعك." 
              : "Submitting this form stores your request and opens direct WhatsApp (0964809575) for immediate team support."}
          </p>
        </div>

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
            <p className="text-[11px] text-slate-300 font-normal">
              {lang === "ar"
                ? "إذا لم يفتح الواتساب تلقائياً، يمكنك النقر على الزر أدناه للمتابعة المباشرة:"
                : "If WhatsApp didn't launch automatically, click the button below:"}
            </p>
            <a
              href="https://wa.me/963964809575"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
              <span>{lang === "ar" ? "فتح واتساب الدعم (0964809575) الآن" : "Open WhatsApp Support Now"}</span>
            </a>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitMessage} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`font-bold block mb-1.5 ${theme === "dark" ? "text-slate-400" : "text-slate-700"}`}>
                {lang === "ar" ? "الاسم الكامل:" : "Your Name:"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === "ar" ? "أدخل اسمك الكريم" : "Enter your full name"}
                className={`w-full text-xs border outline-none rounded-xl p-3 transition-colors ${
                  theme === "dark" 
                    ? "bg-slate-950 border-slate-850 text-slate-100 focus:border-rose-500" 
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-rose-500"
                }`}
                required
              />
            </div>

            <div>
              <label className={`font-bold block mb-1.5 ${theme === "dark" ? "text-slate-400" : "text-slate-700"}`}>
                {lang === "ar" ? "البريد الإلكتروني أو رقم الهاتف:" : "Email or Phone Number:"}
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang === "ar" ? "أدخل بريدك أو رقمك" : "yourname@example.com / 0964809575"}
                className={`w-full text-xs border outline-none rounded-xl p-3 transition-colors ${
                  theme === "dark" 
                    ? "bg-slate-950 border-slate-850 text-slate-100 focus:border-rose-500" 
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-rose-500"
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label className={`font-bold block mb-1.5 ${theme === "dark" ? "text-slate-400" : "text-slate-700"}`}>
              {lang === "ar" ? "الموضوع (عنوان الاستفسار):" : "Subject:"}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={lang === "ar" ? "مثال: استفسار عن مشروع تخرج أو كود أو مخطط" : "e.g. Graduation project or code inquiry"}
              className={`w-full text-xs border outline-none rounded-xl p-3 transition-colors ${
                theme === "dark" 
                  ? "bg-slate-950 border-slate-850 text-slate-100 focus:border-rose-500" 
                  : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-rose-500"
              }`}
            />
          </div>

          <div>
            <label className={`font-bold block mb-1.5 ${theme === "dark" ? "text-slate-400" : "text-slate-700"}`}>
              {lang === "ar" ? "تفاصيل الرسالة أو الطلب:" : "Detailed Request:"}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={lang === "ar" ? "اكتب تفاصيل طلبك أو استفسارك هنا بكل وضوح..." : "Describe your request fully..."}
              className={`w-full text-xs border outline-none rounded-2xl p-4 h-28 transition-colors ${
                theme === "dark" 
                  ? "bg-slate-950 border-slate-850 text-slate-100 focus:border-rose-500" 
                  : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-rose-500"
              }`}
              required
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !name || !email || !message}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/15 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {loading 
                  ? (lang === "ar" ? "جاري الإرسال والتحويل..." : "Sending...") 
                  : (lang === "ar" ? "إرسال الرسالة وتحويلها لواتساب الشركة" : "Send & Forward to WhatsApp")}
              </span>
            </button>

            <a
              href={getWhatsAppUrl(name, email, subject, message)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
            >
              <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
              <span>{lang === "ar" ? "إرسال عبر واتساب المباشر" : "Direct WhatsApp"}</span>
            </a>
          </div>
        </form>
      </div>

      {/* 1/3 Column: Contact Channels Cards */}
      <div className="space-y-6">
        
        {/* Direct Phone Call Channels */}
        <div className={`p-6 rounded-3xl border text-left space-y-4 ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="p-3 w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <Phone className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className={`font-extrabold text-sm ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
              {lang === "ar" ? "رقم الاتصال المباشر بالدعم الفني" : "Direct Support Line"}
            </h3>
            <span className={`text-xl font-black block mt-1 font-mono ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
              0964809575
            </span>
            <p className={`text-[10px] mt-1 leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
              {lang === "ar" ? "الاتصالات المباشرة والاستشارات الفنية متوفرة لخدمة طلاب كليات الهندسة." : "Direct academic and project setup consultation is available."}
            </p>
          </div>
        </div>

        {/* WhatsApp Channel */}
        <div className={`p-6 rounded-3xl border text-left space-y-4 ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="p-3 w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className={`font-extrabold text-sm ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
              {lang === "ar" ? "الواتساب المباشر" : "Direct WhatsApp Support"}
            </h3>
            <span className={`text-xs block mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-600 font-medium"}`}>
              {lang === "ar" ? "رقم المحادثات والدعم الفني:" : "Support & Inquiries Number:"}
            </span>
            <strong className="text-lg font-black text-emerald-600 dark:text-emerald-400 block font-mono">0964809575</strong>
            
            <div className="mt-3">
              <a 
                href="https://wa.me/963964809575" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors text-xs font-bold ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-850 text-emerald-400 hover:border-emerald-500/50"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                  <span>{lang === "ar" ? "مراسلة عبر الواتساب (0964809575)" : "Chat on WhatsApp (0964809575)"}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Syriatel Cash payment account */}
        <div className={`p-6 rounded-3xl border text-left space-y-4 ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="p-3 w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className={`font-extrabold text-sm ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
              {lang === "ar" ? "حساب التحويل سيريتيل كاش المعتمد" : "Official Syriatel Cash Account"}
            </h3>
            <strong className="text-xl font-black text-rose-500 block mt-1 font-mono">0982257195</strong>
            <p className={`text-[10px] mt-1 leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
              {lang === "ar" 
                ? "طريقة الدفع المتوفرة والمعتمدة حالياً هي تحويل سيريتيل كاش حصراً إلى الرقم 0982257195 مع الاحتفاظ بالرقم المرجعي وإرفاق الإيصال لتأكيد الطلب." 
                : "Payment is strictly available via Syriatel Cash transfer to 0982257195. Keep your reference receipt to confirm your order."}
            </p>
          </div>
        </div>

      </div>

    </section>
  );
}

