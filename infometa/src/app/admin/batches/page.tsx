"use client";

import { batches as mockBatches, products, type Batch } from "@/lib/mock-data";
import { useBatches } from "@/hooks/use-api";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function BatchesPage() {
  const { data: apiData } = useBatches(1, 100);
  const batches = apiData ?? mockBatches;
  const columns = [
    { key: "batchCode", header: "Batch Code", sortable: true },
    {
      key: "productId",
      header: "Product",
      render: (item: Batch) => {
        const product = products.find((p) => p.id === item.productId);
        return product?.name ?? item.productId;
      },
      sortable: true,
    },
    { key: "manufactureDate", header: "Manufactured", sortable: true },
    { key: "expiryDate", header: "Expires", sortable: true },
    {
      key: "totalUnits",
      header: "Units",
      render: (item: Batch) => item.totalUnits.toLocaleString(),
    },
    { key: "activatedAt", header: "Activated" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Batches</h1>
          <p className="text-sm text-secondary">View and manage product batches and their QR code activations.</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" /> New Batch
        </Button>
      </div>

      <DataTable data={batches as unknown as Record<string, unknown>[]} columns={columns as never} pageSize={10} />
    </div>
  );
}
