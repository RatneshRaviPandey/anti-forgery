import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { industries } from "@/lib/mock-data";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return industries.map((ind) => ({ slug: ind.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) return {};
  return {
    title: `${industry.name} Anti-Counterfeit Protection`,
    description: `Protect your ${industry.name.toLowerCase()} brand from counterfeit products with real-time QR verification. Trusted by brands worldwide. ${industry.longTailKeyword}.`,
    alternates: { canonical: `https://infometa.tech/industries/${slug}` },
    openGraph: {
      title: `${industry.name} Anti-Counterfeit Protection | Infometa Technologies`,
      description: `Protect your ${industry.name.toLowerCase()} brand from counterfeit products with real-time QR verification.`,
      url: `https://infometa.tech/industries/${slug}`,
      images: [{ url: `/images/og/industries-${slug}.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${industry.name} Anti-Counterfeit Protection | Infometa Technologies`,
      description: `Protect your ${industry.name.toLowerCase()} brand with real-time QR-based authentication.`,
      images: [`/images/og/industries-${slug}.jpg`],
    },
  };
}

export default async function IndustryDetailPage({ params }: Props) {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) notFound();

  const relatedIndustries = industry.relatedSlugs
    .map((s) => industries.find((i) => i.slug === s))
    .filter(Boolean);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: industry.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Industries", href: "/industries" },
          { label: `${industry.name} Anti-Counterfeit` },
        ]}
      />
      <JsonLd data={faqJsonLd} />

      {/* Hero */}
      <ScrollReveal>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl" aria-hidden="true">{industry.icon}</span>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl">
              {industry.name} Anti-Counterfeit Protection
            </h1>
          </div>
          <p className="text-xl text-secondary max-w-3xl leading-relaxed">
            Counterfeit {industry.name.toLowerCase()} products are putting lives and brands at risk.
            Infometa provides real-time QR-based product authentication to protect your products and consumers.
          </p>
        </section>
      </ScrollReveal>

      {/* Problem Statement */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            The Counterfeiting Problem in {industry.name}
          </h2>
          <p className="text-secondary leading-relaxed text-lg">{industry.problemStatement}</p>
        </section>
      </ScrollReveal>

      {/* Impact */}
      <ScrollReveal>
        <section className="mb-16 rounded-2xl bg-danger/5 border border-danger/20 p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Impact on Brands and Consumers
          </h2>
          <p className="text-secondary leading-relaxed">{industry.impactDescription}</p>
        </section>
      </ScrollReveal>

      {/* How Infometa Solves It */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            How Infometa Protects {industry.name} Products
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: "🏷️", title: "Unit-Level Identity", desc: "Every individual product unit receives a unique cryptographic QR code that is impossible to guess and impractical to clone at scale." },
              { icon: "☁️", title: "Server-Side Verification", desc: "Each scan is verified against our secure cloud registry in under 2 seconds, returning authentic product details or flagging anomalies." },
              { icon: "🔍", title: "Anomaly Detection", desc: "Our AI-powered system detects clone patterns, geographic anomalies, and suspicious scan volumes in real time, alerting your team instantly." },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-white p-6">
                <div className="mb-3 text-2xl" aria-hidden="true">{item.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Real-World Scenarios */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Real-World Counterfeit Scenarios in {industry.name}
          </h2>
          <div className="space-y-4">
            {industry.scenarios.map((scenario, i) => (
              <div key={i} className="rounded-xl border border-border bg-white p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  <span className="text-warning mr-2" aria-hidden="true">⚠</span>
                  {scenario.title}
                </h3>
                <p className="text-secondary leading-relaxed">{scenario.description}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Risk Table */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Product SKU Risk Assessment
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="px-6 py-3 text-left font-medium text-secondary">Product Type</th>
                  <th className="px-6 py-3 text-left font-medium text-secondary">Forgery Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {industry.riskTable.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-6 py-3 text-foreground">{row.productType}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          row.riskLevel === "High"
                            ? "bg-danger/10 text-danger"
                            : row.riskLevel === "Medium"
                            ? "bg-warning/10 text-warning"
                            : "bg-success/10 text-success"
                        }`}
                      >
                        {row.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </ScrollReveal>

      {/* Industry Stats */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            {industry.name} Counterfeiting Statistics
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {industry.stats.map((stat, i) => (
              <div key={i} className="rounded-xl border border-primary/20 bg-surface-tint p-6">
                <p className="text-2xl font-bold text-primary mb-2">{stat.stat}</p>
                <p className="text-xs text-secondary">Source: {stat.source}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Success Pattern */}
      <ScrollReveal>
        <section className="mb-16 rounded-2xl bg-primary/5 border border-primary/20 p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Success Pattern: {industry.name} Brand Protection
          </h2>
          <p className="text-secondary leading-relaxed mb-4">
            A leading {industry.name.toLowerCase()} brand deployed Infometa&apos;s QR authentication across their
            product line, covering thousands of SKUs and millions of units. Within 6 months, they achieved:
          </p>
          <ul className="space-y-2 text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-success mt-1" aria-hidden="true">✓</span>
              <span>85% reduction in counterfeit incidents across monitored channels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-1" aria-hidden="true">✓</span>
              <span>Real-time visibility into product distribution and authentication patterns</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-1" aria-hidden="true">✓</span>
              <span>Identification and shutdown of unauthorized distribution networks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-1" aria-hidden="true">✓</span>
              <span>Measurable improvement in consumer trust and brand loyalty metrics</span>
            </li>
          </ul>
        </section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <section className="mb-16 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Protect Your {industry.name} Products Today
          </h2>
          <p className="text-secondary mb-6 max-w-xl mx-auto">
            Join hundreds of {industry.name.toLowerCase()} brands using Infometa to fight counterfeiting with real-time QR-based product authentication.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/contact?subject=demo">Book a Demo</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>
        </section>
      </ScrollReveal>

      {/* Related Industries */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Related Industries</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedIndustries.map((rel) =>
              rel ? (
                <Link
                  key={rel.slug}
                  href={`/industries/${rel.slug}`}
                  className="rounded-xl border border-border bg-white p-6 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <span className="text-2xl mb-2 block" aria-hidden="true">{rel.icon}</span>
                  <h3 className="font-semibold text-foreground">{rel.name}</h3>
                  <p className="mt-1 text-sm text-secondary line-clamp-2">{rel.shortDescription}</p>
                </Link>
              ) : null
            )}
          </div>
        </section>
      </ScrollReveal>

      {/* FAQ */}
      <ScrollReveal>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Frequently Asked Questions: {industry.name} Anti-Counterfeit
          </h2>
          <div className="space-y-4">
            {industry.faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border bg-white"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-foreground font-medium hover:bg-surface-tint/50 rounded-xl">
                  {faq.question}
                  <span className="ml-4 shrink-0 text-secondary group-open:rotate-180 transition-transform" aria-hidden="true">
                    ▾
                  </span>
                </summary>
                <div className="px-6 pb-4 text-secondary leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
