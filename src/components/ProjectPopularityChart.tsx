import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import {
  TrendingUp,
  Eye,
  Heart,
  Award,
  RefreshCw,
  Filter,
  BarChart2,
  Sparkles,
  ArrowUpDown
} from "lucide-react";

interface ProjectEngagement {
  id: string;
  titleAr: string;
  titleEn: string;
  category: string;
  difficultyLevel?: string;
  status?: string;
  priceSyp?: number;
  priceUsd?: number;
  views: number;
  likes: number;
  sales: number;
  reviews: number;
  rating: number;
  engagementScore: number;
}

interface ProjectPopularityChartProps {
  lang: "ar" | "en";
  theme: "dark" | "light";
  onSelectProject?: (projectId: string) => void;
}

export const ProjectPopularityChart: React.FC<ProjectPopularityChartProps> = ({
  lang,
  theme,
  onSelectProject
}) => {
  const [data, setData] = useState<ProjectEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"engagement" | "views" | "likes">("engagement");
  const [limit, setLimit] = useState<number>(10);
  const [displayMetric, setDisplayMetric] = useState<"both" | "views" | "likes">("both");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/projects/popularity", {
        headers: { "Accept": "application/json" },
        credentials: "include"
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.projects)) {
        setData(result.projects);
      } else {
        setError(result.error || "Failed to load project popularity data");
      }
    } catch (err: any) {
      console.error("Error fetching popularity trends:", err);
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter and sort the data for visualization
  const categories = Array.from(new Set(data.map(p => p.category))).filter(Boolean);

  const filteredData = data
    .filter(p => selectedCategory === "all" || p.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "views") return b.views - a.views;
      if (sortBy === "likes") return b.likes - a.likes;
      return b.engagementScore - a.engagementScore;
    });

  const chartData = filteredData.slice(0, limit).map(p => ({
    id: p.id,
    name: lang === "ar" ? p.titleAr : p.titleEn,
    shortName: (lang === "ar" ? p.titleAr : p.titleEn).length > 22
      ? (lang === "ar" ? p.titleAr : p.titleEn).substring(0, 20) + "..."
      : (lang === "ar" ? p.titleAr : p.titleEn),
    category: p.category,
    views: p.views,
    likes: p.likes,
    rating: p.rating,
    score: p.engagementScore,
    fullData: p
  }));

  // Aggregated analytics
  const totalViews = data.reduce((acc, curr) => acc + curr.views, 0);
  const totalLikes = data.reduce((acc, curr) => acc + curr.likes, 0);
  const topProject = data.length > 0 ? [...data].sort((a, b) => b.engagementScore - a.engagementScore)[0] : null;
  const avgViews = data.length > 0 ? Math.round(totalViews / data.length) : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const full = item.fullData as ProjectEngagement;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 text-xs space-y-2 max-w-xs">
          <div className="border-b border-gray-200 pb-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 font-bold uppercase">
              {full.category}
            </span>
            <p className="text-gray-900 font-bold text-sm mt-1 line-clamp-2">
              {lang === "ar" ? full.titleAr : full.titleEn}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "المشاهدات:" : "Views:"}</span>
              <strong className="font-bold font-mono text-blue-700">{full.views.toLocaleString()}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
              <Heart className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "المفضلة / الإعجاب:" : "Likes:"}</span>
              <strong className="font-bold font-mono text-rose-600">{full.likes.toLocaleString()}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "التقييم:" : "Rating:"}</span>
              <strong className="font-bold font-mono text-emerald-700">{full.rating.toFixed(1)} ★</strong>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "نقاط التفاعل:" : "Score:"}</span>
              <strong className="font-bold font-mono text-amber-600">{full.engagementScore}</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-6 rounded-3xl border transition-all ${
      theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
    }`}>
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-5 mb-6 border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-black text-base ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                {lang === "ar" ? "مؤشرات تفاعل وشعبية المشاريع (Popularity Trends)" : "Project Popularity & Engagement Trends"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === "ar"
                  ? "مقارنة معدلات المشاهدة والإعجاب (Views vs Likes) لتحديد المشاريع الأكثر طلباً واهتماماً"
                  : "Visualize project engagement (views & likes) to identify top-performing projects"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`text-xs px-2.5 py-1.5 rounded-xl border outline-none font-bold transition-all ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-200"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value="all">{lang === "ar" ? "كل التخصصات" : "All Categories"}</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`text-xs px-2.5 py-1.5 rounded-xl border outline-none font-bold transition-all ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-200"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value="engagement">{lang === "ar" ? "الأعلى تفاعلاً (مركب)" : "Highest Engagement"}</option>
              <option value="views">{lang === "ar" ? "الأكثر مشاهدة" : "Most Views"}</option>
              <option value="likes">{lang === "ar" ? "الأكثر إعجاباً" : "Most Likes"}</option>
            </select>
          </div>

          {/* Limit selector */}
          <div className="flex items-center gap-1">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className={`text-xs px-2.5 py-1.5 rounded-xl border outline-none font-bold transition-all ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-200"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={50}>Top 50</option>
            </select>
          </div>

          {/* Metric Selector Buttons */}
          <div className={`p-0.5 rounded-xl border flex items-center ${
            theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
          }`}>
            <button
              onClick={() => setDisplayMetric("both")}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                displayMetric === "both"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lang === "ar" ? "الكل" : "Both"}
            </button>
            <button
              onClick={() => setDisplayMetric("views")}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                displayMetric === "views"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lang === "ar" ? "مشاهدات" : "Views"}
            </button>
            <button
              onClick={() => setDisplayMetric("likes")}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                displayMetric === "likes"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lang === "ar" ? "إعجابات" : "Likes"}
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className={`p-2 rounded-xl border transition-all ${
              theme === "dark"
                ? "bg-slate-950 hover:bg-slate-850 text-slate-300 border-slate-800"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
            title={lang === "ar" ? "تحديث البيانات" : "Refresh Data"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className={`p-3.5 rounded-2xl border ${
          theme === "dark" ? "bg-slate-950/70 border-slate-850" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-indigo-400 mb-1">
            <span className="text-[11px] font-bold">{lang === "ar" ? "إجمالي المشاهدات" : "Total Views"}</span>
            <Eye className="w-4 h-4" />
          </div>
          <span className="text-lg font-black font-mono tracking-tight">
            {totalViews.toLocaleString()}
          </span>
        </div>

        <div className={`p-3.5 rounded-2xl border ${
          theme === "dark" ? "bg-slate-950/70 border-slate-850" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-[11px] font-bold">{lang === "ar" ? "إجمالي الإعجابات" : "Total Likes"}</span>
            <Heart className="w-4 h-4" />
          </div>
          <span className="text-lg font-black font-mono tracking-tight">
            {totalLikes.toLocaleString()}
          </span>
        </div>

        <div className={`p-3.5 rounded-2xl border ${
          theme === "dark" ? "bg-slate-950/70 border-slate-850" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] font-bold">{lang === "ar" ? "المشروع الأكثر طلباً" : "Top Project"}</span>
            <Award className="w-4 h-4" />
          </div>
          <span className="text-xs font-black line-clamp-1">
            {topProject ? (lang === "ar" ? topProject.titleAr : topProject.titleEn) : "—"}
          </span>
        </div>

        <div className={`p-3.5 rounded-2xl border ${
          theme === "dark" ? "bg-slate-950/70 border-slate-850" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[11px] font-bold">{lang === "ar" ? "معدل المشاهدات لكل مشروع" : "Avg Views / Project"}</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-lg font-black font-mono tracking-tight">
            {avgViews.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      {loading ? (
        <div className="h-72 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
            <span>{lang === "ar" ? "جاري تحميل بيانات التفاعل والشعبية..." : "Loading engagement trends..."}</span>
          </div>
        </div>
      ) : error ? (
        <div className="h-72 flex items-center justify-center">
          <div className="text-rose-400 text-xs text-center space-y-1">
            <p className="font-bold">{error}</p>
            <button
              onClick={fetchData}
              className="text-xs text-indigo-400 hover:underline cursor-pointer"
            >
              {lang === "ar" ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-slate-500 text-xs">
          {lang === "ar" ? "لا توجد بيانات متاحة للعرض حالياً" : "No project engagement data found"}
        </div>
      ) : (
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === "dark" ? "#334155" : "#e2e8f0"}
                opacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="shortName"
                tick={{
                  fill: theme === "dark" ? "#94a3b8" : "#64748b",
                  fontSize: 10,
                  fontWeight: 600
                }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{
                  fill: theme === "dark" ? "#94a3b8" : "#64748b",
                  fontSize: 10
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: "10px", fontSize: "11px" }}
              />

              {(displayMetric === "both" || displayMetric === "views") && (
                <Bar
                  dataKey="views"
                  name={lang === "ar" ? "المشاهدات (Views)" : "Views"}
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                  cursor="pointer"
                  onClick={(entry) => onSelectProject?.(entry.id)}
                />
              )}

              {(displayMetric === "both" || displayMetric === "likes") && (
                <Bar
                  dataKey="likes"
                  name={lang === "ar" ? "الإعجابات (Likes)" : "Likes"}
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                  cursor="pointer"
                  onClick={(entry) => onSelectProject?.(entry.id)}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ProjectPopularityChart;
