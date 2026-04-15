"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Search, Download, Columns3, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: string[];      // enum values for dropdown filter
  width?: number;                // initial width in px
  minWidth?: number;
  hidden?: boolean;              // initially hidden
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  pageSize?: number;
  className?: string;
  title?: string;
  exportFilename?: string;       // enables CSV export button
  searchable?: boolean;          // enables global search (default true)
}

// ─── CSV Export ──────────────────────────────────────────────
function exportCSV<T extends Record<string, unknown>>(
  data: T[], columns: DataTableColumn<T>[], filename: string,
) {
  const visibleCols = columns.filter(c => !c.hidden);
  const header = visibleCols.map(c => `"${c.header}"`).join(",");
  const rows = data.map(row =>
    visibleCols.map(c => {
      const val = row[c.key];
      const str = val == null ? "" : String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ───────────────────────────────────────────────
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns: initialColumns,
  pageSize: initialPageSize = 10,
  className,
  title,
  exportFilename,
  searchable = true,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(
    () => new Set(initialColumns.filter(c => c.hidden).map(c => c.key))
  );
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [showColMenu, setShowColMenu] = useState(false);
  const resizeRef = useRef<{ key: string; startX: number; startW: number } | null>(null);

  const columns = useMemo(
    () => initialColumns.filter(c => !hiddenCols.has(c.key)),
    [initialColumns, hiddenCols]
  );

  // ─── Filtering ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = data;

    // Global search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(row =>
        columns.some(col => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Per-column filters
    for (const [key, filterVal] of Object.entries(columnFilters)) {
      if (!filterVal) continue;
      const q = filterVal.toLowerCase();
      result = result.filter(row => {
        const val = row[key];
        return val != null && String(val).toLowerCase().includes(q);
      });
    }

    return result;
  }, [data, search, columnFilters, columns]);

  // ─── Sorting ───────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey]; const bVal = b[sortKey];
      // Number sort
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal ?? ""); const bStr = String(bVal ?? "");
      return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filtered, sortKey, sortDir]);

  // ─── Pagination ────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(0);
  }

  // ─── Column Resize ────────────────────────────────────────
  const onResizeStart = useCallback((key: string, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = colWidths[key] || 150;
    resizeRef.current = { key, startX, startW };

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const diff = ev.clientX - resizeRef.current.startX;
      const newW = Math.max(60, resizeRef.current.startW + diff);
      setColWidths(prev => ({ ...prev, [resizeRef.current!.key]: newW }));
    };
    const onUp = () => {
      resizeRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [colWidths]);

  const activeFilters = Object.values(columnFilters).filter(Boolean).length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* ─── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {title && <h3 className="text-lg font-semibold text-foreground mr-auto">{title}</h3>}

        {searchable && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
            <input
              type="search"
              placeholder="Search all columns..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="h-9 w-56 rounded-lg border border-border bg-white pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {/* Column visibility toggle */}
        <div className="relative">
          <button
            onClick={() => setShowColMenu(!showColMenu)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-white text-sm text-secondary hover:text-foreground"
            title="Toggle columns"
          >
            <Columns3 className="h-4 w-4" /> Columns
          </button>
          {showColMenu && (
            <div className="absolute right-0 top-10 z-20 w-48 rounded-lg border border-border bg-white p-2 shadow-lg">
              {initialColumns.map(col => (
                <label key={col.key} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface-tint cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!hiddenCols.has(col.key)}
                    onChange={() => {
                      setHiddenCols(prev => {
                        const next = new Set(prev);
                        next.has(col.key) ? next.delete(col.key) : next.add(col.key);
                        return next;
                      });
                    }}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  {col.header}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* CSV Export */}
        {exportFilename && (
          <button
            onClick={() => exportCSV(sorted, columns, exportFilename)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-white text-sm text-secondary hover:text-foreground"
            title="Export CSV"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        )}
      </div>

      {/* ─── Filter row ──────────────────────────────────────── */}
      {columns.some(c => c.filterable) && (
        <div className="flex flex-wrap gap-2">
          {columns.filter(c => c.filterable).map(col => (
            <div key={col.key}>
              {col.filterOptions ? (
                <select
                  value={columnFilters[col.key] || ""}
                  onChange={e => { setColumnFilters(f => ({ ...f, [col.key]: e.target.value })); setPage(0); }}
                  className="h-8 rounded-lg border border-border bg-white px-2 text-xs focus:border-primary focus:outline-none"
                  aria-label={`Filter ${col.header}`}
                >
                  <option value="">All {col.header}</option>
                  {col.filterOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={`Filter ${col.header}...`}
                  value={columnFilters[col.key] || ""}
                  onChange={e => { setColumnFilters(f => ({ ...f, [col.key]: e.target.value })); setPage(0); }}
                  className="h-8 w-32 rounded-lg border border-border bg-white px-2 text-xs focus:border-primary focus:outline-none"
                />
              )}
            </div>
          ))}
          {activeFilters > 0 && (
            <button
              onClick={() => { setColumnFilters({}); setPage(0); }}
              className="h-8 px-2 text-xs text-red-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ─── Table ───────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        {paged.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-secondary">{search || activeFilters ? "No results match your filters." : "No data available."}</p>
          </div>
        ) : (
          <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr className="border-b border-border bg-background/50">
                {columns.map(col => (
                  <th
                    key={col.key}
                    style={{ width: colWidths[col.key] || col.width || "auto", minWidth: col.minWidth || 60 }}
                    className={cn(
                      "relative px-4 py-3 text-left font-medium text-secondary",
                      col.sortable && "cursor-pointer hover:text-foreground select-none"
                    )}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="flex items-center gap-1 pr-2">
                      {col.header}
                      {col.sortable && sortKey === col.key && (
                        <span className="text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30"
                      onMouseDown={e => onResizeStart(col.key, e)}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((item, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-surface-tint/30">
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-foreground truncate"
                      style={{ maxWidth: colWidths[col.key] || col.width || "auto" }}
                      title={col.render ? undefined : String(item[col.key] ?? "")}
                    >
                      {col.render ? col.render(item) : String(item[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Pagination ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-secondary">
          <span>
            {sorted.length === 0 ? "0 results" :
              `${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, sorted.length)} of ${sorted.length}`
            }
            {filtered.length !== data.length && ` (filtered from ${data.length})`}
          </span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}
            className="h-8 rounded border border-border bg-white px-1 text-xs"
            aria-label="Rows per page"
          >
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(0)} disabled={safePage === 0}
              className="rounded p-1.5 hover:bg-surface-tint disabled:opacity-30" aria-label="First page"><ChevronsLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0}
              className="rounded p-1.5 hover:bg-surface-tint disabled:opacity-30" aria-label="Previous"><ChevronLeft className="h-4 w-4" /></button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(0, Math.min(safePage - 2, totalPages - 5));
              const pg = start + i;
              if (pg >= totalPages) return null;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={cn("rounded px-2.5 py-1 text-xs", pg === safePage ? "bg-primary text-white" : "hover:bg-surface-tint")}
                >{pg + 1}</button>
              );
            })}

            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1}
              className="rounded p-1.5 hover:bg-surface-tint disabled:opacity-30" aria-label="Next"><ChevronRight className="h-4 w-4" /></button>
            <button onClick={() => setPage(totalPages - 1)} disabled={safePage >= totalPages - 1}
              className="rounded p-1.5 hover:bg-surface-tint disabled:opacity-30" aria-label="Last page"><ChevronsRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
