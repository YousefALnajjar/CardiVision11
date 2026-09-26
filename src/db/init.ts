import { getPool } from "./index";
import bcrypt from "bcryptjs";

export async function initDb() {
  const pool = getPool();
  
  console.log("🔄 Initializing PostgreSQL database tables and seeding realistic data...");

  // 1. Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_sub TEXT UNIQUE,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      avatar_url TEXT,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      is_verified BOOLEAN NOT NULL DEFAULT true,
      verification_token TEXT,
      university TEXT,
      specialty TEXT,
      phone TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMP
    );

    -- Safe Migrations for existing databases
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub TEXT UNIQUE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    DO $$ BEGIN
      ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
    EXCEPTION
      WHEN others THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      summary_ar TEXT,
      summary_en TEXT,
      description_ar TEXT,
      description_en TEXT,
      category TEXT NOT NULL DEFAULT 'biomedical',
      project_type_ar TEXT DEFAULT 'مشروع تخرج متكامل',
      project_type_en TEXT DEFAULT 'Full Graduation Project',
      difficulty_level TEXT NOT NULL DEFAULT 'medium',
      price_syp INTEGER NOT NULL DEFAULT 0,
      price_usd INTEGER NOT NULL DEFAULT 0,
      images JSONB NOT NULL DEFAULT '[]'::jsonb,
      video_url TEXT,
      views_count INTEGER NOT NULL DEFAULT 0,
      sales_count INTEGER NOT NULL DEFAULT 0,
      reviews_count INTEGER NOT NULL DEFAULT 0,
      rating_average REAL NOT NULL DEFAULT 5.0,
      comments_count INTEGER NOT NULL DEFAULT 0,
      software_used JSONB DEFAULT '[]'::jsonb,
      hardware_components JSONB DEFAULT '[]'::jsonb,
      tags JSONB DEFAULT '[]'::jsonb,
      is_best_seller BOOLEAN NOT NULL DEFAULT false,
      is_featured BOOLEAN NOT NULL DEFAULT false,
      download_url TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      user_avatar TEXT,
      comment_text TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    ALTER TABLE comments ADD COLUMN IF NOT EXISTS user_avatar TEXT;
    ALTER TABLE comments ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      review_text TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Ensure unique constraint for user per project on reviews (UPSERT support)
    CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_project ON reviews(user_id, project_id);

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      user_phone TEXT,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      project_title TEXT NOT NULL,
      amount_syp INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'SYP',
      payment_method TEXT NOT NULL DEFAULT 'syriatel_cash',
      recipient_account TEXT NOT NULL DEFAULT '0982257195',
      transfer_transaction_id TEXT,
      receipt_url TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
      admin_notes TEXT,
      failure_reason TEXT,
      verification_attempts INTEGER NOT NULL DEFAULT 0,
      verified_at TIMESTAMP,
      expires_at TIMESTAMP,
      idempotency_key TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Safe Migrations for orders table
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'SYP';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS recipient_account TEXT NOT NULL DEFAULT '0982257195';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS failure_reason TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_feedback TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS verification_attempts INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

    -- Deduplicate any legacy test transaction IDs before unique constraint
    DO $$ 
    BEGIN
      UPDATE orders 
      SET transfer_transaction_id = transfer_transaction_id || '_' || SUBSTRING(id, 5, 6)
      WHERE id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER(PARTITION BY transfer_transaction_id ORDER BY created_at ASC) as rn
          FROM orders
          WHERE transfer_transaction_id IS NOT NULL AND transfer_transaction_id != ''
        ) t WHERE t.rn > 1
      );
    EXCEPTION
      WHEN others THEN NULL;
    END $$;

    -- Update legacy status values to standardized state machine
    UPDATE orders SET status = 'PAID' WHERE status IN ('approved', 'completed');
    UPDATE orders SET status = 'PENDING_PAYMENT' WHERE status = 'pending' AND (transfer_transaction_id IS NULL OR transfer_transaction_id = '');
    UPDATE orders SET status = 'PAYMENT_SUBMITTED' WHERE status = 'pending' AND transfer_transaction_id IS NOT NULL AND transfer_transaction_id != '';
    UPDATE orders SET status = 'PAYMENT_REJECTED' WHERE status = 'rejected';

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      message_ar TEXT NOT NULL,
      message_en TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'general',
      is_read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      ip_address TEXT,
      details JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'consultation',
      idea TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      label_ar TEXT NOT NULL,
      label_en TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS platform_feedback (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'NEW', -- 'NEW' | 'REVIEWED' | 'REPLIED' | 'ARCHIVED'
      admin_reply TEXT,
      replied_at TIMESTAMP,
      admin_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      is_featured BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_platform_feedback_user UNIQUE (user_id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Safe Migrations for platform_feedback
    ALTER TABLE platform_feedback ADD COLUMN IF NOT EXISTS admin_reply TEXT;
    ALTER TABLE platform_feedback ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP;
    ALTER TABLE platform_feedback ADD COLUMN IF NOT EXISTS admin_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE platform_feedback ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE platform_feedback ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'NEW';
    ALTER TABLE platform_feedback ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

    -- Safe Migrations for projects
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

    -- Performance and integrity indexes
    CREATE INDEX IF NOT EXISTS idx_comments_project_id ON comments(project_id);
    CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
    CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
    CREATE INDEX IF NOT EXISTS idx_reviews_project_id ON reviews(project_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_project_id ON orders(project_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_transfer_tx_unique ON orders(transfer_transaction_id) WHERE transfer_transaction_id IS NOT NULL AND transfer_transaction_id != '';
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
    CREATE INDEX IF NOT EXISTS idx_projects_difficulty ON projects(difficulty_level);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_unique ON favorites(user_id, project_id);
    CREATE INDEX IF NOT EXISTS idx_platform_feedback_user_id ON platform_feedback(user_id);
    CREATE INDEX IF NOT EXISTS idx_platform_feedback_rating ON platform_feedback(rating);
    CREATE INDEX IF NOT EXISTS idx_platform_feedback_status ON platform_feedback(status);
    CREATE INDEX IF NOT EXISTS idx_platform_feedback_created_at ON platform_feedback(created_at);
    CREATE INDEX IF NOT EXISTS idx_platform_feedback_featured ON platform_feedback(is_featured);

    -- Ensure designated admin emails always have the admin role
    UPDATE users SET role = 'admin' 
    WHERE LOWER(email) IN ('admin@cardiovision.sy', 'admin@cardiovision.com', 'y99286549@gmail.com', 'y9d9286549@gmail.com');
  `);

  console.log("✅ PostgreSQL tables created successfully.");

  // 1.5 Seed default categories if empty
  const catCheck = await pool.query("SELECT COUNT(*) FROM categories");
  if (parseInt(catCheck.rows[0].count, 10) === 0) {
    console.log("🌱 Seeding default academic categories...");
    const defaultCats = [
      ["all", "كل المجالات الأكاديمية", "All Engineering Fields"],
      ["biomedical", "الهندسة الطبية والحيوية", "Biomedical & Bio-Engineering"],
      ["software_ai", "هندسة البرمجيات والذكاء الاصطناعي", "Software & AI Engineering"],
      ["electrical", "الهندسة الكهربائية والتحكم", "Electrical & Control"],
      ["communications", "هندسة الاتصالات وشبكات IoT", "Communications & IoT Networks"],
      ["mechatronics", "الميكانيك والميكاترونكس", "Mechanical & Mechatronics"]
    ];
    for (const [cId, lAr, lEn] of defaultCats) {
      await pool.query("INSERT INTO categories (id, label_ar, label_en) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING", [cId, lAr, lEn]);
    }
  }

  // 2. Seed Default Admin & Users if empty
  const userCheck = await pool.query("SELECT COUNT(*) FROM users");
  if (parseInt(userCheck.rows[0].count, 10) === 0) {
    console.log("🌱 Seeding default users into PostgreSQL...");
    const adminPass = await bcrypt.hash("admin123", 10);
    const userPass = await bcrypt.hash("user123", 10);

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, is_verified, university, specialty, phone)
       VALUES 
       ($1, $2, $3, $4, 'admin', true, 'جامعة دمشق', 'الهندسة الطبية والحيوية', '0933112233'),
       ($5, $6, $7, $8, 'user', true, 'جامعة حلب', 'هندسة الحواسيب والأتمتة', '0944112233'),
       ($9, $10, $11, $8, 'user', true, 'جامعة تشرين', 'هندسة الميكاترونكس', '0944556677'),
       ($12, $13, $14, $8, 'user', true, 'الجامعة الافتراضية السورية', 'ذكاء اصطناعي وبرمجيات', '0955889900')`,
      [
        "usr_admin_1", "د. أنس السوري", "admin@cardiovision.sy", adminPass,
        "usr_1", "م. أحمد الحلاق", "ahmed@gmail.com", userPass,
        "usr_2", "سارة العلي", "sara@gmail.com",
        "usr_3", "مجد الشهابي", "majd@gmail.com"
      ]
    );
  }

  // 3. Seed Realistic Projects if empty
  const projCheck = await pool.query("SELECT COUNT(*) FROM projects");
  if (parseInt(projCheck.rows[0].count, 10) === 0) {
    console.log("🌱 Seeding realistic graduation projects into PostgreSQL...");

    const sampleProjects = [
      {
        id: "proj_iot_ecg",
        titleAr: "نظام مراقبة تخطيط القلب الذكي عبر الإنترنت (IoT ECG Monitor)",
        titleEn: "Smart IoT Real-Time ECG Monitoring System",
        summaryAr: "نظام متكامل يستقبل إشارات القلب عبر حساس AD8232، ويقوم بمعالجتها بـ ESP32 وإرسال القراءات لحظياً إلى منصة سحابية وتطبيق جوال مع تنبيهات السكتة السريرية.",
        summaryEn: "Complete IoT solution reading cardiac bio-signals using AD8232 and ESP32 with real-time web & mobile dashboard alerting.",
        descriptionAr: "مشروع تخرج شامل يشتمل على مخططات الدارات المطبوعة PCB، أكواد البرمجية الدقيقة المعتمدة على متحكم ESP32، وتطبيق جوال مبني بـ React Native يعرض مخطط ECG لحظياً بدقة عالية مع معالجة التشويش الرقمي وخوارزمية كشف اضطراب النبض (Arrhythmia Detection).",
        descriptionEn: "Full graduation package including PCB schematics, ESP32 firmware, and React Native mobile dashboard visualizing real-time ECG signal with digital filtering and arrhythmia alert system.",
        category: "biomedical",
        difficultyLevel: "easy",
        priceSyp: 1850000,
        priceUsd: 135,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800"
        ]),
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        viewsCount: 1420,
        salesCount: 48,
        reviewsCount: 14,
        ratingAverage: 4.9,
        commentsCount: 3,
        softwareUsed: JSON.stringify(["C++ ESP32 Firmware", "React Native", "Node.js Express", "TensorFlow Lite"]),
        hardwareComponents: JSON.stringify(["ESP32 Dev Board", "AD8232 ECG Bio-Sensor", "OLED 0.96 Display", "3.7V LiPo Battery"]),
        tags: JSON.stringify(["IoT", "Biomedical", "ESP32", "ECG", "AI Health"]),
        isBestSeller: true,
        isFeatured: true,
        downloadUrl: "https://cardiovision.sy/downloads/proj_iot_ecg_v2.zip"
      },
      {
        id: "proj_emg_hand",
        titleAr: "اليد الاصطناعية الحيوية الذكية ذات التحكم العصبي العضلي (Bionic EMG Hand)",
        titleEn: "Neural EMG Controlled Bionic Prosthetic Hand",
        summaryAr: "طرف اصطناعي ذكي يعالج الإشارات العضلية الكهربائية (EMG) للتحكم بـ 5 محركات سيرفو دقيقة بمرونة فائقة مع طباعة ثلاثية الأبعاد.",
        summaryEn: "Bionic hand using MyoWare muscle sensors and ESP32 to control 5 servo motors with custom 3D printed mechanical assembly.",
        descriptionAr: "مشروع متقدم يحتوي على ملفات الطباعة ثلاثية الأبعاد STL الكاملة لليد، دارات تضخيم الإشارة العضلية EMG، وكود التحكم الاصطناعي مع معالجة Wavelet للتمييز بين 6 حركات قبض مختلفة لليد.",
        descriptionEn: "Advanced bionic prosthetic hand project featuring complete 3D STL files, EMG bio-amplifier circuits, and Wavelet signal processing code distinguishing 6 distinct hand gesture grips.",
        category: "biomedical",
        difficultyLevel: "medium",
        priceSyp: 2950000,
        priceUsd: 210,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"
        ]),
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        viewsCount: 2180,
        salesCount: 32,
        reviewsCount: 19,
        ratingAverage: 4.8,
        commentsCount: 4,
        softwareUsed: JSON.stringify(["Arduino C++", "SolidWorks 3D", "MATLAB Wavelet Analysis"]),
        hardwareComponents: JSON.stringify(["MyoWare 2.0 EMG Sensor", "MG996R Servos x5", "STM32F4 Microcontroller", "Custom PCB"]),
        tags: JSON.stringify(["Bionic", "Prosthetics", "EMG", "Robotics", "3D Printing"]),
        isBestSeller: true,
        isFeatured: true,
        downloadUrl: "https://cardiovision.sy/downloads/proj_emg_hand_v3.zip"
      },
      {
        id: "proj_crop_ai",
        titleAr: "محلل أمراض النباتات الزراعية بالرؤية الحاسوبية والذكاء الاصطناعي",
        titleEn: "AI Computer Vision Agricultural Plant Disease Diagnostic",
        summaryAr: "نظام تشخيص بصري يعتمد على خوارزميات الشبكيات العصبية الإلتفافية (CNN) لتحديد الآفات الورقية بدقة 98.4% للبيت البلاستيكي الذكي.",
        summaryEn: "Deep learning CNN diagnostic app identifying leaf pathogens in real-time with 98.4% accuracy for greenhouse automation.",
        descriptionAr: "مشروع رؤية حاسوبية ذكي يشمل نموذج YOLOv8 وResNet50 مدرب على أكثر من 50,000 صورة أوراق شجر مصابة، مع لوحة تحكم سحابية وتطبيق أندرويد يتيح للمزارع التقاط صورة والحصول على التشخيص والعلاج فوراً.",
        descriptionEn: "AI Computer vision solution featuring trained YOLOv8 & ResNet50 deep networks on 50k+ leaf images with cloud dashboard and instant mobile plant diagnosis.",
        category: "software_ai",
        difficultyLevel: "hard",
        priceSyp: 3400000,
        priceUsd: 250,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=800"
        ]),
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        viewsCount: 3890,
        salesCount: 56,
        reviewsCount: 27,
        ratingAverage: 5.0,
        commentsCount: 5,
        softwareUsed: JSON.stringify(["Python PyTorch", "YOLOv8", "FastAPI Backend", "Flutter App"]),
        hardwareComponents: JSON.stringify(["Raspberry Pi 4 8GB", "Sony IMX219 Camera Module", "Relay Control Module"]),
        tags: JSON.stringify(["AI Vision", "CNN", "YOLOv8", "AgriTech", "Raspberry Pi"]),
        isBestSeller: true,
        isFeatured: true,
        downloadUrl: "https://cardiovision.sy/downloads/proj_crop_ai_v1.zip"
      },
      {
        id: "proj_patient_monitor",
        titleAr: "شاشة مراقبة المريض الحيوية المتعددة المعطيات (ICU Vital Patient Monitor)",
        titleEn: "Multi-Parameter Patient Vital Signs ICU Monitor",
        summaryAr: "جهاز عناية مشددة يقيس SpO2، NIBP، الحرارة، وتخطيط القلب مع إنذارات مسموعة وواجهة لمسية تفاعلية.",
        summaryEn: "Complete clinical grade ICU vital sign monitor reading SpO2, NIBP, Temperature, and ECG with GUI interface.",
        descriptionAr: "مشروع هندسي طبي تطبيقي يدمج قراءات أربعة حساسات حيوية رئيسية، مع معالجة رقمية للإشارات وشاشة عرض لمسية 7 بوصة تعرض القراءات والمنحنيات البيانية مع تسجيل بيانات المرضى في قاعدة بيانات.",
        descriptionEn: "Clinical biomedical project integrating four main bio-sensors with DSP signal processing, 7-inch touch GUI, and patient data logging.",
        category: "biomedical",
        difficultyLevel: "hard",
        priceSyp: 4200000,
        priceUsd: 310,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
        ]),
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        viewsCount: 1890,
        salesCount: 21,
        reviewsCount: 9,
        ratingAverage: 4.7,
        commentsCount: 2,
        softwareUsed: JSON.stringify(["Qt C++ Embedded GUI", "DSP Digital Filters", "SQLite Database"]),
        hardwareComponents: JSON.stringify(["MAX30102 Pulse Oximeter", "DS18B20 Temp Sensor", "Raspberry Pi 7 Touch Display"]),
        tags: JSON.stringify(["ICU Monitor", "SpO2", "Medical Grade", "Embedded C++"]),
        isBestSeller: false,
        isFeatured: false,
        downloadUrl: "https://cardiovision.sy/downloads/proj_patient_monitor.zip"
      }
    ];

    for (const p of sampleProjects) {
      await pool.query(
        `INSERT INTO projects (
          id, title_ar, title_en, summary_ar, summary_en, description_ar, description_en, 
          category, difficulty_level, price_syp, price_usd, images, video_url, 
          views_count, sales_count, reviews_count, rating_average, comments_count, 
          software_used, hardware_components, tags, is_best_seller, is_featured, download_url
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
        )`,
        [
          p.id, p.titleAr, p.titleEn, p.summaryAr, p.summaryEn, p.descriptionAr, p.descriptionEn,
          p.category, p.difficultyLevel, p.priceSyp, p.priceUsd, p.images, p.videoUrl,
          p.viewsCount, p.salesCount, p.reviewsCount, p.ratingAverage, p.commentsCount,
          p.softwareUsed, p.hardwareComponents, p.tags, p.isBestSeller, p.isFeatured, p.downloadUrl
        ]
      );
    }
  }

  // 4. Seed Comments if empty (NO AVATAR FIELDS!)
  const comCheck = await pool.query("SELECT COUNT(*) FROM comments");
  if (parseInt(comCheck.rows[0].count, 10) === 0) {
    console.log("🌱 Seeding realistic comments into PostgreSQL (No avatars)...");
    await pool.query(
      `INSERT INTO comments (id, project_id, user_id, user_name, comment_text, created_at)
       VALUES 
       ('com_1', 'proj_iot_ecg', 'usr_1', 'م. أحمد الحلاق', 'استلمت الكود البرمجي ومخطط المكونات كاملاً على ESP32. حصلت على علامة 98% في مناقشة مشروعي بفضل التوثيق الدقيق.', NOW() - INTERVAL '2 days'),
       ('com_2', 'proj_emg_hand', 'usr_2', 'سارة العلي', 'ملفات الطباعة ثلاثية الأبعاد STL ودارات الحساس العضلي كانت ممتازة جداً وتم التوصيل والتنفيذ بسلاسة.', NOW() - INTERVAL '4 days'),
       ('com_3', 'proj_crop_ai', 'usr_3', 'مجد الشهابي', 'نموذج TensorFlow المدرب يعمل بسرعة فائقة في تصنيف أمراض المحاصيل البستانية. شكراً جزيلاً.', NOW() - INTERVAL '7 days')`
    );
  }

  // 5. Seed Reviews if empty
  const revCheck = await pool.query("SELECT COUNT(*) FROM reviews");
  if (parseInt(revCheck.rows[0].count, 10) === 0) {
    console.log("🌱 Seeding realistic reviews into PostgreSQL...");
    await pool.query(
      `INSERT INTO reviews (id, project_id, user_id, user_name, rating, review_text, created_at)
       VALUES 
       ('rev_1', 'proj_iot_ecg', 'usr_1', 'م. أحمد الحلاق', 5, 'مشروع ممتاز جداً وتصميم هندسي دقيق للدارات.', NOW() - INTERVAL '3 days'),
       ('rev_2', 'proj_emg_hand', 'usr_2', 'سارة العلي', 5, 'تنسيق أكاديمي ممتاز ومتابعة ممتازة.', NOW() - INTERVAL '5 days')`
    );
  }

  // 6. Seed Sample Orders if empty
  const ordCheck = await pool.query("SELECT COUNT(*) FROM orders");
  if (parseInt(ordCheck.rows[0].count, 10) === 0) {
    console.log("🌱 Seeding realistic orders into PostgreSQL...");
    await pool.query(
      `INSERT INTO orders (id, user_id, user_name, user_phone, project_id, project_title, amount_syp, payment_method, transfer_transaction_id, status, created_at)
       VALUES
       ('ord_101', 'usr_1', 'م. أحمد الحلاق', '0944556677', 'proj_iot_ecg', 'نظام مراقبة تخطيط القلب الذكي عبر الإنترنت (IoT ECG Monitor)', 1850000, 'syriatel_cash', 'TXN-99881122', 'approved', NOW() - INTERVAL '1 day'),
       ('ord_102', 'usr_2', 'سارة العلي', '0955889900', 'proj_emg_hand', 'اليد الاصطناعية الحيوية الذكية ذات التحكم العصبي العضلي', 2950000, 'bemo', 'TXN-33445566', 'pending', NOW() - INTERVAL '2 hours')`
    );
  }

  // 7. Seed Consultations if empty
  const consCheck = await pool.query("SELECT COUNT(*) FROM consultations");
  if (parseInt(consCheck.rows[0].count, 10) === 0) {
    console.log("🌱 Seeding realistic consultations into PostgreSQL...");
    await pool.query(
      `INSERT INTO consultations (id, user_id, type, idea, response, created_at)
       VALUES
       ('cons_1', 'usr_1', 'consultation', 'نظام مراقبة مؤشرات حيوية لاسلكي', 'تم اقتراح دارة ESP32 وحساس AD8232 مع معالجة الإشارات البرمجية.', NOW() - INTERVAL '1 day')`
    );
  }

  console.log("🚀 PostgreSQL database initialization & seeding completed perfectly!");
}
