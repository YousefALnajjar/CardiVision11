import { pgTable, text, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  googleSub: text("google_sub").unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"), // optional legacy field
  role: text("role").notNull().default("user"), // 'user' | 'admin'
  isVerified: boolean("is_verified").notNull().default(true),
  verificationToken: text("verification_token"),
  university: text("university"),
  specialty: text("specialty"),
  phone: text("phone"),
  
  detailsAr: text("details_ar"),
  detailsEn: text("details_en"),
  durationAr: text("duration_ar"),
  durationEn: text("duration_en"),
  universityAr: text("university_ar"),
  universityEn: text("university_en"),
  imageUrl: text("image_url"),
  projectFileUrl: text("project_file_url"),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().default([]),
  componentsAr: jsonb("components_ar").$type<string[]>().default([]),
  componentsEn: jsonb("components_en").$type<string[]>().default([]),
  softwareAr: jsonb("software_ar").$type<string[]>().default([]),
  softwareEn: jsonb("software_en").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  summaryAr: text("summary_ar"),
  summaryEn: text("summary_en"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  category: text("category").notNull().default("biomedical"),
  projectTypeAr: text("project_type_ar").default("مشروع تخرج متكامل"),
  projectTypeEn: text("project_type_en").default("Full Graduation Project"),
  difficultyLevel: text("difficulty_level").notNull().default("medium"), // 'easy' | 'medium' | 'hard'
  priceSyp: integer("price_syp").notNull().default(0),
  priceUsd: integer("price_usd").notNull().default(0),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  videoUrl: text("video_url"),
  viewsCount: integer("views_count").notNull().default(0),
  salesCount: integer("sales_count").notNull().default(0),
  reviewsCount: integer("reviews_count").notNull().default(0),
  ratingAverage: real("rating_average").notNull().default(5.0),
  commentsCount: integer("comments_count").notNull().default(0),
  softwareUsed: jsonb("software_used").$type<string[]>().default([]),
  hardwareComponents: jsonb("hardware_components").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  downloadUrl: text("download_url"),
  
  detailsAr: text("details_ar"),
  detailsEn: text("details_en"),
  durationAr: text("duration_ar"),
  durationEn: text("duration_en"),
  universityAr: text("university_ar"),
  universityEn: text("university_en"),
  imageUrl: text("image_url"),
  projectFileUrl: text("project_file_url"),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().default([]),
  componentsAr: jsonb("components_ar").$type<string[]>().default([]),
  componentsEn: jsonb("components_en").$type<string[]>().default([]),
  softwareAr: jsonb("software_ar").$type<string[]>().default([]),
  softwareEn: jsonb("software_en").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userName: text("user_name").notNull(),
  userAvatar: text("user_avatar"),
  commentText: text("comment_text").notNull(),
  status: text("status").notNull().default("active"),
  
  detailsAr: text("details_ar"),
  detailsEn: text("details_en"),
  durationAr: text("duration_ar"),
  durationEn: text("duration_en"),
  universityAr: text("university_ar"),
  universityEn: text("university_en"),
  imageUrl: text("image_url"),
  projectFileUrl: text("project_file_url"),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().default([]),
  componentsAr: jsonb("components_ar").$type<string[]>().default([]),
  componentsEn: jsonb("components_en").$type<string[]>().default([]),
  softwareAr: jsonb("software_ar").$type<string[]>().default([]),
  softwareEn: jsonb("software_en").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),

});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull().default(5),
  reviewText: text("review_text"),
  
  detailsAr: text("details_ar"),
  detailsEn: text("details_en"),
  durationAr: text("duration_ar"),
  durationEn: text("duration_en"),
  universityAr: text("university_ar"),
  universityEn: text("university_en"),
  imageUrl: text("image_url"),
  projectFileUrl: text("project_file_url"),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().default([]),
  componentsAr: jsonb("components_ar").$type<string[]>().default([]),
  componentsEn: jsonb("components_en").$type<string[]>().default([]),
  softwareAr: jsonb("software_ar").$type<string[]>().default([]),
  softwareEn: jsonb("software_en").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),

});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userName: text("user_name").notNull(),
  userPhone: text("user_phone"),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  projectTitle: text("project_title").notNull(),
  amountSyp: integer("amount_syp").notNull(),
  currency: text("currency").notNull().default("SYP"),
  paymentMethod: text("payment_method").notNull().default("syriatel_cash"), // 'syriatel_cash'
  recipientAccount: text("recipient_account").notNull().default("0982257195"),
  transferTransactionId: text("transfer_transaction_id"),
  receiptUrl: text("receipt_url"),
  status: text("status").notNull().default("PENDING_PAYMENT"), // 'PENDING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'VERIFYING_PAYMENT' | 'PAID' | 'PAYMENT_REJECTED' | 'PAYMENT_EXPIRED' | 'CANCELLED'
  adminNotes: text("admin_notes"),
  failureReason: text("failure_reason"),
  verificationAttempts: integer("verification_attempts").notNull().default(0),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  idempotencyKey: text("idempotency_key"),
  
  detailsAr: text("details_ar"),
  detailsEn: text("details_en"),
  durationAr: text("duration_ar"),
  durationEn: text("duration_en"),
  universityAr: text("university_ar"),
  universityEn: text("university_en"),
  imageUrl: text("image_url"),
  projectFileUrl: text("project_file_url"),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().default([]),
  componentsAr: jsonb("components_ar").$type<string[]>().default([]),
  componentsEn: jsonb("components_en").$type<string[]>().default([]),
  softwareAr: jsonb("software_ar").$type<string[]>().default([]),
  softwareEn: jsonb("software_en").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // user ID or 'admin'
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  messageAr: text("message_ar").notNull(),
  messageEn: text("message_en").notNull(),
  type: text("type").notNull().default("general"),
  isRead: boolean("is_read").notNull().default(false),
  
  detailsAr: text("details_ar"),
  detailsEn: text("details_en"),
  durationAr: text("duration_ar"),
  durationEn: text("duration_en"),
  universityAr: text("university_ar"),
  universityEn: text("university_en"),
  imageUrl: text("image_url"),
  projectFileUrl: text("project_file_url"),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().default([]),
  componentsAr: jsonb("components_ar").$type<string[]>().default([]),
  componentsEn: jsonb("components_en").$type<string[]>().default([]),
  softwareAr: jsonb("software_ar").$type<string[]>().default([]),
  softwareEn: jsonb("software_en").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),

});

