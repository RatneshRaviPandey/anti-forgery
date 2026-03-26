"use client";

import { useState } from "react";
import { scans as mockScans, type Scan } from "@/lib/mock-data";
import { useScans } from "@/hooks/use-api";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function ScansPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: apiData } = useScans(1, 100, statusFilter !== "all" ? statusFilter : undefined);
  const scans = apiData ?? mockScans;

  const filtered = Array.isArray(scans)
    ? scans.filter((s: Record<string, unknown>) => {
        const token = String(s.token ?? "");
        const city = String((s as Record<string, unknown>).city ?? (s as { location?: { city?: string } }).location?.city ?? "");
        const matchesSearch =
          token.toLowerCase().includes(search.toLowerCase()) ||
          city.toLowerCase().includes(search.toLowerCase());
        const result = String(s.resultStatus ?? "");
        const matchesStatus = statusFilter === "all" || result === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  const columns = [
    { key: "id", header: "Scan ID", sortable: true },
    { key: "token", header: "QR Token", sortable: true },
    {
      key: "resultStatus",
      header: "Result",
      render: (item: Scan) => (
        <Badge
          variant={
            item.resultStatus === "authentic"
              ? "authentic"
              : item.resultStatus === "suspicious"
              ? "suspicious"
              : "invalid"
          }
        >
          {item.resultStatus}
        </Badge>
      ),
    },
    {
      key: "location",
      header: "City",
      render: (item: Scan) => item.location.city,
      sortable: true,
    },
    { key: "timestamp", header: "Timestamp", sortable: true },
    {
      key: "deviceFingerprint",
      header: "Device",
      render: (item: Scan) => (
        <span className="font-mono text-xs">{item.deviceFingerprint}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Scan Events</h1>
        <p className="text-sm text-secondary">
          Browse all {scans.length.toLocaleString()} scan events with filtering and search.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          <input
            type="search"
            placeholder="Search by token or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="authentic">Authentic</option>
          <option value="suspicious">Suspicious</option>
          <option value="invalid">Invalid</option>
        </select>
      </div>

      <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as never} pageSize={20} />
    </div>
  );
}
