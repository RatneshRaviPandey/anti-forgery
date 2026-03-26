"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
  variant: "info" | "warning" | "danger";
  children: React.ReactNode;
  dismissible?: boolean;
  className?: string;
}

const styles = {
  info: "bg-primary/5 border-primary/20 text-primary",
  warning: "bg-warning/5 border-warning/20 text-yellow-800",
  danger: "bg-danger/5 border-danger/20 text-danger",
};

export function AlertBanner({ variant, children, dismissible = true, className }: AlertBannerProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div role="alert" className={cn("flex items-center gap-3 rounded-lg border px-4 py-3 text-sm", styles[variant], className)}>
      <div className="flex-1">{children}</div>
      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          className="ml-auto shrink-0 rounded p-1 hover:bg-black/5"
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}
