"use client";

import { useEffect, useState } from "react";
import { usePortalAuth } from "../layout";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { SkeletonTable, EmptyState } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus, Pencil, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const INDUSTRIES = ["dairy","pharma","cosmetics","fmcg","electronics","auto_parts","agro_products","lubricants","supplements","beverages","luxury","industrial_chemicals"];

interface ProductForm {
  name: string;
  sku: string;
  industry: string;
  category: string;
  description: string;
}

export default function PortalProducts() {
  const { token, user } = usePortalAuth();
  const canEdit = user?.role === 'owner' || user?.role === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Record<string, unknown> | null>(null);
  const [editForm, setEditForm] = useState<ProductForm>({ name: "", sku: "", industry: "", category: "", description: "" });
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    fetch("/api/products?limit=200", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) return;
    fetchProducts();
  }, [token]);

  const openEdit = (item: Record<string, unknown>) => {
    setEditProduct(item);
    setEditForm({
      name: (item.name as string) ?? "",
      sku: (item.sku as string) ?? "",
      industry: (item.industry as string) ?? "",
      category: (item.category as string) ?? "",
      description: (item.description as string) ?? "",
    });
  };

  const handleSave = async () => {
    if (!editProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Product updated");
        setEditProduct(null);
        fetchProducts();
      } else {
        toast.error(data.error ?? "Failed to update product");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "name", header: "Product Name", sortable: true, filterable: true },
    { key: "sku", header: "SKU", sortable: true },
    {
      key: "industry", header: "Industry", sortable: true, filterable: true,
      filterOptions: INDUSTRIES,
    },
    { key: "category", header: "Category", sortable: true, filterable: true },
    {
      key: "isActive", header: "Status", sortable: true, filterable: true,
      filterOptions: ["true", "false"],
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.isActive ? "authentic" : "invalid"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt", header: "Created", sortable: true, width: 150,
      render: (item: Record<string, unknown>) =>
        item.createdAt ? new Date(item.createdAt as string).toLocaleDateString() : "—",
    },
    ...(canEdit ? [{
      key: "_actions", header: "Actions", width: 80,
      render: (item: Record<string, unknown>) => (
        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-teal-700 transition">
          <Pencil size={15} />
        </button>
      ),
    }] : []),
  ];

  if (loading) return <SkeletonTable rows={5} cols={5} className="mt-6" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{products.length} products</p>
        </div>
        {canEdit && (
          <Link href="/portal/products/new" className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
            <Plus size={16} /> Add Product
          </Link>
        )}
      </div>
      {products.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No products yet"
          description="Add your first product to start generating QR codes and tracking authenticity."
          action="Add Your First Product"
          actionHref="/portal/products/new"
        />
      ) : (
        <DataTable data={products} columns={columns as never} pageSize={25} exportFilename="products-export" searchable />
      )}

      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditProduct(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Edit Product</h2>
              <button onClick={() => setEditProduct(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input type="text" value={editForm.sku} onChange={e => setEditForm(f => ({ ...f, sku: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select value={editForm.industry} onChange={e => setEditForm(f => ({ ...f, industry: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditProduct(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}