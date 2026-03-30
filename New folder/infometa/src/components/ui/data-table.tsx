"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  pageSize?: number;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const aVal = String(a[sortKey] ?? "");
        const bVal = String(b[sortKey] ?? "");
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      })
    : data;

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-border bg-white", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-background/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left font-medium text-secondary",
                  col.sortable && "cursor-pointer hover:text-foreground select-none"
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <span aria-hidden="true">{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.map((item, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-surface-tint/30">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-foreground">
                  {col.render ? col.render(item) : String(item[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-secondary">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of{" "}
            {data.length}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded px-3 py-1 text-sm hover:bg-surface-tint disabled:opacity-40"
              aria-label="Previous page"
            >
              ‹ Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="rounded px-3 py-1 text-sm hover:bg-surface-tint disabled:opacity-40"
              aria-label="Next page"
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
