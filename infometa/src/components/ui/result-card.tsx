"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { VerifyResult } from "@/lib/mock-data";

interface ResultCardProps {
  result: VerifyResult;
  className?: string;
}

export function ResultCard({ result, className }: ResultCardProps) {
  const [reported, setReported] = useState(false);

  async function reportProduct(token: string, productName: string) {
    if (reported) { toast('Already reported'); return; }
    try {
      const res = await fetch('/api/reports/counterfeit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, message: `Reported from verify page: ${productName}` }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Report submitted! Thank you for helping fight counterfeiting.');
        setReported(true);
      } else {
        toast.error(data.error || 'Failed to submit report');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
  }

  if (result.status === "authentic") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("rounded-2xl border-2 border-success bg-success/5 p-6", className)}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-2xl text-white">
            ✓
          </div>
          <div>
            <h3 className="text-xl font-semibold text-success">Authentic Product</h3>
            <p className="text-sm text-secondary">Verified by Infometa Registry</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <DetailRow label="Product" value={result.product.name} />
          <DetailRow label="Brand" value={result.product.brand} />
          <DetailRow label="Batch" value={result.batch.batchCode} />
          <DetailRow label="Manufactured" value={result.batch.manufactureDate} />
          <DetailRow label="Expiry" value={result.batch.expiryDate} />
          <DetailRow label="Scan Count" value={String(result.scanCount)} />
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <span aria-hidden="true">🛡️</span>
          <span>This product has been verified as authentic.</span>
        </div>
      </motion.div>
    );
  }

  if (result.status === "suspicious") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("rounded-2xl border-2 border-warning bg-warning/5 p-6", className)}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning text-2xl text-white">
            ⚠
          </div>
          <div>
            <h3 className="text-xl font-semibold text-yellow-800">Suspicious Product</h3>
            <p className="text-sm text-secondary">Duplicate scans detected</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <DetailRow label="Product" value={result.product.name} />
          <DetailRow label="Brand" value={result.product.brand} />
          <DetailRow label="Times Scanned" value={String(result.scanCount)} />
          <DetailRow label="Scan Locations" value={result.locations.join(", ")} />
        </div>
        <div className="mt-4 rounded-lg bg-warning/10 px-3 py-2 text-sm text-yellow-800">
          <p className="font-medium">Warning</p>
          <p>{result.message}</p>
        </div>
        <button className="mt-3 rounded-lg bg-warning px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 transition-colors"
          onClick={() => reportProduct(result.product?.sku || '', result.product?.name || '')}>
          Report This Product
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("rounded-2xl border-2 border-danger bg-danger/5 p-6", className)}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger text-2xl text-white">
          ✕
        </div>
        <div>
          <h3 className="text-xl font-semibold text-danger">Invalid Code</h3>
          <p className="text-sm text-secondary">Not registered in our system</p>
        </div>
      </div>
      <div className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
        <p>{result.message}</p>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          onClick={() => reportProduct('unknown', 'Unknown product')}>
          Report Counterfeit
        </button>
        <a href="/industries" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-tint transition-colors text-center">
          Find Authorized Retailer
        </a>
      </div>
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/50 py-1.5">
      <span className="text-secondary">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
