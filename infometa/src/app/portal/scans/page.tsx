"use client";

import { useEffect, useState } from "react";
import { usePortalAuth } from "../layout";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

export default function PortalScans() {
  const { token } = usePortalAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/scans?limit=500", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setScans(d.data); })
      .finally(() => setLoading(false));
  }, [token]);

  const columns = [
    {
      key: "token", header: "Token", sortable: true, width: 220,
      render: (item: Record<string, unknown>) => (
        <span className="font-mono text-xs">{String(item.token ?? "").slice(0, 30)}…</span>
      ),
    },
    {
      key: "resultStatus", header: "Result", sortable: true, filterable: true,
      filterOptions: ["authentic", "suspicious", "invalid"],
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.resultStatus === "authentic" ? "authentic" : item.resultStatus === "suspicious" ? "suspicious" : "invalid"}>
          {String(item.resultStatus ?? "unknown")}
        </Badge>
      ),
    },
    {
      key: "tokenScanCount", header: "Scan Count", sortable: true, width: 110,
      render: (item: Record<string, unknown>) => {
        const cnt = Number(item.tokenScanCount ?? 1);
        return (
          <span className={cnt > 3 ? "font-bold text-red-600" : "text-foreground"}>
            {cnt}
          </span>
        );
      },
    },
    { key: "city", header: "City", sortable: true, filterable: true },
    { key: "country", header: "Country", sortable: true },
    {
      key: "scannedAt", header: "Scanned At (Local)", sortable: true, width: 190,
      render: (item: Record<string, unknown>) =>
        item.scannedAt ? new Date(item.scannedAt as string).toLocaleString() : "—",
    },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-700" /></div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scan History</h1>
        <p className="text-sm text-gray-500">{scans.length} scan events recorded</p>
      </div>
      <DataTable
        data={scans}
        columns={columns as never}
        pageSize={25}
        exportFilename="scans-export"
        searchable
      />
    </div>
  );
}