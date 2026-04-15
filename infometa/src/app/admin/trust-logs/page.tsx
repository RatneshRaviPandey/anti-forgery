"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "../layout";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, AlertTriangle } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function TrustLogsPage() {
  const { token } = useAdminAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/superadmin/audit-logs?limit=50", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setLogs(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const severityOf = (action: string) => {
    if (action.includes("LOCK") || action.includes("FAIL")) return "critical";
    if (action.includes("CHANGE") || action.includes("DELETE")) return "warning";
    return "info";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Trust & Audit Logs</h1>
        <p className="text-sm text-secondary">Immutable record of all platform actions and security events.</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" /></div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <p className="text-sm text-secondary">No audit log entries yet.</p>
        </div>
      ) : (
      <div className="rounded-xl border border-border bg-white divide-y divide-border">
        {logs.map((log) => {
          const sev = severityOf(log.action);
          const Icon = sev === "critical" ? Shield : sev === "warning" ? AlertTriangle : Eye;
          const color = sev === "critical" ? "text-danger" : sev === "warning" ? "text-warning" : "text-primary";
          const badge = sev === "critical" ? "invalid" : sev === "warning" ? "suspicious" : "info";
          return (
            <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-surface-tint/30">
              <div className={`mt-0.5 ${color}`}><Icon className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{log.action}</span>
                  <Badge variant={badge as "invalid" | "suspicious" | "info"}>{sev}</Badge>
                  <span className="text-xs text-secondary">{log.entity}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-secondary">
                  {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}