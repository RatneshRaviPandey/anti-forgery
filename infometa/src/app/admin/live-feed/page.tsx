"use client";

import { useEffect, useState, useRef } from "react";
import { useAdminAuth } from "../layout";
import { Badge } from "@/components/ui/badge";
import { Radio, Pause, Play } from "lucide-react";

interface ScanEvent {
  id: string;
  token: string;
  resultStatus: string;
  city: string | null;
  country: string | null;
  scannedAt: string;
  brandId: string | null;
  tokenScanCount?: number;
}

export default function LiveFeedPage() {
  const { token } = useAdminAuth();
  const [scans, setScans] = useState<ScanEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  function fetchScans() {
    fetch("/api/scans?limit=50", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setScans(d.data); })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!token) return;
    fetchScans();
    intervalRef.current = setInterval(() => {
      if (!paused) fetchScans();
    }, 10000); // Refresh every 10 seconds
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [token, paused]);

  const statusColor = (s: string) =>
    s === "authentic" ? "bg-green-500" : s === "suspicious" ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Live Scan Feed</h1>
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
            <Radio size={12} className="animate-pulse" /> Live
          </span>
        </div>
        <button
          onClick={() => setPaused(!paused)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white text-sm hover:bg-surface-tint"
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      <p className="text-sm text-secondary">
        Auto-refreshes every 10 seconds. Showing last 50 scan events across all brands.
      </p>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" /></div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <div className="divide-y divide-border/50">
            {scans.map((scan, i) => (
              <div
                key={scan.id}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-surface-tint/30 transition ${i === 0 ? 'bg-teal-50/30' : ''}`}
              >
                {/* Status dot */}
                <div className={`h-3 w-3 rounded-full ${statusColor(scan.resultStatus)} ${i === 0 ? 'animate-pulse' : ''}`} />

                {/* Token */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-secondary truncate">
                    {scan.token.length > 40 ? scan.token.slice(0, 40) + "…" : scan.token}
                  </p>
                </div>

                {/* Result badge */}
                <Badge variant={scan.resultStatus === "authentic" ? "authentic" : scan.resultStatus === "suspicious" ? "suspicious" : "invalid"}>
                  {scan.resultStatus}
                </Badge>

                {/* Scan count */}
                {scan.tokenScanCount && scan.tokenScanCount > 1 && (
                  <span className={`text-xs font-bold ${scan.tokenScanCount > 3 ? 'text-red-600' : 'text-gray-500'}`}>
                    ×{scan.tokenScanCount}
                  </span>
                )}

                {/* Location */}
                <span className="text-xs text-secondary w-24 text-right truncate">
                  {scan.city || scan.country || "Unknown"}
                </span>

                {/* Time */}
                <span className="text-xs text-secondary w-20 text-right">
                  {scan.scannedAt ? new Date(scan.scannedAt).toLocaleTimeString() : "—"}
                </span>
              </div>
            ))}
            {scans.length === 0 && (
              <div className="p-8 text-center text-secondary text-sm">
                No scan events yet. Scans will appear here in real-time when products are verified.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
