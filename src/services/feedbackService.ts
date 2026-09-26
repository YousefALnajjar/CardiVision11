import { PlatformFeedback, FeedbackStats, FeaturedTestimonial, FeedbackStatus, RatingTrendsResponse } from "../types";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("cardiovision_token") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const feedbackService = {
  // Submit new feedback (or upsert)
  async submitFeedback(rating: number, message: string): Promise<{ success: boolean; message: string; feedback?: PlatformFeedback; error?: string }> {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, message })
    });
    return res.json();
  },

  // Update existing feedback by ID
  async updateFeedback(id: string, rating: number, message: string): Promise<{ success: boolean; message: string; feedback?: PlatformFeedback; error?: string }> {
    const res = await fetch(`/api/feedback/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, message })
    });
    return res.json();
  },

  // Get current logged-in user's feedback
  async getMyFeedback(): Promise<{ success: boolean; feedback: PlatformFeedback | null; error?: string }> {
    const res = await fetch("/api/feedback/me", {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Public: Get featured testimonials and platform average rating
  async getFeaturedFeedback(): Promise<{ success: boolean; testimonials: FeaturedTestimonial[]; averageRating: number; totalCount: number; error?: string }> {
    const res = await fetch("/api/feedback/featured");
    return res.json();
  },

  // Admin: Get all feedback with filters and pagination
  async getAdminFeedback(params: {
    page?: number;
    limit?: number;
    rating?: number;
    status?: string;
    search?: string;
    dateFilter?: string;
  } = {}): Promise<{
    success: boolean;
    feedback: PlatformFeedback[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    error?: string;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.rating) query.append("rating", params.rating.toString());
    if (params.status && params.status !== "ALL") query.append("status", params.status);
    if (params.search) query.append("search", params.search);
    if (params.dateFilter && params.dateFilter !== "all") query.append("dateFilter", params.dateFilter);

    const res = await fetch(`/api/admin/feedback?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Admin: Get detailed feedback metrics & star breakdown
  async getAdminFeedbackStats(): Promise<{ success: boolean; stats: FeedbackStats; error?: string }> {
    const res = await fetch("/api/admin/feedback/stats", {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Admin: Change feedback status
  async updateStatus(id: string, status: FeedbackStatus): Promise<{ success: boolean; message: string; feedback?: PlatformFeedback; error?: string }> {
    const res = await fetch(`/api/admin/feedback/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Admin: Send reply to student feedback
  async reply(id: string, reply: string): Promise<{ success: boolean; message: string; feedback?: PlatformFeedback; error?: string }> {
    const res = await fetch(`/api/admin/feedback/${id}/reply`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ reply })
    });
    return res.json();
  },

  // Admin: Toggle featured status
  async toggleFeature(id: string, isFeatured: boolean): Promise<{ success: boolean; message: string; feedback?: PlatformFeedback; error?: string }> {
    const res = await fetch(`/api/admin/feedback/${id}/feature`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ isFeatured })
    });
    return res.json();
  },

  // Admin: Delete feedback
  async deleteFeedback(id: string): Promise<{ success: boolean; message: string; error?: string }> {
    const res = await fetch(`/api/admin/feedback/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Admin: Get Rating Trends over time for Recharts
  async getRatingTrends(): Promise<RatingTrendsResponse> {
    const res = await fetch("/api/admin/feedback/trends", {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Admin: Export Feedback to CSV
  async exportFeedbackCsv(): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/admin/export/feedback", {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cardiovision_feedback_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true };
    } catch (e: any) {
      console.error("Export feedback CSV error:", e);
      return { success: false, error: e.message };
    }
  },

  // Admin: Bulk Action (flag for review or delete)
  async bulkAction(
    feedbackIds: string[],
    action: "flag" | "delete",
    status?: string
  ): Promise<{ success: boolean; message: string; affectedCount?: number; error?: string }> {
    const res = await fetch("/api/admin/feedback/bulk-action", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ feedbackIds, action, status })
    });
    return res.json();
  }
};
