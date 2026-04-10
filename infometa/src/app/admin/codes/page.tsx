"use client";

import { useState } from "react";
import { qrCodes as mockCodes, products, batches, type QRCode } from "@/lib/mock-data";
import { useCodes } from "@/hooks/use-api";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function CodesPage() {
  const [search, setSearch] = useState("");
  const { data: apiData } = useCodes(1, 100);
  const qrCodes = apiData ?? mockCodes;

  const filtered = Array.isArray(qrCodes)
    ? qrCodes.filter((q: Record<string, string>) =>
        (q.token ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const columns = [
    { key: "token", header: "Token", sortable: true },
    {
      key: "productId",
      header: "Product",
      render: (item: QRCode) => {
        const p = products.find((prod) => prod.id === item.productId);
        return p?.name ?? "—";
      },
    },
    {
      key: "batchId",
      header: "Batch",
      render: (item: QRCode) => {
        const b = batches.find((batch) => batch.id === item.batchId);
        return b?.batchCode ?? "—";
      },
    },
    {
      key: "status",
      header: "Status",
      render: (item: QRCode) => (
        <Badge
          variant={
            item.status === "active" ? "authentic" : item.status === "suspicious" ? "suspicious" : "invalid"
          }
        >
          {item.status}
        </Badge>
      ),
    },
    { key: "scanCount", header: "Scans", sortable: true },
    { key: "lastScannedAt", header: "Last Scanned" },
    { key: "lastScannedLocation", header: "Location" },
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
          type="search"
          placeholder="Search by token..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as never} pageSize={10} />
    </div>
  );
}
