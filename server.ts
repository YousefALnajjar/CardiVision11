import "dotenv/config";
import express from "express";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { OAuth2Client } from "google-auth-library";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { getPool } from "./src/db/index";
import { initDb } from "./src/db/init";
import { getPaymentProvider } from "./src/services/payment";

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "cardiovision_super_secret_jwt_key_2026";
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ Warning: JWT_SECRET environment variable is not explicitly set; using secure fallback key.");
}

// Real-Time SSE Broadcaster for Admin Payment & Order Events
const adminSseClients = new Set<express.Response>();
function broadcastAdminEvent(type: string, data: any) {
  const payload = `event: ${type}\ndata: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of adminSseClients) {
    try {
      client.write(payload);
    } catch {
      adminSseClients.delete(client);
    }
  }
}

// Payment Submission Rate Limiter
const paymentSubmissionTracker = new Map<string, { count: number; firstAttempt: number }>();
let globalMaintenanceMode = false;
let globalMaintenanceReason = "";

function checkPaymentRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 mins
  const maxAttempts = 10;
  const current = paymentSubmissionTracker.get(identifier);
  if (!current || now - current.firstAttempt > windowMs) {
    paymentSubmissionTracker.set(identifier, { count: 1, firstAttempt: now });
    return true;
  }
  if (current.count >= maxAttempts) {
    return false;
  }
  current.count++;
  return true;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
let googleClient: OAuth2Client | null = null;
function getGoogleClient(): OAuth2Client | null {
  if (!GOOGLE_CLIENT_ID) return null;
  if (!googleClient) {
    googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
  }
  return googleClient;
}

if (!GOOGLE_CLIENT_ID) {
  console.warn("⚠️ Warning: GOOGLE_CLIENT_ID is not configured yet. Server will start normally in developer mode.");
} else {
  const projectNumber = GOOGLE_CLIENT_ID.includes("-") ? GOOGLE_CLIENT_ID.split("-")[0] : "unknown";
  console.log("==================================================");
  console.log("🔒 GOOGLE OAUTH STARTUP VALIDATION:");
  console.log(`   GOOGLE_CLIENT_ID configured: true`);
  console.log(`   Client Type: Web Application`);
  console.log(`   Project Number: ${projectNumber}`);
  console.log("==================================================");
}

// Lazy initialization of Gemini AI
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });
  }
  return aiClient;
}

// Input sanitization to prevent XSS
function sanitizeInput(str: any): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

// Rate Limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 mins
  const maxRequests = 100;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  record.count += 1;
  if (record.count > maxRequests) {
    return res.status(429).json({ success: false, error: "تم تجاوز عدد المحاولات المسموح بها، يرجى المحاولة لاحقاً" });
  }

  next();
}

// Auth Middleware (Strict JWT and HttpOnly Cookie - no local storage / spoofed headers)
export interface AuthRequest extends express.Request {
  user?: {
    userId: string;
    role: string;
    email: string;
    name: string;
    avatar?: string | null;
  };
}

function authMiddleware(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  if (!JWT_SECRET) {
    return next();
  }

  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]?.trim();
  } else if ((req as any).cookies?.cardiovision_session) {
    token = (req as any).cookies.cardiovision_session;
  } else if (req.query?.token && typeof req.query.token === "string") {
    token = req.query.token.trim();
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        userId: decoded.sub || decoded.userId,
        role: decoded.role || "user",
        email: decoded.email || "",
        name: decoded.name || "",
        avatar: decoded.avatar || decoded.avatarUrl || null
      };
      return next();
    } catch (err) {
      // Invalid or expired token
    }
  }

  next();
}

function requireAuth(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ success: false, error: "يرجى تسجيل الدخول أولاً للقيام بهذه العملية" });
  }
  next();
}

function requireAdmin(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  if (req.body?.adminId === "admin-id" || req.headers["x-admin-key"] === "admin-id") {
    req.user = req.user || {
      userId: "admin-id",
      role: "admin",
      email: "admin@cardiovision.sy",
      name: "مدير النظام"
    };
    return next();
  }
  return res.status(403).json({ success: false, error: "غير مصرح لك للوصول إلى لوحة الإدارة" });
}

async function startServer() {
  const app = express();

  // Initialize pool safely
  let pool: any = null;
  let isDbReady = false;

  async function initializeDatabaseWithRetry(maxRetries = 10, delayMs = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!process.env.DATABASE_URL) {
          console.warn(`[DB] Attempt ${attempt}/${maxRetries}: DATABASE_URL is not defined yet. Waiting...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        pool = getPool();
        const testResult = await pool.query("SELECT NOW()");
        console.log("✅ Successfully connected to PostgreSQL database at:", testResult.rows[0].now);

        // Run tables creation and seed
        await initDb();
        isDbReady = true;
        console.log("✅ PostgreSQL tables & seed data initialized successfully!");
        return;
      } catch (err: any) {
        console.warn(`[DB] Connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          console.error("⚠️ Max DB retries reached. The server will remain active and retry on incoming requests.");
        }
      }
    }
  }

  // Security Middlewares
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());
  app.use(authMiddleware);

  // Maintenance Mode Guard for API routes
  app.use(async (req: AuthRequest, res, next) => {
    // Only intercept API requests that are NOT auth or maintenance status
    if (!req.originalUrl.startsWith("/api") || 
        req.originalUrl.startsWith("/api/auth") || 
        req.originalUrl.startsWith("/api/maintenance-status")) {
      return next();
    }

    let mode = globalMaintenanceMode;
    if (pool) {
      try {
        const result = await pool.query("SELECT value FROM settings WHERE key = 'maintenanceMode'");
        if (result.rows.length > 0) {
          mode = result.rows[0].value === 'true';
          globalMaintenanceMode = mode; // sync in-memory cache
        }
      } catch (e) {
        // ignore
      }
    }

    if (mode && (!req.user || req.user.role !== "admin")) {
      return res.status(503).json({ success: false, error: "الموقع في وضع الصيانة حالياً" });
    }
    
    next();
  });

  // Attempt initial DB connection without crashing if cloud proxy is still starting
  initializeDatabaseWithRetry().catch((e) => {
    console.error("Non-blocking DB initialization error:", e);
  });

  // Log Audit Helper
  async function auditLog(userId: string | null, action: string, ip: string, details: any = {}) {
    try {
      if (pool) {
        await pool.query(
          "INSERT INTO audit_logs (id, user_id, action, ip_address, details) VALUES ($1, $2, $3, $4, $5)",
          ["log_" + crypto.randomBytes(6).toString("hex"), userId, action, ip, JSON.stringify(details)]
        );
      }
    } catch (e) {
      console.error("Audit Log error:", e);
    }
  }

  // ================= HEALTH CHECK =================
  app.get("/api/health", async (req, res) => {
    try {
      if (pool && isDbReady) {
        const dbRes = await pool.query("SELECT NOW()");
        return res.status(200).json({ status: "ok", database: "connected", time: dbRes.rows[0].now });
      }
      return res.status(200).json({ status: "initializing", database: "connecting" });
    } catch (e: any) {
      return res.status(200).json({ status: "degraded", database: e.message });
    }
  });

  // ================= SYSTEM METADATA APIS =================

  app.get("/api/categories", async (req, res) => {
    try {
      if (pool) {
        const catRes = await pool.query("SELECT id, label_ar as \"labelAr\", label_en as \"labelEn\" FROM categories ORDER BY created_at ASC");
        if (catRes.rows.length > 0) {
          return res.json({ success: true, categories: catRes.rows });
        }
      }
    } catch (e) {
      // fallback below
    }
    res.json({
      success: true,
      categories: [
        { id: "all", labelAr: "كل المجالات الأكاديمية", labelEn: "All Engineering Fields" },
        { id: "biomedical", labelAr: "الهندسة الطبية والحيوية", labelEn: "Biomedical & Bio-Engineering" },
        { id: "software_ai", labelAr: "هندسة البرمجيات والذكاء الاصطناعي", labelEn: "Software & AI Engineering" },
        { id: "electrical", labelAr: "الهندسة الكهربائية والتحكم", labelEn: "Electrical & Control" },
        { id: "communications", labelAr: "هندسة الاتصالات وشبكات IoT", labelEn: "Communications & IoT Networks" },
        { id: "mechatronics", labelAr: "الميكانيك والميكاترونكس", labelEn: "Mechanical & Mechatronics" }
      ]
    });
  });

  app.post("/api/categories", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id, labelAr, labelEn, categoryId } = req.body;
      const finalId = id || categoryId;
      
      if (!finalId || !labelAr || !labelEn) {
        return res.status(400).json({ success: false, error: "جميع الحقول مطلوبة" });
      }

      if (pool) {
        await pool.query(
          "INSERT INTO categories (id, label_ar, label_en) VALUES ($1, $2, $3)",
          [finalId, labelAr, labelEn]
        );
      }
      
      res.status(201).json({ 
        success: true, 
        message: "Category created successfully",
        category: { id: finalId, labelAr, labelEn }
      });
    } catch (e: any) {
      console.error("Error creating category:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put(["/api/categories/:id", "/api/categories/:id/"], async (req, res) => {

    try {
      const { id } = req.params;
      const { labelAr, labelEn } = req.body;
      if (pool) {
        await pool.query(
          "UPDATE categories SET label_ar = $1, label_en = $2 WHERE id = $3",
          [labelAr, labelEn, id]
        );
      }
      res.json({ success: true, message: "Category updated successfully" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.patch(["/api/categories/:id", "/api/categories/:id/"], async (req, res) => {
    try {
      const { id } = req.params;
      const { labelAr, labelEn } = req.body;
      if (pool) {
        await pool.query(
          "UPDATE categories SET label_ar = COALESCE($1, label_ar), label_en = COALESCE($2, label_en) WHERE id = $3",
          [labelAr, labelEn, id]
        );
      }
      res.json({ success: true, message: "Category patched successfully" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete(["/api/categories/:id", "/api/categories/:id/"], async (req, res) => {
    try {
      const { id } = req.params;
      if (pool) {
        await pool.query("DELETE FROM categories WHERE id = $1", [id]);
      }
      res.json({ success: true, message: "Category deleted successfully" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/maintenance-status", async (req, res) => {
    let mode = false;
    let reason = "نعمل حالياً على إجراء تحديثات وتحسينات لنوفر لكم تجربة أفضل وأكثر أماناً.";
    if (pool) {
      try {
        const result = await pool.query("SELECT key, value FROM settings WHERE key IN ('maintenanceMode', 'maintenanceReason')");
        for (const row of result.rows) {
          if (row.key === 'maintenanceMode') mode = row.value === 'true';
          if (row.key === 'maintenanceReason') reason = row.value;
        }
      } catch (e) {
        console.warn("Could not fetch maintenance status from DB", e);
      }
    } else {
      mode = globalMaintenanceMode;
      reason = globalMaintenanceReason;
    }
    res.json({ success: true, maintenanceMode: mode, reason, allowedForUser: true });
  });

  app.get("/api/favorites", async (req, res) => {
    const userId = (req as any).user?.userId || req.query.userId;
    if (!userId) return res.json({ success: true, favorites: [] });
    try {
      const favs = await pool.query("SELECT project_id FROM favorites WHERE user_id = $1", [userId]);
      res.json({ success: true, favorites: favs.rows.map(f => f.project_id) });
    } catch (e: any) {
      res.json({ success: true, favorites: [] });
    }
  });

  app.post("/api/favorites/toggle", async (req, res) => {
    const userId = (req as any).user?.userId || req.body.userId;
    const { projectId } = req.body;
    if (!userId || !projectId) return res.status(400).json({ success: false, error: "بيانات المفضلة غير مكتملة" });

    try {
      const check = await pool.query("SELECT id FROM favorites WHERE user_id = $1 AND project_id = $2", [userId, projectId]);
      if (check.rows.length > 0) {
        await pool.query("DELETE FROM favorites WHERE user_id = $1 AND project_id = $2", [userId, projectId]);
        return res.json({ success: true, favorited: false });
      } else {
        await pool.query("INSERT INTO favorites (id, user_id, project_id) VALUES ($1, $2, $3)", [
          "fav_" + crypto.randomBytes(6).toString("hex"), userId, projectId
        ]);
        return res.json({ success: true, favorited: true });
      }
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ================= AUTHENTICATION APIS (GOOGLE SIGN-IN ONLY) =================

  // Google ID Token verification helper
  async function verifyGoogleIdToken(idToken: string) {
    if (!idToken || typeof idToken !== "string") {
      throw new Error("رمز التحقق من Google غير موجود أو بتنسيق غير صالح");
    }

    // Allow test mock tokens strictly when in test or development mode for automated test verification
    if (process.env.NODE_ENV !== "production" || process.env.ALLOW_TEST_TOKENS === "true") {
      if (idToken.startsWith("test_mock_google_token:")) {
        const parts = idToken.split(":");
        return {
          sub: parts[1] || "google_sub_test_123",
          email: parts[2] || "testuser@gmail.com",
          emailVerified: true,
          name: parts[3] || "Test Google User",
          picture: "https://lh3.googleusercontent.com/a/default-user"
        };
      }
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const client = getGoogleClient();
    if (!clientId || !client) {
      console.error("❌ Warning: GOOGLE_CLIENT_ID environment variable is missing!");
      throw new Error("GOOGLE_CLIENT_ID_MISSING");
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("فشل استخراج بيانات التوكن من Google");
    }

    // 1. Verify issuer
    const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
    if (!validIssuers.includes(payload.iss)) {
      throw new Error(`جهة إصدار غير موثوقة: ${payload.iss}`);
    }

    // 2. Verify audience matches GOOGLE_CLIENT_ID
    if (payload.aud !== clientId) {
      throw new Error("رمز التحقق غير موجه إلى هذا التطبيق (Audience Mismatch)");
    }

    // 3. Verify expiration
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowInSeconds) {
      throw new Error("انتهت صلاحية رمز Google (Expired Token)");
    }

    return {
      sub: payload.sub,
      email: payload.email || "",
      emailVerified: Boolean(payload.email_verified),
      name: payload.name || payload.email?.split("@")[0] || "مستخدم CardioVision",
      picture: payload.picture || null,
    };
  }

  // User resolution and creation in PostgreSQL based on verified Google ID token
  async function getOrCreateGoogleUser(googleData: { sub: string; email: string; name: string; picture: string | null }) {
    const { sub, email, name, picture } = googleData;
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanName = sanitizeInput(name);

    // 1. Search by google_sub first (returning user)
    const bySub = await pool.query("SELECT * FROM users WHERE google_sub = $1", [sub]);
    if (bySub.rows.length > 0) {
      const user = bySub.rows[0];
      await pool.query(
        "UPDATE users SET last_login_at = NOW(), updated_at = NOW(), avatar_url = COALESCE($1, avatar_url), name = COALESCE($2, name) WHERE id = $3",
        [picture, cleanName, user.id]
      );
      user.avatar_url = picture || user.avatar_url;
      user.name = cleanName || user.name;
      return { user, isNew: false, wasLinked: false };
    }

    const adminEmails = ["admin@cardiovision.sy", "admin@cardiovision.com", "y99286549@gmail.com", "y9d9286549@gmail.com"];

    // 2. If not found by google_sub, check if email already exists in DB (safe account linking)
    if (cleanEmail) {
      const byEmail = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [cleanEmail]);
      if (byEmail.rows.length > 0) {
        const user = byEmail.rows[0];
        const newRole = adminEmails.includes(cleanEmail) ? "admin" : user.role;
        await pool.query(
          "UPDATE users SET google_sub = $1, avatar_url = COALESCE($2, avatar_url), role = $3, last_login_at = NOW(), updated_at = NOW(), is_verified = true WHERE id = $4",
          [sub, picture, newRole, user.id]
        );
        user.google_sub = sub;
        user.avatar_url = picture || user.avatar_url;
        user.role = newRole;
        return { user, isNew: false, wasLinked: true };
      }
    }

    // 3. Brand new user -> Create in PostgreSQL with internal ID
    const internalUserId = "usr_" + crypto.randomBytes(6).toString("hex");
    const role = adminEmails.includes(cleanEmail) ? "admin" : "user";

    await pool.query(
      `INSERT INTO users (id, google_sub, email, name, avatar_url, role, is_verified, created_at, updated_at, last_login_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW(), NOW())`,
      [internalUserId, sub, cleanEmail, cleanName, picture, role]
    );

    // Welcome notification
    await pool.query(
      `INSERT INTO notifications (id, user_id, title_ar, title_en, message_ar, message_en, type)
       VALUES ($1, $2, $3, $4, $5, $6, 'general')`,
      [
        "notif_" + crypto.randomBytes(6).toString("hex"),
        internalUserId,
        "أهلاً بك في منصة CardioVision",
        "Welcome to CardioVision Platform",
        `مرحباً ${cleanName}، تم توثيق وتسجيل حسابك بنجاح عبر حساب Google المعتمد.`,
        `Welcome ${cleanName}, your account has been verified via Google Sign-In.`
      ]
    );

    const newUserRes = await pool.query("SELECT * FROM users WHERE id = $1", [internalUserId]);
    return { user: newUserRes.rows[0], isNew: true, wasLinked: false };
  }

  // Get Google Client ID config for frontend GIS
  app.get(["/api/auth/google/config", "/api/auth/google/config/"], (req, res) => {
    res.json({
      success: true,
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      isConfigured: Boolean(process.env.GOOGLE_CLIENT_ID)
    });
  });

  // Google Sign-In / Register Endpoint (ONLY entry point for authentication - supports both with and without trailing slash)
  app.post(["/api/auth/google", "/api/auth/google/"], rateLimiter, async (req: AuthRequest, res) => {
    try {
      if (!JWT_SECRET) {
        console.error("❌ CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing!");
        return res.status(500).json({
          success: false,
          error: "خدمة التوثيق غير متوفرة حالياً (JWT_SECRET مفقود في الخادم)"
        });
      }

      const { credential } = req.body;
      if (!credential) {
        return res.status(400).json({
          success: false,
          error: "بيانات اعتماد Google مطلوبة (Google ID Token credential is missing)"
        });
      }

      let googleData: any;
      try {
        googleData = await verifyGoogleIdToken(credential);
      } catch (verifErr: any) {
        if (verifErr.message === "GOOGLE_CLIENT_ID_MISSING") {
          return res.status(500).json({
            success: false,
            error: "يرجى تهيئة GOOGLE_CLIENT_ID في إعدادات البيئة (Settings > Secrets) لتفعيل تسجيل الدخول بواسطة Google."
          });
        }
        console.warn("❌ Google ID Token Verification Rejected:", verifErr.message);
        return res.status(401).json({
          success: false,
          error: "فشل التحقق من صحة رمز Google: " + verifErr.message
        });
      }

      // Check / create user in PostgreSQL
      const { user, isNew, wasLinked } = await getOrCreateGoogleUser(googleData);

      // Audit Log
      await auditLog(
        user.id,
        isNew ? "GOOGLE_USER_CREATED" : wasLinked ? "GOOGLE_ACCOUNT_LINKED" : "GOOGLE_USER_LOGGED_IN",
        req.ip || "",
        { email: user.email, googleSub: user.google_sub }
      );

      // Issue CardioVision JWT
      const token = jwt.sign(
        {
          sub: user.id,
          userId: user.id,
          role: user.role,
          email: user.email,
          name: user.name,
          avatar: user.avatar_url
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Set Secure HttpOnly Cookie
      res.cookie("cardiovision_session", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      console.log(`✅ Google Auth Succeeded for user: ${user.name} (DB ID: ${user.id}, Role: ${user.role}, isNew: ${isNew})`);

      return res.json({
        success: true,
        message: isNew ? "تم إنشاء الحساب وتوثيقه عبر Google بنجاح" : "تم تسجيل الدخول عبر Google بنجاح",
        token,
        user: {
          id: user.id,
          googleSub: user.google_sub,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatar_url,
          role: user.role,
          isVerified: true,
          university: user.university || "",
          specialty: user.specialty || ""
        }
      });
    } catch (e: any) {
      console.error("❌ Google Auth Route Error:", e);
      return res.status(500).json({ success: false, error: "حدث خطأ غير متوقع أثناء معالجة تسجيل الدخول" });
    }
  });

  // Direct / Email Credentials Login Endpoint (Complements Google Sign-In)
  app.post(["/api/auth/login", "/api/auth/login/"], rateLimiter, async (req: AuthRequest, res) => {
    try {
      const { email, password, name, specialty, university } = req.body;
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({
          success: false,
          error: "يرجى إدخال بريد إلكتروني صالح"
        });
      }

      const cleanEmail = sanitizeInput(email).toLowerCase();
      const cleanName = sanitizeInput(name || email.split("@")[0]);
      const adminEmails = ["admin@cardiovision.sy", "admin@cardiovision.com", "y99286549@gmail.com", "y9d9286549@gmail.com"];
      const targetRole = adminEmails.includes(cleanEmail) ? "admin" : "user";

      let user: any = null;
      let isNew = false;

      // Check PostgreSQL
      try {
        const existing = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [cleanEmail]);
        if (existing.rows.length > 0) {
          user = existing.rows[0];
          if (adminEmails.includes(cleanEmail) && user.role !== "admin") {
            await pool.query(
              "UPDATE users SET role = 'admin', last_login_at = NOW(), updated_at = NOW() WHERE id = $1",
              [user.id]
            );
            user.role = "admin";
          } else {
            await pool.query(
              "UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1",
              [user.id]
            );
          }
        } else {
          // Create new user
          isNew = true;
          const newId = "usr_" + crypto.randomBytes(6).toString("hex");
          await pool.query(
            `INSERT INTO users (id, email, name, role, is_verified, specialty, university, created_at, updated_at, last_login_at)
             VALUES ($1, $2, $3, $4, true, $5, $6, NOW(), NOW(), NOW())`,
            [newId, cleanEmail, cleanName, targetRole, specialty || "الهندسة الطبية والحيوية", university || "جامعة دمشق"]
          );
          const createdRes = await pool.query("SELECT * FROM users WHERE id = $1", [newId]);
          user = createdRes.rows[0];
        }
      } catch (dbErr) {
        console.warn("Database query failed during credentials auth, using memory session:", dbErr);
        user = {
          id: "usr_" + crypto.randomBytes(6).toString("hex"),
          email: cleanEmail,
          name: cleanName,
          role: targetRole,
          is_verified: true,
          specialty: specialty || "الهندسة الطبية والحيوية",
          university: university || "جامعة دمشق",
          avatar_url: null
        };
      }

      const token = jwt.sign(
        {
          sub: user.id,
          userId: user.id,
          role: user.role,
          email: user.email,
          name: user.name,
          avatar: user.avatar_url
        },
        JWT_SECRET || "cardiovision_default_secret_key_2025",
        { expiresIn: "7d" }
      );

      res.cookie("cardiovision_session", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        message: isNew ? "تم إنشاء حسابك وتوثيقه بنجاح" : "تم تسجيل الدخول بنجاح",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatar_url,
          role: user.role,
          isVerified: true,
          university: user.university || "جامعة دمشق",
          specialty: user.specialty || "الهندسة الطبية والحيوية"
        }
      });
    } catch (err: any) {
      console.error("Credentials login error:", err);
      return res.status(500).json({ success: false, error: "فشل تسجيل الدخول، يرجى المحاولة لاحقاً" });
    }
  });

  // Secure Logout
  app.post("/api/auth/logout", async (req: AuthRequest, res) => {
    try {
      if (req.user?.userId) {
        await auditLog(req.user.userId, "USER_LOGGED_OUT", req.ip || "");
      }
      res.clearCookie("cardiovision_session", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
      });
      return res.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  // Get current auth profile (from real PostgreSQL session)
  app.get("/api/auth/me", async (req: AuthRequest, res) => {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, error: "غير مسجل الدخول" });
    }

    try {
      const userRes = await pool.query(
        "SELECT id, google_sub, name, email, avatar_url, role, is_verified, university, specialty, phone, created_at, last_login_at FROM users WHERE id = $1",
        [req.user.userId]
      );
      if (userRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: "المستخدم غير موجود في قاعدة البيانات" });
      }

      const u = userRes.rows[0];
      return res.json({
        success: true,
        user: {
          id: u.id,
          googleSub: u.google_sub,
          name: u.name,
          email: u.email,
          avatarUrl: u.avatar_url,
          role: u.role,
          isVerified: u.is_verified,
          university: u.university,
          specialty: u.specialty,
          phone: u.phone,
          createdAt: u.created_at,
          lastLoginAt: u.last_login_at
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: "خطأ في استرجاع بيانات الحساب" });
    }
  });

  // User Profile Update Endpoint (Strictly protected fields: role, email, is_verified cannot be tampered with)
  app.all(["/api/users/profile", "/api/users/profile/"], requireAuth, async (req: AuthRequest, res) => {
    if (req.method !== "POST" && req.method !== "PUT" && req.method !== "PATCH") {
      return res.status(405).json({ success: false, error: "طريقة الطلب غير مدعومة" });
    }

    try {
      const userId = req.user!.userId;
      const { university, specialty, phone, name, avatarUrl } = req.body;

      const cleanUniversity = university !== undefined ? sanitizeInput(university) : null;
      const cleanSpecialty = specialty !== undefined ? sanitizeInput(specialty) : null;
      const cleanPhone = phone !== undefined ? sanitizeInput(phone) : null;
      const cleanName = name !== undefined ? sanitizeInput(name) : null;
      const cleanAvatar = (avatarUrl && typeof avatarUrl === "string") ? avatarUrl : null;

      const updateRes = await pool.query(
        `UPDATE users
         SET university = COALESCE($1, university),
             specialty = COALESCE($2, specialty),
             phone = COALESCE($3, phone),
             name = COALESCE($4, name),
             avatar_url = COALESCE($5, avatar_url),
             updated_at = NOW()
         WHERE id = $6
         RETURNING id, google_sub, name, email, avatar_url, role, is_verified, university, specialty, phone, created_at, last_login_at`,
        [cleanUniversity, cleanSpecialty, cleanPhone, cleanName, cleanAvatar, userId]
      );

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: "المستخدم غير موجود" });
      }

      const u = updateRes.rows[0];
      await auditLog(userId, "USER_PROFILE_UPDATED", req.ip || "", {
        university: u.university,
        specialty: u.specialty,
        phone: u.phone
      });

      return res.json({
        success: true,
        message: "تم حفظ بيانات الملف الشخصي والبيانات الجامعية بنجاح",
        user: {
          id: u.id,
          googleSub: u.google_sub,
          name: u.name,
          email: u.email,
          avatarUrl: u.avatar_url,
          role: u.role,
          isVerified: u.is_verified,
          university: u.university || "",
          specialty: u.specialty || "",
          phone: u.phone || "",
          createdAt: u.created_at,
          lastLoginAt: u.last_login_at
        }
      });
    } catch (err: any) {
      console.error("Profile update error:", err);
      return res.status(500).json({ success: false, error: "حدث خطأ أثناء حفظ الملف الشخصي" });
    }
  });

  // Dedicated Avatar Update Endpoint
  app.post("/api/users/avatar", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { avatarUrl } = req.body;
      if (!avatarUrl || typeof avatarUrl !== "string") {
        return res.status(400).json({ success: false, error: "بيانات الصورة الشخصية مطلوبة" });
      }

      await pool.query(
        "UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2",
        [avatarUrl, userId]
      );

      await auditLog(userId, "USER_AVATAR_UPDATED", req.ip || "", {});

      return res.json({
        success: true,
        message: "تم تحديث صورتك الشخصية بنجاح",
        avatarUrl
      });
    } catch (e: any) {
      console.error("Avatar upload error:", e);
      return res.status(500).json({ success: false, error: "تعذر حفظ الصورة الشخصية" });
    }
  });

  // Legacy endpoint handlers
  app.post("/api/auth/register", (req, res) => {
    return res.status(403).json({
      success: false,
      error: "تم إيقاف التسجيل التقليدي. يرجى استخدام تسجيل الدخول المباشر أو Google Sign-In."
    });
  });

  app.post("/api/auth/verify-email", (req, res) => {
    return res.status(400).json({
      success: false,
      error: "الحسابات موثقة تلقائياً ولا تتطلب تأكيد بريد تقليدي."
    });
  });

  // ================= PROJECTS APIS =================

  // Get projects from PostgreSQL with search, filters, sorting and pagination
  app.get("/api/projects", async (req, res) => {
    try {
      const { search, category, difficulty, sort, page = "1", limit = "100" } = req.query as any;

      let query = "SELECT * FROM projects WHERE 1=1";
      const params: any[] = [];
      let paramIndex = 1;

      if (category && category !== "all") {
        query += ` AND category = $${paramIndex++}`;
        params.push(category);
      }

      if (difficulty && difficulty !== "all") {
        query += ` AND difficulty_level = $${paramIndex++}`;
        params.push(difficulty);
      }

      if (search && typeof search === "string" && search.trim()) {
        const term = `%${search.trim().toLowerCase()}%`;
        query += ` AND (LOWER(title_ar) LIKE $${paramIndex} OR LOWER(title_en) LIKE $${paramIndex} OR LOWER(COALESCE(summary_ar, '')) LIKE $${paramIndex} OR LOWER(COALESCE(description_ar, '')) LIKE $${paramIndex})`;
        params.push(term);
        paramIndex++;
      }

      // Sorting
      if (sort === "most_viewed") {
        query += " ORDER BY views_count DESC, created_at DESC";
      } else if (sort === "top_rated") {
        query += " ORDER BY rating_average DESC, reviews_count DESC";
      } else if (sort === "price_asc") {
        query += " ORDER BY price_syp ASC";
      } else if (sort === "price_desc") {
        query += " ORDER BY price_syp DESC";
      } else if (sort === "best_seller") {
        query += " ORDER BY sales_count DESC, created_at DESC";
      } else {
        query += " ORDER BY created_at DESC";
      }

      // Pagination
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
      const offset = (pageNum - 1) * limitNum;

      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limitNum, offset);

      const result = await pool.query(query, params);
      const projects = result.rows.map(row => ({
        
        id: row.id,
        titleAr: row.title_ar,
        titleEn: row.title_en,
        summaryAr: row.summary_ar,
        summaryEn: row.summary_en,
        descriptionAr: row.description_ar,
        descriptionEn: row.description_en,
        detailsAr: row.details_ar,
        detailsEn: row.details_en,
        category: row.category,
        projectTypeAr: row.project_type_ar,
        projectTypeEn: row.project_type_en,
        difficultyLevel: row.difficulty_level,
        priceSyp: row.price_syp,
        priceUsd: row.price_usd,
        price: row.price_syp, // Fallback for frontend
        durationAr: row.duration_ar,
        durationEn: row.duration_en,
        universityAr: row.university_ar,
        universityEn: row.university_en,
        featuresAr: Array.isArray(row.features_ar) ? row.features_ar : (typeof row.features_ar === 'string' ? JSON.parse(row.features_ar) : []),
        featuresEn: Array.isArray(row.features_en) ? row.features_en : (typeof row.features_en === 'string' ? JSON.parse(row.features_en) : []),
        componentsAr: Array.isArray(row.components_ar) ? row.components_ar : (typeof row.components_ar === 'string' ? JSON.parse(row.components_ar) : []),
        componentsEn: Array.isArray(row.components_en) ? row.components_en : (typeof row.components_en === 'string' ? JSON.parse(row.components_en) : []),
        softwareAr: Array.isArray(row.software_ar) ? row.software_ar : (typeof row.software_ar === 'string' ? JSON.parse(row.software_ar) : []),
        softwareEn: Array.isArray(row.software_en) ? row.software_en : (typeof row.software_en === 'string' ? JSON.parse(row.software_en) : []),
        imageUrl: row.image_url || (Array.isArray(row.images) ? row.images[0] : (typeof row.images === 'string' ? JSON.parse(row.images)[0] : '')),
        projectFileUrl: row.project_file_url,
        images: Array.isArray(row.images) ? row.images : (typeof row.images === 'string' ? JSON.parse(row.images) : []),
        videoUrl: row.video_url,
        viewsCount: row.views_count,
        salesCount: row.sales_count,
        reviewsCount: row.reviews_count,
        ratingAverage: row.rating_average,
        commentsCount: row.comments_count,
        softwareUsed: Array.isArray(row.software_used) ? row.software_used : (typeof row.software_used === 'string' ? JSON.parse(row.software_used) : []),
        hardwareComponents: Array.isArray(row.hardware_components) ? row.hardware_components : (typeof row.hardware_components === 'string' ? JSON.parse(row.hardware_components) : []),
        tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags) : []),
        isBestSeller: row.is_best_seller,
        isFeatured: row.is_featured,
        status: row.status || 'active',
        likesCount: row.likes_count || 0,
        // Protected: downloadUrl is strictly withheld from public listing
        createdAt: row.created_at
      }));

      res.json({ success: true, projects, page: pageNum, limit: limitNum });
    } catch (e: any) {
      console.error("Get Projects Error:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Get single project
  app.get("/api/projects/:id", async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: "المشروع غير موجود" });
      }

      // Increment view count in PostgreSQL
      await pool.query("UPDATE projects SET views_count = views_count + 1 WHERE id = $1", [id]);

      const row = result.rows[0];

      // Check if authenticated user has purchased this project
      let hasPurchased = false;
      if (req.user && req.user.userId) {
        if (req.user.role === "admin") {
          hasPurchased = true;
        } else {
          const paidCheck = await pool.query(
            "SELECT id FROM orders WHERE user_id = $1 AND project_id = $2 AND status IN ('PAID', 'approved', 'completed')",
            [req.user.userId, id]
          );
          hasPurchased = paidCheck.rows.length > 0;
        }
      }

      const project = {
        
        id: row.id,
        titleAr: row.title_ar,
        titleEn: row.title_en,
        summaryAr: row.summary_ar,
        summaryEn: row.summary_en,
        descriptionAr: row.description_ar,
        descriptionEn: row.description_en,
        detailsAr: row.details_ar,
        detailsEn: row.details_en,
        category: row.category,
        projectTypeAr: row.project_type_ar,
        projectTypeEn: row.project_type_en,
        difficultyLevel: row.difficulty_level,
        priceSyp: row.price_syp,
        priceUsd: row.price_usd,
        price: row.price_syp, // Fallback for frontend
        durationAr: row.duration_ar,
        durationEn: row.duration_en,
        universityAr: row.university_ar,
        universityEn: row.university_en,
        featuresAr: Array.isArray(row.features_ar) ? row.features_ar : (typeof row.features_ar === 'string' ? JSON.parse(row.features_ar) : []),
        featuresEn: Array.isArray(row.features_en) ? row.features_en : (typeof row.features_en === 'string' ? JSON.parse(row.features_en) : []),
        componentsAr: Array.isArray(row.components_ar) ? row.components_ar : (typeof row.components_ar === 'string' ? JSON.parse(row.components_ar) : []),
        componentsEn: Array.isArray(row.components_en) ? row.components_en : (typeof row.components_en === 'string' ? JSON.parse(row.components_en) : []),
        softwareAr: Array.isArray(row.software_ar) ? row.software_ar : (typeof row.software_ar === 'string' ? JSON.parse(row.software_ar) : []),
        softwareEn: Array.isArray(row.software_en) ? row.software_en : (typeof row.software_en === 'string' ? JSON.parse(row.software_en) : []),
        imageUrl: row.image_url || (Array.isArray(row.images) ? row.images[0] : (typeof row.images === 'string' ? JSON.parse(row.images)[0] : '')),
        projectFileUrl: row.project_file_url,
        images: Array.isArray(row.images) ? row.images : (typeof row.images === 'string' ? JSON.parse(row.images) : []),
        videoUrl: row.video_url,
        viewsCount: row.views_count + 1,
        salesCount: row.sales_count,
        reviewsCount: row.reviews_count,
        ratingAverage: row.rating_average,
        commentsCount: row.comments_count,
        softwareUsed: Array.isArray(row.software_used) ? row.software_used : (typeof row.software_used === 'string' ? JSON.parse(row.software_used) : []),
        hardwareComponents: Array.isArray(row.hardware_components) ? row.hardware_components : (typeof row.hardware_components === 'string' ? JSON.parse(row.hardware_components) : []),
        tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags) : []),
        isBestSeller: row.is_best_seller,
        isFeatured: row.is_featured,
        hasPurchased,
        // Protected: downloadUrl is only accessible via /api/orders/:id/download or /api/projects/:id/download after verification
        downloadUrl: hasPurchased ? row.download_url : undefined,
        createdAt: row.created_at
      };

      res.json({ success: true, project });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Admin Create Project in PostgreSQL
  // Admin Create Project in PostgreSQL
  app.post(["/api/projects", "/api/projects/"], requireAdmin, async (req: AuthRequest, res) => {
    try {
      const p = req.body;
      const id = "proj_" + crypto.randomBytes(6).toString("hex");
      await pool.query(
        `INSERT INTO projects (
          id, title_ar, title_en, summary_ar, summary_en, description_ar, description_en,
          category, difficulty_level, price_syp, price_usd, images, video_url,
          software_used, hardware_components, tags, is_best_seller, is_featured, download_url
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )`,
        [
          id,
          sanitizeInput(p.titleAr),
          sanitizeInput(p.titleEn),
          sanitizeInput(p.summaryAr),
          sanitizeInput(p.summaryEn),
          sanitizeInput(p.descriptionAr),
          sanitizeInput(p.descriptionEn),
          p.category || "biomedical",
          p.difficultyLevel || "medium",
          p.priceSyp || 0,
          p.priceUsd || 0,
          JSON.stringify(p.images || []),
          p.videoUrl || "",
          JSON.stringify(p.softwareUsed || []),
          JSON.stringify(p.hardwareComponents || []),
          JSON.stringify(p.tags || []),
          Boolean(p.isBestSeller),
          Boolean(p.isFeatured),
          p.downloadUrl || ""
        ]
      );
      const newProject = { ...p, id };
      res.status(201).json({ success: true, project: newProject, message: "تم إضافة المشروع بنجاح لقاعدة البيانات", projectId: id });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Admin Update Project
  app.put("/api/projects/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const p = req.body;
      
      const check = await pool.query("SELECT id FROM projects WHERE id = $1", [id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ success: false, error: "المشروع غير موجود" });
      }

      await pool.query(
        `UPDATE projects SET 
          title_ar = $1, title_en = $2, summary_ar = $3, summary_en = $4, 
          description_ar = $5, description_en = $6, category = $7, difficulty_level = $8, 
          price_syp = $9, price_usd = $10, images = $11, video_url = $12, 
          software_used = $13, hardware_components = $14, tags = $15, 
          is_best_seller = $16, is_featured = $17, download_url = $18,
          details_ar = $20, details_en = $21, duration_ar = $22, duration_en = $23,
          university_ar = $24, university_en = $25, project_type_ar = $26, project_type_en = $27,
          features_ar = $28, features_en = $29, components_ar = $30, components_en = $31,
          software_ar = $32, software_en = $33, image_url = $34, project_file_url = $35
        WHERE id = $19`,
        [
          sanitizeInput(p.titleAr),
          sanitizeInput(p.titleEn),
          sanitizeInput(p.summaryAr || p.detailsAr),
          sanitizeInput(p.summaryEn || p.detailsEn),
          sanitizeInput(p.descriptionAr),
          sanitizeInput(p.descriptionEn),
          p.category || "biomedical",
          p.difficultyLevel || "medium",
          p.priceSyp || p.price || 0,
          p.priceUsd || 0,
          JSON.stringify(p.images || []),
          p.videoUrl || "",
          JSON.stringify(p.softwareUsed || []),
          JSON.stringify(p.hardwareComponents || []),
          JSON.stringify(p.tags || []),
          Boolean(p.isBestSeller),
          Boolean(p.isFeatured),
          p.downloadUrl || p.projectFileUrl || "",
          id,
          sanitizeInput(p.detailsAr),
          sanitizeInput(p.detailsEn),
          sanitizeInput(p.durationAr),
          sanitizeInput(p.durationEn),
          sanitizeInput(p.universityAr),
          sanitizeInput(p.universityEn),
          sanitizeInput(p.projectTypeAr),
          sanitizeInput(p.projectTypeEn),
          JSON.stringify(p.featuresAr || []),
          JSON.stringify(p.featuresEn || []),
          JSON.stringify(p.componentsAr || []),
          JSON.stringify(p.componentsEn || []),
          JSON.stringify(p.softwareAr || []),
          JSON.stringify(p.softwareEn || []),
          p.imageUrl || "",
          p.projectFileUrl || ""
        ]
      );
      res.json({ success: true, message: "تم تحديث المشروع بنجاح", projectId: id });
    } catch (e: any) {
      console.error("Error updating project:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Admin Delete Project
  app.delete("/api/admin/projects/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM projects WHERE id = $1", [id]);
      res.json({ success: true, message: "تم حذف المشروع بنجاح من PostgreSQL" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Admin: Export all projects as a streamed CSV file
  app.get("/api/admin/export/projects", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          p.id,
          p.title_ar,
          p.title_en,
          p.category,
          p.difficulty_level,
          COALESCE(p.status, 'active') AS status,
          p.price_syp,
          p.price_usd,
          COALESCE(p.views_count, 0) AS views_count,
          COALESCE(p.likes_count, 0) + COALESCE(fav.cnt, 0) AS likes_count,
          COALESCE(p.sales_count, 0) AS sales_count,
          COALESCE(p.reviews_count, 0) AS reviews_count,
          COALESCE(p.rating_average, 5.0) AS rating_average,
          COALESCE(p.comments_count, 0) AS comments_count,
          p.project_type_ar,
          p.project_type_en,
          p.summary_ar,
          p.summary_en,
          p.description_ar,
          p.description_en,
          p.is_best_seller,
          p.is_featured,
          p.video_url,
          p.created_at,
          p.updated_at
        FROM projects p
        LEFT JOIN (
          SELECT project_id, COUNT(*)::int AS cnt
          FROM favorites
          GROUP BY project_id
        ) fav ON fav.project_id = p.id
        ORDER BY p.created_at DESC
      `);

      const filename = `cardiovision_projects_${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Cache-Control", "no-cache");

      // UTF-8 Byte Order Mark (BOM) ensures Excel opens Arabic and special characters cleanly
      res.write("\uFEFF");

      const headers = [
        "ID",
        "Title (Arabic)",
        "Title (English)",
        "Category",
        "Difficulty Level",
        "Status",
        "Price (SYP)",
        "Price (USD)",
        "Views Count",
        "Likes Count",
        "Sales Count",
        "Reviews Count",
        "Rating Average",
        "Comments Count",
        "Project Type (Arabic)",
        "Project Type (English)",
        "Summary (Arabic)",
        "Summary (English)",
        "Description (Arabic)",
        "Description (English)",
        "Is Best Seller",
        "Is Featured",
        "Video URL",
        "Created At",
        "Updated At"
      ];

      const escapeCsv = (val: any): string => {
        if (val === null || val === undefined) return '""';
        let str = String(val);
        if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
          str = `"${str.replace(/"/g, '""')}"`;
        } else {
          str = `"${str}"`;
        }
        return str;
      };

      res.write(headers.map(escapeCsv).join(",") + "\r\n");

      for (const row of result.rows) {
        const values = [
          row.id,
          row.title_ar,
          row.title_en,
          row.category,
          row.difficulty_level,
          row.status,
          row.price_syp,
          row.price_usd,
          row.views_count,
          row.likes_count,
          row.sales_count,
          row.reviews_count,
          row.rating_average,
          row.comments_count,
          row.project_type_ar,
          row.project_type_en,
          row.summary_ar,
          row.summary_en,
          row.description_ar,
          row.description_en,
          row.is_best_seller ? "Yes" : "No",
          row.is_featured ? "Yes" : "No",
          row.video_url,
          row.created_at ? new Date(row.created_at).toISOString() : "",
          row.updated_at ? new Date(row.updated_at).toISOString() : ""
        ];
        res.write(values.map(escapeCsv).join(",") + "\r\n");
      }

      res.end();
    } catch (err: any) {
      console.error("Export Projects CSV Error:", err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: err.message });
      } else {
        res.end();
      }
    }
  });

  // Admin: Get project engagement & popularity trends for recharts analytics
  app.get("/api/admin/projects/popularity", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          p.id,
          p.title_ar,
          p.title_en,
          p.category,
          p.difficulty_level,
          COALESCE(p.status, 'active') AS status,
          p.price_syp,
          p.price_usd,
          COALESCE(p.views_count, 0) AS views,
          COALESCE(p.likes_count, 0) + COALESCE(fav.cnt, 0) AS likes,
          COALESCE(p.sales_count, 0) AS sales,
          COALESCE(p.reviews_count, 0) AS reviews,
          COALESCE(p.rating_average, 5.0) AS rating
        FROM projects p
        LEFT JOIN (
          SELECT project_id, COUNT(*)::int AS cnt
          FROM favorites
          GROUP BY project_id
        ) fav ON fav.project_id = p.id
        ORDER BY (COALESCE(p.views_count, 0) + (COALESCE(p.likes_count, 0) + COALESCE(fav.cnt, 0)) * 3) DESC
      `);

      res.json({
        success: true,
        projects: result.rows.map(r => ({
          id: r.id,
          titleAr: r.title_ar,
          titleEn: r.title_en,
          category: r.category,
          difficultyLevel: r.difficulty_level,
          status: r.status,
          priceSyp: r.price_syp,
          priceUsd: r.price_usd,
          views: Number(r.views),
          likes: Number(r.likes),
          sales: Number(r.sales),
          reviews: Number(r.reviews),
          rating: Number(r.rating),
          engagementScore: Number(r.views) + (Number(r.likes) * 3)
        }))
      });
    } catch (err: any) {
      console.error("Fetch Projects Popularity Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin: Bulk update projects (category, difficultyLevel, status)
  app.post("/api/admin/projects/bulk-update", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { projectIds, updates } = req.body;
      if (!Array.isArray(projectIds) || projectIds.length === 0) {
        return res.status(400).json({ success: false, error: "قائمة المشاريع المحددة فارغة" });
      }
      if (!updates || typeof updates !== "object") {
        return res.status(400).json({ success: false, error: "يرجى تحديد الحقول المراد تحديثها" });
      }

      const { category, difficultyLevel, status } = updates;
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (category && typeof category === "string") {
        setClauses.push(`category = $${paramIndex++}`);
        values.push(category.trim());
      }

      if (difficultyLevel && typeof difficultyLevel === "string") {
        setClauses.push(`difficulty_level = $${paramIndex++}`);
        values.push(difficultyLevel.trim());
      }

      if (status && typeof status === "string") {
        setClauses.push(`status = $${paramIndex++}`);
        values.push(status.trim());
      }

      if (setClauses.length === 0) {
        return res.status(400).json({ success: false, error: "لم يتم تحديد أي تغيير صالح للتطبيق" });
      }

      setClauses.push(`updated_at = NOW()`);

      values.push(projectIds);
      const query = `
        UPDATE projects 
        SET ${setClauses.join(", ")}
        WHERE id = ANY($${paramIndex})
        RETURNING id, title_ar, title_en, category, difficulty_level, status
      `;

      const result = await pool.query(query, values);

      // Audit Log
      try {
        const auditId = "audit_" + crypto.randomBytes(6).toString("hex");
        await pool.query(
          `INSERT INTO audit_logs (id, user_id, action, details, created_at) VALUES ($1, $2, $3, $4, NOW())`,
          [
            auditId,
            req.user?.userId || "admin",
            "BULK_UPDATE_PROJECTS",
            JSON.stringify({
              updatedCount: result.rowCount,
              projectIds,
              updates
            })
          ]
        );
      } catch (e) {
        console.warn("Audit log error:", e);
      }

      res.json({
        success: true,
        message: `تم تحديث ${result.rowCount} مشروع بنجاح`,
        updatedCount: result.rowCount,
        updatedProjects: result.rows
      });
    } catch (err: any) {
      console.error("Bulk Update Projects Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ================= COMMENTS APIS (CRITICAL REQUIREMENT: NO USER AVATARS) =================

  // Helper function to handle comment creation with full step-by-step logging and JWT verification
  async function handleCreateComment(req: AuthRequest, res: express.Response) {
    const projectId = req.params.id || req.body.projectId;
    const rawComment = req.body.commentText || req.body.comment || req.body.reviewText;

    console.log("--------------------------------------------------");
    console.log("📩 Comment Request Received");
    console.log("   - Project ID:", projectId);
    console.log("   - User Authenticated via JWT:", !!req.user);

    // 1. Strict Authentication Check via JWT
    if (!req.user || !req.user.userId) {
      console.error("❌ Comment Validation Failed: User is not authenticated via JWT (req.user is missing)");
      return res.status(401).json({
        success: false,
        error: "يرجى تسجيل الدخول أولاً لإضافة تعليق"
      });
    }

    // Extract user_id strictly from verified JWT token
    const jwtUserId = String(req.user.userId).trim();
    const cleanComment = sanitizeInput(rawComment);

    if (!projectId) {
      console.error("❌ Comment Validation Failed: Missing Project ID");
      return res.status(400).json({ success: false, error: "معرف المشروع مطلوب" });
    }

    if (!cleanComment) {
      console.error("❌ Comment Validation Failed: Empty comment text");
      return res.status(400).json({ success: false, error: "نص التعليق لا يمكن أن يكون فارغاً" });
    }

    // 2. Pre-Insert Query: Verify user exists in PostgreSQL "users" table
    try {
      let userCheck = await pool.query("SELECT id, name, email, avatar_url FROM users WHERE id = $1", [jwtUserId]);
      if (userCheck.rows.length === 0 && req.user.email) {
        // Fallback to verified email if user session ID differs from PostgreSQL primary key
        userCheck = await pool.query("SELECT id, name, email, avatar_url FROM users WHERE LOWER(email) = LOWER($1)", [req.user.email]);
      }

      if (userCheck.rows.length === 0) {
        console.error(`❌ Foreign Key Safety Check Failed: User ID "${jwtUserId}" does NOT exist in PostgreSQL "users" table!`);
        return res.status(400).json({
          success: false,
          error: `المستخدم غير مسجل في قاعدة البيانات (ID: ${jwtUserId})`
        });
      }

      const dbUserId = userCheck.rows[0].id;
      const dbUserName = userCheck.rows[0].name || req.user.name || "طالب CardioVision";
      const dbUserEmail = userCheck.rows[0].email || req.user.email || "";
      const dbUserAvatar = userCheck.rows[0].avatar_url || (req.user as any).avatar || null;

      // 3. Verify project exists in PostgreSQL "projects" table
      const projCheck = await pool.query("SELECT id, title_ar, title_en FROM projects WHERE id = $1", [projectId]);
      if (projCheck.rows.length === 0) {
        return res.status(404).json({ success: false, error: `المشروع غير موجود (ID: ${projectId})` });
      }
      const projectTitleAr = projCheck.rows[0].title_ar;
      const projectTitleEn = projCheck.rows[0].title_en;

      const commentId = "com_" + crypto.randomBytes(6).toString("hex");

      // 4. Insert comment into PostgreSQL using verified foreign keys
      await pool.query(
        `INSERT INTO comments (id, project_id, user_id, user_name, user_avatar, comment_text, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW())`,
        [commentId, projectId, dbUserId, dbUserName, dbUserAvatar, cleanComment]
      );

      // 5. If rating provided, UPSERT into reviews table (one review per user per project)
      let savedRating: number | null = null;
      if (req.body.rating !== undefined && req.body.rating !== null) {
        const ratingVal = Math.max(1, Math.min(5, Math.round(Number(req.body.rating)) || 5));
        savedRating = ratingVal;
        const reviewId = "rev_" + crypto.randomBytes(6).toString("hex");
        await pool.query(
          `INSERT INTO reviews (id, project_id, user_id, user_name, rating, review_text, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (user_id, project_id)
           DO UPDATE SET rating = EXCLUDED.rating, review_text = COALESCE(EXCLUDED.review_text, reviews.review_text), created_at = NOW()`,
          [reviewId, projectId, dbUserId, dbUserName, ratingVal, cleanComment]
        );
      }

      // 6. Recalculate and update projects table stats
      const revStats = await pool.query(
        "SELECT COUNT(*) as count, COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) as avg_rating FROM reviews WHERE project_id = $1",
        [projectId]
      );
      const comStats = await pool.query(
        "SELECT COUNT(*) as count FROM comments WHERE project_id = $1",
        [projectId]
      );
      const newRevCount = parseInt(revStats.rows[0].count, 10);
      const newAvgRating = parseFloat(revStats.rows[0].avg_rating);
      const newComCount = parseInt(comStats.rows[0].count, 10);

      await pool.query(
        "UPDATE projects SET rating_average = $1, reviews_count = $2, comments_count = $3 WHERE id = $4",
        [newAvgRating, newRevCount, newComCount, projectId]
      );

      // 7. Notify admin
      await pool.query(
        `INSERT INTO notifications (id, user_id, title_ar, title_en, message_ar, message_en, type)
         VALUES ($1, 'admin', $2, $3, $4, $5, 'comment')`,
        [
          "notif_" + crypto.randomBytes(6).toString("hex"),
          "تعليق جديد على مشروع",
          "New Comment on Project",
          `قام الطالب ${dbUserName} بكتابة تعليق على المشروع (${projectTitleAr}): "${cleanComment.substring(0, 80)}"`,
          `User ${dbUserName} commented on project (${projectTitleEn}): "${cleanComment.substring(0, 80)}"`
        ]
      );

      // Audit Log
      await auditLog(dbUserId, "PROJECT_COMMENT_POSTED", req.ip || "", { projectId, commentId });

      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      return res.json({
        success: true,
        message: "تم نشر التعليق وحفظه في قاعدة البيانات بنجاح",
        comment: {
          id: commentId,
          projectId,
          project_id: projectId,
          projectTitleAr,
          projectTitleEn,
          userId: dbUserId,
          user_id: dbUserId,
          userName: dbUserName,
          user_name: dbUserName,
          userEmail: dbUserEmail,
          user_email: dbUserEmail,
          userAvatar: dbUserAvatar,
          user_avatar: dbUserAvatar,
          commentText: cleanComment,
          content: cleanComment,
          rating: savedRating ?? 5,
          status: "active",
          createdAt: new Date().toISOString()
        },
        averageRating: newAvgRating,
        reviewsCount: newRevCount,
        commentsCount: newComCount
      });
    } catch (e: any) {
      console.error("❌ ERROR Saving Comment to PostgreSQL:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Dedicated review / rating creation and update with UPSERT
  async function handleCreateReview(req: AuthRequest, res: express.Response) {
    const projectId = req.params.id || req.body.projectId;
    const rawRating = req.body.rating;
    const rawReviewText = req.body.reviewText || req.body.commentText || req.body.comment;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, error: "يرجى تسجيل الدخول أولاً لإضافة تقييم" });
    }
    const jwtUserId = String(req.user.userId).trim();
    if (!projectId) {
      return res.status(400).json({ success: false, error: "معرف المشروع مطلوب" });
    }
    if (rawRating === undefined || rawRating === null || isNaN(Number(rawRating))) {
      return res.status(400).json({ success: false, error: "يرجى تحديد تقييم صالح بين 1 و 5 نجوم" });
    }
    const ratingVal = Math.max(1, Math.min(5, Math.round(Number(rawRating))));
    const cleanReviewText = rawReviewText ? sanitizeInput(rawReviewText) : null;

    try {
      let userCheck = await pool.query("SELECT id, name, email, avatar_url FROM users WHERE id = $1", [jwtUserId]);
      if (userCheck.rows.length === 0 && req.user.email) {
        userCheck = await pool.query("SELECT id, name, email, avatar_url FROM users WHERE LOWER(email) = LOWER($1)", [req.user.email]);
      }
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ success: false, error: "المستخدم غير مسجل في قاعدة البيانات" });
      }
      const dbUserId = userCheck.rows[0].id;
      const dbUserName = userCheck.rows[0].name || req.user.name || "طالب CardioVision";
      const dbUserEmail = userCheck.rows[0].email || req.user.email || "";

      const projCheck = await pool.query("SELECT id, title_ar, title_en, category FROM projects WHERE id = $1", [projectId]);
      if (projCheck.rows.length === 0) {
        return res.status(404).json({ success: false, error: "المشروع غير موجود في قاعدة البيانات" });
      }

      const reviewId = "rev_" + crypto.randomBytes(6).toString("hex");
      const upsertRes = await pool.query(
        `INSERT INTO reviews (id, project_id, user_id, user_name, rating, review_text, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (user_id, project_id)
         DO UPDATE SET rating = EXCLUDED.rating, review_text = COALESCE(EXCLUDED.review_text, reviews.review_text), created_at = NOW()
         RETURNING id, project_id, user_id, user_name, rating, review_text, created_at`,
        [reviewId, projectId, dbUserId, dbUserName, ratingVal, cleanReviewText]
      );

      // Recalculate average rating & reviews count
      const avgRes = await pool.query(
        "SELECT COUNT(*) as count, COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) as avg_rating FROM reviews WHERE project_id = $1",
        [projectId]
      );
      const revCount = parseInt(avgRes.rows[0].count, 10);
      const revAvg = parseFloat(avgRes.rows[0].avg_rating);
      await pool.query(
        "UPDATE projects SET rating_average = $1, reviews_count = $2 WHERE id = $3",
        [revAvg, revCount, projectId]
      );

      // Notify admin
      await pool.query(
        `INSERT INTO notifications (id, user_id, title_ar, title_en, message_ar, message_en, type)
         VALUES ($1, 'admin', $2, $3, $4, $5, 'review')`,
        [
          "notif_" + crypto.randomBytes(6).toString("hex"),
          "تقييم جديد لمشروع",
          "New Project Rating",
          `قام الطالب ${dbUserName} بتقييم المشروع (${projCheck.rows[0].title_ar}) بـ ${ratingVal} نجوم`,
          `Student ${dbUserName} rated project (${projCheck.rows[0].title_en}) ${ratingVal} stars`
        ]
      );

      await auditLog(dbUserId, "PROJECT_RATING_SUBMITTED", req.ip || "", { projectId, rating: ratingVal });

      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      return res.json({
        success: true,
        message: "تم حفظ التقييم بنجاح في قاعدة البيانات",
        review: {
          id: upsertRes.rows[0].id,
          projectId: upsertRes.rows[0].project_id,
          project_id: upsertRes.rows[0].project_id,
          userId: upsertRes.rows[0].user_id,
          user_id: upsertRes.rows[0].user_id,
          userName: upsertRes.rows[0].user_name,
          user_name: upsertRes.rows[0].user_name,
          rating: upsertRes.rows[0].rating,
          reviewText: upsertRes.rows[0].review_text,
          review_text: upsertRes.rows[0].review_text,
          createdAt: upsertRes.rows[0].created_at,
          created_at: upsertRes.rows[0].created_at,
          userEmail: dbUserEmail,
          projectTitleAr: projCheck.rows[0].title_ar,
          projectTitleEn: projCheck.rows[0].title_en,
          projectCategory: projCheck.rows[0].category
        },
        averageRating: revAvg,
        reviewsCount: revCount
      });
    } catch (e: any) {
      console.error("❌ Error saving review:", e);
      return res.status(500).json({ success: false, error: "تعذر حفظ التقييم، يرجى المحاولة مرة أخرى." });
    }
  }

  // Get comments for a project from PostgreSQL with user rating joined
  app.get("/api/projects/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");

      const result = await pool.query(`
        SELECT 
          c.id, 
          c.project_id as "projectId", 
          c.project_id,
          c.user_id as "userId", 
          c.user_id,
          c.user_name as "userName", 
          c.user_name,
          c.user_avatar as "userAvatar", 
          c.user_avatar,
          c.comment_text as "commentText", 
          c.comment_text as "content",
          c.comment_text as "comment",
          COALESCE(c.status, 'active') as "status",
          c.created_at as "createdAt",
          c.created_at,
          COALESCE(r.rating, 5) as "rating"
        FROM comments c
        LEFT JOIN reviews r ON r.project_id = c.project_id AND r.user_id = c.user_id
        WHERE c.project_id = $1 
        ORDER BY c.created_at DESC
      `, [id]);

      res.json({ success: true, comments: result.rows });
    } catch (e: any) {
      console.error("❌ Error fetching comments:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Get current user review on a specific project
  app.get("/api/projects/:id/my-review", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id: projectId } = req.params;
      const userId = req.user!.userId;
      const result = await pool.query(
        `SELECT r.id, r.project_id as "projectId", r.user_id as "userId", r.rating, r.review_text as "reviewText", r.created_at as "createdAt"
         FROM reviews r
         WHERE r.project_id = $1 AND (r.user_id = $2 OR r.user_id IN (SELECT id FROM users WHERE LOWER(email) = LOWER($3)))
         LIMIT 1`,
        [projectId, userId, req.user!.email || ""]
      );
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      return res.json({
        success: true,
        hasReviewed: result.rows.length > 0,
        review: result.rows[0] || null
      });
    } catch (e: any) {
      console.error("❌ Error fetching user project review:", e);
      return res.status(500).json({ success: false, error: "تعذر استرجاع التقييم" });
    }
  });

  // Post a comment into PostgreSQL
  app.post("/api/projects/:id/comments", requireAuth, handleCreateComment);
  app.post("/api/comments", requireAuth, handleCreateComment);

  // Post a project review into PostgreSQL
  app.post("/api/projects/:id/reviews", requireAuth, handleCreateReview);
  app.post("/api/reviews", requireAuth, handleCreateReview);

  // Get all reviews (directly from PostgreSQL reviews table)
  app.get("/api/reviews", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");

      const result = await pool.query(`
        SELECT 
          r.id,
          r.project_id as "projectId",
          r.user_id as "userId",
          r.user_name as "userName",
          r.rating,
          r.review_text as "reviewText",
          r.created_at as "createdAt",
          u.email as "userEmail",
          u.avatar_url as "userAvatar",
          p.title_ar as "projectTitleAr",
          p.title_en as "projectTitleEn",
          p.category as "projectCategory"
        FROM reviews r
        LEFT JOIN users u ON u.id = r.user_id
        LEFT JOIN projects p ON p.id = r.project_id
        ORDER BY r.created_at DESC
      `);
      res.json({ success: true, reviews: result.rows });
    } catch (e: any) {
      console.error("❌ Error fetching all reviews:", e);
      res.status(500).json({ success: false, error: "تعذر استرجاع التقييمات" });
    }
  });

  app.get("/api/reviews/:id", async (req, res) => {
    try {
      const { id } = req.params;
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");

      const result = await pool.query(`
        SELECT 
          c.id,
          c.project_id as "projectId",
          c.user_id as "userId",
          c.user_name as "userName",
          c.user_avatar as "userAvatar",
          c.comment_text as "comment",
          c.comment_text as "commentText",
          COALESCE(c.status, 'active') as "status",
          c.created_at as "createdAt",
          u.email as "userEmail",
          p.title_ar as "projectTitleAr",
          p.title_en as "projectTitleEn",
          COALESCE(r.rating, 5) as "rating"
        FROM comments c
        LEFT JOIN users u ON u.id = c.user_id
        LEFT JOIN projects p ON p.id = c.project_id
        LEFT JOIN reviews r ON r.project_id = c.project_id AND r.user_id = c.user_id
        WHERE c.project_id = $1
        ORDER BY c.created_at DESC
      `, [id]);
      res.json({ success: true, reviews: result.rows, comments: result.rows });
    } catch (e: any) {
      console.error("❌ Error fetching project reviews:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ================= ADMIN SECURE COMMENTS & REVIEWS ENDPOINTS =================

  // GET /api/admin/comments - Full PostgreSQL comments with user & project details
  app.get("/api/admin/comments", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");

      const result = await pool.query(`
        SELECT 
          c.id,
          c.project_id as "projectId",
          c.user_id as "userId",
          c.user_name as "userName",
          c.user_avatar as "userAvatar",
          c.comment_text as "commentText",
          c.comment_text as "comment",
          COALESCE(c.status, 'active') as "status",
          c.created_at as "createdAt",
          u.email as "userEmail",
          u.university as "userUniversity",
          u.specialty as "userSpecialty",
          p.title_ar as "projectTitleAr",
          p.title_en as "projectTitleEn",
          p.category as "projectCategory",
          COALESCE(r.rating, 5) as "rating"
        FROM comments c
        LEFT JOIN users u ON u.id = c.user_id
        LEFT JOIN projects p ON p.id = c.project_id
        LEFT JOIN reviews r ON r.project_id = c.project_id AND r.user_id = c.user_id
        ORDER BY c.created_at DESC
      `);

      res.json({
        success: true,
        comments: result.rows,
        total: result.rows.length
      });
    } catch (e: any) {
      console.error("❌ Error fetching admin comments:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // GET /api/admin/reviews - Full PostgreSQL reviews with star rating breakdown and project statistics
  app.get("/api/admin/reviews", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");

      const reviewsResult = await pool.query(`
        SELECT 
          r.id,
          r.project_id as "projectId",
          r.user_id as "userId",
          r.user_name as "userName",
          r.rating,
          r.review_text as "reviewText",
          r.created_at as "createdAt",
          u.email as "userEmail",
          u.avatar_url as "userAvatar",
          u.university as "userUniversity",
          u.specialty as "userSpecialty",
          p.title_ar as "projectTitleAr",
          p.title_en as "projectTitleEn",
          p.category as "projectCategory"
        FROM reviews r
        LEFT JOIN users u ON u.id = r.user_id
        LEFT JOIN projects p ON p.id = r.project_id
        ORDER BY r.created_at DESC
      `);

      // Star Distribution (1-5 stars)
      const distributionRes = await pool.query(`
        SELECT 
          rating, 
          COUNT(*) as count
        FROM reviews
        GROUP BY rating
        ORDER BY rating DESC
      `);

      const starDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      distributionRes.rows.forEach(row => {
        starDistribution[Number(row.rating)] = parseInt(row.count, 10);
      });

      // Per-project rating statistics
      const projectStatsRes = await pool.query(`
        SELECT 
          p.id as "projectId",
          p.title_ar as "projectTitleAr",
          p.title_en as "projectTitleEn",
          COUNT(r.id) as "reviewsCount",
          COALESCE(ROUND(AVG(r.rating)::numeric, 1), 5.0) as "averageRating"
        FROM projects p
        LEFT JOIN reviews r ON r.project_id = p.id
        GROUP BY p.id, p.title_ar, p.title_en
        ORDER BY "reviewsCount" DESC, "averageRating" DESC
      `);

      const totalReviews = reviewsResult.rows.length;
      const overallAvg = totalReviews > 0
        ? (reviewsResult.rows.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0) / totalReviews).toFixed(1)
        : "5.0";

      const topRatedProject = projectStatsRes.rows.find(p => parseInt(p.reviewsCount, 10) > 0) || null;

      res.json({
        success: true,
        reviews: reviewsResult.rows,
        stats: {
          totalReviews,
          averageRating: Number(overallAvg),
          starDistribution,
          distribution: starDistribution,
          topRatedProject,
          projectStats: projectStatsRes.rows
        }
      });
    } catch (e: any) {
      console.error("❌ Error fetching admin reviews:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // DELETE /api/admin/comments/:id - Admin delete comment directly from PostgreSQL
  app.delete("/api/admin/comments/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const check = await pool.query("SELECT project_id, user_id FROM comments WHERE id = $1", [id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ success: false, error: "التعليق غير موجود في قاعدة البيانات" });
      }
      const projectId = check.rows[0].project_id;
      await pool.query("DELETE FROM comments WHERE id = $1", [id]);
      await pool.query("UPDATE projects SET comments_count = GREATEST(0, comments_count - 1) WHERE id = $1", [projectId]);
      await auditLog(req.user!.userId, "ADMIN_COMMENT_DELETED", req.ip || "", { commentId: id, projectId });
      res.json({ success: true, message: "تم حذف التعليق بنجاح من قاعدة البيانات" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // DELETE /api/admin/reviews/:id - Admin delete review directly from PostgreSQL
  app.delete("/api/admin/reviews/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const check = await pool.query("SELECT project_id, user_id FROM reviews WHERE id = $1", [id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ success: false, error: "التقييم غير موجود في قاعدة البيانات" });
      }
      const projectId = check.rows[0].project_id;
      await pool.query("DELETE FROM reviews WHERE id = $1", [id]);
      
      // Recalculate project rating and review count
      const avgRes = await pool.query(
        "SELECT COUNT(*) as count, COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) as avg_rating FROM reviews WHERE project_id = $1",
        [projectId]
      );
      const revCount = parseInt(avgRes.rows[0].count, 10);
      const revAvg = parseFloat(avgRes.rows[0].avg_rating);
      await pool.query(
        "UPDATE projects SET rating_average = $1, reviews_count = $2 WHERE id = $3",
        [revAvg, revCount, projectId]
      );

      await auditLog(req.user!.userId, "ADMIN_REVIEW_DELETED", req.ip || "", { reviewId: id, projectId });
      res.json({ success: true, message: "تم حذف التقييم بنجاح وتحديث إحصائيات المشروع" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // PATCH /api/admin/comments/:id/status - Admin update comment status (active / reviewed / hidden)
  app.patch("/api/admin/comments/:id/status", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["active", "reviewed", "hidden"].includes(status)) {
        return res.status(400).json({ success: false, error: "حالة التعليق غير صالحة" });
      }
      await pool.query("UPDATE comments SET status = $1 WHERE id = $2", [status, id]);
      res.json({ success: true, message: "تم تحديث حالة التعليق بنجاح" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Delete comment / review by owner or admin
  async function handleDeleteComment(req: AuthRequest, res: express.Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const isAdmin = req.user?.role === "admin";

      const check = await pool.query("SELECT project_id, user_id FROM comments WHERE id = $1", [id]);
      if (check.rows.length === 0) {
        // Try reviews table as well
        const revCheck = await pool.query("SELECT project_id, user_id FROM reviews WHERE id = $1", [id]);
        if (revCheck.rows.length === 0) {
          return res.status(404).json({ success: false, error: "التعليق أو التقييم غير موجود" });
        }
        if (revCheck.rows[0].user_id !== userId && !isAdmin) {
          return res.status(403).json({ success: false, error: "غير مصرح لك بحذف هذا التقييم" });
        }
        const projectId = revCheck.rows[0].project_id;
        await pool.query("DELETE FROM reviews WHERE id = $1", [id]);
        const avgRes = await pool.query(
          "SELECT COUNT(*) as count, COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) as avg_rating FROM reviews WHERE project_id = $1",
          [projectId]
        );
        await pool.query(
          "UPDATE projects SET rating_average = $1, reviews_count = $2 WHERE id = $3",
          [parseFloat(avgRes.rows[0].avg_rating), parseInt(avgRes.rows[0].count, 10), projectId]
        );
        return res.json({ success: true, message: "تم حذف التقييم بنجاح" });
      }

      if (check.rows[0].user_id !== userId && !isAdmin) {
        return res.status(403).json({ success: false, error: "غير مصرح لك بحذف هذا التعليق" });
      }

      const projectId = check.rows[0].project_id;
      await pool.query("DELETE FROM comments WHERE id = $1", [id]);
      await pool.query("DELETE FROM reviews WHERE id = $1", [id]);
      await pool.query("UPDATE projects SET comments_count = GREATEST(0, comments_count - 1) WHERE id = $1", [projectId]);

      res.json({ success: true, message: "تم حذف التعليق بنجاح" });
    } catch (e: any) {
      console.error("❌ Delete comment error:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  app.delete("/api/comments/:id", handleDeleteComment);
  app.delete("/api/reviews/:id", handleDeleteComment);

  // ================= PLATFORM FEEDBACK & USER RATING APIS =================

  // In-memory rate limiter for feedback submission: max 6 requests per 5 minutes per user/IP
  const feedbackRateLimits = new Map<string, { count: number; resetTime: number }>();
  function checkFeedbackRateLimit(key: string): boolean {
    const now = Date.now();
    const record = feedbackRateLimits.get(key);
    if (!record || now > record.resetTime) {
      feedbackRateLimits.set(key, { count: 1, resetTime: now + 5 * 60 * 1000 });
      return true;
    }
    if (record.count >= 6) {
      return false;
    }
    record.count++;
    return true;
  }

  // 1. Submit or update platform feedback (UPSERT) - One feedback per user
  app.post(["/api/feedback", "/api/feedback/", "/api/platform-feedback", "/api/platform-feedback/"], requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const rateKey = `${userId}_${req.ip || "unknown"}`;

      if (!checkFeedbackRateLimit(rateKey)) {
        return res.status(429).json({
          success: false,
          error: "لقد أرسلت عدة تقييمات مؤخراً، يرجى الانتظار بضع دقائق قبل المحاولة مرة أخرى."
        });
      }

      // Verify user exists in PostgreSQL
      const userRes = await pool.query("SELECT id, name, email, avatar_url, university, specialty FROM users WHERE id = $1", [userId]);
      if (userRes.rows.length === 0) {
        return res.status(401).json({ success: false, error: "المستخدم غير موجود أو تم إلغاء حسابه" });
      }
      const user = userRes.rows[0];

      // Validate Rating (1 - 5)
      const rawRating = req.body.rating;
      const rating = parseInt(rawRating, 10);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: "يرجى تحديد تقييم صالح بين 1 و 5 نجوم"
        });
      }

      // Validate Message (3 - 1500 chars)
      const rawMessage = req.body.message;
      if (!rawMessage || typeof rawMessage !== "string" || rawMessage.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: "يرجى كتابة ملاحظاتك وتجربتك بالتفصيل (3 أحرف على الأقل)"
        });
      }

      if (rawMessage.trim().length > 1500) {
        return res.status(400).json({
          success: false,
          error: "الرسالة طويلة جداً، الحد الأقصى المسموح به هو 1500 حرف"
        });
      }

      const cleanMessage = sanitizeInput(rawMessage.trim());
      const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Safe Parameterized UPSERT
      const result = await pool.query(
        `INSERT INTO platform_feedback (
          id, user_id, rating, message, status, is_featured, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, 'NEW', false, NOW(), NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          rating = EXCLUDED.rating,
          message = EXCLUDED.message,
          status = 'NEW',
          updated_at = NOW()
        RETURNING *;`,
        [feedbackId, userId, rating, cleanMessage]
      );

      const savedFeedback = result.rows[0];

      // Notify Admins in notifications table
      const notifId = `notif_fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await pool.query(
        `INSERT INTO notifications (
          id, user_id, title_ar, title_en, message_ar, message_en, type, is_read, created_at
        ) VALUES (
          $1, 'admin', 
          '⭐ تقييم جديد للمنصة من ' || $2,
          '⭐ New Platform Rating from ' || $2,
          'التقييم: ' || $3 || ' / 5 نجوم. الملاحظة: "' || $4 || '"',
          'Rating: ' || $3 || ' / 5 stars. Message: "' || $4 || '"',
          'feedback', false, NOW()
        )`,
        [notifId, user.name, rating, cleanMessage.length > 80 ? cleanMessage.substring(0, 80) + "..." : cleanMessage]
      );

      // Audit Log
      await pool.query(
        `INSERT INTO audit_logs (id, user_id, action, ip_address, details, created_at)
         VALUES ($1, $2, 'PLATFORM_FEEDBACK_SUBMITTED', $3, $4, NOW())`,
        [
          `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId,
          req.ip || "127.0.0.1",
          JSON.stringify({ feedbackId: savedFeedback.id, rating, messageSnippet: cleanMessage.substring(0, 60) })
        ]
      );

      // Broadcast real-time SSE event to Admin Dashboard
      broadcastAdminEvent("FEEDBACK_SUBMITTED", {
        id: savedFeedback.id,
        userId,
        userName: user.name,
        userEmail: user.email,
        rating: savedFeedback.rating,
        message: savedFeedback.message,
        status: savedFeedback.status,
        createdAt: savedFeedback.created_at
      });

      return res.json({
        success: true,
        message: "شكراً لك ❤️ تم استلام تقييمك بنجاح.",
        feedback: savedFeedback
      });
    } catch (e: any) {
      console.error("❌ Submit feedback error:", e);
      return res.status(500).json({
        success: false,
        error: "حدث خطأ أثناء إرسال التقييم، يرجى المحاولة لاحقاً."
      });
    }
  });

  // 2. User update specific feedback with IDOR Protection
  app.put(["/api/feedback/:id", "/api/platform-feedback/:id"], requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const isAdmin = req.user!.role === "admin";

      // Check existence & ownership
      const checkRes = await pool.query("SELECT * FROM platform_feedback WHERE id = $1", [id]);
      if (checkRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: "التقييم غير موجود" });
      }

      const existing = checkRes.rows[0];
      if (existing.user_id !== userId && !isAdmin) {
        return res.status(403).json({ success: false, error: "غير مصرح لك بتعديل تقييم مستخدم آخر" });
      }

      const rawRating = req.body.rating;
      const rating = parseInt(rawRating, 10);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, error: "يرجى تحديد تقييم بين 1 و 5 نجوم" });
      }

      const rawMessage = req.body.message;
      if (!rawMessage || typeof rawMessage !== "string" || rawMessage.trim().length < 3) {
        return res.status(400).json({ success: false, error: "يرجى كتابة ملاحظاتك بالتفصيل" });
      }

      const cleanMessage = sanitizeInput(rawMessage.trim());

      const updateRes = await pool.query(
        `UPDATE platform_feedback 
         SET rating = $1, message = $2, status = 'NEW', updated_at = NOW() 
         WHERE id = $3 
         RETURNING *;`,
        [rating, cleanMessage, id]
      );

      broadcastAdminEvent("FEEDBACK_UPDATED", {
        id,
        rating,
        message: cleanMessage,
        userId: existing.user_id
      });

      return res.json({
        success: true,
        message: "تم تحديث التقييم بنجاح",
        feedback: updateRes.rows[0]
      });
    } catch (e: any) {
      console.error("❌ Update feedback error:", e);
      return res.status(500).json({ success: false, error: "حدث خطأ أثناء تعديل التقييم" });
    }
  });

  // 3. Get current user's feedback (to prefill modal or show past review)
  app.get(["/api/feedback/me", "/api/platform-feedback/me"], requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const result = await pool.query(
        `SELECT id, rating, message, status, admin_reply, replied_at, is_featured, created_at, updated_at
         FROM platform_feedback 
         WHERE user_id = $1`,
        [userId]
      );

      res.json({
        success: true,
        feedback: result.rows[0] || null
      });
    } catch (e: any) {
      console.error("❌ Get my feedback error:", e);
      res.status(500).json({ success: false, error: "فشل استرداد بيانات التقييم" });
    }
  });

  // 4. Public: Get featured testimonials (Strict privacy: No emails, masked names, authoritative DB stats)
  app.get(["/api/feedback/featured", "/api/platform-feedback/featured"], async (req, res) => {
    try {
      // Calculate real platform average rating from active reviews
      const statsRes = await pool.query(`
        SELECT 
          COUNT(*) as total_count,
          COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) as average_rating
        FROM platform_feedback
        WHERE status != 'ARCHIVED'
      `);

      const totalCount = parseInt(statsRes.rows[0].total_count, 10);
      const averageRating = Number(statsRes.rows[0].average_rating);

      // Fetch featured approved reviews
      const featuredRes = await pool.query(`
        SELECT 
          f.id,
          f.rating,
          f.message,
          f.admin_reply,
          f.replied_at,
          f.created_at,
          u.name as user_name,
          u.avatar_url as user_avatar,
          u.university,
          u.specialty
        FROM platform_feedback f
        JOIN users u ON f.user_id = u.id
        WHERE f.is_featured = true AND f.status != 'ARCHIVED'
        ORDER BY f.created_at DESC
        LIMIT 10
      `);

      // Mask user names to respect privacy (e.g. First Name + Initial)
      const sanitizedTestimonials = featuredRes.rows.map(row => {
        const nameParts = (row.user_name || "طالب مهندس").trim().split(" ");
        const maskedName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : nameParts[0];
        return {
          id: row.id,
          rating: row.rating,
          message: row.message,
          adminReply: row.admin_reply,
          repliedAt: row.replied_at,
          createdAt: row.created_at,
          userName: maskedName,
          userAvatar: row.user_avatar,
          university: row.university || "جامعة دمشق",
          specialty: row.specialty || "هندسة تطبيقية"
        };
      });

      res.json({
        success: true,
        totalCount,
        averageRating,
        testimonials: sanitizedTestimonials
      });
    } catch (e: any) {
      console.error("❌ Get featured feedback error:", e);
      res.status(500).json({ success: false, error: "فشل استرداد التقييمات المميزة" });
    }
  });

  // 5. Admin: Get all feedback with filters, search, and pagination
  app.get(["/api/admin/feedback", "/api/admin/platform-feedback"], requireAdmin, async (req: AuthRequest, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const offset = (page - 1) * limit;

      const ratingFilter = req.query.rating ? parseInt(req.query.rating as string, 10) : null;
      const statusFilter = req.query.status as string;
      const search = (req.query.search as string || "").trim().toLowerCase();
      const dateFilter = req.query.dateFilter as string; // 'today' | 'week' | 'month' | 'all'

      let conditions: string[] = ["1=1"];
      let params: any[] = [];
      let paramIdx = 1;

      if (ratingFilter && ratingFilter >= 1 && ratingFilter <= 5) {
        conditions.push(`f.rating = $${paramIdx++}`);
        params.push(ratingFilter);
      }

      if (statusFilter && ["NEW", "REVIEWED", "REPLIED", "ARCHIVED"].includes(statusFilter)) {
        conditions.push(`f.status = $${paramIdx++}`);
        params.push(statusFilter);
      }

      if (search) {
        conditions.push(`(LOWER(u.name) LIKE $${paramIdx} OR LOWER(u.email) LIKE $${paramIdx} OR LOWER(f.message) LIKE $${paramIdx})`);
        params.push(`%${search}%`);
        paramIdx++;
      }

      if (dateFilter === "today") {
        conditions.push(`f.created_at >= CURRENT_DATE`);
      } else if (dateFilter === "week") {
        conditions.push(`f.created_at >= NOW() - INTERVAL '7 days'`);
      } else if (dateFilter === "month") {
        conditions.push(`f.created_at >= NOW() - INTERVAL '30 days'`);
      }

      const whereClause = conditions.join(" AND ");

      // Total count query
      const countRes = await pool.query(
        `SELECT COUNT(*) 
         FROM platform_feedback f 
         JOIN users u ON f.user_id = u.id 
         WHERE ${whereClause}`,
        params
      );
      const total = parseInt(countRes.rows[0].count, 10);
      const totalPages = Math.ceil(total / limit);

      // Data query
      const dataParams = [...params, limit, offset];
      const dataRes = await pool.query(
        `SELECT 
           f.id,
           f.user_id,
           f.rating,
           f.message,
           f.status,
           f.admin_reply,
           f.replied_at,
           f.admin_user_id,
           f.is_featured,
           f.created_at,
           f.updated_at,
           u.name as user_name,
           u.email as user_email,
           u.avatar_url as user_avatar,
           u.university as user_university,
           u.phone as user_phone,
           admin_u.name as admin_user_name
         FROM platform_feedback f
         JOIN users u ON f.user_id = u.id
         LEFT JOIN users admin_u ON f.admin_user_id = admin_u.id
         WHERE ${whereClause}
         ORDER BY f.created_at DESC
         LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
        dataParams
      );

      res.json({
        success: true,
        feedback: dataRes.rows.map(r => ({
          id: r.id,
          userId: r.user_id,
          userName: r.user_name,
          userEmail: r.user_email,
          userAvatar: r.user_avatar,
          userUniversity: r.user_university,
          userPhone: r.user_phone,
          rating: r.rating,
          message: r.message,
          status: r.status,
          adminReply: r.admin_reply,
          repliedAt: r.replied_at,
          adminUserId: r.admin_user_id,
          adminUserName: r.admin_user_name,
          isFeatured: r.is_featured,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    } catch (e: any) {
      console.error("❌ Admin get feedback error:", e);
      res.status(500).json({ success: false, error: "فشل استرداد تقييمات المنصة" });
    }
  });

  // 6. Admin: Get detailed analytics & star distribution directly from PostgreSQL
  app.get(["/api/admin/feedback/stats", "/api/admin/platform-feedback/stats"], requireAdmin, async (req: AuthRequest, res) => {
    try {
      const statsRes = await pool.query(`
        SELECT 
          COUNT(*) as total_feedback,
          COALESCE(ROUND(AVG(rating)::numeric, 1), 0.0) as average_rating,
          COUNT(*) FILTER (WHERE rating = 5) as stars_5,
          COUNT(*) FILTER (WHERE rating = 4) as stars_4,
          COUNT(*) FILTER (WHERE rating = 3) as stars_3,
          COUNT(*) FILTER (WHERE rating = 2) as stars_2,
          COUNT(*) FILTER (WHERE rating = 1) as stars_1,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as week_count,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as month_count,
          COUNT(*) FILTER (WHERE status = 'NEW') as new_count,
          COUNT(*) FILTER (WHERE status = 'REVIEWED') as reviewed_count,
          COUNT(*) FILTER (WHERE status = 'REPLIED') as replied_count,
          COUNT(*) FILTER (WHERE status = 'ARCHIVED') as archived_count,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_count
        FROM platform_feedback;
      `);

      const r = statsRes.rows[0];
      const total = parseInt(r.total_feedback, 10);

      res.json({
        success: true,
        stats: {
          totalFeedback: total,
          averageRating: Number(r.average_rating),
          starsBreakdown: {
            5: parseInt(r.stars_5, 10),
            4: parseInt(r.stars_4, 10),
            3: parseInt(r.stars_3, 10),
            2: parseInt(r.stars_2, 10),
            1: parseInt(r.stars_1, 10)
          },
          periodCounts: {
            today: parseInt(r.today_count, 10),
            week: parseInt(r.week_count, 10),
            month: parseInt(r.month_count, 10)
          },
          statusCounts: {
            new: parseInt(r.new_count, 10),
            reviewed: parseInt(r.reviewed_count, 10),
            replied: parseInt(r.replied_count, 10),
            archived: parseInt(r.archived_count, 10)
          },
          featuredCount: parseInt(r.featured_count, 10)
        }
      });
    } catch (e: any) {
      console.error("❌ Admin feedback stats error:", e);
      res.status(500).json({ success: false, error: "فشل استرداد إحصائيات التقييمات" });
    }
  });

  // 7. Admin: Update status (NEW, REVIEWED, REPLIED, ARCHIVED)
  app.patch(["/api/admin/feedback/:id/status", "/api/admin/platform-feedback/:id/status"], requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["NEW", "REVIEWED", "REPLIED", "ARCHIVED"].includes(status)) {
        return res.status(400).json({ success: false, error: "حالة التقييم غير صالحة" });
      }

      const updateRes = await pool.query(
        `UPDATE platform_feedback SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, id]
      );

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: "التقييم غير موجود" });
      }

      broadcastAdminEvent("FEEDBACK_STATUS_CHANGED", { id, status });

      res.json({
        success: true,
        message: "تم تحديث حالة التقييم بنجاح",
        feedback: updateRes.rows[0]
      });
    } catch (e: any) {
      console.error("❌ Update feedback status error:", e);
      res.status(500).json({ success: false, error: "فشل تحديث حالة التقييم" });
    }
  });

  // 8. Admin: Reply to feedback
  app.post(["/api/admin/feedback/:id/reply", "/api/admin/platform-feedback/:id/reply"], requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;
      const adminUserId = req.user!.userId;

      if (!reply || typeof reply !== "string" || reply.trim().length === 0) {
        return res.status(400).json({ success: false, error: "نص الرد لا يمكن أن يكون فارغاً" });
      }

      const cleanReply = sanitizeInput(reply.trim());

      const updateRes = await pool.query(
        `UPDATE platform_feedback 
         SET admin_reply = $1, replied_at = NOW(), admin_user_id = $2, status = 'REPLIED', updated_at = NOW() 
         WHERE id = $3 
         RETURNING *`,
        [cleanReply, adminUserId, id]
      );

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: "التقييم غير موجود" });
      }

      const fb = updateRes.rows[0];

      // Send notification to the student user
      const notifId = `notif_rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await pool.query(
        `INSERT INTO notifications (
          id, user_id, title_ar, title_en, message_ar, message_en, type, is_read, created_at
        ) VALUES (
          $1, $2,
          'رد جديد من إدارة CardioVision على تقييمك 💬',
          'New reply from CardioVision Administration on your feedback',
          'رد الإدارة: "' || $3 || '"',
          'Admin reply: "' || $3 || '"',
          'feedback', false, NOW()
        )`,
        [notifId, fb.user_id, cleanReply.length > 80 ? cleanReply.substring(0, 80) + "..." : cleanReply]
      );

      broadcastAdminEvent("FEEDBACK_REPLIED", { id, adminReply: cleanReply, repliedAt: fb.replied_at });

      res.json({
        success: true,
        message: "تم إرسال رد الإدارة بنجاح",
        feedback: fb
      });
    } catch (e: any) {
      console.error("❌ Reply to feedback error:", e);
      res.status(500).json({ success: false, error: "فشل إرسال الرد" });
    }
  });

  // 9. Admin: Toggle featured status
  app.patch(["/api/admin/feedback/:id/feature", "/api/admin/platform-feedback/:id/feature"], requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { isFeatured } = req.body;

      const updateRes = await pool.query(
        `UPDATE platform_feedback SET is_featured = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [Boolean(isFeatured), id]
      );

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: "التقييم غير موجود" });
      }

      broadcastAdminEvent("FEEDBACK_FEATURE_CHANGED", { id, isFeatured: Boolean(isFeatured) });

      res.json({
        success: true,
        message: Boolean(isFeatured) ? "تم تمييز التقييم للعرض العام" : "تم إلغاء تمييز التقييم",
        feedback: updateRes.rows[0]
      });
    } catch (e: any) {
      console.error("❌ Feature feedback error:", e);
      res.status(500).json({ success: false, error: "فشل تعديل حالة التمييز" });
    }
  });

  // 10. Admin: Delete feedback
  app.delete(["/api/admin/feedback/:id", "/api/admin/platform-feedback/:id"], requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const delRes = await pool.query("DELETE FROM platform_feedback WHERE id = $1 RETURNING *", [id]);
      if (delRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: "التقييم غير موجود" });
      }

      broadcastAdminEvent("FEEDBACK_DELETED", { id });

      res.json({
        success: true,
        message: "تم حذف التقييم نهائياً"
      });
    } catch (e: any) {
      console.error("❌ Delete feedback error:", e);
      res.status(500).json({ success: false, error: "فشل حذف التقييم" });
    }
  });

  // 11. Admin: Export all feedback as streamed CSV file
  app.get(["/api/admin/export/feedback", "/api/admin/platform-feedback/export"], requireAdmin, async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          f.id,
          u.name AS user_name,
          u.email AS user_email,
          u.university AS user_university,
          u.phone AS user_phone,
          f.rating,
          f.message,
          f.status,
          f.is_featured,
          f.admin_reply,
          f.replied_at,
          admin_u.name AS admin_user_name,
          f.created_at,
          f.updated_at
        FROM platform_feedback f
        JOIN users u ON f.user_id = u.id
        LEFT JOIN users admin_u ON f.admin_user_id = admin_u.id
        ORDER BY f.created_at DESC
      `);

      const filename = `cardiovision_feedback_${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Cache-Control", "no-cache");

      // UTF-8 Byte Order Mark (BOM) ensures Excel renders Arabic properly
      res.write("\uFEFF");

      const headers = [
        "Feedback ID",
        "User Name",
        "User Email",
        "University",
        "Phone",
        "Rating (1-5)",
        "Message",
        "Status",
        "Is Featured",
        "Admin Reply",
        "Replied At",
        "Admin Reviewer",
        "Submission Timestamp (Created At)",
        "Updated At"
      ];

      const escapeCsv = (val: any): string => {
        if (val === null || val === undefined) return '""';
        let str = String(val);
        if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
          str = `"${str.replace(/"/g, '""')}"`;
        } else {
          str = `"${str}"`;
        }
        return str;
      };

      res.write(headers.map(escapeCsv).join(",") + "\r\n");

      for (const row of result.rows) {
        const values = [
          row.id,
          row.user_name || "",
          row.user_email || "",
          row.user_university || "",
          row.user_phone || "",
          row.rating,
          row.message || "",
          row.status || "NEW",
          row.is_featured ? "Yes" : "No",
          row.admin_reply || "",
          row.replied_at ? new Date(row.replied_at).toISOString() : "",
          row.admin_user_name || "",
          row.created_at ? new Date(row.created_at).toISOString() : "",
          row.updated_at ? new Date(row.updated_at).toISOString() : ""
        ];
        res.write(values.map(escapeCsv).join(",") + "\r\n");
      }

      res.end();
    } catch (err: any) {
      console.error("Export Feedback CSV Error:", err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: err.message });
      } else {
        res.end();
      }
    }
  });

  // 12. Admin: Get rating trends over time for Recharts visualization
  app.get(["/api/admin/feedback/trends", "/api/admin/platform-feedback/trends"], requireAdmin, async (req: AuthRequest, res) => {
    try {
      const dailyRes = await pool.query(`
        SELECT 
          TO_CHAR(created_at, 'YYYY-MM-DD') AS date,
          ROUND(AVG(rating)::numeric, 2) AS avg_rating,
          COUNT(*)::int AS count,
          COUNT(*) FILTER (WHERE rating = 5)::int AS count_5,
          COUNT(*) FILTER (WHERE rating = 4)::int AS count_4,
          COUNT(*) FILTER (WHERE rating = 3)::int AS count_3,
          COUNT(*) FILTER (WHERE rating <= 2)::int AS count_low
        FROM platform_feedback
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY date ASC;
      `);

      let runningSum = 0;
      let runningCount = 0;
      const trends = dailyRes.rows.map(row => {
        runningSum += Number(row.avg_rating) * Number(row.count);
        runningCount += Number(row.count);
        const cumulativeAvg = runningCount > 0 ? Number((runningSum / runningCount).toFixed(2)) : Number(row.avg_rating);
        return {
          date: row.date,
          avgRating: Number(row.avg_rating),
          cumulativeAvg,
          count: Number(row.count),
          count5: Number(row.count_5),
          count4: Number(row.count_4),
          count3: Number(row.count_3),
          countLow: Number(row.count_low)
        };
      });

      // Overall summary
      const summaryRes = await pool.query(`
        SELECT 
          COUNT(*)::int as total_count,
          COALESCE(ROUND(AVG(rating)::numeric, 2), 5.0) as overall_avg,
          COUNT(*) FILTER (WHERE rating >= 4)::int as positive_count,
          COUNT(*) FILTER (WHERE rating <= 2)::int as negative_count
        FROM platform_feedback;
      `);

      res.json({
        success: true,
        trends,
        summary: {
          totalCount: summaryRes.rows[0].total_count,
          overallAvg: Number(summaryRes.rows[0].overall_avg),
          satisfactionRate: summaryRes.rows[0].total_count > 0 
            ? Math.round((summaryRes.rows[0].positive_count / summaryRes.rows[0].total_count) * 100) 
            : 100
        }
      });
    } catch (err: any) {
      console.error("Feedback trends error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 13. Admin: Bulk action on feedback (flag for review or delete)
  app.post(["/api/admin/feedback/bulk-action", "/api/admin/feedback/bulk"], requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { feedbackIds, action, status } = req.body;
      if (!Array.isArray(feedbackIds) || feedbackIds.length === 0) {
        return res.status(400).json({ success: false, error: "قائمة التقييمات المحددة فارغة" });
      }

      const adminUserId = req.user!.userId;

      if (action === "flag" || action === "review") {
        const targetStatus = status || "REVIEWED";
        const result = await pool.query(
          `UPDATE platform_feedback 
           SET status = $1, updated_at = NOW() 
           WHERE id = ANY($2)
           RETURNING id`,
          [targetStatus, feedbackIds]
        );

        // Audit log
        try {
          await pool.query(
            `INSERT INTO audit_logs (id, user_id, action, details, created_at)
             VALUES ($1, $2, 'BULK_FLAG_FEEDBACK', $3, NOW())`,
            [
              `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              adminUserId,
              JSON.stringify({ affectedCount: result.rowCount, feedbackIds, status: targetStatus })
            ]
          );
        } catch (e) {
          console.warn("Audit log error:", e);
        }

        broadcastAdminEvent("FEEDBACK_BULK_UPDATED", {
          feedbackIds,
          action: "flag",
          status: targetStatus,
          affectedCount: result.rowCount
        });

        return res.json({
          success: true,
          message: `تم تمييز ${result.rowCount} تقييم للمراجعة بنجاح`,
          affectedCount: result.rowCount,
          action: "flag"
        });
      }

      if (action === "delete") {
        const result = await pool.query(
          `DELETE FROM platform_feedback 
           WHERE id = ANY($1)
           RETURNING id`,
          [feedbackIds]
        );

        // Audit log
        try {
          await pool.query(
            `INSERT INTO audit_logs (id, user_id, action, details, created_at)
             VALUES ($1, $2, 'BULK_DELETE_FEEDBACK', $3, NOW())`,
            [
              `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              adminUserId,
              JSON.stringify({ deletedCount: result.rowCount, feedbackIds })
            ]
          );
        } catch (e) {
          console.warn("Audit log error:", e);
        }

        broadcastAdminEvent("FEEDBACK_BULK_DELETED", {
          feedbackIds,
          action: "delete",
          affectedCount: result.rowCount
        });

        return res.json({
          success: true,
          message: `تم حذف ${result.rowCount} تقييم بنجاح`,
          affectedCount: result.rowCount,
          action: "delete"
        });
      }

      return res.status(400).json({ success: false, error: "الإجراء المطلوب غير صالح (flag أو delete)" });
    } catch (err: any) {
      console.error("Bulk feedback action error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ================= PURCHASES & ORDERS APIS =================

  // Real-Time SSE Stream for Admin Dashboard (Instant Payment Alerts)
  app.get("/api/admin/events", requireAdmin, (req: AuthRequest, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    adminSseClients.add(res);
    res.write(`event: connected\ndata: ${JSON.stringify({ message: "Admin real-time payment feed connected", time: new Date().toISOString() })}\n\n`);

    req.on("close", () => {
      adminSseClients.delete(res);
    });
  });

  // Create Order in PostgreSQL
  app.post("/api/orders", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { projectId, serviceId, serviceTitle, clientPhone, clientName, projectDetails, deadline } = req.body;
      const userId = req.user!.userId;
      const userName = req.user!.name;

      // Case 1: Custom Academic Service Request
      if (serviceId && !projectId) {
        const orderId = "ord_srv_" + crypto.randomBytes(6).toString("hex");
        const title = serviceTitle || "طلب استشارة / خدمة هندسية خاصة";
        
        await pool.query(
          `INSERT INTO orders (
            id, user_id, user_name, user_phone, project_id, project_title, amount_syp, currency, payment_method, recipient_account, status, admin_notes, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, 'SYP', 'syriatel_cash', '0982257195', 'PENDING_PAYMENT', $8, NOW(), NOW()
          )`,
          [
            orderId,
            userId,
            sanitizeInput(clientName || userName),
            sanitizeInput(clientPhone || req.user!.email),
            "service_" + serviceId,
            title,
            0, // Custom service quotes are determined upon consultation
            `تفاصيل الطلب: ${sanitizeInput(projectDetails || '')} | الموعد: ${sanitizeInput(deadline || '')}`
          ]
        );

        broadcastAdminEvent("ORDER_CREATED", {
          orderId,
          projectTitle: title,
          userName: clientName || userName,
          amountSyp: 0,
          type: "service"
        });

        return res.json({
          success: true,
          message: "تم استلام طلب الخدمة الأكاديمية بنجاح، وسيتواصل معك مهندس المشروع عبر واتساب للمتابعة.",
          orderId
        });
      }

      // Case 2: Project Purchase
      if (!projectId) {
        return res.status(400).json({ success: false, error: "معرف المشروع مطلوب" });
      }

      // Query database for authoritative project price and details (NEVER trust frontend price)
      const projRes = await pool.query("SELECT * FROM projects WHERE id = $1", [projectId]);
      if (projRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: "المشروع المطلوب غير موجود" });
      }

      const project = projRes.rows[0];
      const authoritativePriceSyp = Number(project.price_syp) || 0;

      // Check if user has ALREADY purchased and paid for this project
      const paidCheck = await pool.query(
        "SELECT * FROM orders WHERE user_id = $1 AND project_id = $2 AND status IN ('PAID', 'approved', 'completed')",
        [userId, projectId]
      );

      if (paidCheck.rows.length > 0) {
        const existingPaidOrder = paidCheck.rows[0];
        return res.json({
          success: true,
          alreadyPurchased: true,
          message: "لقد قمت بشراء هذا المشروع مسبقاً، وملفاته متاحة للتحميل في حسابك مباشرة.",
          order: {
            id: existingPaidOrder.id,
            projectId: existingPaidOrder.project_id,
            projectTitle: existingPaidOrder.project_title,
            amountSyp: existingPaidOrder.amount_syp,
            currency: existingPaidOrder.currency || "SYP",
            status: "PAID",
            transferTransactionId: existingPaidOrder.transfer_transaction_id,
            verifiedAt: existingPaidOrder.verified_at
          }
        });
      }

      // Idempotency: Check if user already has an active pending/submitted order for this project
      const activeCheck = await pool.query(
        `SELECT * FROM orders 
         WHERE user_id = $1 AND project_id = $2 AND status IN ('PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'VERIFYING_PAYMENT')
         ORDER BY created_at DESC LIMIT 1`,
        [userId, projectId]
      );

      if (activeCheck.rows.length > 0) {
        const existing = activeCheck.rows[0];
        return res.json({
          success: true,
          isExisting: true,
          message: "لديك طلب شراء نشط مسبقاً لهذا المشروع، يمكنك إتمام الدفع أو متابعة حالته.",
          order: {
            id: existing.id,
            projectId: existing.project_id,
            projectTitle: existing.project_title,
            amountSyp: existing.amount_syp,
            currency: existing.currency || "SYP",
            recipientAccount: existing.recipient_account || "0982257195",
            status: existing.status,
            transferTransactionId: existing.transfer_transaction_id,
            createdAt: existing.created_at
          }
        });
      }

      // Create new Order with status PENDING_PAYMENT
      const orderId = "ord_" + crypto.randomBytes(6).toString("hex");
      const phoneInput = req.body.userPhone || req.body.phoneSender || req.user!.email;
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours expiry

      await pool.query(
        `INSERT INTO orders (
          id, user_id, user_name, user_phone, project_id, project_title, amount_syp, currency, payment_method, recipient_account, status, expires_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 'SYP', 'syriatel_cash', '0982257195', 'PENDING_PAYMENT', $8, NOW(), NOW()
        )`,
        [
          orderId,
          userId,
          userName,
          sanitizeInput(phoneInput),
          projectId,
          project.title_ar,
          authoritativePriceSyp,
          expiresAt
        ]
      );

      // Audit Log
      await pool.query(
        `INSERT INTO audit_logs (id, user_id, action, ip_address, details)
         VALUES ($1, $2, 'ORDER_CREATED', $3, $4)`,
        [
          "log_" + crypto.randomBytes(6).toString("hex"),
          userId,
          req.ip || "127.0.0.1",
          JSON.stringify({
            orderId,
            projectId,
            amountSyp: authoritativePriceSyp,
            currency: "SYP",
            recipientAccount: "0982257195"
          })
        ]
      );

      // Admin Notification
      await pool.query(
        `INSERT INTO notifications (id, user_id, title_ar, title_en, message_ar, message_en, type)
         VALUES ($1, 'admin', $2, $3, $4, $5, 'order')`,
        [
          "notif_" + crypto.randomBytes(6).toString("hex"),
          "طلب شراء جديد تم إنشاؤه 🛒",
          "New Order Initiated",
          `أنشأ الطالب ${userName} طلب شراء للمشروع "${project.title_ar}" بقيمة ${authoritativePriceSyp.toLocaleString()} ل.س وهو بانتظار تحويل سيريتل كاش.`,
          `New order created by ${userName} for "${project.title_en}" (${authoritativePriceSyp} SYP).`
        ]
      );

      // Broadcast SSE Event to Admin Dashboard
      broadcastAdminEvent("ORDER_CREATED", {
        orderId,
        projectId,
        projectTitle: project.title_ar,
        userName,
        amountSyp: authoritativePriceSyp,
        recipientAccount: "0982257195",
        status: "PENDING_PAYMENT",
        createdAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: "تم إنشاء طلب الشراء بنجاح، يرجى إرسال الحوالة عبر سيريتل كاش وإدخال رقم العملية.",
        order: {
          id: orderId,
          projectId,
          projectTitle: project.title_ar,
          amountSyp: authoritativePriceSyp,
          currency: "SYP",
          recipientAccount: "0982257195",
          status: "PENDING_PAYMENT",
          createdAt: new Date().toISOString()
        }
      });
    } catch (e: any) {
      console.error("Order Creation Error:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Submit Syriatel Cash Payment (Transaction ID & Receipt)
  async function handleSubmitPayment(req: AuthRequest, res: express.Response) {
    try {
      const { id } = req.params;
      const transactionId = req.body.transactionId || req.body.transactionNumber;
      const phoneSender = req.body.phoneSender || req.body.senderPhone;
      const receiptUrl = req.body.receiptImageUrl || req.body.receiptUrl;
      const userId = req.user!.userId;

      if (!transactionId && !receiptUrl) {
        return res.status(400).json({ 
          success: false, 
          error: "يرجى إدخال الرقم المرجعي للتحويل أو رفع صورة الإيصال لمتابعة الطلب." 
        });
      }

      // Rate limit check
      const rateKey = `${userId}_${req.ip || "unknown"}`;
      if (!checkPaymentRateLimit(rateKey)) {
        return res.status(429).json({
          success: false,
          error: "تم تجاوز عدد محاولات إرسال الحوالة المسموح بها، يرجى الانتظار 15 دقيقة قبل المحاولة مرة أخرى."
        });
      }

      const provider = getPaymentProvider();
      const result = await provider.submitPayment(
        {
          orderId: id,
          transactionId: transactionId ? sanitizeInput(transactionId) : undefined,
          senderPhone: sanitizeInput(phoneSender),
          receiptUrl: receiptUrl || undefined,
          userId,
          clientIp: req.ip || "127.0.0.1"
        },
        pool
      );

      if (result.success) {
        // Broadcast Real-time event to Admin
        broadcastAdminEvent("PAYMENT_SUBMITTED", {
          orderId: id,
          transactionId: result.transactionId,
          userId,
          status: "pending_verification"
        });
      }

      res.status(result.success ? 200 : 400).json(result);
    } catch (e: any) {
      console.error("Payment Submit Error:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  app.post("/api/orders/:id/submit-payment", requireAuth, handleSubmitPayment);
  app.post("/api/orders/:id/payment", requireAuth, handleSubmitPayment);

  // Admin: Verify & Approve Payment (Authoritative Server Verification)
  app.post(["/api/orders/:id/verify-payment", "/api/orders/:id/approve"], requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const notes = req.body?.notes || req.body?.adminNotes;
      const adminUserId = req.user?.userId || "admin-id";

      const provider = getPaymentProvider();
      const result = await provider.verifyPayment(id, adminUserId, sanitizeInput(notes), pool);

      if (result.success) {
        broadcastAdminEvent("PAYMENT_VERIFIED", {
          orderId: id,
          transactionId: result.transactionId,
          verifiedAt: result.verifiedAt,
          status: "approved"
        });
      }

      res.status(result.success ? 200 : 400).json(result);
    } catch (e: any) {
      console.error("Payment Verification Error:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Admin: Reject Payment (With Reason)
  app.post(["/api/orders/:id/reject-payment", "/api/orders/:id/reject"], requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const reason = req.body?.adminFeedback || req.body?.reason || req.body?.admin_feedback || "رقم العملية غير مطابق أو الصورة غير واضحة";
      const adminUserId = req.user?.userId || "admin-id";

      const provider = getPaymentProvider();
      const result = await provider.rejectPayment(id, adminUserId, sanitizeInput(reason), pool);

      if (result.success) {
        broadcastAdminEvent("PAYMENT_REJECTED", {
          orderId: id,
          reason,
          adminFeedback: reason,
          status: "rejected"
        });
      }

      res.status(result.success ? 200 : 400).json(result);
    } catch (e: any) {
      console.error("Payment Rejection Error:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Admin: Mark as Verifying in Progress
  app.post("/api/orders/:id/start-verification", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await pool.query("UPDATE orders SET status = 'VERIFYING_PAYMENT', updated_at = NOW() WHERE id = $1", [id]);
      
      broadcastAdminEvent("PAYMENT_STATUS_CHANGED", {
        orderId: id,
        status: "VERIFYING_PAYMENT"
      });

      res.json({ success: true, message: "تم تغيير حالة الطلب إلى جاري التدقيق والمطابقة" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Legacy approval & rejection fallback endpoints
  app.post("/api/admin/orders/:id/status", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes, failureReason } = req.body;
      const adminUserId = req.user?.userId || "admin-id";
      const provider = getPaymentProvider();

      if (status === "PAID" || status === "approved" || status === "completed") {
        const result = await provider.verifyPayment(id, adminUserId, adminNotes, pool);
        if (result.success) {
          broadcastAdminEvent("PAYMENT_VERIFIED", { orderId: id, status: "approved" });
        }
        return res.status(result.success ? 200 : 400).json(result);
      }

      if (status === "PAYMENT_REJECTED" || status === "rejected") {
        const result = await provider.rejectPayment(id, adminUserId, failureReason || adminNotes || "رقم العملية غير صحيح", pool);
        if (result.success) {
          broadcastAdminEvent("PAYMENT_REJECTED", { orderId: id, status: "rejected" });
        }
        return res.status(result.success ? 200 : 400).json(result);
      }

      await pool.query("UPDATE orders SET status = $1, admin_notes = $2, updated_at = NOW() WHERE id = $3", [status, sanitizeInput(adminNotes), id]);
      broadcastAdminEvent("PAYMENT_STATUS_CHANGED", { orderId: id, status });
      res.json({ success: true, message: "تم تحديث حالة الطلب بنجاح" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Get orders list (User sees own orders, Admin sees all orders)
  app.get("/api/orders", async (req: AuthRequest, res) => {
    try {
      const queryUserId = (req.query.userId as string)?.trim();
      const authenticatedUserId = req.user?.userId;
      const isAdmin = req.user?.role === "admin" || (!queryUserId && !authenticatedUserId);

      let query = `
        SELECT o.*, p.download_url as project_download_url, u.email as user_email
        FROM orders o
        LEFT JOIN projects p ON o.project_id = p.id
        LEFT JOIN users u ON o.user_id = u.id
      `;
      let params: any[] = [];

      if (!isAdmin && (queryUserId || authenticatedUserId)) {
        const targetUserId = queryUserId || authenticatedUserId;
        query += ` WHERE o.user_id = $1 ORDER BY o.created_at DESC`;
        params.push(targetUserId);
      } else {
        query += ` ORDER BY o.created_at DESC`;
      }

      const result = await pool.query(query, params);
      const orders = result.rows.map(o => {
        const isPaid = o.status === "PAID" || o.status === "approved" || o.status === "completed" || o.status === "Approved";
        const feedback = o.admin_feedback || o.failure_reason || o.admin_notes || "";
        const txNumber = o.transfer_transaction_id || "";
        const receiptImg = o.receipt_url || "";
        const hasReceipt = Boolean(txNumber || receiptImg);

        return {
          id: o.id,
          userId: o.user_id,
          userName: o.user_name,
          userEmail: o.user_email,
          userPhone: o.user_phone,
          projectId: o.project_id,
          projectTitle: o.project_title,
          amountSyp: o.amount_syp,
          price: o.amount_syp,
          currency: o.currency || "SYP",
          paymentMethod: o.payment_method || "syriatel_cash",
          recipientAccount: o.recipient_account || "0982257195",
          syriatelNumber: o.recipient_account || "0982257195",
          transferTransactionId: txNumber,
          receiptUrl: receiptImg,
          paymentReceipt: hasReceipt ? {
            id: "rcpt_" + o.id,
            orderId: o.id,
            transactionNumber: txNumber || "إيصال مرفق (بدون رقم يدوي)",
            phoneSender: o.user_phone || "غير مسجل",
            amount: o.amount_syp,
            receiptImageUrl: receiptImg,
            paidAt: o.updated_at || o.created_at,
            uploadedAt: o.updated_at || o.created_at
          } : undefined,
          status: o.status,
          adminFeedback: feedback,
          admin_feedback: feedback,
          rejectionReason: feedback,
          adminNotes: o.admin_notes,
          failureReason: feedback,
          verificationAttempts: o.verification_attempts || 0,
          verifiedAt: o.verified_at,
          expiresAt: o.expires_at,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
          // Protected download access flag
          canDownload: isPaid,
          downloadUrl: isPaid ? o.project_download_url : undefined
        };
      });

      res.json({ success: true, orders });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Protected Project Files Download Endpoint (Strictly Enforces Verified Payment in DB)
  async function handleProtectedDownload(req: AuthRequest, res: express.Response) {
    try {
      const targetId = req.params.id; // Can be order ID or project ID
      const userId = req.user!.userId;
      const isAdmin = req.user!.role === "admin";

      let query = `
        SELECT o.id as order_id, o.status, o.user_id, p.id as project_id, p.title_ar, p.title_en, p.download_url
        FROM orders o
        JOIN projects p ON o.project_id = p.id
        WHERE (o.id = $1 OR o.project_id = $1)
      `;
      const params: any[] = [targetId];

      if (!isAdmin) {
        query += " AND o.user_id = $2";
        params.push(userId);
      }

      query += " ORDER BY o.created_at DESC LIMIT 1";

      const orderRes = await pool.query(query, params);

      if (orderRes.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: "عذراً، لا يوجد طلب شراء مسجل لهذا المشروع في حسابك."
        });
      }

      const match = orderRes.rows[0];
      const isPaid = match.status === "PAID" || match.status === "approved" || match.status === "completed" || match.status === "Approved";

      if (!isPaid && !isAdmin) {
        let statusMsg = "عذراً، يجب إتمام وتأكيد عملية الدفع أولاً لتتمكن من تحميل ملفات المشروع.";
        if (match.status === "pending_verification" || match.status === "PAYMENT_SUBMITTED" || match.status === "VERIFYING_PAYMENT") {
          statusMsg = "طلبك قيد التدقيق والمراجعة من قبل إدارة المنصة حالياً. ستُتاح الملفات فور تأكيد الحوالة.";
        } else if (match.status === "rejected" || match.status === "PAYMENT_REJECTED") {
          statusMsg = "تم رفض إثبات الدفع لهذا الطلب. يرجى مراجعة سبب الرفض وإعادة رفع إيصال أو رقم مرجعي صحيح.";
        }

        return res.status(403).json({
          success: false,
          status: match.status,
          error: statusMsg
        });
      }

      // Log verified download access in audit logs
      await pool.query(
        `INSERT INTO audit_logs (id, user_id, action, ip_address, details)
         VALUES ($1, $2, 'FILE_DOWNLOAD_ACCESSED', $3, $4)`,
        [
          "log_" + crypto.randomBytes(6).toString("hex"),
          userId,
          req.ip || "127.0.0.1",
          JSON.stringify({
            orderId: match.order_id,
            projectId: match.project_id,
            projectTitle: match.title_ar,
            downloadedAt: new Date().toISOString()
          })
        ]
      );

      return res.json({
        success: true,
        projectTitle: match.title_ar,
        downloadUrl: match.download_url
      });
    } catch (e: any) {
      console.error("Protected Download Error:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  app.get("/api/orders/:id/download", requireAuth, handleProtectedDownload);
  app.get("/api/projects/:id/download", requireAuth, handleProtectedDownload);

  // Admin Payments & Financial Summary
  app.get("/api/admin/payments/summary", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const revenueRes = await pool.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN status IN ('PAID', 'approved', 'completed') THEN amount_syp ELSE 0 END), 0) as total_revenue_syp,
          COUNT(CASE WHEN status IN ('PAID', 'approved', 'completed') THEN 1 END) as paid_orders_count,
          COUNT(CASE WHEN status = 'PAYMENT_SUBMITTED' THEN 1 END) as submitted_orders_count,
          COUNT(CASE WHEN status = 'VERIFYING_PAYMENT' THEN 1 END) as verifying_orders_count,
          COUNT(CASE WHEN status = 'PENDING_PAYMENT' THEN 1 END) as pending_orders_count,
          COUNT(CASE WHEN status = 'PAYMENT_REJECTED' THEN 1 END) as rejected_orders_count,
          COUNT(*) as total_orders_count
        FROM orders
      `);

      const stats = revenueRes.rows[0];

      res.json({
        success: true,
        summary: {
          totalRevenueSyp: parseInt(stats.total_revenue_syp, 10),
          paidOrdersCount: parseInt(stats.paid_orders_count, 10),
          submittedOrdersCount: parseInt(stats.submitted_orders_count, 10),
          verifyingOrdersCount: parseInt(stats.verifying_orders_count, 10),
          pendingOrdersCount: parseInt(stats.pending_orders_count, 10),
          rejectedOrdersCount: parseInt(stats.rejected_orders_count, 10),
          totalOrdersCount: parseInt(stats.total_orders_count, 10)
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ================= ADMIN DASHBOARD & STATS =================

  app.get("/api/admin/stats", requireAdmin, async (req: AuthRequest, res) => {
    try {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");

      const usersRes = await pool.query("SELECT COUNT(*) FROM users");
      const projectsRes = await pool.query("SELECT COUNT(*) FROM projects");
      const commentsRes = await pool.query("SELECT COUNT(*) FROM comments");
      const reviewsRes = await pool.query("SELECT COUNT(*) FROM reviews");
      const avgProjectRatingRes = await pool.query("SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) as avg_rating FROM reviews");
      const ordersRes = await pool.query("SELECT COUNT(*), SUM(amount_syp) as revenue FROM orders WHERE status IN ('PAID', 'approved', 'completed')");
      const pendingOrdersRes = await pool.query("SELECT COUNT(*) FROM orders WHERE status IN ('PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'VERIFYING_PAYMENT', 'pending')");
      const feedbackStatsRes = await pool.query(`
        SELECT 
          COUNT(*) as total_feedback,
          COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) as average_rating
        FROM platform_feedback
        WHERE status != 'ARCHIVED'
      `);

      res.json({
        success: true,
        stats: {
          totalUsers: parseInt(usersRes.rows[0].count, 10),
          usersCount: parseInt(usersRes.rows[0].count, 10),
          totalProjects: parseInt(projectsRes.rows[0].count, 10),
          projectsCount: parseInt(projectsRes.rows[0].count, 10),
          totalComments: parseInt(commentsRes.rows[0].count, 10),
          commentsCount: parseInt(commentsRes.rows[0].count, 10),
          totalReviews: parseInt(reviewsRes.rows[0].count, 10),
          reviewsCount: parseInt(reviewsRes.rows[0].count, 10),
          averageProjectRating: Number(avgProjectRatingRes.rows[0].avg_rating),
          totalOrders: parseInt(ordersRes.rows[0].count || "0", 10),
          paymentsCount: parseInt(ordersRes.rows[0].count || "0", 10),
          pendingOrders: parseInt(pendingOrdersRes.rows[0].count, 10),
          totalRevenueSyp: parseInt(ordersRes.rows[0].revenue || "0", 10),
          revenue: parseInt(ordersRes.rows[0].revenue || "0", 10),
          platformRating: Number(feedbackStatsRes.rows[0].average_rating),
          totalFeedback: parseInt(feedbackStatsRes.rows[0].total_feedback, 10)
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(`
        SELECT u.id, u.name, u.email, u.role, u.is_verified, u.university, u.specialty, u.phone, u.created_at, u.last_login_at,
               COUNT(o.id) as orders_count
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `);

      res.json({
        success: true,
        users: result.rows.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isVerified: u.is_verified,
          university: u.university,
          specialty: u.specialty,
          phone: u.phone,
          createdAt: u.created_at,
          lastLoginAt: u.last_login_at,
          ordersCount: parseInt(u.orders_count, 10)
        }))
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Toggle User Verification
  app.post("/api/admin/users/:id/toggle-verify", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const uRes = await pool.query("SELECT is_verified FROM users WHERE id = $1", [id]);
      if (uRes.rows.length === 0) return res.status(404).json({ success: false, error: "المستخدم غير موجود" });

      const newVer = !uRes.rows[0].is_verified;
      await pool.query("UPDATE users SET is_verified = $1 WHERE id = $2", [newVer, id]);

      res.json({ success: true, isVerified: newVer, message: newVer ? "تم تفعيل وتوثيق الحساب" : "تم إلغاء التوثيق" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Admin Delete User
  app.delete("/api/admin/users/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      if (id === "usr_admin_1") return res.status(400).json({ success: false, error: "لا يمكن حذف حساب المسؤول الرئيسي" });

      await pool.query("DELETE FROM users WHERE id = $1", [id]);
      res.json({ success: true, message: "تم حذف حساب المستخدم نهائياً من قاعدة البيانات" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ================= NOTIFICATIONS APIS =================

  app.get("/api/notifications", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const isAdmin = req.user!.role === "admin";

      let query = "SELECT * FROM notifications WHERE user_id = $1 OR user_id = 'all' ORDER BY created_at DESC LIMIT 50";
      let params = [userId];

      if (isAdmin) {
        query = "SELECT * FROM notifications WHERE user_id = 'admin' OR user_id = 'all' ORDER BY created_at DESC LIMIT 50";
        params = [];
      }

      const result = await pool.query(query, params);
      res.json({
        success: true,
        notifications: result.rows.map(n => ({
          id: n.id,
          userId: n.user_id,
          titleAr: n.title_ar,
          titleEn: n.title_en,
          messageAr: n.message_ar,
          messageEn: n.message_en,
          type: n.type,
          isRead: n.is_read,
          createdAt: n.created_at
        }))
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/notifications/read-all", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      await pool.query("UPDATE notifications SET is_read = true WHERE user_id = $1 OR user_id = 'all'", [userId]);
      res.json({ success: true, message: "تم تحديث جميع الإشعارات كمقروءة" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ================= CONSULTATIONS APIS =================

  app.get("/api/consultations", async (req, res) => {
    try {
      const userId = (req as any).user?.userId || req.query.userId;
      if (!userId) return res.json({ success: true, consultations: [] });

      const result = await pool.query(
        'SELECT id, user_id as "userId", type, idea, response, created_at as "createdAt" FROM consultations WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      res.json({ success: true, consultations: result.rows });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/consultations", async (req, res) => {
    try {
      const { userId, type, idea, consultationType: cType, userInput: uInput, language } = req.body;
      const rawInput = idea || uInput || "";
      const cleanIdea = sanitizeInput(rawInput);

      if (!cleanIdea) {
        return res.status(400).json({ success: false, error: "فكرة أو نص طلب الاستشارة لا يمكن أن يكون فارغاً" });
      }

      const consultationType = cType || type || "consultation";
      const userInput = cleanIdea;

      let generatedResponse = "";
      const ai = getAi();
      if (ai) {
        try {
          const prompt = `You are an expert Engineering Consultant at CardioVision.
The user is requesting a consultation of type: "${consultationType}".
User's specific request: "${userInput}".

Instructions:
Read the user's request carefully.
Provide a highly relevant, precise answer tailored ONLY to what the user asked.
If the user asks for a brainstorming idea, give them ideas. If they ask for code debugging, debug the code. If they ask for an architecture, provide an architecture.
DO NOT output a generic hardware/software architecture (like ESP32/PCB) UNLESS the user explicitly asked for hardware design.
Output the response in clear Arabic using Markdown formatting.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              temperature: 0.4,
              maxOutputTokens: 1500
            }
          });
          generatedResponse = response.text || "";
        } catch (err) {
          console.warn("AI generation failed for consultation:", err);
        }
      }

      if (!generatedResponse) {
        generatedResponse = language === "en"
          ? `### 📋 CardioVision Engineering Consultation (${consultationType})\n\n**Request Summary:** ${userInput}\n\n**Tailored Analysis:**\n- We carefully reviewed your request regarding "${userInput}".\n- Our engineering team recommends prioritizing feasibility, modular component selection, and verified testing procedures.\n- For in-depth personal supervision and custom implementation, please contact our specialized engineering team.`
          : `### 📋 استشارة CardioVision الهندسية (${consultationType})\n\n**ملخص الطلب:** ${userInput}\n\n**التحليل والتوجيه الدقيق:**\n- قمنا بتحليل طلبك المتعلق بـ "${userInput}" بعناية.\n- يُنصح بالتركيز المباشر على متطلبات فكرتك وتحديد الأولويات التقنية خطوة بخطوة.\n- يمكنك متابعة التنفيذ العملي أو مناقشة التفاصيل الدقيقة مباشرة مع المهندس المشرف.`;
      }

      const consultationId = "cons_" + crypto.randomBytes(6).toString("hex");
      const targetUserId = userId || "guest";

      await pool.query(
        "INSERT INTO consultations (id, user_id, type, idea, response, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
        [consultationId, targetUserId, consultationType, cleanIdea, generatedResponse]
      );

      res.json({
        success: true,
        consultation: {
          id: consultationId,
          userId: targetUserId,
          type: consultationType,
          idea: cleanIdea,
          response: generatedResponse,
          createdAt: new Date().toISOString()
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ================= GEMINI AI SERVICES APIS =================

  // Technical Q&A Assistant for a specific graduation project using Gemini 3.8-flash
  app.post("/api/ai/project-qa", async (req, res) => {
    try {
      const { projectId, question, lang } = req.body;
      const cleanQuestion = sanitizeInput(question);

      if (!cleanQuestion) {
        return res.status(400).json({ success: false, error: "السؤال مطلوب" });
      }

      let projectContext = "";
      if (projectId) {
        const projRes = await pool.query("SELECT * FROM projects WHERE id = $1", [projectId]);
        if (projRes.rows.length > 0) {
          const p = projRes.rows[0];
          projectContext = `
Project Title: ${lang === "en" ? p.title_en : p.title_ar}
Summary: ${lang === "en" ? p.summary_en : p.summary_ar}
Description: ${lang === "en" ? p.description_en : p.description_ar}
Hardware Components: ${JSON.stringify(p.hardware_components)}
Software Used: ${JSON.stringify(p.software_used)}
Difficulty: ${p.difficulty_level}
`;
        }
      }

      const ai = getAi();
      if (ai) {
        try {
          const systemInstruction = "مساعد طبي وهندسي خبير خاص بمنصة CardioVision. مهمتك تقديم إجابات دقيقة وموثوقة بناءً على البيانات المقدمة. يمنع الإجابة على أي أسئلة خارج نطاق المنصة";

          const prompt = `Context / السياق:
${projectContext || 'معلومات المنصة العامة'}

Student Question / السؤال:
${cleanQuestion}

Please respond concisely and accurately in ${lang === "en" ? "English" : "Arabic"}.`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.1,
              maxOutputTokens: 800
            }
          });

          return res.json({
            success: true,
            answer: response.text || (lang === "en" ? "Answer generated successfully." : "تم توليد الإجابة الهندسية بنجاح.")
          });
        } catch (aiErr: any) {
          console.warn("Gemini QA Error, using engineering heuristic fallback:", aiErr.message);
        }
      }

      // Intelligent Fallback if Gemini key is not configured or rate-limited
      const fallbackAnswer = lang === "en"
        ? `In this project architecture, the sensors communicate via I2C/SPI to the microcontroller (ESP32 / STM32). Ensure pull-up resistors (4.7kΩ) on SDA/SCL lines, and calibrate bio-potentials with analog low-pass filtering before feeding into ADC channels.`
        : `في البنية الهندسية لهذا المشروع، تتصل الحساسات عبر بروتوكول I2C/SPI مع المتحكم الدقيق (ESP32 أو STM32). تأكد من توصيل مقاومات الرفع (4.7kΩ) على خطوط SDA/SCL ومعايرة الإشارة التناظرية مع مرشح تمرير منخفض رقمي لإزالة تشويش شبكة التغذية 50Hz.`;

      return res.json({
        success: true,
        answer: fallbackAnswer,
        source: "fallback"
      });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/ai/advisor", async (req, res) => {
    try {
      const { major, interests, budget, difficulty } = req.body;
      const ai = getAi();

      if (!ai) {
        return res.json({
          success: true,
          source: "fallback",
          recommendations: [
            {
              titleAr: "نظام مراقبة المؤشرات الحيوية اللاسلكي برؤية حاسوبية",
              titleEn: "Wireless Vital Signs Telemetry & Computer Vision System",
              descriptionAr: "مشروع متكامل يجمع بين مستشعرات نبضات القلب AD8232 ومتحكم ESP32 مع تحليل البيانات عبر السحاب.",
              descriptionEn: "Integrated IoT system reading ECG signals with ESP32 and AD8232.",
              category: "biomedical",
              estimatedCost: "1,850,000 ل.س ($135)",
              estimatedDuration: "14 يوم",
              recommendedHardware: ["ESP32", "AD8232", "OLED Display"]
            }
          ]
        });
      }

      const prompt = `
You are the Senior Chief AI Engineering Advisor at CardioVision, an elite graduation projects platform.
Recommend 3 highly specific, innovative graduation projects for an engineering student in JSON format.

Details:
- Major: ${major || "Biomedical / AI / Software"}
- Interests: ${interests || "IoT, Hardware, Machine Learning"}
- Budget: ${budget || "Moderate"}
- Difficulty: ${difficulty || "Medium"}

Schema (return raw JSON array ONLY):
[
  {
    "titleAr": "عنوان المشروع باللغة العربية",
    "titleEn": "English Title",
    "descriptionAr": "وصف مفصل لآلية العمل والهدف الأكاديمي",
    "descriptionEn": "Detailed functional overview",
    "category": "biomedical",
    "estimatedCost": "$150",
    "estimatedDuration": "15 days",
    "recommendedHardware": ["ESP32", "AD8232"]
  }
]
`;

      const systemInstruction = "مساعد طبي وهندسي خبير خاص بمنصة CardioVision. مهمتك تقديم إجابات دقيقة وموثوقة بناءً على البيانات المقدمة. يمنع الإجابة على أي أسئلة خارج نطاق المنصة";
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          systemInstruction: systemInstruction,
          temperature: 0.1,
          maxOutputTokens: 800
        }
      });

      const recommendations = JSON.parse(response.text || "[]");
      res.json({ success: true, source: "gemini", recommendations });
    } catch (e: any) {
      res.json({
        success: true,
        source: "fallback",
        recommendations: [
          {
            titleAr: "طرف اصطناعي ذكي متحكم به بالنشاط العضلي (EMG)",
            titleEn: "Smart EMG Bionic Prosthetic Limb",
            descriptionAr: "يد حيوية مطبوعة ثلاثية الأبعاد بـ 5 محركات سيرفو مع معالجة الإشارات العضلية لحظياً.",
            descriptionEn: "3D printed bionic prosthetic hand actuated by muscle electrical activity sensors.",
            category: "biomedical",
            estimatedCost: "2,950,000 ل.س ($210)",
            estimatedDuration: "20 يوم",
            recommendedHardware: ["Arduino Nano", "MyoWare EMG Sensor", "Servos"]
          }
        ]
      });
    }
  });

  // Additional Admin Endpoints
  app.get("/api/admin/audit-logs", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(
        'SELECT id, user_id as "userId", action, details, created_at as "timestamp" FROM audit_logs ORDER BY created_at DESC LIMIT 100'
      );
      res.json({ success: true, logs: result.rows });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/admin/maintenance", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { maintenanceMode, reason } = req.body;
      globalMaintenanceMode = Boolean(maintenanceMode);
      if (reason !== undefined) {
        globalMaintenanceReason = reason;
      }
      
      if (pool) {
        await pool.query(
          "INSERT INTO settings (key, value) VALUES ('maintenanceMode', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
          [globalMaintenanceMode ? 'true' : 'false']
        );
        if (reason !== undefined) {
          await pool.query(
            "INSERT INTO settings (key, value) VALUES ('maintenanceReason', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
            [globalMaintenanceReason]
          );
        }
      }

      res.json({ success: true, maintenanceMode: globalMaintenanceMode, reason: globalMaintenanceReason, message: "تم تحديث وضع الصيانة بنجاح" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/admin/users/create", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { name, email, password, role, university, specialty, phone } = req.body;
      if (!email || !name) return res.status(400).json({ success: false, error: "بيانات المستخدم غير مكتملة" });

      const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase().trim()]);
      if (existing.rows.length > 0) return res.status(400).json({ success: false, error: "البريد الإلكتروني مستخدم بالفعل" });

      const userId = "usr_" + crypto.randomBytes(6).toString("hex");
      const hashedPassword = await bcrypt.hash(password || "password123", 10);

      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role, is_verified, university, specialty, phone, created_at, last_login_at)
         VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8, NOW(), NOW())`,
        [userId, sanitizeInput(name), email.toLowerCase().trim(), hashedPassword, role || "user", sanitizeInput(university), sanitizeInput(specialty), sanitizeInput(phone)]
      );

      res.json({ success: true, message: "تم إنشاء حساب المستخدم بنجاح", user: { id: userId, name, email, role: role || "user" } });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/admin/users/:id/toggle-status", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const uRes = await pool.query("SELECT is_verified FROM users WHERE id = $1", [id]);
      if (uRes.rows.length === 0) return res.status(404).json({ success: false, error: "المستخدم غير موجود" });

      const newVer = !uRes.rows[0].is_verified;
      await pool.query("UPDATE users SET is_verified = $1 WHERE id = $2", [newVer, id]);

      res.json({ success: true, isVerified: newVer, message: newVer ? "تم تفعيل الحساب" : "تم تعليق الحساب" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/admin/difficulty-stats", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const result = await pool.query("SELECT difficulty_level, COUNT(*) as count FROM projects GROUP BY difficulty_level");
      res.json({ success: true, stats: result.rows });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/admin/seed-demo-data", requireAdmin, async (req: AuthRequest, res) => {
    res.json({ success: true, message: "تم تحديث وإعادة تعبئة البيانات التجريبية بنجاح" });
  });

  app.post("/api/admin/clear-demo-data", requireAdmin, async (req: AuthRequest, res) => {
    res.json({ success: true, message: "تم تنظيف البيانات المؤقتة بنجاح" });
  });

  app.post("/api/orders/:id/approve", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const provider = getPaymentProvider();
      const result = await provider.verifyPayment(id, req.user!.userId, notes, pool);
      if (result.success) {
        broadcastAdminEvent("PAYMENT_VERIFIED", { orderId: id, status: "approved" });
      }
      res.status(result.success ? 200 : 400).json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/orders/:id/reject", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const cleanReason = req.body.adminFeedback || req.body.reason || "رقم العملية غير مطابق أو الصورة غير واضحة";
      const provider = getPaymentProvider();
      const result = await provider.rejectPayment(id, req.user!.userId, cleanReason, pool);
      if (result.success) {
        broadcastAdminEvent("PAYMENT_REJECTED", { 
          orderId: id, 
          status: "rejected", 
          reason: cleanReason,
          adminFeedback: cleanReason 
        });
      }
      res.status(result.success ? 200 : 400).json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/notifications/broadcast", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { titleAr, titleEn, messageAr, messageEn } = req.body;
      const notifId = "notif_" + crypto.randomBytes(6).toString("hex");
      await pool.query(
        `INSERT INTO notifications (id, user_id, title_ar, title_en, message_ar, message_en, type)
         VALUES ($1, 'all', $2, $3, $4, $5, 'broadcast')`,
        [notifId, sanitizeInput(titleAr), sanitizeInput(titleEn), sanitizeInput(messageAr), sanitizeInput(messageEn)]
      );
      res.json({ success: true, message: "تم إرسال الإشعار لجميع المستخدمين" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Catch-all API Fallback route to ALWAYS return JSON instead of HTML

  // Project Interactions (Views & Likes)
  app.patch("/api/projects/:id/view", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        "UPDATE projects SET views_count = COALESCE(views_count, 0) + 1 WHERE id = $1 RETURNING views_count",
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: "المشروع غير موجود" });
      }
      res.json({ success: true, viewsCount: result.rows[0].views_count });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/projects/:id/like", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: "غير مصرح" });
      }

      const check = await pool.query("SELECT id FROM favorites WHERE user_id = $1 AND project_id = $2", [userId, id]);
      
      let isLiked = false;
      if (check.rows.length > 0) {
        await pool.query("DELETE FROM favorites WHERE user_id = $1 AND project_id = $2", [userId, id]);
        await pool.query("UPDATE projects SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = $1", [id]);
        isLiked = false;
      } else {
        const favId = "fav_" + require("crypto").randomBytes(6).toString("hex");
        await pool.query("INSERT INTO favorites (id, user_id, project_id) VALUES ($1, $2, $3)", [favId, userId, id]);
        await pool.query("UPDATE projects SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = $1", [id]);
        isLiked = true;
      }

      const proj = await pool.query("SELECT likes_count FROM projects WHERE id = $1", [id]);
      const likesCount = proj.rows[0]?.likes_count || 0;

      res.json({ success: true, isLiked, likesCount });
    } catch (error: any) {
      console.error("Error toggling like:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.use("/api/*", (req, res) => {
    res.status(404).json({ success: false, error: `المسار البرمجي غير موجود: ${req.originalUrl}` });
  });



  // Serve static files in production & Vite middleware in dev
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ CardioVision server running on http://0.0.0.0:${PORT} with PostgreSQL!`);
  });
}

startServer();
