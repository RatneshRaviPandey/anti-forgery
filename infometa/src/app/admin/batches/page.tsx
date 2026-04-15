"use client";

import { useBatches } from "@/hooks/use-api";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

export default function BatchesPage() {
  const { data: apiData, error, isLoading } = useBatches(1, 100);
  const batches = Array.isArray(apiData) ? apiData : [];

  const columns = [
    { key: "batchCode", header: "Batch Code", sortable: true },
    { key: "totalUnits", header: "Units", render: (item: Record<string, unknown>) => Number(item.totalUnits ?? 0).toLocaleString() },
    { key: "generatedUnits", header: "Generated", render: (item: Record<string, unknown>) => Number(item.generatedUnits ?? 0).toLocaleString() },
    { key: "manufactureDate", header: "Manufactured", sortable: true },
    { key: "expiryDate", header: "Expires", sortable: true },
    {
      key: "isActive", header: "Status",
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.isActive ? "authentic" : "suspicious"}>{item.isActive ? "Active" : "Pending"}</Badge>
      ),
    },
    {
      key: "createdAt", header: "Created",
      render: (item: Record<string, unknown>) => item.createdAt ? new Date(item.createdAt as string).toLocaleDateString() : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Batches</h1>
        <p className="text-sm text-secondary">View and manage product batches across all brands.</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" /></div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">Failed to load batches</div>
      ) : (
        <DataTable data={batches as unknown as Record<string, unknown>[]} columns={columns as never} pageSize={10} />
      )}
    </div>
  );
}
