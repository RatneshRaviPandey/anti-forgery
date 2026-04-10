"use client";

import { cn } from "@/lib/utils";

interface KPITileProps {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function KPITile({ label, value, trend, trendUp, icon, className }: KPITileProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-white p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <div className="mt-2 flex items-center gap-1 text-sm">
        <span aria-hidden="true" className={trendUp ? "text-success" : "text-danger"}>
          {trendUp ? "↑" : "↓"}
        </span>
        <span className={trendUp ? "text-success" : "text-danger"}>{trend}</span>
        <span className="text-secondary">vs last period</span>
      </div>
    </div>
  );
}
