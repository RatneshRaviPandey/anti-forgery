"use client";

import { useState } from "react";
import { alerts as mockAlerts, type Alert } from "@/lib/mock-data";
import { useAlerts } from "@/hooks/use-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const [filter, setFilter] = useState<string>("all");
  const resolved = filter === "active" ? "false" : filter === "resolved" ? "true" : undefined;
  const { data: apiData, mutate } = useAlerts(1, 100, resolved);
  const [data, setData] = useState(mockAlerts);

  // Use API data if available
  const alertsList = apiData ?? data;
  const filtered = Array.isArray(alertsList)
    ? alertsList.filter((a: Record<string, unknown>) => {
        if (filter === "active") return !a.resolved;
        if (filter === "resolved") return a.resolved;
        return true;
      })
    : [];

  function resolveAlert(id: string) {
    // Try API first
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      fetch(`/api/alerts/${id}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(() => mutate());
    }
    // Also update local state for mock data fallback
    setData((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  }

  const typeVariant = (type: Alert["type"]) => {
    switch (type) {
      case "duplicate": return "invalid" as const;
      case "spike": return "suspicious" as const;
      case "geo_anomaly": return "info" as const;
      case "recall": return "invalid" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Alerts</h1>
        <p className="text-sm text-secondary">
          Monitor and resolve clone detection, scan spikes, and geographic anomalies.
        </p>
      </div>

      <div className="flex gap-2">
        {["all", "active", "resolved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              filter === f
                ? "bg-primary text-white"
                : "bg-white text-secondary border border-border hover:bg-surface-tint"
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "active" && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                {data.filter((a) => !a.resolved).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-8 text-center">
            <p className="text-sm text-secondary">No alerts match your filter.</p>
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "rounded-xl border bg-white p-5 transition-colors",
                alert.resolved ? "border-border" : "border-warning/30"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={typeVariant(alert.type)}>
                      {alert.type.replace("_", " ")}
                    </Badge>
                    {alert.resolved && (
                      <Badge variant="authentic">resolved</Badge>
                    )}
                    <span className="text-xs text-secondary">{alert.triggeredAt}</span>
                  </div>
                  <p className="text-sm text-foreground">{alert.message}</p>
                  <p className="text-xs text-secondary">Token: <code className="rounded bg-background px-1 py-0.5 font-mono">{alert.token}</code></p>
                </div>
                {!alert.resolved && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
