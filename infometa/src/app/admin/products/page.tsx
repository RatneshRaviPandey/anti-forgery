"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-api";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const { data: apiData, error, isLoading } = useProducts(1, 100, search || undefined);

  const products = Array.isArray(apiData) ? apiData : [];

  const columns = [
    { key: "name", header: "Product Name", sortable: true },
    { key: "sku", header: "SKU" },
    { key: "industry", header: "Industry", sortable: true },
    { key: "category", header: "Category", sortable: true },
    {
      key: "isActive",
      header: "Status",
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.isActive ? "authentic" : "invalid"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (item: Record<string, unknown>) =>
        item.createdAt ? new Date(item.createdAt as string).toLocaleDateString() : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Products</h1>
        <p className="text-sm text-secondary">All products across all brands.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" /></div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">Failed to load products</div>
      ) : (
        <DataTable data={products as unknown as Record<string, unknown>[]} columns={columns as never} pageSize={10} />
      )}
    </div>
  );
}
