"use client";

import { useState } from "react";
import { pricingTiers, pricingFaqs } from "@/lib/mock-data";
import { PricingCard } from "@/components/ui/pricing-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pricing" }]} />

      <ScrollReveal>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-secondary max-w-2xl mx-auto">
            Choose the plan that fits your product volume. Start with a 14-day free trial — no credit card required.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-secondary"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative inline-flex h-7 w-12 items-center rounded-full bg-primary transition-colors"
              role="switch"
              aria-checked={annual}
              aria-label="Toggle annual billing"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  annual ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-secondary"}`}>
              Annual
              <span className="ml-1 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success font-semibold">
                Save 17%
              </span>
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* Pricing Cards */}
      <ScrollReveal>
        <div className="grid gap-8 md:grid-cols-3 items-start mb-20">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} annual={annual} />
          ))}
        </div>
      </ScrollReveal>

      {/* Trust Signals */}
      <ScrollReveal>
        <div className="flex flex-wrap items-center justify-center gap-6 mb-20 text-sm text-secondary">
          {["No lock-in contracts", "Cancel anytime", "SOC2-ready", "14-day free trial", "GDPR-aligned"].map((signal) => (
            <span key={signal} className="flex items-center gap-1.5">
              <span className="text-success" aria-hidden="true">✓</span>
              {signal}
            </span>
          ))}
        </div>
      </ScrollReveal>

      {/* Enterprise CTA */}
      <ScrollReveal>
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center mb-20">
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Need a Custom Enterprise Solution?
          </h2>
          <p className="text-secondary mb-6 max-w-xl mx-auto">
            Get custom pricing, dedicated support, SLA guarantees, and white-label options for your organization.
          </p>
          <Button size="lg" asChild>
            <Link href="/contact?subject=demo&plan=enterprise">Talk to Sales</Link>
          </Button>
        </div>
      </ScrollReveal>

      {/* FAQ */}
      <ScrollReveal>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground text-center mb-8">
            Pricing FAQ
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {pricingFaqs.map((faq, i) => (
              <details key={i} className="group rounded-xl border border-border bg-white">
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-foreground font-medium hover:bg-surface-tint/50 rounded-xl">
                  {faq.question}
                  <span className="ml-4 shrink-0 text-secondary group-open:rotate-180 transition-transform" aria-hidden="true">▾</span>
                </summary>
                <div className="px-6 pb-4 text-secondary leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
