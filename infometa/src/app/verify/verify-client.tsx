"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/ui/result-card";
import type { VerifyResult } from "@/lib/mock-data";

export function VerifyClient() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-verify if ?code= is present in the URL (from QR scan)
  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam && codeParam.trim().length >= 8) {
      setCode(codeParam.trim());
      verifyCode(codeParam.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function verifyCode(token: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(token)}`);
      const json = await res.json();

      if (!res.ok || !json.data) {
        setResult({ status: "invalid", message: json.error ?? "Verification failed" });
        return;
      }

      const data = json.data;
      setResult(mapApiResult(data));
    } catch {
      setResult({ status: "invalid", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    const trimmed = code.trim();
    if (!trimmed) return;
    await verifyCode(trimmed);
  }

  function handleReset() {
    setCode("");
    setResult(null);
  }

  return (
    <div className="text-center">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Verify Your Product
        </h1>
        <p className="mt-3 text-secondary leading-relaxed">
          Scan the QR code on your product or enter the code manually below to check if your product is authentic.
          Free, instant, no sign-up required.
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* QR Scanner placeholder */}
          <div className="rounded-2xl border-2 border-dashed border-border bg-surface-tint p-8">
            <div className="mb-4 text-5xl" aria-hidden="true">📷</div>
            <p className="text-lg font-medium text-foreground mb-2">Scan QR Code</p>
            <p className="text-sm text-secondary mb-4">
              Point your camera at the QR code on the product packaging
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                // In production, this would activate the camera
                // For demo, we'll just focus the manual input
                document.getElementById("verify-code-input")?.focus();
              }}
            >
              Open Camera
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-secondary">or enter code manually</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex gap-3">
            <Input
              id="verify-code-input"
              placeholder="Enter product code (e.g., REAL-123)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              aria-label="Product verification code"
              className="text-center text-lg"
            />
            <Button onClick={handleVerify} disabled={!code.trim() || loading} size="md">
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>

          <div className="rounded-xl bg-surface-tint p-4 text-sm text-secondary">
            <p className="font-medium text-foreground mb-1">How It Works</p>
            <p>
              Enter the code printed on your product packaging or scan the QR code.
              We&apos;ll instantly verify its authenticity against the brand&apos;s secure registry.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <ResultCard result={result} />

          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Next Actions</h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="ghost" size="sm" asChild>
                <a href="/contact?subject=report">Report an Issue</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="/contact">Contact Brand</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="/industries">Find Authorized Retailer</a>
              </Button>
            </div>
          </div>

          <Button variant="secondary" size="md" onClick={handleReset} className="w-full">
            Verify Another Product
          </Button>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiResult(data: any): VerifyResult {
  if (data.status === "authentic") {
    return {
      status: "authentic",
      product: {
        id: data.product?.sku ?? "",
        name: data.product?.name ?? data.brand?.name ?? "Unknown",
        brand: data.brand?.name ?? data.product?.brand ?? "Unknown",
        category: data.product?.category ?? data.product?.industry ?? "",
        industry: data.product?.industry ?? "",
        sku: data.product?.sku ?? "",
        imageUrl: "",
        status: "active" as const,
      },
      batch: {
        id: data.product?.batchCode ?? "",
        productId: data.product?.sku ?? "",
        batchCode: data.product?.batchCode ?? data.batch?.batchCode ?? "",
        manufactureDate: data.product?.manufactureDate ?? data.batch?.manufactureDate ?? "N/A",
        expiryDate: data.product?.expiryDate ?? data.batch?.expiryDate ?? "N/A",
        totalUnits: data.batch?.totalUnits ?? 0,
        activatedAt: data.issuedAt ?? data.batch?.activatedAt ?? "",
      },
      scanCount: data.scanCount ?? 1,
    };
  }

  if (data.status === "suspicious") {
    return {
      status: "suspicious",
      product: {
        id: data.product?.sku ?? "",
        name: data.product?.name ?? "Unknown",
        brand: data.brand?.name ?? data.product?.brand ?? "Unknown",
        category: data.product?.category ?? "",
        industry: data.product?.industry ?? "",
        sku: data.product?.sku ?? "",
        imageUrl: "",
        status: "active" as const,
      },
      batch: {
        id: "",
        productId: "",
        batchCode: data.product?.batchCode ?? data.batch?.batchCode ?? "",
        manufactureDate: data.batch?.manufactureDate ?? "N/A",
        expiryDate: data.batch?.expiryDate ?? "N/A",
        totalUnits: 0,
        activatedAt: "",
      },
      scanCount: data.scanCount ?? 0,
      locations: data.locations ?? [],
      message: data.message ?? "Multiple scans detected from different locations.",
    };
  }

  // invalid, tampered, expired_key, revoked_key → all map to invalid
  const messages: Record<string, string> = {
    invalid: data.message ?? "This code is not registered in our system.",
    tampered: "This code appears to have been tampered with. Do NOT trust this product.",
    expired_key: "Brand verification key has expired. Contact the manufacturer.",
    revoked_key: "Brand verification key has been revoked. Contact the manufacturer.",
  };

  return {
    status: "invalid",
    message: messages[data.status] ?? data.message ?? "Verification failed.",
  };
}
