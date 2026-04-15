"use client";

import { useState } from "react";
import { useCodes } from "@/hooks/use-api";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function CodesPage() {
  const [search, setSearch] = useState("");
  const { data: apiData, error, isLoading } = useCodes(1, 100);
  const qrCodes = Array.isArray(apiData) ? apiData : [];

  const filtered = qrCodes.filter((q: Record<string, string>) =>
    (q.token ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "token", header: "Token",
      render: (item: Record<string, unknown>) => {
        const t = String(item.token ?? "");
        return t.length > 30 ? t.slice(0, 30) + "…" : t;
      },
    },
    {
      key: "status", header: "Status",
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.status === "active" ? "authentic" : item.status === "suspicious" ? "suspicious" : "invalid"}>
          {String(item.status ?? "unknown")}
        </Badge>
      ),
    },
    { key: "scanCount", header: "Scans", sortable: true },
    { key: "lastScannedCity", header: "Last City" },
    {
      key: "lastScannedAt", header: "Last Scanned",
      render: (item: Record<string, unknown>) => item.lastScannedAt ? new Date(item.lastScannedAt as string).toLocaleString() : "—",
    },
    {
      key: "createdAt", header: "Created",
      render: (item: Record<string, unknown>) => item.createdAt ? new Date(item.createdAt as string).toLocaleDateString() : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">QR Codes</h1>
        <p className="text-sm text-secondary">Monitor all QR tokens, their status, and scan activity.</p>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
        <input
          type="search" placeholder="Search by token..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" /></div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">Failed to load QR codes</div>
      ) : (
        <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as never} pageSize={10} />
      )}
    </div>
  );
}
