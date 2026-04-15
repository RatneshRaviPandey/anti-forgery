"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);

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

  const stopScanner = useCallback(async () => {
    try {
      const scanner = html5QrCodeRef.current as { stop?: () => Promise<void>; clear?: () => void } | null;
      if (scanner?.stop) await scanner.stop();
      if (scanner?.clear) scanner.clear();
    } catch { /* ignore */ }
    html5QrCodeRef.current = null;
    setScanning(false);
  }, []);

  async function startScanner() {
    setCameraError("");
    setScanning(true);

    try {
      // Dynamic import — html5-qrcode is heavy, only load when needed
      const { Html5Qrcode } = await import("html5-qrcode");

      // Small delay for DOM to render the scanner div
      await new Promise(r => setTimeout(r, 100));

      const scannerId = "qr-scanner-region";
      const scanner = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // Stop scanner immediately on successful scan
          await stopScanner();

          // Extract code from URL if scanned a verification URL
          let token = decodedText;
          try {
            const url = new URL(decodedText);
            const codeParam = url.searchParams.get("code");
            if (codeParam) token = codeParam;
            // Also handle /verify/TOKEN format
            const pathMatch = url.pathname.match(/\/verify\/(.+)/);
            if (pathMatch) token = pathMatch[1];
          } catch { /* not a URL, use as-is */ }

          setCode(token);
          await verifyCode(token);
        },
        () => { /* QR not found in frame — ignore */ },
      );
    } catch (err) {
      setScanning(false);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
        setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (msg.includes("NotFoundError")) {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError(`Camera error: ${msg}`);
      }
    }
  }

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

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

      {loading && !result ? (
        /* ─── Verification in progress ─── */
        <div className="py-16 text-center space-y-6 animate-in fade-in">
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 rounded-full border-4 border-teal-100" />
            <div className="absolute inset-0 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-4xl">🔍</div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Verifying Product...</h2>
            <p className="mt-2 text-secondary">Checking authenticity against the secure registry</p>
          </div>
          {code && (
            <div className="inline-block max-w-sm">
              <p className="text-xs text-secondary font-mono bg-surface-tint rounded-lg px-4 py-2 truncate">
                {code.length > 50 ? code.slice(0, 50) + "…" : code}
              </p>
            </div>
          )}
          <div className="flex justify-center gap-1.5 pt-2">
            <div className="h-2 w-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      ) : !result ? (
        <div className="space-y-6">
          {/* QR Scanner */}
          <div className="rounded-2xl border-2 border-dashed border-border bg-surface-tint p-6">
            {scanning ? (
              <div className="space-y-4">
                <div id="qr-scanner-region" ref={scannerRef} className="mx-auto max-w-sm overflow-hidden rounded-xl" />
                <Button variant="secondary" size="md" onClick={stopScanner} className="w-full">
                  Stop Camera
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-5xl" aria-hidden="true">📷</div>
                <p className="text-lg font-medium text-foreground mb-2">Scan QR Code</p>
                <p className="text-sm text-secondary mb-4">
                  Point your camera at the QR code on the product packaging
                </p>
                {cameraError && (
                  <p className="text-sm text-red-600 mb-4">{cameraError}</p>
                )}
                <Button variant="primary" size="md" onClick={startScanner}>
                  Open Camera
                </Button>
              </>
            )}
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
            <Button onClick={handleVerify} disabled={!code.trim() || loading} size="md" className="min-w-[100px]">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Verifying
                </span>
              ) : "Verify"}
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

          {/* Share buttons */}
          {result.status === "authentic" && (
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-secondary">Share result:</span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`✅ Verified: ${result.product.name} by ${result.product.brand} is authentic! Checked on infometa.in`)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`✅ Verified "${result.product.name}" by ${result.product.brand} as authentic using @infometa_tech`)}&url=${encodeURIComponent('https://infometa.in/verify')}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Post
              </a>
            </div>
          )}

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
