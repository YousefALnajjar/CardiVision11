import React, { useState } from "react";
import { 
  Cpu, 
  Layers, 
  Presentation, 
  FileText, 
  Box, 
  Printer, 
  Globe, 
  BrainCircuit, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  Target, 
  ShieldCheck, 
  ArrowRight,
  Send,
  Zap,
  Award,
  Users
} from "lucide-react";

interface AboutServicesSectionProps {
  lang: "ar" | "en";
  theme: "dark" | "light";
  onSelectTab?: (tab: string) => void;
}

export interface ServiceItem {
  id: string;
  icon: React.ElementType;
  titleAr: string;
  titleEn: string;
  badgeAr: string;
  badgeEn: string;
  descAr: string;
  descEn: string;
  featuresAr: string[];
  featuresEn: string[];
  color: string;
  bgGradient: string;
  cardBgLight: string;
  cardBgDark: string;
  badgeStyle: string;
  accentBorder: string;
  checkColor: string;
  titleColor: string;
  btnStyle: string;
}

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: "arduino-iot",
    icon: Cpu,
    titleAr: "تصميم وتنفيذ مشاريع Arduino و IoT",
    titleEn: "Arduino & IoT Engineering Projects",
    badgeAr: "مشاريع تفاعلية وذكية",
    badgeEn: "Interactive & Smart IoT",
    descAr: "برمجة المتحكمات الدقيقة وتطبيقات أوردوينو، ESP32، وتكامل الأنظمة المدمجة مع الحساسات وشبكات IoT مع التحكم عبر الموبايل أو السحابة.",
    descEn: "Microcontroller programming, ESP32, embedded systems integration with sensors, actuators, and cloud/mobile IoT dashboards.",
    featuresAr: ["برمجة متحكمات Arduino / ESP32", "ربط الحساسات وربط السحابة IoT", "تطبيقات تحكم بالموبايل والويب"],
    featuresEn: ["Arduino & ESP32 Code", "Sensor & Cloud Integration", "Mobile & Web Remote Control"],
    color: "from-blue-600 to-cyan-500",
    bgGradient: "from-blue-500/25 via-cyan-500/10 to-transparent",
    cardBgLight: "bg-gradient-to-b from-blue-50/90 via-cyan-50/30 to-white",
    cardBgDark: "bg-slate-900 dark:bg-slate-900",
    badgeStyle: "bg-blue-100 text-blue-950 border-blue-300 dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-400 font-black",
    accentBorder: "border-blue-300 dark:border-cyan-500/50 shadow-md shadow-cyan-950/20 hover:border-blue-500 dark:hover:border-cyan-300",
    checkColor: "text-blue-600 dark:text-cyan-400",
    titleColor: "text-blue-700 dark:text-cyan-300 group-hover:text-blue-600 dark:group-hover:text-cyan-200",
    btnStyle: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/20"
  },
  {
    id: "pcb-design",
    icon: Layers,
    titleAr: "تصميم وطباعة دوائر PCB",
    titleEn: "PCB Circuit Design & Manufacturing",
    badgeAr: "دقة وجودة تصنيعية",
    badgeEn: "High Precision & Fab-Ready",
    descAr: "رسم المخططات الإلكترونية (Schematic) وتصميم المخطط المطبوع المتقدم (PCB Layout) وإخراج ملفات Gerber وتوفير البوردات المطبوعة الجاهزة للتركيب.",
    descEn: "Schematic drawing, multilayer PCB Layout design, Gerber file generation, and hardware board prototyping.",
    featuresAr: ["رسم المخططات على Altium/KiCad", "تصميم المسارات وتفادي النويز", "ملفات Gerber وتجهيز الطباعة"],
    featuresEn: ["Schematics on Altium/KiCad", "High-density Track Routing", "Production Gerber Files"],
    color: "from-emerald-600 to-teal-500",
    bgGradient: "from-emerald-500/25 via-teal-500/10 to-transparent",
    cardBgLight: "bg-gradient-to-b from-emerald-50/90 via-teal-50/30 to-white",
    cardBgDark: "bg-slate-900 dark:bg-slate-900",
    badgeStyle: "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-400 font-black",
    accentBorder: "border-emerald-300 dark:border-emerald-500/50 shadow-md shadow-emerald-950/20 hover:border-emerald-500 dark:hover:border-emerald-300",
    checkColor: "text-emerald-600 dark:text-emerald-400",
    titleColor: "text-emerald-700 dark:text-emerald-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-200",
    btnStyle: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20"
  },
  {
    id: "powerpoint",
    icon: Presentation,
    titleAr: "إعداد عروض PowerPoint احترافية",
    titleEn: "Professional PowerPoint Presentation Design",
    badgeAr: "عروض مناقشة مبهرة",
    badgeEn: "Stunning Defense Slides",
    descAr: "تصميم سلايدات هادفة وجذابة بصرياً لمناقشة مشاريع التخرج والأبحاث، تدعم الحركة السلسة، الإنفوجرافيك الهندسي، وملخص الكود والمخرجات.",
    descEn: "Crafting visually engaging slide decks for thesis defense with fluid animations, custom infographics, and concise technical breakdowns.",
    featuresAr: ["تصميم هويات بصرية مخصصة", "أنيميشن وانفوجرافيك هندسي", "إعداد خطة إلقاء وسيناريو مناقشة"],
    featuresEn: ["Custom Visual Branding", "Engineering Infographics", "Defense Script & Flow Plan"],
    color: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-500/25 via-orange-500/10 to-transparent",
    cardBgLight: "bg-gradient-to-b from-amber-50/90 via-orange-50/30 to-white",
    cardBgDark: "bg-slate-900 dark:bg-slate-900",
    badgeStyle: "bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-400 font-black",
    accentBorder: "border-amber-300 dark:border-amber-500/50 shadow-md shadow-amber-950/20 hover:border-amber-500 dark:hover:border-amber-300",
    checkColor: "text-amber-600 dark:text-amber-400",
    titleColor: "text-amber-700 dark:text-amber-300 group-hover:text-amber-600 dark:group-hover:text-amber-200",
    btnStyle: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-md shadow-amber-500/20"
  },
  {
    id: "research-formatting",
    icon: FileText,
    titleAr: "كتابة وتنسيق الأبحاث بأسلوب علمي",
    titleEn: "Academic Research & Thesis Writing",
    badgeAr: "تنسيق وأسلوب أكاديمي",
    badgeEn: "Standard Academic Format",
    descAr: "صياغة وتنسيق حلقات البحث وتقارير التخرج وفق الشروط الجامعية والأكاديمية، تنقيح المراجع IEEE / APA وإخراج صيغ PDF و Word متقنة.",
    descEn: "Structuring and formatting graduation reports & research papers according to academic guidelines with proper IEEE/APA citations.",
    featuresAr: ["تنسيق الجداول والمراجع والمخططات", "تدقيق لغوي وعلمي شامل", "التزام بهيكلية الجامعات"],
    featuresEn: ["Citation & Reference Formatting", "Grammar & Technical Proofreading", "University Standard Structure"],
    color: "from-rose-600 to-pink-600",
    bgGradient: "from-rose-500/25 via-pink-500/10 to-transparent",
    cardBgLight: "bg-gradient-to-b from-rose-50/90 via-pink-50/30 to-white",
    cardBgDark: "bg-slate-900 dark:bg-slate-900",
    badgeStyle: "bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-400 font-black",
    accentBorder: "border-rose-300 dark:border-rose-500/50 shadow-md shadow-rose-950/20 hover:border-rose-500 dark:hover:border-rose-300",
    checkColor: "text-rose-600 dark:text-rose-400",
    titleColor: "text-rose-700 dark:text-rose-300 group-hover:text-rose-600 dark:group-hover:text-rose-200",
    btnStyle: "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-md shadow-rose-500/20"
  },
  {
    id: "solidworks",
    icon: Box,
    titleAr: "تصميم هندسي باستخدام SolidWorks",
    titleEn: "SolidWorks 3D CAD Engineering Design",
    badgeAr: "نماذج 3D ميكانيكية",
    badgeEn: "3D Mechanical Modeling",
    descAr: "نمذجة الأجزاء الهندسية والهياكل الميكانيكية وتجهيز الهياكل الخارجية للبوردات والمجسمات مع المحاكاة الحركية والاختبارات البنيوية.",
    descEn: "3D mechanical modeling, custom enclosure design for electronics, assembly simulation, and technical drawings.",
    featuresAr: ["تصميم مجسمات وهياكل دقيقة", "رسم القطع والمخططات التنفيذية", "تجهيز الملفات للطباعة والتصنيع"],
    featuresEn: ["3D CAD Solid Modeling", "Exploded View & Drawings", "Export ready for 3D Printing"],
    color: "from-sky-600 to-indigo-600",
    bgGradient: "from-sky-500/25 via-indigo-500/10 to-transparent",
    cardBgLight: "bg-gradient-to-b from-sky-50/90 via-indigo-50/30 to-white",
    cardBgDark: "bg-slate-900 dark:bg-slate-900",
    badgeStyle: "bg-sky-100 text-sky-950 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-400 font-black",
    accentBorder: "border-sky-300 dark:border-sky-500/50 shadow-md shadow-sky-950/20 hover:border-sky-500 dark:hover:border-sky-300",
    checkColor: "text-sky-600 dark:text-sky-400",
    titleColor: "text-sky-700 dark:text-sky-300 group-hover:text-sky-600 dark:group-hover:text-sky-200",
    btnStyle: "bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md shadow-sky-500/20"
  },
  {
    id: "3d-printing",
    icon: Printer,
    titleAr: "الطباعة ثلاثية الأبعاد 3D",
    titleEn: "High-Precision 3D Printing Services",
    badgeAr: "مجسمات ونماذج واقعية",
    badgeEn: "Physical Rapid Prototyping",
    descAr: "تحويل المخططات الرقمية إلى قطع ملموسة عالية الجودة لخامات متنوعة، مثالية للنماذج الأولية، العلب الإلكترونية، والتروس الميكانيكية.",
    descEn: "Transforming CAD models into high-durability physical components, custom casings, gears, and structural prototypes.",
    featuresAr: ["طباعة دقيقة بخامات PLA / PETG / ABS", "تنفيذ نماذج مجسمة واقعية", "تشطيب وتجميع الحواضن"],
    featuresEn: ["PLA/PETG/ABS High Quality Print", "Physical Functional Prototypes", "Enclosure Finishing & Assembly"],
    color: "from-violet-600 to-purple-600",
    bgGradient: "from-violet-500/25 via-purple-500/10 to-transparent",
    cardBgLight: "bg-gradient-to-b from-violet-50/90 via-purple-50/30 to-white",
    cardBgDark: "bg-slate-900 dark:bg-slate-900",
    badgeStyle: "bg-violet-100 text-violet-950 border-violet-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-400 font-black",
    accentBorder: "border-purple-300 dark:border-purple-500/50 shadow-md shadow-purple-950/20 hover:border-violet-500 dark:hover:border-purple-300",
    checkColor: "text-violet-600 dark:text-purple-400",
    titleColor: "text-violet-700 dark:text-purple-300 group-hover:text-violet-600 dark:group-hover:text-purple-200",
    btnStyle: "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-md shadow-violet-500/20"
  },
  {
    id: "web-dev",
    icon: Globe,
    titleAr: "تصميم وتطوير المواقع الإلكترونية Backend & Frontend",
    titleEn: "Full-Stack Web Design & Development",
    badgeAr: "مواقع ولوحات تحكم متكاملة",
    badgeEn: "Modern Web Systems & Dashboards",
    descAr: "بناء منصات ويب متكاملة، لوحات تحكم تفاعلية، ربط قواعد البيانات وواجهات API المباشرة مع أنظمة التحكم والمشاريع الهندسية.",
    descEn: "Developing high-performance responsive web applications, admin dashboards, real-time APIs, and IoT cloud control interfaces.",
    featuresAr: ["واجهات سريعة React & Tailwind", "سيرفر وبك أند قوي Node.js & Express", "لوحات تحكم وقواعد بيانات"],
    featuresEn: ["Modern React & Tailwind UI", "Robust Node.js & Express API", "Databases & Real-time Sockets"],
    color: "from-indigo-600 to-fuchsia-600",
    bgGradient: "from-indigo-500/25 via-fuchsia-500/10 to-transparent",
    cardBgLight: "bg-gradient-to-b from-indigo-50/90 via-fuchsia-50/30 to-white",
    cardBgDark: "bg-slate-900 dark:bg-slate-900",
    badgeStyle: "bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-400 font-black",
    accentBorder: "border-indigo-300 dark:border-indigo-500/50 shadow-md shadow-indigo-950/20 hover:border-indigo-500 dark:hover:border-indigo-300",
    checkColor: "text-indigo-600 dark:text-indigo-400",
    titleColor: "text-indigo-700 dark:text-indigo-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-200",
    btnStyle: "bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white shadow-md shadow-indigo-500/20"
  },
  {
    id: "ml-dl",
    icon: BrainCircuit,
    titleAr: "تنفيذ مشاريع Machine Learning & Deep Learning",
    titleEn: "Machine Learning & Deep Learning Solutions",
    badgeAr: "ذكاء اصطناعي ومعالجة صور",
    badgeEn: "AI Models & Computer Vision",
    descAr: "تطوير نماذج الذكاء الاصطناعي، المعالجة الرقمية للصور (Computer Vision)، تحليل البيانات الضخمة، وتدريب الخوارزميات الذكية للنشر الفعلي.",
    descEn: "Building ML models, computer vision pipelines, neural networks, predictive analytics, and edge AI deployment.",
    featuresAr: ["تدريب نماذج Python & PyTorch / TensorFlow", "معالجة الصور OpenCV وYOLO", "ربط AI مع الأنظمة والمواقع"],
    featuresEn: ["Python ML/DL Models", "OpenCV & YOLO Computer Vision", "API & Hardware AI Deployment"],
    color: "from-fuchsia-600 to-rose-600",
    bgGradient: "from-fuchsia-500/25 via-rose-500/10 to-transparent",
    cardBgLight: "bg-gradient-to-b from-fuchsia-50/90 via-rose-50/30 to-white",
    cardBgDark: "bg-slate-900 dark:bg-slate-900",
    badgeStyle: "bg-fuchsia-100 text-fuchsia-950 border-fuchsia-300 dark:bg-fuchsia-950 dark:text-fuchsia-200 dark:border-fuchsia-400 font-black",
    accentBorder: "border-fuchsia-300 dark:border-fuchsia-500/50 shadow-md shadow-fuchsia-950/20 hover:border-fuchsia-500 dark:hover:border-fuchsia-300",
    checkColor: "text-fuchsia-600 dark:text-fuchsia-400",
    titleColor: "text-fuchsia-700 dark:text-fuchsia-300 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-200",
    btnStyle: "bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-500 hover:to-rose-500 text-white shadow-md shadow-fuchsia-500/20"
  }
];

