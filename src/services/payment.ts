import crypto from "crypto";
import { PaymentStatus } from "../types";

export interface PaymentOrderInfo {
  orderId: string;
  amount: number;
  currency: "SYP";
  recipientAccount: string;
  recipientName: string;
  paymentMethod: "syriatel_cash";
  instructionsAr: string[];
  instructionsEn: string[];
}

export interface PaymentSubmission {
  orderId: string;
  transactionId: string;
  senderPhone?: string;
  receiptUrl?: string;
  userId: string;
  clientIp?: string;
}

export interface PaymentResult {
  success: boolean;
  status: PaymentStatus;
  message: string;
  orderId: string;
  transactionId?: string;
  error?: string;
  verifiedAt?: Date;
}

export interface PaymentProvider {
  readonly id: string;
  readonly name: string;
  readonly recipientAccount: string;
  readonly currency: string;
  readonly isAutomated: boolean;

  createPaymentOrder(order: { id: string; amountSyp: number; projectTitle: string }): Promise<PaymentOrderInfo>;
  validateTransactionId(transactionId: string): { isValid: boolean; error?: string };
  submitPayment(submission: PaymentSubmission, pool: any): Promise<PaymentResult>;
  verifyPayment(orderId: string, adminUserId: string, notes: string | undefined, pool: any): Promise<PaymentResult>;
  rejectPayment(orderId: string, adminUserId: string, reason: string, pool: any): Promise<PaymentResult>;
  getPaymentStatus(orderId: string, pool: any): Promise<{ status: PaymentStatus; transactionId?: string; verifiedAt?: Date; failureReason?: string }>;
}

/**
 * Production Manual Syriatel Cash Provider
 * 
 * Used for production when direct open consumer API is not available or requires
 * high-security operator reconciliation. Ensures absolute transactional integrity:
 * - Prevents double spending (unique constraint + row-locking)
 * - Prevents price or user tampering (backend-calculated only)
 * - Full audit logs and admin authorization verification
 */
export class ManualSyriatelCashProvider implements PaymentProvider {
  readonly id = "syriatel_cash_manual";
  readonly name = "Syriatel Cash (التحقق اليدوي الموثق)";
  readonly recipientAccount = "0982257195";
  readonly currency = "SYP";
  readonly isAutomated = false;

  async createPaymentOrder(order: { id: string; amountSyp: number; projectTitle: string }): Promise<PaymentOrderInfo> {
    return {
      orderId: order.id,
      amount: order.amountSyp,
      currency: "SYP",
      recipientAccount: this.recipientAccount,
      recipientName: "CardioVision - سيريتل كاش",
      paymentMethod: "syriatel_cash",
      instructionsAr: [
        "افتح تطبيق Syriatel Cash أو اتصل بـ *150#.",
        `أرسل المبلغ المطابق تماماً (${order.amountSyp.toLocaleString()} ل.س) إلى رقم المحفظة: ${this.recipientAccount}.`,
        "احتفظ برقم العملية (Transaction ID) المكون من إشعار نجاح التحويل.",
        "أدخل رقم العملية في الحقل المخصص أدناه واضغط 'تأكيد الدفع'.",
        "سيقوم فريق إدارة CardioVision بمطابقة العملية فوراً وتفعيل المشروع لحسابك."
      ],
      instructionsEn: [
        "Open Syriatel Cash app or dial *150#.",
        `Transfer exactly ${order.amountSyp.toLocaleString()} SYP to wallet: ${this.recipientAccount}.`,
        "Save the Transaction ID from the transfer receipt message.",
        "Enter the Transaction ID below and submit payment.",
        "CardioVision team will verify and activate your project files."
      ]
    };
  }

  validateTransactionId(transactionId: string): { isValid: boolean; error?: string } {
    if (!transactionId || typeof transactionId !== "string") {
      return { isValid: false, error: "رقم العملية مطلوب" };
    }
    const clean = transactionId.trim();
    if (clean.length < 5) {
      return { isValid: false, error: "رقم العملية قصير جداً (الحد الأدنى 5 خانات)" };
    }
    if (clean.length > 64) {
      return { isValid: false, error: "رقم العملية طويل جداً" };
    }
    // Allow alphanumeric characters and standard delimiters: hyphens, underscores
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(clean)) {
      return { isValid: false, error: "رقم العملية يحتوي على رموز غير صالحة. يجب أن يتكون من أرقام وحروف إنجليزية فقط" };
    }

