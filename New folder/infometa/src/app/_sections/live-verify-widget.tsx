"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verify } from "@/lib/mock-data";
import { StatusPill } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function LiveVerifyWidget() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ReturnType<typeof verify> | null>(null);

  function handleVerify() {
    if (!code.trim()) return;
    setResult(verify(code.trim()));
  }

  return (
    <section className="bg-white py-12 border-b border-border">
      <ScrollReveal>
        <div className="mx-auto max-w-xl px-4 text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Quick Verify</h2>
          <p className="text-sm text-secondary mb-4">
            Try it now — enter <kbd className="rounded bg-surface-tint px-1.5 py-0.5 text-xs font-mono">REAL-123</kbd>,{" "}
            <kbd className="rounded bg-surface-tint px-1.5 py-0.5 text-xs font-mono">DUP-999</kbd>, or{" "}
            <kbd className="rounded bg-surface-tint px-1.5 py-0.5 text-xs font-mono">BAD-000</kbd>
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter product code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              aria-label="Product verification code"
            />
            <Button onClick={handleVerify} variant="primary">
              Verify
            </Button>
          </div>
          {result && (
            <div className="mt-4 flex justify-center">
              <StatusPill status={result.status} />
            </div>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
