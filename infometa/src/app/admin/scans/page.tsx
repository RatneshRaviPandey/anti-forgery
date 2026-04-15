"use client";

import { useState } from "react";
import { useScans } from "@/hooks/use-api";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function ScansPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: apiData, error, isLoading } = useScans(1, 100, statusFilter !== "all" ? statusFilter : undefined);
  const scans = Array.isArray(apiData) ? apiData : [];

  const filtered = scans.filter((s: Record<string, unknown>) => {
    const token = String(s.token ?? "");
    const city = String(s.city ?? "");
    return token.toLowerCase().includes(search.toLowerCase()) ||
           city.toLowerCase().includes(search.toLowerCase());
  });

  const columns = [
    {
      key: "token", header: "QR Token",
      render: (item: Record<string, unknown>) => {
        const t = String(item.token ?? ""); return t.length > 25 ? t.slice(0, 25) + "…" : t;
      },
    },
    {
      key: "resultStatus", header: "Result",
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.resultStatus === "authentic" ? "authentic" : item.resultStatus === "suspicious" ? "suspicious" : "invalid"}>
          {String(item.resultStatus ?? "unknown")}
        </Badge>
      ),
    },
    {
      key: "tokenScanCount", header: "Scan #", sortable: true,
      render: (item: Record<string, unknown>) => {
        const cnt = Number(item.tokenScanCount ?? 1);
        return <span className={cnt > 3 ? "font-bold text-red-600" : ""}>{cnt}</span>;
      },
    },
    { key: "city", header: "City", sortable: true },
    { key: "country", header: "Country" },
    {
      key: "scannedAt", header: "Timestamp (Local)", sortable: true,
      render: (item: Record<string, unknown>) => item.scannedAt ? new Date(item.scannedAt as string).toLocaleString() : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Scan Events</h1>
        <p className="text-sm text-secondary">Browse all scan events with filtering and search.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          <input type="search" placeholder="Search by token or city..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" aria-label="Filter by status">
          <option value="all">All Statuses</option>
          <option value="authentic">Authentic</option>
          <option value="suspicious">Suspicious</option>
          <option value="invalid">Invalid</option>
        </select>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" /></div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">Failed to load scans</div>
      ) : (
        <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as never} pageSize={20} />
      )}
    </div>
  );
}
