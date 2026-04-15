"use client";

import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-white p-5 animate-pulse", className)}>
      <div className="h-10 w-10 rounded-lg bg-gray-200 mb-3" />
      <div className="h-7 w-20 rounded bg-gray-200 mb-2" />
      <div className="h-4 w-24 rounded bg-gray-100" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-white overflow-hidden animate-pulse", className)}>
      {/* Header */}
      <div className="flex border-b border-border bg-gray-50/50 px-4 py-3 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-gray-200" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex px-4 py-3 gap-4 border-b border-border/30">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 flex-1 rounded bg-gray-100" style={{ opacity: 1 - r * 0.15 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-white p-5 animate-pulse", className)}>
      <div className="h-5 w-40 rounded bg-gray-200 mb-4" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gray-200"
            style={{ height: `${20 + Math.random() * 80}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionHref,
}: {
  icon: string;
  title: string;
  description: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border bg-white p-12 text-center">
      <div className="text-5xl mb-4" aria-hidden="true">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-secondary max-w-md mx-auto mb-6">{description}</p>
      {action && actionHref && (
        <a
          href={actionHref}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition"
        >
          {action}
        </a>
      )}
    </div>
  );
}
