"use client";

import { useState } from "react";
import { products as mockProducts, type Product } from "@/lib/mock-data";
import { useProducts } from "@/hooks/use-api";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const { data: apiData, error } = useProducts(1, 100, search || undefined);

  // Use API data if available, fall back to mock data
  const products = apiData ?? mockProducts;

  const filtered = Array.isArray(products)
    ? products.filter(
        (p: Record<string, string>) =>
          (p.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (p.brand ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (p.sku ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const columns = [
    { key: "name", header: "Product Name", sortable: true },
    { key: "brand", header: "Brand", sortable: true },
    { key: "category", header: "Category", sortable: true },
    { key: "sku", header: "SKU" },
    { key: "industry", header: "Industry", sortable: true },
    {
      key: "status",
      header: "Status",
      render: (item: Product) => (
        <Badge
          variant={
            item.status === "active" ? "authentic" : item.status === "recalled" ? "invalid" : "suspicious"
          }
        >
          {item.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="text-sm text-secondary">Manage your product catalog and authentication settings.</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
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

      <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as never} pageSize={10} />
    </div>
  );
}
