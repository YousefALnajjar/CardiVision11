import React, { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from "recharts";
import {
  TrendingUp,
  Star,
  Calendar,
  RefreshCw,
  Award,
  CheckCircle,
  HelpCircle,
  BarChart2,
  Smile,
  Frown,
  Sliders
} from "lucide-react";
import { RatingTrendPoint } from "../types";
import { feedbackService } from "../services/feedbackService";

interface RatingTrendsChartProps {
  lang: "ar" | "en";
  theme?: "dark" | "light";
  onRefreshTrigger?: () => void;
}

export const RatingTrendsChart: React.FC<RatingTrendsChartProps> = ({
  lang,
  theme = "dark",
  onRefreshTrigger
}) => {
  const isAr = lang === "ar";
  const isDark = theme === "dark";

  const [trends, setTrends] = useState<RatingTrendPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalCount: number;
    overallAvg: number;
    satisfactionRate: number;
  } | null>(null);

  // Filter & view modes
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("all");
  const [metricMode, setMetricMode] = useState<"both" | "cumulative" | "daily">("both");

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedbackService.getRatingTrends();
      if (res.success) {
        setTrends(res.trends || []);
        if (res.summary) {
          setSummary(res.summary);
        }
      } else {
        setError(res.error || (isAr ? "تعذر جلب توجهات التقييم" : "Failed to load rating trends"));
      }
    } catch (err: any) {
      console.error("Fetch rating trends error:", err);
      setError(err.message || (isAr ? "خطأ في الاتصال" : "Network error"));
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  // Filter trends based on selected timeRange
  const filteredTrends = React.useMemo(() => {
    if (!trends || trends.length === 0) return [];
    if (timeRange === "all") return trends;

    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return trends.filter(t => {
      const d = new Date(t.date);
      return d >= cutoff;
    });
  }, [trends, timeRange]);

  // Format date for chart axis
  const formatAxisDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(isAr ? "ar-SY" : "en-US", {
        month: "short",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Custom rich Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: RatingTrendPoint = payload[0].payload;
      return (
        <div
          className={`p-4 rounded-2xl border shadow-2xl text-xs space-y-2.5 backdrop-blur-md min-w-[220px] ${
            isDark
              ? "bg-slate-900/95 border-slate-700/80 text-slate-200"
              : "bg-white/95 border-slate-200 text-slate-800 shadow-slate-300"
          }`}
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
            <span className="font-mono font-bold text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {label ? formatAxisDate(label) : dataPoint.date}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              {dataPoint.count} {isAr ? "تقييم" : "reviews"}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {isAr ? "المتوسط التراكمي:" : "Cumulative Score:"}
              </span>
              <span className="font-mono font-black text-amber-400 text-sm">
                {dataPoint.cumulativeAvg.toFixed(2)} / 5.0
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                {isAr ? "متوسط ذلك اليوم:" : "Daily Average:"}
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {dataPoint.avgRating.toFixed(2)} ★
              </span>
            </div>

            {dataPoint.count > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Smile className="w-3 h-3" />
                  {isAr ? "تقييم ممتاز (5★):" : "5★ Stars:"}
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {dataPoint.count5} ({Math.round((dataPoint.count5 / dataPoint.count) * 100)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="rating-trends-chart-container"
      className={`p-6 rounded-3xl border transition-all ${
        isDark
          ? "bg-slate-900/90 border-slate-800 shadow-xl"
          : "bg-white border-slate-200 shadow-lg"
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <TrendingUp className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>{isAr ? "منحنى توجهات تقييم المنصة (Rating Trends)" : "Platform Rating Trends"}</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold">
                Recharts Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? "مراقبة متوسط درجات رضا المستخدمين وتقلباتها الزمنية المستمرة لضمان الجودة الأكاديمية"
                : "Tracking user satisfaction score fluctuations and average feedback over time"}
            </p>
          </div>
        </div>

        {/* Action Controls: Time Range & Metric Mode & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setMetricMode("both")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                metricMode === "both"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isAr ? "الكل" : "Both"}
            </button>
            <button
              onClick={() => setMetricMode("cumulative")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                metricMode === "cumulative"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isAr ? "التراكمي" : "Cumulative"}
            </button>
            <button
              onClick={() => setMetricMode("daily")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                metricMode === "daily"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isAr ? "اليومي" : "Daily"}
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
            {(["7d", "30d", "90d", "all"] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  timeRange === range
                    ? "bg-cyan-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {range === "7d" ? (isAr ? "7 أيام" : "7D") :
                 range === "30d" ? (isAr ? "30 يوم" : "30D") :
                 range === "90d" ? (isAr ? "90 يوم" : "90D") :
                 (isAr ? "الكل" : "All")}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            id="btn-refresh-rating-trends"
            onClick={() => {
              fetchTrends();
              if (onRefreshTrigger) onRefreshTrigger();
            }}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all disabled:opacity-50"
            title={isAr ? "تحديث المنحنى" : "Refresh chart"}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-white shadow-md border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-gray-600 font-medium">{isAr ? "متوسط الرضا العام" : "Platform Score"}</div>
              <div className="text-xl font-bold text-amber-500 font-mono mt-0.5 flex items-center gap-1">
                <span>{summary.overallAvg.toFixed(2)}</span>
                <Star className="w-4 h-4 fill-amber-500 text-amber-500 inline" />
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white shadow-md border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-gray-600 font-medium">{isAr ? "نسبة التقييم الإيجابي" : "Positive Ratio"}</div>
              <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">
                {summary.satisfactionRate}%
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Smile className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white shadow-md border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-gray-600 font-medium">{isAr ? "إجمالي التقييمات" : "Submissions"}</div>
              <div className="text-xl font-bold text-blue-600 font-mono mt-0.5">
                {summary.totalCount}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white shadow-md border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-gray-600 font-medium">{isAr ? "حالة المؤشر" : "Trend Status"}</div>
              <div className="text-xs font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{isAr ? "أداء متميز وثابت" : "Optimal Quality"}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      {loading && trends.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <span className="text-xs font-medium">{isAr ? "جاري استرجاع بيانات التقييم الزمني..." : "Loading rating timeline..."}</span>
        </div>
      ) : error ? (
        <div className="h-72 flex flex-col items-center justify-center gap-2 text-rose-400">
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={fetchTrends}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-white hover:bg-slate-700"
          >
            {isAr ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      ) : filteredTrends.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center gap-2 text-slate-500">
          <TrendingUp className="w-10 h-10 opacity-40" />
          <p className="text-sm font-bold text-slate-400">
            {isAr ? "لا توجد بيانات كافية خلال هذه الفترة الزمنية" : "No trend data points found for this range"}
          </p>
          <button
            onClick={() => setTimeRange("all")}
            className="text-xs text-amber-400 hover:underline mt-1"
          >
            {isAr ? "عرض كل التواريخ" : "Show all time"}
          </button>
        </div>
      ) : (
        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredTrends}
              margin={{ top: 15, right: isAr ? 15 : 25, left: isAr ? 25 : 15, bottom: 10 }}
            >
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#334155" : "#e2e8f0"}
                opacity={0.5}
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                stroke={isDark ? "#64748b" : "#94a3b8"}
                tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                axisLine={{ stroke: isDark ? "#334155" : "#cbd5e1" }}
                tickLine={false}
              />

              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(val) => `${val} ★`}
                stroke={isDark ? "#64748b" : "#94a3b8"}
                tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                axisLine={{ stroke: isDark ? "#334155" : "#cbd5e1" }}
                tickLine={false}
                orientation={isAr ? "right" : "left"}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align={isAr ? "left" : "right"}
                height={36}
                wrapperStyle={{ paddingBottom: "10px", fontSize: "12px" }}
                formatter={(value) => {
                  if (value === "cumulativeAvg") {
                    return (
                      <span className="text-amber-400 font-bold mx-1">
                        {isAr ? "متوسط التقييم التراكمي (Cumulative Score)" : "Cumulative Score (Platform Average)"}
                      </span>
                    );
                  }
                  if (value === "avgRating") {
                    return (
                      <span className="text-cyan-400 font-bold mx-1">
                        {isAr ? "متوسط التقييم اليومي (Daily Average)" : "Daily Average Rating"}
                      </span>
                    );
                  }
                  return value;
                }}
              />

              {/* Target Benchmark Line (4.5 ★) */}
              <ReferenceLine
                y={4.5}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: isAr ? "المعيار الذهبي (4.5★)" : "Target Benchmark (4.5★)",
                  position: isAr ? "insideTopLeft" : "insideTopRight",
                  fill: "#10b981",
                  fontSize: 10,
                  fontWeight: "bold"
                }}
              />

              {/* Cumulative Average Line */}
              {(metricMode === "both" || metricMode === "cumulative") && (
                <Line
                  type="monotone"
                  dataKey="cumulativeAvg"
                  name="cumulativeAvg"
                  stroke="#f59e0b"
                  strokeWidth={3.5}
                  dot={{ r: 4, fill: "#f59e0b", stroke: "#1e293b", strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: "#fbbf24", stroke: "#fff", strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={1200}
                />
              )}

              {/* Daily Average Line */}
              {(metricMode === "both" || metricMode === "daily") && (
                <Line
                  type="monotone"
                  dataKey="avgRating"
                  name="avgRating"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={{ r: 3, fill: "#06b6d4", stroke: "#0f172a", strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: "#22d3ee", stroke: "#fff", strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={1200}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer Insight */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {isAr
              ? "يعتمد المنحنى على الحساب اللحظي لتقييمات طلاب الهندسة المسجلة في قاعدة بيانات PostgreSQL"
              : "Chart dynamically computed in real-time from PostgreSQL verified student feedback"}
          </span>
        </span>
        <span className="font-mono text-slate-400">
          {isAr ? `نقاط العرض: ${filteredTrends.length} فترة` : `Displaying ${filteredTrends.length} data points`}
        </span>
      </div>
    </div>
  );
};
