import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HowItWorksTimeline } from "@/components/ui/step-card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "For Brands — Protect Your Products",
  description:
    "Give every product its own identity. Detect clones, track distribution, and build consumer trust with real-time QR-based product authentication from Infometa.",
  alternates: { canonical: "https://infometa.tech/brands" },
  openGraph: {
    title: "For Brands — Anti-Counterfeit Product Authentication | Infometa",
    description: "Give every product its own identity. Real-time QR verification, clone detection, and scan analytics.",
    url: "https://infometa.tech/brands",
  },
};

const brandJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Infometa Anti-Counterfeit Platform",
  provider: { "@type": "Organization", name: "Infometa Technologies" },
  description: "B2B SaaS platform for real-time QR-based product authentication and anti-counterfeit protection.",
  serviceType: "Anti-Counterfeit Software",
};

const steps = [
  {
    icon: "📋",
    title: "Register Your Products",
    description: "Upload your product catalog and create batches through our dashboard or API. Define SKUs, batch sizes, and manufacturing details.",
  },
  {
    icon: "🏭",
    title: "Generate & Print QR Codes",
    description: "Unique encrypted QR codes are generated for every unit. Print them on packaging using your existing production line — no new equipment needed.",
  },
  {
    icon: "✅",
    title: "Monitor & Protect",
    description: "Consumers verify instantly. You get real-time scan analytics, clone detection alerts, and distribution intelligence through your brand dashboard.",
  },
];

const benefits = [
  { icon: "🔍", title: "Clone Detection", desc: "Real-time identification of copied QR codes across geographic locations." },
  { icon: "📊", title: "Scan Analytics", desc: "Detailed dashboards showing where, when, and how often products are scanned." },
  { icon: "🗺️", title: "Distribution Intelligence", desc: "Map product flow and identify unauthorized distribution channels." },
  { icon: "🤝", title: "Consumer Trust", desc: "Build confidence with verifiable authenticity at the point of purchase." },
  { icon: "🛡️", title: "Brand Protection", desc: "Proactive alerts and evidence collection for enforcement actions." },
  { icon: "📜", title: "Regulatory Compliance", desc: "Meet FSSAI, CDSCO, BIS, and international traceability requirements." },
  { icon: "🚨", title: "Real-Time Alerts", desc: "Instant notifications for duplicate scans, geographic anomalies, and scan spikes." },
  { icon: "🔌", title: "API Integration", desc: "REST API for seamless integration with your ERP, CRM, and WMS systems." },
];

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "For Brands" }]} />
      <JsonLd data={brandJsonLd} />

      {/* Hero */}
      <ScrollReveal>
        <section className="mb-16 text-center">
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            Give Every Product Its Own Identity
          </h1>
          <p className="mt-4 text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
            Protect your brand, detect counterfeits in real time, and build unshakeable consumer trust with
            Infometa&apos;s QR-based product authentication platform.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/contact?subject=demo">Book a Free Demo</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>
        </section>
      </ScrollReveal>

      {/* How It Works */}
      <ScrollReveal>
        <section className="mb-20">
          <h2 className="text-3xl font-semibold text-foreground text-center mb-12">
            How It Works in 3 Steps
          </h2>
          <HowItWorksTimeline steps={steps} />
        </section>
      </ScrollReveal>

      {/* Benefits */}
      <ScrollReveal>
        <section className="mb-20">
          <h2 className="text-3xl font-semibold text-foreground text-center mb-4">
            Everything You Need to Fight Counterfeiting
          </h2>
          <p className="text-secondary text-center mb-12 max-w-2xl mx-auto">
            A complete anti-counterfeit platform with real-time detection, analytics, and integration capabilities.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <div key={i} className="rounded-xl border border-border bg-white p-6 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="mb-3 text-2xl" aria-hidden="true">{b.icon}</div>
                <h3 className="mb-2 text-base font-semibold text-foreground">{b.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Integration Logos */}
      <ScrollReveal>
        <section className="mb-20">
          <h2 className="text-2xl font-semibold text-foreground text-center mb-8">
            Integrates With Your Existing Systems
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-8 rounded-xl border border-border bg-white p-8">
            {["ERP Systems", "CRM Platforms", "WMS Solutions", "REST API", "CSV Upload", "Webhooks"].map((label) => (
              <div key={label} className="flex h-16 w-36 items-center justify-center rounded-lg bg-background text-sm font-medium text-secondary">
                {label}
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Pricing Teaser */}
      <ScrollReveal>
        <section className="mb-16 rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Flexible Pricing for Every Brand Size
          </h2>
          <p className="text-secondary mb-6 max-w-xl mx-auto">
            From startups to enterprise — choose the plan that fits your product volume. Start with a 14-day free trial.
          </p>
          <Button size="lg" asChild>
            <Link href="/pricing">View Pricing Plans</Link>
          </Button>
        </section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <section className="text-center py-8">
          <h2 className="text-3xl font-semibold text-foreground mb-4">
            Ready to Protect Your Brand?
          </h2>
          <p className="text-secondary mb-8 max-w-xl mx-auto">
            Get a personalized demo and see how Infometa can protect your products from counterfeiting.
          </p>
          <Button size="lg" asChild>
            <Link href="/contact?subject=demo">Book a Free Demo</Link>
          </Button>
        </section>
      </ScrollReveal>
    </div>
  );
}