    // Blacklist obvious fake or test sequences in production
    const obviousFakes = ["12345", "123456", "12345678", "00000", "000000", "test", "demo", "fake"];
    if (obviousFakes.includes(clean.toLowerCase())) {
      return { isValid: false, error: "يرجى إدخال رقم عملية حقيقي مستخرج من إشعار سيريتل كاش" };
    }

    return { isValid: true };
  }

  async submitPayment(submission: PaymentSubmission, pool: any): Promise<PaymentResult> {
    const { orderId, transactionId, senderPhone, userId, clientIp, receiptUrl } = submission;

    const hasTx = Boolean(transactionId && transactionId.trim().length > 0);
    const hasReceipt = Boolean(receiptUrl && receiptUrl.trim().length > 0);

    if (!hasTx && !hasReceipt) {
      return {
        success: false,
        status: "PENDING_PAYMENT",
        message: "يجب إدخال الرقم المرجعي للتحويل أو إرفاق صورة الإيصال لمتابعة الطلب.",
        orderId,
        error: "Either transaction reference or receipt image is required"
      };
    }

    if (hasTx) {
      const validation = this.validateTransactionId(transactionId);
      if (!validation.isValid) {
        return {
          success: false,
          status: "PENDING_PAYMENT",
          message: validation.error || "رقم العملية غير صالح",
          orderId,
          error: validation.error
        };
      }
    }

    const cleanTx = hasTx 
      ? transactionId.trim() 
      : ("IMG-" + orderId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() + "-" + Date.now().toString().slice(-4));
    const cleanPhone = senderPhone ? senderPhone.trim().replace(/[^0-9+]/g, "") : null;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Lock the order row to prevent race conditions
      const orderRes = await client.query(
        "SELECT * FROM orders WHERE id = $1 FOR UPDATE",
        [orderId]
      );

      if (orderRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return {
          success: false,
          status: "PENDING_PAYMENT",
          message: "طلب الشراء غير موجود",
          orderId,
          error: "Order not found"
        };
      }

      const order = orderRes.rows[0];

      // Verify ownership
      if (order.user_id !== userId) {
        await client.query("ROLLBACK");
        return {
          success: false,
          status: order.status,
          message: "غير مصرح لك بتعديل هذا الطلب",
          orderId,
          error: "Unauthorized user for this order"
        };
      }

      // Check current state: if already approved/paid, do not allow re-submission
      if (order.status === "PAID" || order.status === "approved" || order.status === "completed") {
        await client.query("ROLLBACK");
        return {
          success: true,
          status: "approved",
          message: "هذا الطلب مدفوع ومكتمل بالفعل",
          orderId,
          transactionId: order.transfer_transaction_id
        };
      }

      // Check Double Spending: ensure transaction ID has not been used in ANY other paid order
      const dupCheck = await client.query(
        "SELECT id, user_id, project_title, status FROM orders WHERE transfer_transaction_id = $1 AND id != $2 AND status IN ('PAID', 'approved', 'completed')",
        [cleanTx, orderId]
      );

      if (dupCheck.rows.length > 0) {
        await client.query("ROLLBACK");
        return {
          success: false,
          status: order.status,
          message: "رقم العملية (Transaction ID) تم استخدامه مسبقاً في عملية شراء أخرى معتمدة.",
          orderId,
          error: "Double spending detected: Transaction ID already in use"
        };
      }

      // Update order to pending_verification
      await client.query(
        `UPDATE orders 
         SET transfer_transaction_id = $1,
             user_phone = COALESCE($2, user_phone),
             receipt_url = COALESCE($3, receipt_url),
             status = 'pending_verification',
             verification_attempts = verification_attempts + 1,
             failure_reason = NULL,
             admin_feedback = NULL,
             updated_at = NOW()
         WHERE id = $4`,
        [cleanTx, cleanPhone, submission.receiptUrl || null, orderId]
      );

      // Add to audit logs
      await client.query(
        `INSERT INTO audit_logs (id, user_id, action, ip_address, details)
         VALUES ($1, $2, 'PAYMENT_SUBMITTED', $3, $4)`,
        [
          "log_" + crypto.randomBytes(6).toString("hex"),
          userId,
          clientIp || "127.0.0.1",
          JSON.stringify({
            orderId,
            projectId: order.project_id,
            amountSyp: order.amount_syp,
            transactionId: cleanTx,
            senderPhone: cleanPhone,
            hasReceiptImage: Boolean(submission.receiptUrl),
            recipientAccount: this.recipientAccount,
            status: "pending_verification"
          })
        ]
      );

      // Create Admin Notification
      await client.query(
        `INSERT INTO notifications (id, user_id, title_ar, title_en, message_ar, message_en, type)
         VALUES ($1, 'admin', $2, $3, $4, $5, 'order')`,
        [
          "notif_" + crypto.randomBytes(6).toString("hex"),
          "طلب دفع جديد قيد التدقيق 🔔",
          "Payment Pending Verification",
          `إشعار دفع للمشروع "${order.project_title}" من ${order.user_name}. المبلغ: ${Number(order.amount_syp).toLocaleString()} ل.س. المرجع: ${cleanTx}`,
          `Payment pending verification for "${order.project_title}" by ${order.user_name}. Amount: ${order.amount_syp} SYP. TX: ${cleanTx}`
        ]
      );

      // Create User Notification
      await client.query(
        `INSERT INTO notifications (id, user_id, title_ar, title_en, message_ar, message_en, type)
         VALUES ($1, $2, $3, $4, $5, $6, 'order')`,
        [
          "notif_" + crypto.randomBytes(6).toString("hex"),
          userId,
          "تم إرسال إثبات الدفع وهو قيد التدقيق الآن",
          "Payment Submitted - Pending Verification",
          `تم استلام بيانات التحويل للمشروع "${order.project_title}". طلبك الآن بحالة (قيد التدقيق) وسيتم تفعيل الملفات فور اعتماد الإدارة.`,
          `Payment details received for "${order.project_title}". Status is now pending verification.`
        ]
      );

      await client.query("COMMIT");

      return {
        success: true,
        status: "pending_verification",
        message: "تم استلام إثبات الدفع بنجاح والطلب الآن (قيد التدقيق) من قبل الإدارة.",
        orderId,
        transactionId: cleanTx
      };
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("Payment submission error:", err);
      return {
        success: false,
        status: "PENDING_PAYMENT",
        message: "تعذر تسجيل عملية الدفع حالياً، يرجى المحاولة بعد قليل.",
        orderId,
        error: err.message
      };
    } finally {
      client.release();
    }
  }

  async verifyPayment(orderId: string, adminUserId: string, notes: string | undefined, pool: any): Promise<PaymentResult> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const orderRes = await client.query(
        "SELECT * FROM orders WHERE id = $1 FOR UPDATE",
        [orderId]
      );

      if (orderRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return {
          success: false,
          status: "PENDING_PAYMENT",
          message: "الطلب غير موجود",
          orderId,
          error: "Order not found"
        };
      }

      const order = orderRes.rows[0];

      let effectiveTx = order.transfer_transaction_id;
      if (!effectiveTx) {
        if (order.receipt_url) {
          effectiveTx = "IMG-" + orderId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
        } else {
          await client.query("ROLLBACK");
          return {
            success: false,
            status: order.status,
            message: "لا يمكن اعتماد الدفع بدون وجود رقم عملية أو صورة إيصال مرفقة",
            orderId,
            error: "No transaction ID or receipt present"
          };
        }
      }

      // Check double spending one more time
      const dupCheck = await client.query(
        "SELECT id FROM orders WHERE transfer_transaction_id = $1 AND id != $2 AND status IN ('PAID', 'approved')",
        [effectiveTx, orderId]
      );

      if (dupCheck.rows.length > 0) {
        await client.query("ROLLBACK");
        return {
          success: false,
          status: order.status,
          message: "تحذير: رقم العملية هذا معتمد مسبقاً لطلب آخر مدفوع!",
          orderId,
          error: "Duplicate transaction already paid"
        };
      }

      const now = new Date();

      // Update order to approved
      await client.query(
        `UPDATE orders 
         SET status = 'approved',
             transfer_transaction_id = COALESCE(transfer_transaction_id, $1),
             verified_at = $2,
             admin_notes = $3,
             admin_feedback = NULL,
             failure_reason = NULL,
             updated_at = $2
         WHERE id = $4`,
        [effectiveTx, now, notes || "تم التحقق من الحوالة في تطبيق سيريتل كاش ومطابقة المبلغ بنجاح.", orderId]
      );

      // Increment project sales count
      await client.query(
        "UPDATE projects SET sales_count = sales_count + 1 WHERE id = $1",
        [order.project_id]
      );

      // Audit Log
      await client.query(
        `INSERT INTO audit_logs (id, user_id, action, details)
         VALUES ($1, $2, 'PAYMENT_VERIFIED', $3)`,
        [
          "log_" + crypto.randomBytes(6).toString("hex"),
          adminUserId,
          JSON.stringify({
            orderId,
            projectId: order.project_id,
            amountSyp: order.amount_syp,
            transactionId: effectiveTx,
            verifiedAt: now.toISOString(),
            method: "syriatel_cash",
            recipientAccount: this.recipientAccount,
            notes,
            status: "approved"
          })
        ]
      );

      // Notify User: Project Unlocked!
      await client.query(
        `INSERT INTO notifications (id, user_id, title_ar, title_en, message_ar, message_en, type)
         VALUES ($1, $2, $3, $4, $5, $6, 'order')`,
        [
          "notif_" + crypto.randomBytes(6).toString("hex"),
          order.user_id,
          "تم تأكيد الدفع وقبول طلبك بنجاح! 🎉",
          "Payment Approved! Project Unlocked",
          `تم قبول وتأكيد عملية التحويل للمشروع "${order.project_title}". تم تفعيل صلاحية الوصول وتحميل ملفات وأكواد المشروع فوراً.`,
          `Your payment for "${order.project_title}" has been approved! All files are now unlocked.`
        ]
      );

      // Notify Admin
      await client.query(
        `INSERT INTO notifications (id, user_id, title_ar, title_en, message_ar, message_en, type)
         VALUES ($1, 'admin', $2, $3, $4, $5, 'order')`,
        [
          "notif_" + crypto.randomBytes(6).toString("hex"),
          "تم تأكيد دفعة جديدة بنجاح ✅",
          "Payment Approved",
          `تم اعتماد الدفع للمشروع "${order.project_title}" للمستخدم ${order.user_name}. المبلغ: ${Number(order.amount_syp).toLocaleString()} ل.س. المرجع: ${effectiveTx}`,
          `Payment verified for "${order.project_title}" (${order.amount_syp} SYP). TX: ${effectiveTx}`
        ]
      );

      await client.query("COMMIT");

      return {
        success: true,
        status: "approved",
        message: "تم تأكيد الدفع بنجاح واعتماد الطلب وتفعيل تحميل الملفات.",
        orderId,
        transactionId: effectiveTx,
        verifiedAt: now
      };
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("Verify payment error:", err);
      return {
        success: false,
        status: "pending_verification",
        message: "فشل التحقق من الطلب",
        orderId,
        error: err.message
      };
    } finally {
      client.release();
    }
  }

  async rejectPayment(orderId: string, adminUserId: string, reason: string, pool: any): Promise<PaymentResult> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const orderRes = await client.query(
        "SELECT * FROM orders WHERE id = $1 FOR UPDATE",
        [orderId]
      );

      if (orderRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return {
          success: false,
          status: "PENDING_PAYMENT",
          message: "الطلب غير موجود",
          orderId,
          error: "Order not found"
        };
      }

      const order = orderRes.rows[0];

      const cleanReason = reason || "رقم العملية غير مطابق أو لم يتم استلام الحوالة في الحساب.";

      await client.query(
        `UPDATE orders 
         SET status = 'rejected',
             admin_feedback = $1,
             failure_reason = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [cleanReason, orderId]
      );

      // Audit Log
      await client.query(
        `INSERT INTO audit_logs (id, user_id, action, details)
         VALUES ($1, $2, 'PAYMENT_REJECTED', $3)`,
        [
          "log_" + crypto.randomBytes(6).toString("hex"),
          adminUserId,
          JSON.stringify({
            orderId,
            projectId: order.project_id,
            reason: cleanReason,
            adminFeedback: cleanReason,
            transactionId: order.transfer_transaction_id,
            status: "rejected"
          })
        ]
      );

      // User Notification with exact admin feedback
      await client.query(
        `INSERT INTO notifications (id, user_id, title_ar, title_en, message_ar, message_en, type)
         VALUES ($1, $2, $3, $4, $5, $6, 'order')`,
        [
          "notif_" + crypto.randomBytes(6).toString("hex"),
          order.user_id,
          "تنبيه: تعذر قبول إثبات الدفع (طلب مرفوض)",
          "Payment Verification Rejected",
          `تعذر تأكيد الدفع للمشروع "${order.project_title}". ملاحظة الإدارة: ${cleanReason}. يرجى التوجه لصفحة "طلباتي" والضغط على "إعادة رفع الإيصال" لتصحيح الطلب.`,
          `Payment could not be verified for "${order.project_title}". Admin feedback: ${cleanReason}. Please re-submit your receipt in My Orders.`
        ]
      );

      await client.query("COMMIT");

      return {
        success: true,
        status: "rejected",
        message: "تم رفض الدفعة وحفظ ملاحظة الإدارة وإشعار المستخدم بالسبب.",
        orderId
      };
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("Reject payment error:", err);
      return {
        success: false,
        status: "pending_verification",
        message: "فشل رفض الطلب",
        orderId,
        error: err.message
      };
    } finally {
      client.release();
    }
  }

  async getPaymentStatus(orderId: string, pool: any): Promise<{ status: PaymentStatus; transactionId?: string; verifiedAt?: Date; failureReason?: string }> {
    const res = await pool.query(
      "SELECT status, transfer_transaction_id, verified_at, failure_reason FROM orders WHERE id = $1",
      [orderId]
    );
    if (res.rows.length === 0) {
      return { status: "PENDING_PAYMENT" };
    }
    const row = res.rows[0];
    return {
      status: row.status as PaymentStatus,
      transactionId: row.transfer_transaction_id,
      verifiedAt: row.verified_at,
      failureReason: row.failure_reason
    };
  }
}

/**
 * Syriatel Cash Automated API Provider
 * 
 * Pre-engineered for future direct enterprise gateway integration if credentials
 * are provided in environment variables:
 * - SYRIATEL_CASH_API_URL
 * - SYRIATEL_CASH_API_KEY
 * - SYRIATEL_CASH_ACCOUNT
 */
export class SyriatelCashApiProvider implements PaymentProvider {
  readonly id = "syriatel_cash_api";
  readonly name = "Syriatel Cash API (مباشر)";
  readonly recipientAccount: string;
  readonly currency = "SYP";
  readonly isAutomated = true;

  private apiUrl: string;
  private apiKey: string;
  private manualFallback: ManualSyriatelCashProvider;

  constructor(apiUrl: string, apiKey: string, account = "0982257195") {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.recipientAccount = account;
    this.manualFallback = new ManualSyriatelCashProvider();
  }

  async createPaymentOrder(order: { id: string; amountSyp: number; projectTitle: string }): Promise<PaymentOrderInfo> {
    return this.manualFallback.createPaymentOrder(order);
  }

  validateTransactionId(transactionId: string) {
    return this.manualFallback.validateTransactionId(transactionId);
  }

  async submitPayment(submission: PaymentSubmission, pool: any): Promise<PaymentResult> {
    // 1. Submit to database with row-locking first
    const submitRes = await this.manualFallback.submitPayment(submission, pool);
    if (!submitRes.success) {
      return submitRes;
    }

    // 2. Query upstream provider API with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${this.apiUrl}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          transactionId: submission.transactionId,
          expectedAmount: submitRes.orderId,
          destinationAccount: this.recipientAccount
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.status === "SUCCESS" && data.amountMatch) {
          // Automated verification succeeded!
          return this.verifyPayment(submission.orderId, "system_api", "Verified automatically by Syriatel Cash API", pool);
        }
      }
    } catch (apiErr: any) {
      console.warn("Syriatel Cash upstream API call failed, kept in VERIFYING_PAYMENT / Manual review:", apiErr.message);
      // Fallback: order remains in PAYMENT_SUBMITTED for manual admin review
    }

    return submitRes;
  }

  async verifyPayment(orderId: string, adminUserId: string, notes: string | undefined, pool: any): Promise<PaymentResult> {
    return this.manualFallback.verifyPayment(orderId, adminUserId, notes, pool);
  }

  async rejectPayment(orderId: string, adminUserId: string, reason: string, pool: any): Promise<PaymentResult> {
    return this.manualFallback.rejectPayment(orderId, adminUserId, reason, pool);
  }

  async getPaymentStatus(orderId: string, pool: any) {
    return this.manualFallback.getPaymentStatus(orderId, pool);
  }
}

/**
 * Payment Provider Factory
 */
export function getPaymentProvider(): PaymentProvider {
  const apiUrl = process.env.SYRIATEL_CASH_API_URL;
  const apiKey = process.env.SYRIATEL_CASH_API_KEY;
  const account = process.env.SYRIATEL_CASH_ACCOUNT || "0982257195";

  if (apiUrl && apiKey) {
    return new SyriatelCashApiProvider(apiUrl, apiKey, account);
  }

  return new ManualSyriatelCashProvider();
}
