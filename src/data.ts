import { Project, Category } from "./types";

export const CATEGORIES: Category[] = [
  { id: "all", labelEn: "All Fields", labelAr: "كل المجالات" },
  { id: "biomedical", labelEn: "Biomedical Engineering", labelAr: "الهندسة الطبية" },
  { id: "software", labelEn: "Software & AI Engineering", labelAr: "هندسة البرمجيات والذكاء الاصطناعي" },
  { id: "electrical", labelEn: "Electrical & Control", labelAr: "الهندسة الكهربائية والتحكم" },
  { id: "communications", labelEn: "Communications Engineering", labelAr: "هندسة الاتصالات" },
  { id: "mechatronics", labelEn: "Mechanical & Mechatronics", labelAr: "الميكانيك والميكاترونكس" }
];

export const PROJECTS: Project[] = [
  {
    id: "cardiovision-ecg",
    titleEn: "CardioVision: IoT Real-Time ECG Monitor",
    titleAr: "CardioVision: نظام مراقبة تخطيط القلب عبر إنترنت الأشياء",
    category: "biomedical",
    descriptionEn: "A wearable device using AD8232 and ESP32 to monitor ECG signals in real-time, sending telemetry to a web dashboard with AI arrhythmia detection.",
    descriptionAr: "جهاز قابل للارتداء يستخدم مستشعر AD8232 ومتحكم ESP32 لمراقبة إشارات تخطيط القلب لحظياً، وإرسال البيانات للوحة تحكم ويب مع كشف اضطراب ضربات القلب بالذكاء الاصطناعي.",
    detailsEn: "This project features fully functional hardware schematics and cloud platform integration. It records bio-potential electrical activities of the heart. The ESP32 micro-controller samples the analog signals at 250Hz, filters high-frequency noise, and streams the clean signal using WebSockets to our React-based dashboard. It's designed for cardiac patients requiring continuous monitoring.",
    detailsAr: "يتميز هذا المشروع بمخططات عتادية متكاملة مع منصة سحابية. يقوم بتسجيل النشاط الكهربائي الحيوي للقلب. يقوم معالج ESP32 بقراءة الإشارات التماثلية بتردد 250 هرتز، وتصفية الضجيج عالي التردد، وبث الإشارة النظيفة عبر WebSockets إلى لوحة تحكم React. مصمم لمرضى القلب الذين يحتاجون لمراقبة مستمرة.",
    featuresEn: [
      "Real-time chart rendering at 60 FPS",
      "Heart Rate Variability (HRV) calculations",
      "Emergency SMS notification via Twilio API if heart anomalies occur",
      "Low power sleep mode for long battery life"
    ],
    featuresAr: [
      "رسم بياني فوري فائق السرعة بمعدل 60 إطار في الثانية",
      "حسابات تباين معدل ضربات القلب (HRV)",
      "إرسال رسائل طوارئ SMS عبر Twilio في حال رصد اضطرابات",
      "وضع توفير طاقة فائق لتمديد عمر البطارية"
    ],
    componentsEn: [
      "ESP32 Wi-Fi microcontroller",
      "AD8232 ECG Sensor module",
      "Disposable Bio-electrodes",
      "LiPo Battery 3.7V & USB Charger circuit",
      "Buzzer and OLED Display 1.3 inch"
    ],
    componentsAr: [
      "متحكم ESP32 يدعم الواي فاي",
      "حساس قياس نبضات القلب AD8232",
      "أقطاب حيوية لاصقة أحادية الاستخدام",
      "بطارية LiPo بجهد 3.7 فولت مع دارة شحن",
      "طنان صوتي وشاشة OLED قياس 1.3 بوصة"
    ],
    softwareEn: ["Arduino IDE", "React.js", "Node.js Express", "Tailwind CSS", "PlatformIO", "MongoDB"],
    softwareAr: ["بيئة Arduino IDE", "إطار عمل React.js", "خادم Node.js Express", "مكتبة Tailwind CSS", "منصة PlatformIO", "قاعدة بيانات MongoDB"],
    diagramsEn: [
      "ESP32 AD8232 pins: GND->GND, 3V3->3V3, OUTPUT->VP, LO+->GPIO15, LO-->GPIO14",
      "OLED pins: SDA->GPIO21, SCL->GPIO22, VCC->3V3, GND->GND",
      "Buzzer connected to GPIO12 via BC547 NPN Transistor"
    ],
    diagramsAr: [
      "توصيل ESP32 مع AD8232: الأرضي->الأرضي، التغذية 3.3V->3.3V، المخرج->منفذ VP، قطب LO+->GPIO15، قطب LO-->GPIO14",
      "توصيل شاشة OLED: خط البيانات SDA->GPIO21، خط الساعة SCL->GPIO22، التغذية->3.3V، الأرضي->الأرضي",
      "توصيل الطنان الصوتي مع منفذ GPIO12 باستخدام ترانزستور BC547"
    ],
    outputsEn: ["Complete PCB schematic (EasyEDA)", "Full C++ firmware", "Full React Web Dashboard source code", "Project 3D printable case files", "Complete 80-page scientific report in PDF"],
    outputsAr: ["مخطط PCB كامل (برنامج EasyEDA)", "الكود البرمجي الكامل للمتحكم (C++)", "كود لوحة تحكم الويب بالكامل (React)", "ملفات تصميم الغلاف ثلاثي الأبعاد"],
    implementationEn: [
      "Step 1: Wire the components on a breadboard according to the circuit diagram.",
      "Step 2: Install ESP32 board manager in Arduino IDE and upload the provided C++ firmware.",
      "Step 3: Host the Node.js WebSocket backend and configure connection tokens.",
      "Step 4: Launch the React Dashboard to receive live telemetry from the wearable.",
      "Step 5: Assemble the components in the 3D-printed enclosure."
    ],
    implementationAr: [
      "الخطوة 1: توصيل المكونات على لوحة التجارب (Breadboard) وفق المخطط الكهربائي.",
      "الخطوة 2: تثبيت حزمة ESP32 في بيئة Arduino IDE ورفع الكود البرمجي المرفق.",
      "الخطوة 3: تشغيل خادم Node.js WebSocket وتعيين رموز الاتصال والمفاتيح السرية.",
      "الخطوة 4: تشغيل لوحة تحكم React للبدء باستقبال البيانات الحيوية الفورية.",
      "الخطوة 5: تجميع المكونات الإلكترونية داخل الغلاف المطبوع ثلاثي الأبعاد."
    ],
    price: 185000,
    durationAr: "7 أيام",
    durationEn: "7 Days",
    imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=800",
    additionalImages: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800"
    ],
    videoUrl: "https://www.youtube.com/embed/9XInbVka77w",
    projectFileUrl: "/downloads/cardiovision_ecg_v2.zip",
    rating: 4.9,
    difficultyLevel: "hard",
    viewsCount: 2140,
    salesCount: 63,
    likesCount: 182,
    reviewsCount: 14,
    isBestSeller: true,
    isTopRated: true,
    universityAr: "جامعة دمشق",
    universityEn: "Damascus University",
    projectTypeAr: "مشروع تخرج عتادي برمجي متكامل",
    projectTypeEn: "Integrated Hardware & Software Graduation Project",
    language: "both"
  },
  {
    id: "myo-prosthetic-hand",
    titleEn: "Myoelectric Bionic Prosthetic Hand",
    titleAr: "اليد الاصطناعية الحيوية الذكية",
    category: "mechatronics",
    descriptionEn: "A 3D-printed bionic hand controlled by muscle electrical activities (EMG), allowing multi-grip patterns for upper limb amputees.",
    descriptionAr: "يد اصطناعية مطبوعة ثلاثية الأبعاد يتم التحكم بها عبر النشاط العضلي الكهربائي (EMG)، مما يسمح بأنماط إمساك متعددة لمبتوري الأطراف العلوية.",
    detailsEn: "Using surface EMG electrodes placed on the forearm muscles, electrical impulses are amplified and processed. The microcontroller maps muscle contractions to specific grip styles (fist, pinch, point) using servo motors to actuate individual fingers. Features a responsive touch feedback system.",
    detailsAr: "باستخدام أقطاب EMG السطحية الموضوعة على عضلات الساعد، يتم تضخيم النبضات الكهربائية ومعالجتها. يقوم المتحكم بربط انقباض العضلات بأنماط إمساك محددة (قبضة، قرص، إشارة) باستخدام محركات سيرفو لتحريك الأصابع بشكل فردي. يتميز بنظام استجابة لمسية.",
    featuresEn: [
      "Proportional speed control based on muscle contraction strength",
      "3D printed lightweight design (less than 450g)",
      "OLED screen indicating battery status and current active mode",
      "Rechargeable battery lasting over 12 hours"
    ],
    featuresAr: [
      "تحكم تناسبي بالسرعة بناءً على شدة انقباض العضلة",
      "تصميم خفيف الوزن مطبوع ثلاثي الأبعاد (أقل من 450 غرام)",
      "شاشة OLED لعرض مستوى البطارية والوضع الفعال حالياً",
      "بطارية قابلة للشحن تدوم لأكثر من 12 ساعة متواصلة"
    ],
    componentsEn: [
      "Myoware EMG muscle sensor",
      "Arduino Nano controller",
      "5x SG90/MG90S Servo motors",
      "3D-Printed PLA mechanical hand parts",
      "7.4V Li-ion battery pack with BMS board"
    ],
    componentsAr: [
      "حساس عضلات Myoware EMG",
      "متحكم أردوينو نانو",
      "5 محركات سيرفو SG90/MG90S عالية العزم",
      "أجزاء يد ميكانيكية مطبوعة من مادة PLA",
      "حزمة بطاريات قابلة للشحن بجهد 7.4 فولت مع نظام إدارة الشحن"
    ],
    softwareEn: ["Arduino IDE", "Proteus", "SolidWorks", "EasyEDA"],
    softwareAr: ["بيئة Arduino IDE", "برنامج Proteus للمحاكاة", "برنامج SolidWorks للتصميم ثلاثي الأبعاد", "برنامج EasyEDA للدارات المطبوعة"],
    diagramsEn: [
      "MyoWare Output -> Arduino A0, GND->GND, VCC->5V",
      "Servo Motors: Data pins connected to Arduino D3, D5, D6, D9, D10",
      "Servos require external 5V 3A power source sharing common GND with Arduino"
    ],
    diagramsAr: [
      "مخرج حساس MyoWare -> مدخل أردوينو A0، خط الأرضي->GND، خط التغذية->5V",
      "محركات السيرفو: خطوط التحكم موصولة بالمنافذ D3, D5, D6, D9, D10",
      "تتطلب المحركات مصدر تغذية خارجي 5 فولت 3 أمبير مع توحيد الأرضي مع الأردوينو"
    ],
    outputsEn: ["SolidWorks STL files for printing", "Arduino control script", "Proteus simulation file", "Full circuit schematic", "Comprehensive 65-page thesis documentation"],
    outputsAr: ["ملفات تصميم اليد STL الجاهزة للطباعة ثلاثية الأبعاد", "كود التحكم البرمجي بالأردوينو C++", "ملف محاكاة Proteus المتكامل", "المخطط الكهربائي للدارة", "توثيق علمي للمشروع مكون من 65 صفحة"],
    implementationEn: [
      "Step 1: Print all mechanical hand parts on a 3D printer using PLA/PETG filament.",
      "Step 2: Mount the servo motors inside the hand palm and route the fishing wires to actuate fingers.",
      "Step 3: Connect the Arduino, MyoWare sensor, and servos on the main control board.",
      "Step 4: Upload the muscle contraction calibration code, adjusting sensitivity thresholds.",
      "Step 5: Secure the battery pack, place EMG electrodes on the arm, and test different hand grip gestures."
    ],
    implementationAr: [
      "الخطوة 1: طباعة كافة الأجزاء الميكانيكية ثلاثية الأبعاد باستخدام مادة PLA أو PETG.",
      "الخطوة 2: تثبيت محركات السيرفو داخل كف اليد وتوصيل خيوط تحريك الأصابع الفولاذية أو البلاستيكية.",
      "الخطوة 3: توصيل الأردوينو، حساس العضلات MyoWare، ومحركات السيرفو على اللوحة المطبوعة الرئيسية.",
      "الخطوة 4: رفع كود المعايرة لضبط مستويات استجابة وحساسية العضلات وقراءة الإشارات الحيوية.",
      "الخطوة 5: تثبيت بطارية التغذية وتثبيت الأقطاب الكهربائية على الساعد وبدء اختبار حركات القبض والفتح."
    ],
    price: 210000,
    durationAr: "10 أيام",
    durationEn: "10 Days",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    additionalImages: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800"
    ],
    videoUrl: "https://www.youtube.com/embed/fS3oNen6UvY",
    projectFileUrl: "/downloads/myo_prosthetic_hand.zip",
    rating: 4.8,
    difficultyLevel: "hard",
    viewsCount: 1850,
    salesCount: 28,
    likesCount: 145,
    reviewsCount: 11,
    isMostViewed: true,
    universityAr: "جامعة تشرين",
    universityEn: "Tishreen University",
    projectTypeAr: "مشروع تخرج ميكاترونكس وطبي",
    projectTypeEn: "Mechatronics & Biomedical Graduation Project",
    language: "both"
  },
  {
    id: "ai-crop-analyzer",
    titleEn: "AI-Powered Smart Agricultural Crop Disease Analyzer",
    titleAr: "محلل ذكي لأمراض النباتات والمحاصيل بالذكاء الاصطناعي",
    category: "software",
    descriptionEn: "A high-precision mobile/web computer vision solution detecting plant diseases and recommending organic treatment plans.",
    descriptionAr: "تطبيق ويب وجوال دقيق يعمل برؤية الحاسوب للكشف عن أمراض النباتات وتقديم توصيات علاجية عضوية فورية.",
    detailsEn: "This system uses a Deep Convolutional Neural Network (CNN) trained on thousands of leaves. Users upload a picture of a leaf, and the AI classifies the disease with >96% accuracy, explaining causes and providing ecological treatment methods. Connected to an offline database of agricultural solutions.",
    detailsAr: "يستخدم هذا النظام شبكة عصبونية عميقة (CNN) تم تدريبها على آلاف أوراق الشجر. يقوم المستخدم برفع صورة الورقة، ليقوم الذكاء الاصطناعي بتصنيف المرض بدقة تتجاوز 96%، مع شرح المسببات وتقديم طرق علاج بيئية.",
    featuresEn: [
      "Classifies over 38 classes of crop diseases (Tomato, Potato, Grape, Apple etc.)",
      "Provides organic and chemical treatment instructions",
      "Interactive map showing regional outbreaks",
      "Exportable PDF diagnosis reports"
    ],
    featuresAr: [
      "تصنيف أكثر من 38 نوعاً من أمراض المحاصيل (طماطم، بطاطا، عنب، تفاح، إلخ)",
      "توفير إرشادات علاجية عضوية وكيميائية مفصلة",
      "خريطة تفاعلية توضح مدى انتشار الأوبئة الزراعية جغرافياً",
      "إمكانية تصدير تقارير التشخيص بصيغة PDF فورية"
    ],
    componentsEn: [
      "TensorFlow Lite backend API",
      "React Native mobile layout",
      "SQLite Local database for treatment advice",
      "Firebase Auth for registered farmers",
      "AWS S3 bucket / local node server filesystem"
    ],
    componentsAr: [
      "الواجهة البرمجية المعتمدة على TensorFlow Lite",
      "تطبيق جوال مبني بـ React Native أو Flutter",
      "قاعدة بيانات SQLite محلية لتخزين طرق العلاج",
      "نظام مصادقة مستخدمين متكامل",
      "مساحة تخزين سحابية لحفظ أرشيف الصور والتقارير"
    ],
    softwareEn: ["Python", "TensorFlow", "Keras", "FastAPI", "React Native", "Flutter", "Docker"],
    softwareAr: ["لغة البرمجة Python", "مكتبة TensorFlow للذكاء الاصطناعي", "مكتبة Keras", "إطار عمل FastAPI", "إطار عمل React Native", "إطار عمل Flutter للجوال", "بيئة Docker المعزولة"],
    diagramsEn: [
      "Image input -> Rescaling 224x224 -> CNN (MobileNetV2) -> Dense Layer Softmax -> Disease classification & Organic cure recommendations",
      "React Frontend client requests FastAPI endpoint /predict sending multipart file form-data"
    ],
    diagramsAr: [
      "صورة ورقة النبات -> إعادة قياس الأبعاد 224x224 -> الشبكة العصبية CNN -> طبقة التصنيف -> نوع المرض والجرعات العلاجية المقترحة",
      "الواجهة الأمامية ترسل طلب تصوير إلى FastAPI عبر منفذ /predict محمل بملف الصورة المرفوعة"
    ],
    outputsEn: ["Trained Model (.h5 & .tflite formats)", "FastAPI backend script", "Flutter or React Native client application code", "Jupyter Notebook with model training process", "Complete dissertation paper"],
    outputsAr: ["الملف المدرب للنموذج الذكي (.h5 و .tflite)", "كود خادم FastAPI الخلفي بالكامل", "الكود المصدري لتطبيق Flutter أو React Native للجوال", "كتاب جوبيتر Jupyter لتدريب وتحليل النموذج", "تقرير تخرج متكامل ومنقح علمياً"],
    implementationEn: [
      "Step 1: Download PlantVillage dataset and pre-process images using Python & OpenCV.",
      "Step 2: Train a transfer-learning model based on MobileNetV2 using TensorFlow.",
      "Step 3: Export the model to TFLite format for mobile inference, or host it on FastAPI.",
      "Step 4: Connect the client application to fetch disease labels and cure metadata.",
      "Step 5: Bundle and test the mobile application using Android Emulator."
    ],
    implementationAr: [
      "الخطوة 1: تحميل قاعدة بيانات أمراض النباتات ومعالجة الصور المسبقة باستخدام Python ومكتبة OpenCV.",
      "الخطوة 2: تدريب نموذج تعلم انتقال (Transfer Learning) معتمد على MobileNetV2.",
      "الخطوة 3: تحويل وتصدير النموذج الذكي بصيغة TFLite للجوال، أو رفعه على خادم سحابي FastAPI.",
      "الخطوة 4: ربط واجهة التطبيق بقاعدة البيانات لعرض سبل العلاج والوقاية المناسبة.",
      "الخطوة 5: حزم التطبيق النهائي واختباره على محاكي الأندرويد للتأكد من سرعة وسلاسة الاستجابة."
    ],
    price: 155000,
    durationAr: "5 أيام",
    durationEn: "5 Days",
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800",
    additionalImages: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
    ],
    videoUrl: "https://www.youtube.com/embed/A8SAnlI62_0",
    projectFileUrl: "/downloads/ai_crop_analyzer.zip",
    rating: 4.7,
    difficultyLevel: "medium",
    viewsCount: 1200,
    salesCount: 19,
    likesCount: 98,
    reviewsCount: 8,
    universityAr: "الجامعة الافتراضية السورية",
    universityEn: "Syrian Virtual University",
    projectTypeAr: "برمجيات وذكاء اصطناعي للزراعة",
    projectTypeEn: "Software & AI Agriculture Solutions",
    language: "both"
  },
  {
    id: "smart-home-esp32",
    titleEn: "Smart Home Automation System with MQTT & ESP32",
    titleAr: "نظام الأتمتة المنزلية الذكي ببروتوكول MQTT ومتحكم ESP32",
    category: "electrical",
    descriptionEn: "An affordable, easy-to-build smart home automation board controlling lights, temperature, and security via Wi-Fi and mobile app.",
    descriptionAr: "نظام أتمتة منزلية ذكي واقتصادي وسهل التنفيذ للتحكم بالإضاءة والتكييف والأمان عبر شبكة الواي فاي وتطبيق الجوال.",
    detailsEn: "Designed for electrical engineering students looking for a clean, modular project. Uses ESP32 with 4-channel relay modules, DHT11 temperature/humidity sensor, and PIR motion detector. Operates on local MQTT server or cloud dashboard.",
    detailsAr: "مصمم لطلاب الهندسة الكهربائية والاتصالات للبدء بمشروع نظيف وموديلاري. يستخدم ESP32 مع وحدة ريلاي 4 أشرطة وحساس حرارة DHT11 وحساس حركة PIR. يعمل عبر بروتوكول MQTT المحلي أو السحابي.",
    featuresEn: [
      "Control up to 4 AC appliances safely",
      "Real-time temperature & humidity telemetry",
      "Motion alarm trigger with buzzer notification",
      "Simple web dashboard hosted directly on ESP32 flash"
    ],
    featuresAr: [
      "تحكم بـ 4 أجهزة كهربائية ذات تيار متناوب بأمان تام",
      "قراءة فورية لدرجات الحرارة والرطوبة",
      "إنذار أمان عند رصد الحركة عبر طنان ضوئي وصوتي",
      "لوحة تحكم ويب خفيفة مخزنة داخل ذاكرة ESP32 مباشرة"
    ],
    componentsEn: ["ESP32 Module", "4-Channel Relay 5V", "DHT11 Temp Sensor", "PIR Motion Sensor", "16x2 I2C LCD"],
    componentsAr: ["متحكم ESP32", "وحدة ريلاي 4 أشرطة 5V", "حساس حرارة ورطوبة DHT11", "حساس حركة PIR", "شاشة LCD 16x2 مع لوحة I2C"],
    softwareEn: ["Arduino IDE", "Blynk App", "Proteus", "C++"],
    softwareAr: ["بيئة Arduino IDE", "تطبيق Blynk", "برنامج Proteus", "لغة البرمجة C++"],
    diagramsEn: ["ESP32 GPIO Pinout: Relays -> GPIO16, 17, 18, 19; DHT11 -> GPIO4; PIR -> GPIO27"],
    diagramsAr: ["توصيلات ESP32: الريلايات -> GPIO16, 17, 18, 19؛ حساس الحرارة -> GPIO4؛ حساس الحركة -> GPIO27"],
    outputsEn: ["Arduino C++ Code", "Schematic PDF", "Mobile Dashboard Layout", "Project Documentation 40-pages"],
    outputsAr: ["كود الأردوينو الشامل", "المخطط الكهربائي PDF", "تصميم الواجهة للجوال", "تقرير المشروع 40 صفحة"],
    implementationEn: ["Connect relay, flash ESP32 with C++ code, configure Wi-Fi SSID and test via smartphone app."],
    implementationAr: ["ربط الريلايات بحساس الحركة وتغذية ESP32، ثم رفع الكود وضبط إعدادات الشبكة والتجربة."],
    price: 95000,
    durationAr: "3 أيام",
    durationEn: "3 Days",
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/9XInbVka77w",
    projectFileUrl: "/downloads/smart_home_esp32.zip",
    rating: 4.9,
    difficultyLevel: "easy",
    viewsCount: 680,
    salesCount: 35,
    likesCount: 72,
    reviewsCount: 6,
    isBestSeller: true,
    universityAr: "جامعة البعث",
    universityEn: "Al-Baath University",
    projectTypeAr: "مشروع أنظمة مدمجة وإنترنت الأشياء",
    projectTypeEn: "Embedded Systems & IoT Project",
    language: "both"
  },
  {
    id: "smart-patient-drip",
    titleEn: "Automated Intravenous (IV) Infusion Drip Monitor",
    titleAr: "نظام تنقيط المحاليل الوريدية الذكي التلقائي للمستشفيات",
    category: "biomedical",
    descriptionEn: "A medical device measuring fluid infusion rate and detecting air bubbles or empty IV bags to prevent air embolism.",
    descriptionAr: "جهاز طبي ذكي لقياس سرعة تدفق السيروم في المحاليل الوريدية وكشف الفقعات الهوائية وانتهاء الكيس لحماية المرضى.",
    detailsEn: "Employs an optical infrared drop sensor and load cell weight transducer to accurately calculate fluid flow rate (ml/hr). Automatically clamps the tube when infusion ends and sends real-time alerts to the central nurse station dashboard.",
    detailsAr: "يعتمد على مستشعر قطرات ضوئي تحت الحمراء مع خلايا وزن لمراقبة المعدل الدقيق لتدفق السيروم بالمليلتر/ساعة. يغلق الأنبوب تلقائياً بآلية صمام سيرفو عند انتهاء السيروم ويرسل تنبيهاً لغرفة الممرضين.",
    featuresEn: [
      "Infrared drop rate counter (dps)",
      "Servo motor automatic tube occlusion mechanism",
      "Wireless telemetry to nurse station",
      "Audible & visual alarm for blockage"
    ],
    featuresAr: [
      "عداد قطرات ضوئي عالي الدقة",
      "محرك سيرفو لإغلاق خط السيروم تلقائياً عند انتهاء الكمية",
      "إرسال تنبيه لاسلكي لغرفة الإشراف التمريضي",
      "إنذارات ضوئية وصوتية عند انسداد الأنبوب"
    ],
    componentsEn: ["Infrared Slot Sensor", "Load Cell & HX711 Amplifier", "Micro Servo Motor", "Arduino Uno", "Buzzer"],
    componentsAr: ["حساس قطرات إنفرارد", "خلية وزن Load Cell مع مضخم HX711", "محرك سيرفو مصغر", "متحكم أردوينو أونو", "طنان إنذار"],
    softwareEn: ["Arduino IDE", "EasyEDA", "C++"],
    softwareAr: ["بيئة Arduino IDE", "برنامج EasyEDA", "لغة C++"],
    diagramsEn: ["HX711 DT->A1, SCK->A0; IR Sensor->D2 (Interrupt); Servo->D9"],
    diagramsAr: ["توصيل HX711: خيارات البيانات A1، الساعة A0؛ حساس القطرات D2؛ السيرفو D9"],
    outputsEn: ["Complete Source Code", "Circuit Diagram", "PCB Design File", "Documentation PDF"],
    outputsAr: ["الكود البرمجي المكتمل", "المخطط الكهربائي", "ملف PCB جاهز للطباعة", "تقرير علمي منقح"],
    implementationEn: ["Mount sensors on drip chamber, calibrate HX711 tare, upload C++ script, test occlusion."],
    implementationAr: ["تثبيت الحساسات على حجرة قطرات السيروم، معايرة الميزان، رفع الكود واختبار إغلاق الصمام."],
    price: 135000,
    durationAr: "5 أيام",
    durationEn: "5 Days",
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/fS3oNen6UvY",
    projectFileUrl: "/downloads/iv_infusion_drip.zip",
    rating: 4.8,
    difficultyLevel: "medium",
    viewsCount: 940,
    salesCount: 18,
    likesCount: 64,
    reviewsCount: 5,
    universityAr: "جامعة حلب",
    universityEn: "University of Aleppo",
    projectTypeAr: "مشروع تجهيزات طبية ومراقبة حيوية",
    projectTypeEn: "Medical Equipment & Bio-Monitoring",
    language: "both"
  },
  {
    id: "digital-stethoscope",
    titleEn: "Digital Electronic Stethoscope with Audio Filter",
    titleAr: "السماعة الطبية الرقمية المزودة بفلتر التضخيم الصوتي",
    category: "biomedical",
    descriptionEn: "A low-cost electronic stethoscope that amplifies cardiac and respiratory sounds, filtering environmental noise for clear diagnosis.",
    descriptionAr: "سماعة طبية إلكترونية تضخم أصوات القلب والرئتين وتفلتر الضجيج المحيط لتشخيص طبي دقيق وسهل.",
    detailsEn: "Uses electret condenser microphone acoustically coupled to a stethoscope chest piece. High-gain bandpass filter operational amplifier (TL072) cleans frequencies between 20Hz and 500Hz for cardiac murmurs analysis.",
    detailsAr: "تعتمد على ميكروفون مكثف مثبت داخل قمع السماعة الطبية التقليدية، مع دارة مرشح تمرير حزمة مضخم عملياتي (TL072) لتنقيه الصوت وتضخيمه ضمن المجال من 20 إلى 500 هرتز.",
    featuresEn: [
      "Adjustable volume gain up to 40dB",
      "Headphone output jack + Bluetooth audio stream",
      "Low power consumption (9V battery)"
    ],
    featuresAr: [
      "ربح صوتي قابل للتعديل حتى 40 ديسيبل",
      "مخرج لسماعات الأذن + بث الصوت عبر البلوتوث",
      "استهلاك طاقة منخفض يعمل ببطارية 9 فولت"
    ],
    componentsEn: ["TL072 Op-Amp IC", "Electret Mic", "Headphone Jack", "Potentiometer 50k", "Resistors & Capacitors"],
    componentsAr: ["مضخم عملياتي TL072", "ميكروفون الكترريت", "مقبس سماعات 3.5mm", "مقاومة متغيرة 50K", "مقاومات ومكثفات تصفية"],
    softwareEn: ["Proteus", "Audacity"],
    softwareAr: ["برنامج المحاكاة Proteus", "برنامج تحليل الصوت Audacity"],
    diagramsEn: ["Non-inverting bandpass active filter circuit schematic"],
    diagramsAr: ["مخطط دارة الفلتر الفعال غير العاكس مع تضخيم الصوت"],
    outputsEn: ["Schematic, PCB Layout, Audacity Sample Waveforms, 30-Page Report"],
    outputsAr: ["المخطط، رسم دارة الـ PCB، عينات الصوت المحللة، تقرير 30 صفحة"],
    implementationEn: ["Solder components on stripboard or custom PCB, adjust audio gain and test cardiac beats."],
    implementationAr: ["لحام المكونات على لوحة PCB وتعديل مستوى الربط واختبار استماع ضربات القلب."],
    price: 75000,
    durationAr: "2 يوم",
    durationEn: "2 Days",
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/9XInbVka77w",
    projectFileUrl: "/downloads/digital_stethoscope.zip",
    rating: 4.6,
    difficultyLevel: "easy",
    viewsCount: 450,
    salesCount: 22,
    likesCount: 50,
    reviewsCount: 4,
    universityAr: "جامعة طرطوس",
    universityEn: "Tartous University",
    projectTypeAr: "مشروع دارات إلكترونية طبية",
    projectTypeEn: "Medical Electronics Circuit Project",
    language: "both"
  },
  {
    id: "ai-crop-analyzer",
    titleEn: "Plant Disease Detection AI & Smart Treatment",
    titleAr: "نظام تشخيص أمراض النبات بالذكاء الاصطناعي",
    category: "software",
    descriptionEn: "AI mobile app using CNN MobileNetV2 to identify crop leaf diseases and suggest organic cures.",
    descriptionAr: "تطبيق جوال يعتمد على شبكات معالجة الصور CNN لتشخيص أمراض أوراق المحاصيل الزراعية واقتراح العلاج المناسب.",
    detailsEn: "Integrated deep learning solution trained on PlantVillage dataset.",
    detailsAr: "حل ذكاء اصطناعي شامل مدرب على آلاف الصور لتشخيص الآفات والأمراض فوراً عبر كاميرا الجوال.",
    featuresEn: [
      "Offline inference supported via TensorFlow Lite",
      "React Native / Flutter Mobile UI",
      "SQLite local database for remedies",
      "FastAPI server integration"
    ],
    featuresAr: [
      "تشخيص آلي بدون إنترنت معتمدة على TensorFlow Lite",
      "تطبيق جوال مبني بـ React Native أو Flutter",
      "قاعدة بيانات SQLite محلية لتخزين طرق العلاج",
      "نظام مصادقة مستخدمين متكامل",
      "مساحة تخزين سحابية لحفظ أرشيف الصور والتقارير"
    ],
    componentsEn: ["Smartphone Camera", "Cloud GPU / Local NPU", "MicroSD Card"],
    componentsAr: ["كاميرا الهاتف الذكي", "معالج الرسومات السحابي GPU", "بطاقة تخزين ذاكرة MicroSD"],
    softwareEn: ["Python", "TensorFlow", "Keras", "FastAPI", "React Native", "Flutter", "Docker"],
    softwareAr: ["لغة البرمجة Python", "مكتبة TensorFlow للذكاء الاصطناعي", "مكتبة Keras", "إطار عمل FastAPI", "إطار عمل React Native", "إطار عمل Flutter للجوال", "بيئة Docker المعزولة"],
    diagramsEn: [
      "Image input -> Rescaling 224x224 -> CNN (MobileNetV2) -> Dense Layer Softmax -> Disease classification & Organic cure recommendations",
      "React Frontend client requests FastAPI endpoint /predict sending multipart file form-data"
    ],
    diagramsAr: [
      "صورة ورقة النبات -> إعادة قياس الأبعاد 224x224 -> الشبكة العصبية CNN -> طبقة التصنيف -> نوع المرض والجرعات العلاجية المقترحة",
      "الواجهة الأمامية ترسل طلب تصوير إلى FastAPI عبر منفذ /predict محمل بملف الصورة المرفوعة"
    ],
    outputsEn: ["Trained Model (.h5 & .tflite formats)", "FastAPI backend script", "Flutter or React Native client application code", "Jupyter Notebook with model training process", "Complete dissertation paper"],
    outputsAr: ["الملف المدرب للنموذج الذكي (.h5 و .tflite)", "كود خادم FastAPI الخلفي بالكامل", "الكود المصدري لتطبيق Flutter أو React Native للجوال", "كتاب جوبيتر Jupyter لتدريب وتحليل النموذج", "تقرير تخرج متكامل ومنقح علمياً"],
    implementationEn: [
      "Step 1: Download PlantVillage dataset and pre-process images using Python & OpenCV.",
      "Step 2: Train a transfer-learning model based on MobileNetV2 using TensorFlow.",
      "Step 3: Export the model to TFLite format for mobile inference, or host it on FastAPI.",
      "Step 4: Connect the client application to fetch disease labels and cure metadata.",
      "Step 5: Bundle and test the mobile application using Android Emulator."
    ],
    implementationAr: [
      "الخطوة 1: تحميل قاعدة بيانات أمراض النباتات ومعالجة الصور المسبقة باستخدام Python ومكتبة OpenCV.",
      "الخطوة 2: تدريب نموذج تعلم انتقال (Transfer Learning) معتمد على MobileNetV2.",
      "الخطوة 3: تحويل وتصدير النموذج الذكي بصيغة TFLite للجوال، أو رفعه على خادم سحابي FastAPI.",
      "الخطوة 4: ربط واجهة التطبيق بقاعدة البيانات لعرض سبل العلاج والوقاية المناسبة.",
      "الخطوة 5: حزم التطبيق النهائي واختباره على محاكي الأندرويد للتأكد من سرعة وسلاسة الاستجابة."
    ],
    price: 155000,
    durationAr: "5 أيام",
    durationEn: "5 Days",
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800",
    additionalImages: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
    ],
    videoUrl: "https://www.youtube.com/embed/A8SAnlI62_0",
    projectFileUrl: "/downloads/ai_crop_analyzer.zip",
    rating: 4.7,
    universityAr: "الجامعة الافتراضية السورية",
    universityEn: "Syrian Virtual University",
    projectTypeAr: "برمجيات وذكاء اصطناعي للزراعة",
    projectTypeEn: "Software & AI Agriculture Solutions",
    language: "both"
  }
];

