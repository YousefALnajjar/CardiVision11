export interface User {
  id: string;
  googleSub?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "user" | "student" | "visitor";
  isVerified?: boolean;
  status?: "active" | "disabled";
  university?: string;
  specialty?: string;
  phone?: string;
  createdAt?: string;
  lastLoginAt?: string | null;
  ordersCount?: number;
}

export interface Category {
  id: string;
  labelAr: string;
  labelEn: string;
}

export interface Project {
  id: string;
  titleAr: string;
  titleEn: string;
  category: string;
  descriptionAr: string;
  descriptionEn: string;
  detailsAr: string;
  detailsEn: string;
  featuresAr: string[];
  featuresEn: string[];
  componentsAr: string[];
  componentsEn: string[];
  softwareAr: string[];
  softwareEn: string[];
  diagramsAr: string[]; // URLs or text descriptions
  diagramsEn: string[];
  outputsAr: string[];
  outputsEn: string[];
  implementationAr: string[];
  implementationEn: string[];
  price: number;
  durationAr: string;
  durationEn: string;
  imageUrl: string;
  additionalImages?: string[];
  videoUrl: string; // YouTube embed or video placeholder
  projectFileUrl?: string; // Download link once paid
  rating: number; // average
  difficultyLevel?: "easy" | "medium" | "hard"; // 🟢 easy | 🟡 medium | 🔴 hard
  status?: "active" | "archived" | "draft" | string;
  viewsCount?: number;
  salesCount?: number;
  likesCount?: number;
  reviewsCount?: number;
  isBestSeller?: boolean;
  isMostViewed?: boolean;
  isTopRated?: boolean;
  universityAr?: string;
  universityEn?: string;
  projectTypeAr?: string;
  projectTypeEn?: string;
  language?: "ar" | "en" | "both";
}

export type PaymentStatus = 
  | "PENDING_PAYMENT"
  | "PAYMENT_SUBMITTED"
  | "VERIFYING_PAYMENT"
  | "PAID"
  | "PAYMENT_REJECTED"
  | "PAYMENT_EXPIRED"
  | "CANCELLED"
  | "REFUNDED"
  // Order lifecycle statuses
  | "pending_verification"
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Paid"
  | "Rejected"
  | "Completed";

export interface PaymentReceipt {
  id: string;
  orderId: string;
  paymentId?: string;
  receiptImageUrl: string;
  transactionNumber: string;
  phoneSender: string;
  amount: number;
  paidAt: string;
  uploadedAt: string;
  originalFileName?: string;
  mimeType?: string;
  fileSize?: number;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  projectId: string;
  amount: number;
  paymentMethod: "syriatel_cash";
  recipientPhone: string; // "0982257195"
  recipientName: string; // "CardioVision - Syriatel Cash"
  transactionNumber: string;
  phoneSender: string;
  paidAt: string;
  receiptImageUrl: string;
  status: PaymentStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  projectId: string;
  projectTitle: string;
  price?: number;
  amountSyp: number;
  currency: string; // "SYP"
  status: PaymentStatus;
  paymentMethod: "syriatel_cash" | string;
  recipientAccount: string; // "0982257195"
  syriatelNumber?: string;
  transferTransactionId?: string;
  receiptUrl?: string;
  adminNotes?: string;
  adminFeedback?: string;
  admin_feedback?: string;
  rejectionReason?: string;
  failureReason?: string;
  verificationAttempts?: number;
  verifiedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  completedAt?: string;
  paymentReceipt?: PaymentReceipt;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: "order" | "payment" | "project" | "user" | "auth";
  entityId: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: string;
}

export interface Consultation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "consultation" | "schematic" | "custom_project" | "modification" | "pcb_design" | "arduino" | "esp32" | "flutter" | "python";
  idea: string;
  response: string;
  status: "pending" | "answered";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string; // "all" or specific userId
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  isRead: boolean;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  projectId: string;
}

export interface Review {
  id: string;
  projectId: string;
  project_id?: string;
  projectTitleAr?: string;
  projectTitleEn?: string;
  projectCategory?: string;
  userId: string;
  user_id?: string;
  userName: string;
  user_name?: string;
  userEmail?: string;
  user_email?: string;
  userAvatar?: string;
  user_avatar?: string;
  userUniversity?: string;
  userSpecialty?: string;
  rating: number;
  comment: string;
  commentText?: string;
  reviewText?: string;
  status?: "active" | "reviewed" | "hidden";
  createdAt: string;
  created_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  reply?: string;
  isRead: boolean;
}

export interface SystemStats {
  usersCount: number;
  projectsCount: number;
  ordersCount: number;
  paymentsCount: number;
  pendingOrdersCount: number;
  underReviewOrdersCount: number;
  approvedOrdersCount: number;
  rejectedOrdersCount: number;
  consultationsCount: number;
  visitorsCount: number;
  bestSellers: Array<{ projectId: string; titleAr: string; titleEn: string; salesCount: number; revenue: number }>;
  revenue: number;
  totalComments?: number;
  commentsCount?: number;
  totalReviews?: number;
  reviewsCount?: number;
  averageProjectRating?: number;
}

export type FeedbackStatus = "NEW" | "REVIEWED" | "REPLIED" | "ARCHIVED";

export interface PlatformFeedback {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  userUniversity?: string;
  userPhone?: string;
  rating: number;
  message: string;
  status: FeedbackStatus;
  adminReply?: string | null;
  repliedAt?: string | null;
  adminUserId?: string | null;
  adminUserName?: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  starsBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  periodCounts: {
    today: number;
    week: number;
    month: number;
  };
  statusCounts: {
    new: number;
    reviewed: number;
    replied: number;
    archived: number;
  };
  featuredCount: number;
}

export interface FeaturedTestimonial {
  id: string;
  rating: number;
  message: string;
  adminReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
  userName: string;
  userAvatar?: string;
  university?: string;
  specialty?: string;
}

export interface RatingTrendPoint {
  date: string;
  avgRating: number;
  cumulativeAvg: number;
  count: number;
  count5: number;
  count4: number;
  count3: number;
  countLow: number;
}

export interface RatingTrendsResponse {
  success: boolean;
  trends: RatingTrendPoint[];
  summary?: {
    totalCount: number;
    overallAvg: number;
    satisfactionRate: number;
  };
  error?: string;
}

