"use client";

import { scans, alerts } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, AlertTriangle, CheckCircle } from "lucide-react";

type TrustLog = {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  severity: "info" | "warning" | "critical";
};

// Generate trust logs from scan and alert data
const alertLogs: TrustLog[] = alerts.map((a) => ({
  id: `tl-alert-${a.id}`,
  timestamp: a.triggeredAt,
  action: a.resolved ? "Alert Resolved" : "Alert Triggered",
  actor: "System",
  details: a.message,
  severity: (a.type === "recall" ? "critical" : a.type === "spike" ? "warning" : "info") as TrustLog["severity"],
}));

const manualLogs: TrustLog[] = [
  {
    id: "tl-001",
    timestamp: "2025-03-25T10:00:00Z",
    action: "Batch Activated",
    actor: "admin@infometa.tech",
    details: "Batch DF-2025-001 activated with 50,000 QR codes for PureLife Milk 1L.",
    severity: "info",
  },
  {
    id: "tl-002",
    timestamp: "2025-03-24T16:30:00Z",
    action: "Product Added",
    actor: "admin@infometa.tech",
    details: "New product VitaBoost Multi-Vitamin (NW-MV-060) added to catalog.",
    severity: "info",
  },
  {
    id: "tl-003",
    timestamp: "2025-03-23T08:15:00Z",
    action: "QR Code Deactivated",
    actor: "system-clone-detector",
    details: "QR code DUP-999 deactivated automatically after 7 scans from 3 different cities.",
    severity: "critical",
  },
  {
    id: "tl-004",
    timestamp: "2025-03-22T14:00:00Z",
    action: "User Login",
    actor: "admin@infometa.tech",
    details: "Admin login from IP 103.xx.xx.45 (Mumbai, India).",
    severity: "info",
  },
  {
    id: "tl-005",
    timestamp: "2025-03-21T11:00:00Z",
    action: "Settings Updated",
    actor: "admin@infometa.tech",
    details: "Clone detection threshold updated from 5 to 3 scans.",
    severity: "warning",
  },
];

const trustLogs = [...alertLogs, ...manualLogs].sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
);

const severityConfig = {
  info: { icon: Eye, color: "text-primary", badge: "info" as const },
  warning: { icon: AlertTriangle, color: "text-warning", badge: "suspicious" as const },
  critical: { icon: Shield, color: "text-danger", badge: "invalid" as const },
};

export default function TrustLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Trust & Audit Logs</h1>
        <p className="text-sm text-secondary">
          Immutable record of all platform actions, alerts, and security events.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-white">
        <div className="divide-y divide-border">
          {trustLogs.map((log) => {
            const config = severityConfig[log.severity];
            const Icon = config.icon;
            return (
              <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-surface-tint/30">
                <div className={`mt-0.5 ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{log.action}</span>
                    <Badge variant={config.badge}>{log.severity}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-secondary">{log.details}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-secondary">
                    <span>{log.actor}</span>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
