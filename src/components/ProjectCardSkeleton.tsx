import React from "react";

interface ProjectCardSkeletonProps {
  theme: "dark" | "light";
  key?: React.Key;
}

export default function ProjectCardSkeleton({ theme }: ProjectCardSkeletonProps) {
  const isDark = theme === "dark";
  const shimmer = `shimmer-block ${isDark ? "shimmer-dark" : "shimmer-light"}`;

  return (
    <div
      className={`w-full min-w-full rounded-2xl border overflow-hidden flex flex-col justify-between relative transition-all duration-300 ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}
      aria-hidden="true"
    >
      {/* Ambient Card Shimmer Sweep */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <div
          className={`w-full h-full -translate-x-full animate-shimmer ${
            isDark
              ? "bg-gradient-to-r from-transparent via-white/[0.035] to-transparent"
              : "bg-gradient-to-r from-transparent via-white/50 to-transparent"
          }`}
        />
      </div>

      <div>
        {/* Project Thumbnail Image Skeleton */}
        <div className={`relative h-48 overflow-hidden ${shimmer} ${isDark ? "bg-slate-800/80" : "bg-slate-200/80"}`}>
          {/* Top Left Badges Skeleton */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <div className={`h-5 w-16 rounded-full ${shimmer} ${isDark ? "bg-slate-700/80" : "bg-slate-300"}`} />
            <div className={`h-4 w-20 rounded-full ${shimmer} ${isDark ? "bg-slate-700/60" : "bg-slate-300/80"}`} />
          </div>

          {/* Top Right View Count Badge Skeleton */}
          <div className="absolute top-3 right-3 z-10">
            <div className={`h-5 w-14 rounded-full ${shimmer} ${isDark ? "bg-slate-700/80" : "bg-slate-300"}`} />
          </div>

          {/* Bottom Left Category Chip Skeleton */}
          <div className="absolute bottom-3 left-3">
            <div className={`h-4 w-20 rounded-full ${shimmer} ${isDark ? "bg-slate-700/90" : "bg-slate-300"}`} />
          </div>

          {/* Bottom Right Pricing Tag Skeleton */}
          <div className="absolute bottom-3 right-3">
            <div className={`h-5 w-16 rounded-lg ${shimmer} ${isDark ? "bg-slate-700/90" : "bg-slate-300"}`} />
          </div>
        </div>

        {/* Content Box Skeleton */}
        <div className="p-5">
          {/* University and Duration Row Skeleton */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className={`h-3 w-28 rounded-md ${shimmer} ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
            <div className={`h-3 w-16 rounded-md ${shimmer} ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
          </div>

          {/* Project Title Skeleton */}
          <div className={`h-5 w-4/5 rounded-md mb-2 ${shimmer} ${isDark ? "bg-slate-700/80" : "bg-slate-300"}`} />

          {/* Description Lines Skeleton */}
          <div className="space-y-1.5 mb-3">
            <div className={`h-3.5 w-full rounded ${shimmer} ${isDark ? "bg-slate-800/90" : "bg-slate-200"}`} />
            <div className={`h-3.5 w-3/4 rounded ${shimmer} ${isDark ? "bg-slate-800/70" : "bg-slate-200/80"}`} />
          </div>

          {/* Primary Language and Hardware Tag Skeleton */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className={`h-5 w-20 rounded-md ${shimmer} ${isDark ? "bg-slate-800/90" : "bg-slate-200"}`} />
            <div className={`h-5 w-24 rounded-md ${shimmer} ${isDark ? "bg-slate-800/80" : "bg-slate-200"}`} />
          </div>

          {/* Metrics Row Skeleton */}
          <div className={`flex items-center justify-between pt-2 border-t ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`h-3 w-10 rounded ${shimmer} ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
              <div className={`h-3 w-10 rounded ${shimmer} ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
              <div className={`h-3 w-10 rounded ${shimmer} ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
            </div>
            <div className={`h-3 w-8 rounded ${shimmer} ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
          </div>
        </div>
      </div>

      {/* Footer CTA Buttons Skeleton */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-3 max-[359px]:flex max-[359px]:flex-col max-[359px]:min-w-full">
        <div className={`h-8 rounded-xl ${shimmer} ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
        <div className={`h-8 rounded-xl ${shimmer} ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
      </div>
    </div>
  );
}