export const favorites = pgTable("favorites", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  detailsAr: text("details_ar"),
  detailsEn: text("details_en"),
  durationAr: text("duration_ar"),
  durationEn: text("duration_en"),
  universityAr: text("university_ar"),
  universityEn: text("university_en"),
  imageUrl: text("image_url"),
  projectFileUrl: text("project_file_url"),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().default([]),
  componentsAr: jsonb("components_ar").$type<string[]>().default([]),
  componentsEn: jsonb("components_en").$type<string[]>().default([]),
  softwareAr: jsonb("software_ar").$type<string[]>().default([]),
  softwareEn: jsonb("software_en").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),

});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  action: text("action").notNull(),
  ipAddress: text("ip_address"),
  details: jsonb("details"),
  
  detailsAr: text("details_ar"),
  detailsEn: text("details_en"),
  durationAr: text("duration_ar"),
  durationEn: text("duration_en"),
  universityAr: text("university_ar"),
  universityEn: text("university_en"),
  imageUrl: text("image_url"),
  projectFileUrl: text("project_file_url"),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().default([]),
  componentsAr: jsonb("components_ar").$type<string[]>().default([]),
  componentsEn: jsonb("components_en").$type<string[]>().default([]),
  softwareAr: jsonb("software_ar").$type<string[]>().default([]),
  softwareEn: jsonb("software_en").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),

});

export const consultations = pgTable("consultations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull().default("consultation"),
  idea: text("idea").notNull(),
  response: text("response").notNull(),
  
  detailsAr: text("details_ar"),
  detailsEn: text("details_en"),
  durationAr: text("duration_ar"),
  durationEn: text("duration_en"),
  universityAr: text("university_ar"),
  universityEn: text("university_en"),
  imageUrl: text("image_url"),
  projectFileUrl: text("project_file_url"),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().default([]),
  componentsAr: jsonb("components_ar").$type<string[]>().default([]),
  componentsEn: jsonb("components_en").$type<string[]>().default([]),
  softwareAr: jsonb("software_ar").$type<string[]>().default([]),
  softwareEn: jsonb("software_en").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),

});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  labelAr: text("label_ar").notNull(),
  labelEn: text("label_en").notNull(),
  
  detailsAr: text("details_ar"),
  detailsEn: text("details_en"),
  durationAr: text("duration_ar"),
  durationEn: text("duration_en"),
  universityAr: text("university_ar"),
  universityEn: text("university_en"),
  imageUrl: text("image_url"),
  projectFileUrl: text("project_file_url"),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().default([]),
  componentsAr: jsonb("components_ar").$type<string[]>().default([]),
  componentsEn: jsonb("components_en").$type<string[]>().default([]),
  softwareAr: jsonb("software_ar").$type<string[]>().default([]),
  softwareEn: jsonb("software_en").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),

});

export const platformFeedback = pgTable("platform_feedback", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  rating: integer("rating").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("NEW"), // 'NEW' | 'REVIEWED' | 'REPLIED' | 'ARCHIVED'
  adminReply: text("admin_reply"),
  repliedAt: timestamp("replied_at"),
  adminUserId: text("admin_user_id").references(() => users.id, { onDelete: "set null" }),
  isFeatured: boolean("is_featured").notNull().default(false),
  
  detailsAr: text("details_ar"),
  detailsEn: text("details_en"),
  durationAr: text("duration_ar"),
  durationEn: text("duration_en"),
  universityAr: text("university_ar"),
  universityEn: text("university_en"),
  imageUrl: text("image_url"),
  projectFileUrl: text("project_file_url"),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().default([]),
  componentsAr: jsonb("components_ar").$type<string[]>().default([]),
  componentsEn: jsonb("components_en").$type<string[]>().default([]),
  softwareAr: jsonb("software_ar").$type<string[]>().default([]),
  softwareEn: jsonb("software_en").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