export default function AboutServicesSection({ lang, theme, onSelectTab }: AboutServicesSectionProps) {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const primaryPhone = "0964809575";
  const secondaryPhone = "0982257195";

  const getWhatsAppLink = (serviceName: string, name: string, phone: string, details: string, time: string) => {
    const text = lang === "ar"
      ? `السلام عليكم CardioVision:\n` +
        `أود تقديم طلب لخدمة: *${serviceName}*\n\n` +
        `👤 *الاسم:* ${name || "غير محدد"}\n` +
        `📱 *رقم التواصل:* ${phone || "غير محدد"}\n` +
        `⏳ *الموعد النهائي المستهدف:* ${time || "غير محدد"}\n\n` +
        `📝 *تفاصيل ومتطلبات المشروع:*\n${details || "لا يوجد تفاصيل إضافية"}`
      : `Hello CardioVision:\n` +
        `I want to order service: *${serviceName}*\n\n` +
        `👤 *Name:* ${name || "N/A"}\n` +
        `📱 *Phone:* ${phone || "N/A"}\n` +
        `⏳ *Target Deadline:* ${time || "N/A"}\n\n` +
        `📝 *Project Details:*\n${details || "No additional details"}`;

    return `https://wa.me/963964809575?text=${encodeURIComponent(text)}`;
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !clientName || !clientPhone) return;

    setIsSubmitting(true);
    setSubmitSuccess(null);

    const waUrl = getWhatsAppLink(
      lang === "ar" ? selectedService.titleAr : selectedService.titleEn,
      clientName,
      clientPhone,
      projectDetails,
      deadline
    );

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceTitle: lang === "ar" ? selectedService.titleAr : selectedService.titleEn,
          clientName,
          clientPhone,
          projectDetails,
          deadline,
          status: "pending",
          createdAt: new Date().toISOString()
        })
      });

      // Always direct client to WhatsApp line 0964809575
      window.open(waUrl, "_blank");

      setSubmitSuccess(
        lang === "ar"
          ? "تم تسجيل طلبك بنجاح ونقلك إلى الواتساب المباشر (0964809575) للتنسيق الفوري!"
          : "Your request was saved and redirected to direct WhatsApp (0964809575)!"
      );

      setTimeout(() => {
        setSubmitSuccess(null);
        setSelectedService(null);
        setClientName("");
        setClientPhone("");
        setProjectDetails("");
        setDeadline("");
      }, 3500);

    } catch (err) {
      window.open(waUrl, "_blank");
      setSubmitSuccess(
        lang === "ar"
          ? "جاري توجيهك مباشرة إلى واتساب الشركة (0964809575)..."
          : "Redirecting directly to company WhatsApp (0964809575)..."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 py-4" id="about-services-hub">

      {/* HERO / BRAND OVERVIEW CARD */}
      <div className={`relative overflow-hidden rounded-3xl border p-6 md:p-10 transition-colors shadow-xl ${
        theme === "dark" 
          ? "bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-slate-800/80 text-slate-100" 
          : "bg-gradient-to-br from-white via-slate-50 to-rose-50/30 border-slate-200 text-slate-900"
      }`}>
        {/* Background Accent Gradients - Optimized for mobile GPU */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-rose-500/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-500/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-2xl text-center md:text-right rtl:md:text-right ltr:md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CardioVision</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              {lang === "ar" ? (
                <>شريكك الهندسي والأكاديمي الموثوق <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-500">لإنجاز مشروعك</span> بكل احترافية</>
              ) : (
                <>Your Trusted Academic & Engineering Partner <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-500">for Graduation Excellence</span></>
              )}
            </h1>

            <p className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
              {lang === "ar" ? (
                "نقدم حزمة شاملة من الحلول الهندسية المتكاملة لتنفيذ مشاريع التخرج، الأبحاث الأكاديمية، والأنظمة البرمجية والإلكترونية بدقة متناهية تحت إشراف نخبة من المهندسين المختصين."
              ) : (
                "We offer a complete suite of engineering solutions for graduation projects, academic research, embedded hardware, and software systems under expert engineering supervision."
              )}
            </p>

            {/* Target Goal Quote Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-indigo-500/10 to-transparent border border-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold text-sm sm:text-base flex items-start gap-3">
              <Target className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p>
                  {lang === "ar" 
                    ? "🎯 هدفنا أن تدخل يوم المناقشة بثقة مع مشروع منظم وعرض احترافي!" 
                    : "🎯 Our goal is for you to enter your defense day with full confidence, backed by an organized project and stunning presentation!"}
                </p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                  {lang === "ar" ? "⏳ لا تنتظر حتى يتراكم الضغط… ابدأ الآن!" : "⏳ Don't wait until pressure builds up... Start now!"}
                </p>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <a
                href={`https://wa.me/963964809575?text=${encodeURIComponent(lang === "ar" ? "السلام عليكم، أود الاستفسار عن خدماتكم المتاحة" : "Hello, I want to inquire about your services")}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{lang === "ar" ? "تواصل معنا واتساب (0964809575)" : "WhatsApp Support (0964809575)"}</span>
              </a>

              {onSelectTab && (
                <button
                  type="button"
                  onClick={() => onSelectTab("projects")}
                  className={`px-5 py-3 rounded-2xl border font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all hover:scale-105 ${
                    theme === "dark" 
                      ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" 
                      : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs"
                  }`}
                >
                  <Zap className="w-4 h-4 text-rose-500" />
                  <span>{lang === "ar" ? "تصفح معرض المشاريع" : "Explore Project Catalog"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Contact & Info Card Badge */}
          <div className={`p-6 rounded-3xl border w-full md:w-80 shrink-0 space-y-4 text-center ${
            theme === "dark" ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-200 shadow-md"
          }`}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shadow-inner">
              <Award className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                {lang === "ar" ? "CardioVision" : "CardioVision"}
              </h3>
              <p className="text-xs font-bold text-rose-500 mt-0.5">
                {lang === "ar" ? "مركز الخدمات الهندسية المتكاملة" : "Engineering Hub"}
              </p>
            </div>

            <div className="border-t pt-3 space-y-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                <span>{lang === "ar" ? "الخط المباشر 1:" : "Direct Line 1:"}</span>
                <span className="font-mono font-black text-rose-500 dir-ltr">{primaryPhone}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                <span>{lang === "ar" ? "الخط المباشر 2:" : "Direct Line 2:"}</span>
                <span className="font-mono font-black text-indigo-500 dir-ltr">{secondaryPhone}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight pt-1">
              {lang === "ar" 
                ? "⚡️ تسليم سريع • دعم شامل حتى يوم المناقشة • سرية وأمان"
                : "⚡️ Fast Delivery • Defense Guidance • Secure & Confidential"}
            </div>
          </div>

        </div>
      </div>

      {/* SECTION TITLE: OUR SERVICES */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-black">
          <Layers className="w-3.5 h-3.5" />
          <span>{lang === "ar" ? "قائمة الخدمات المتاحة" : "Our Full Suite of Services"}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
          {lang === "ar" ? "🔧 خدماتنا تشمل جميع المجالات الهندسية والتقنية" : "🔧 Comprehensive Engineering & Technical Services"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">
          {lang === "ar" 
            ? "اختر الخدمة التي تحتاجها واضغط على (طلب الخدمة) لإرسال تفاصيل مشروعك مباشرة لفريق المهندسين"
            : "Select any service below and click (Order Service) to submit your request directly to our engineering team"}
        </p>
      </div>

      {/* SERVICES GRID (8 CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {SERVICES_LIST.map((srv) => {
          const Icon = srv.icon;
          return (
            <div 
              key={srv.id}
              className={`group relative rounded-3xl border p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${srv.accentBorder} ${
                theme === "dark" 
                  ? `${srv.cardBgDark} text-slate-100 shadow-slate-950/80` 
                  : `${srv.cardBgLight} text-slate-900 shadow-md shadow-slate-200/50`
              }`}
            >
              {/* Card top banner background with vivid ambient tint */}
              <div className={`absolute top-0 left-0 right-0 h-28 rounded-t-3xl bg-gradient-to-br ${srv.bgGradient} ${
                theme === "dark" ? "opacity-20" : "opacity-70"
              } pointer-events-none`} />

              <div className="relative z-10 space-y-3.5">
                
                {/* Header Icon & Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${srv.color} text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-2xs ${srv.badgeStyle}`}>
                    {lang === "ar" ? srv.badgeAr : srv.badgeEn}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className={`font-black text-base leading-snug ${srv.titleColor} transition-colors`}>
                    {lang === "ar" ? srv.titleAr : srv.titleEn}
                  </h3>
                </div>

                {/* Description inside high-contrast badge container */}
                <div className={`p-3 rounded-2xl border transition-colors ${
                  theme === "dark"
                    ? "bg-slate-950/80 border-slate-800/90 text-slate-100 shadow-inner"
                    : "bg-white/80 border-slate-200/80 text-slate-800 shadow-2xs"
                }`}>
                  <p className={`text-xs sm:text-[12.5px] font-extrabold leading-relaxed ${
                    theme === "dark" ? "text-slate-100" : "text-slate-800"
                  }`}>
                    {lang === "ar" ? srv.descAr : srv.descEn}
                  </p>
                </div>

                {/* Key features bullet points */}
                <ul className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                  {(lang === "ar" ? srv.featuresAr : srv.featuresEn).map((feat, idx) => (
                    <li key={idx} className={`flex items-center gap-1.5 text-[11px] font-black ${
                      theme === "dark" ? "text-slate-100" : "text-slate-800"
                    }`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${srv.checkColor} shrink-0`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

              </div>

              {/* Card Footer Order Button */}
              <div className="relative z-10 pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setSelectedService(srv)}
                  className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${srv.btnStyle}`}
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>{lang === "ar" ? "اطلب الخدمة الآن" : "Order This Service"}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* WHY CHOOSE US / ADVANTAGES BANNER */}
      <div className={`p-6 md:p-8 rounded-3xl border space-y-6 ${
        theme === "dark" ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200/80"
      }`}>
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-base sm:text-lg font-semibold text-rose-500 tracking-wide">
            {lang === "ar" ? "مميزات العمل معنا" : "Why Work With Us"}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            {lang === "ar" ? "لماذا يفضل الطلاب والباحثون CardioVision؟" : "Why Do Students & Researchers Choose CardioVision?"}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
              {lang === "ar" ? "التزام تام بالمواعيد" : "Strict On-Time Delivery"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === "ar" ? "تسليم أجزاء المشروع بانتظام وفق جدول زمني دقيق دون تأخير." : "Delivering project milestones according to strict deadline schedules."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
              {lang === "ar" ? "شرح ومتابعة المناقشة" : "Defense Preparation"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === "ar" ? "لا نكتفي بالتنفيذ، بل نشرح لك الكود والآلية لتناقش بثقة." : "We explain every line of code and schematic so you defend with high confidence."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
              {lang === "ar" ? "سرية وجودة عالية" : "Confidentiality & Quality"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === "ar" ? "حفظ كامل لبيانات وحقوق أبحاثك ومشروعك وأكوادك الخاصة." : "100% data privacy and IP protection for your custom research."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
              {lang === "ar" ? "دعم واستفسارات واتساب" : "WhatsApp Support & Inquiries"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === "ar" ? "تواصل مباشر عبر واتساب الدعم الفني: 0964809575 (سيريتيل كاش المعتمد للدفع: 0982257195)." : "Direct support WhatsApp: 0964809575 (Official Syriatel Cash payments: 0982257195)."}
            </p>
          </div>

        </div>
      </div>

      {/* SERVICE REQUEST MODAL POPUP */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 animate-fade-in">
          <div className={`relative w-full max-w-lg rounded-3xl border p-6 md:p-8 space-y-5 shadow-2xl ${
            theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              className="absolute top-4 left-4 rtl:left-4 ltr:right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="space-y-1 text-center md:text-right rtl:md:text-right ltr:md:text-left">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">
                {lang === "ar" ? "نموذج طلب خدمة هندسية" : "Service Request Form"}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{lang === "ar" ? selectedService.titleAr : selectedService.titleEn}</span>
              </h3>
              
              {/* Selected service description inside modal */}
              <div className={`p-3 rounded-xl border text-xs font-bold leading-relaxed ${
                theme === "dark" 
                  ? "bg-slate-950 border-slate-800 text-slate-200" 
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                {lang === "ar" ? selectedService.descAr : selectedService.descEn}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                {lang === "ar" 
                  ? "قم بتعبئة التفاصيل وسيتم تحويل طلبك مباشرة لمندوب الخدمة على الواتساب (0964809575)"
                  : "Fill in the details below to submit your request directly to WhatsApp support (0964809575)"}
              </p>
            </div>

            {submitSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-bold text-xs text-center space-y-2">
                <p>{submitSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                
                {/* Client Name */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {lang === "ar" ? "اسم الطالب / العميل *" : "Your Name *"}
                  </label>
                  <input 
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={lang === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all focus:ring-2 focus:ring-rose-500 outline-none ${
                      theme === "dark" 
                        ? "bg-slate-950 border-slate-800 text-slate-100" 
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                {/* Phone / WhatsApp */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {lang === "ar" ? "رقم الهاتف / الواتساب للتواصل *" : "Phone / WhatsApp Number *"}
                  </label>
                  <input 
                    type="text"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: 0964809575" : "e.g. +963..."}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all focus:ring-2 focus:ring-rose-500 outline-none ${
                      theme === "dark" 
                        ? "bg-slate-950 border-slate-800 text-slate-100" 
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                {/* Target Deadline */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {lang === "ar" ? "الموعد النهائي المستهدف للتسليم" : "Target Completion Date / Deadline"}
                  </label>
                  <input 
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: خلال أسبوعين / يوم 15 الشهر" : "e.g. In 2 weeks / By end of month"}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all focus:ring-2 focus:ring-rose-500 outline-none ${
                      theme === "dark" 
                        ? "bg-slate-950 border-slate-800 text-slate-100" 
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                {/* Project details */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {lang === "ar" ? "تفاصيل الشرح والمتطلبات الخاصة" : "Project Details & Specific Requirements"}
                  </label>
                  <textarea 
                    rows={3}
                    value={projectDetails}
                    onChange={(e) => setProjectDetails(e.target.value)}
                    placeholder={lang === "ar" ? "اكتب هنا تفاصيل الفكرة، المكونات، أو العنوان..." : "Describe your project idea, components or thesis topic..."}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all focus:ring-2 focus:ring-rose-500 outline-none ${
                      theme === "dark" 
                        ? "bg-slate-950 border-slate-800 text-slate-100" 
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (lang === "ar" ? "جاري الإرسال..." : "Submitting...")
                      : (lang === "ar" ? "إرسال واستكمال التنسيق عبر واتساب (0964809575)" : "Submit & Continue via WhatsApp")}
                  </span>
                </button>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