export interface TranslationKeys {
  appName: string;
  heroTitle: string;
  heroSub: string;
  searchPlaceholder: string;
  allCategories: string;
  projectDetails: string;
  features: string;
  components: string;
  watchVideo: string;
  close: string;
  registerTitle: string;
  registerSub: string;
  nameLabel: string;
  emailLabel: string;
  registerBtn: string;
  registeredHeading: string;
  uniqueEmailCheck: string;
  contactBtn: string;
  contactTitle: string;
  paymentTitle: string;
  paymentSub: string;
  syriatelCash: string;
  syriatelCashNumber: string;
  companyContact: string;
  requestConsult: string;
  consultationTitle: string;
  consultationSub: string;
  consultInputPlaceholder: string;
  getConsultationBtn: string;
  consultationResult: string;
  notificationTitle: string;
  notificationRegSuccess: string;
  notificationConsultSuccess: string;
  notificationError: string;
  languageLabel: string;
  themeToggle: string;
  proposalsTitle: string;
  noProjectsFound: string;
  aboutTitle: string;
  aboutText: string;
  consultLoading: string;
  consultInstructions: string;
  yousefName: string;
  yousefTitle: string;
}

export const TRANSLATIONS: Record<"ar" | "en", TranslationKeys> = {
  ar: {
    appName: "CardioVision",
    heroTitle: "مؤسسة CardioVision للمشاريع الهندسية",
    heroSub: "بإشراف CardioVision - نوفر لطلاب كليات الهندسة والمعاهد أفضل مشاريع التخرج، المخططات، والاستشارات العلمية والعملية بدقة واحترافية.",
    searchPlaceholder: "البحث عن مشروع، حساس، برامج أو جامعة...",
    allCategories: "كل المجالات",
    projectDetails: "تفاصيل المشروع ومخطط العمل",
    features: "الميزات والخصائص الفنية",
    components: "المكونات والعناصر المستخدمة",
    watchVideo: "مشاهدة الفيديو التوضيحي",
    close: "إغلاق",
    registerTitle: "سجل حسابك معنا",
    registerSub: "أدخل معلوماتك بالكامل للانضمام إلى طلاب CardioVision والتحقق الفوري من صحة بريدك الإلكتروني لضمان أمان حسابك وتنزيل الملفات وتتبع المدفوعات.",
    nameLabel: "الاسم الكامل",
    emailLabel: "البريد الإلكتروني",
    registerBtn: "إنشاء حساب جديد وتفعيله",
    registeredHeading: "حسابك نشط ومسجل",
    uniqueEmailCheck: "يتم التحقق من عدم تكرار البريد وصلاحيته لضمان أمان حسابك.",
    contactBtn: "تواصل معنا مباشرة",
    contactTitle: "معلومات الاتصال والدعم الفني المستمر",
    paymentTitle: "آلية الدفع وتأكيد الحجز عبر سيريتيل كاش",
    paymentSub: "لحجز أي مشروع أو طلب المخططات والأكواد التفصيلية، يتم تحويل المبلغ المتفق عليه حصراً عبر حساب سيريتيل كاش (Syriatel Cash) المعتمد:",
    syriatelCash: "حساب سيريتيل كاش المعتمد للدفع:",
    syriatelCashNumber: "0982257195",
    companyContact: "رقم التواصل والواتساب المباشر:",
    requestConsult: "طلب استشارة أو مخطط فوري",
    consultationTitle: "مستشار الذكاء الاصطناعي لمشاريع التخرج",
    consultationSub: "أدخل فكرتك الهندسية أو موضوعك، وسيقوم مستشار الذكاء الاصطناعي من CardioVision برسم مخطط شامل، اقتراح المكونات، وتحديد آلية العمل بدقة وبشكل فوري!",
    consultInputPlaceholder: "مثال: نظام لمراقبة نبضات القلب لاسلكياً باستخدام إنترنت الأشياء...",
    getConsultationBtn: "توليد الاستشارة والمخطط المقترح",
    consultationResult: "المخطط والاستشارة الهندسية المقترحة",
    notificationTitle: "إشعار النظام",
    notificationRegSuccess: "تهانينا! تم تسجيل حسابك بنجاح في نظام CardioVision وتفعيل ملفك الشخصي.",
    notificationConsultSuccess: "تم توليد المخطط الهندسي والاستشارة بنجاح ومزامنتهما.",
    notificationError: "البريد الإلكتروني مسجل مسبقاً أو غير صالح! يرجى استخدام بريد إلكتروني فريد وصحيح.",
    languageLabel: "English",
    themeToggle: "تغيير المظهر",
    proposalsTitle: "المشاريع المنفذة والمتاحة",
    noProjectsFound: "لم يتم العثور على مشاريع تطابق بحثك الحالي.",
    aboutTitle: "عن CardioVision",
    aboutText: "مؤسسة رائدة متخصصة في دعم طلاب الجامعات والمعاهد العليا بتقديم مشاريع تخرج هندسية متكاملة (عتاد، برمجيات، ومحاكاة) مع توفير الدعم الفني والاستشاري الدائم تحت إدارة وإشراف CardioVision.",
    consultLoading: "جاري تحليل الفكرة وبناء المخطط الهندسي...",
    consultInstructions: "اكتب تفاصيل مشروعك وسنتكفل بالباقي...",
    yousefName: "CardioVision",
    yousefTitle: "المؤسسة الرائدة للمشاريع الهندسية والاستشارات"
  },
  en: {
    appName: "CardioVision Platform",
    heroTitle: "CardioVision Engineering Solutions",
    heroSub: "Supervised by CardioVision - We provide engineering and technical institute students with the best graduation projects, structural schematics, and academic consultations with absolute precision.",
    searchPlaceholder: "Search projects, sensors, software or uni...",
    allCategories: "All Fields",
    projectDetails: "Project Details & Architecture",
    features: "Features & Technical Specs",
    components: "Required Components & Modules",
    watchVideo: "Watch Demonstration Video",
    close: "Close",
    registerTitle: "Register With Us",
    registerSub: "Enter your name and email to activate your account and join CardioVision students. Your email will be verified for security and uniqueness.",
    nameLabel: "Full Name",
    emailLabel: "Email Address",
    registerBtn: "Register & Activate Account",
    registeredHeading: "Your Account is Active",
    uniqueEmailCheck: "Verification is performed to prevent duplicate registration and secure your data.",
    contactBtn: "Contact Us Directly",
    contactTitle: "Contact Info & Continuous Technical Support",
    paymentTitle: "Payment & Reservation Process via Syriatel Cash",
    paymentSub: "To reserve any project or request detailed blueprints and source code, payment is processed exclusively via the official Syriatel Cash account:",
    syriatelCash: "Official Syriatel Cash Number:",
    syriatelCashNumber: "0982257195",
    companyContact: "Direct Phone & WhatsApp Line:",
    requestConsult: "Request Instant AI Consultation",
    consultationTitle: "AI Graduation Project Consultant",
    consultationSub: "Enter your engineering project concept, and CardioVision's AI consultant will draft a full block diagram, suggest parts, and define the technical workflow instantly!",
    consultInputPlaceholder: "e.g., Wireless heart rate monitoring system using IoT...",
    getConsultationBtn: "Generate Structural Consultation",
    consultationResult: "AI Generated Schematic & Consultation",
    notificationTitle: "System Notification",
    notificationRegSuccess: "Congratulations! Your account has been registered successfully on CardioVision and profile activated.",
    notificationConsultSuccess: "Engineering consultation and schematic generated successfully.",
    notificationError: "This email is already registered or invalid! Please use a unique and correct email address.",
    languageLabel: "العربية",
    themeToggle: "Toggle Theme",
    proposalsTitle: "Executed & Available Projects",
    noProjectsFound: "No projects matched your search criteria.",
    aboutTitle: "About CardioVision",
    aboutText: "A pioneering establishment specialized in supporting engineering and institute students by delivering robust graduation projects (hardware, software, simulations) along with continuous consultations and technical supervision under CardioVision.",
    consultLoading: "Analyzing concept and constructing engineering schematics...",
    consultInstructions: "Type your project idea details and let our AI do the work...",
    yousefName: "CardioVision",
    yousefTitle: "Leading Medical & Engineering Consultation Hub"
  }
};
