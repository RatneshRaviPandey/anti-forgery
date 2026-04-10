import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { caseStudies } from "@/lib/mock-data";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) return {};
  return {
    title: cs.title,
    description: `${cs.challenge.slice(0, 155)}...`,
    alternates: { canonical: `https://infometa.tech/case-studies/${slug}` },
  };
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: cs.title,
    author: { "@type": "Organization", name: "Infometa Technologies" },
  };

  const reviewJsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    reviewBody: cs.quote.text,
    author: { "@type": "Person", name: cs.quote.author },
    itemReviewed: { "@type": "SoftwareApplication", name: "Infometa Anti-Counterfeit Platform" },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Case Studies", href: "/case-studies" }, { label: cs.title }]} />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={reviewJsonLd} />

      <ScrollReveal>
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{cs.industry}</span>
          <span className="text-sm text-secondary">{cs.category}</span>
        </div>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl mb-8">{cs.title}</h1>
      </ScrollReveal>

      {/* Metrics */}
      <ScrollReveal>
        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          {cs.metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-primary/20 bg-surface-tint p-6 text-center">
              <p className="text-3xl font-bold text-primary">{m.value}</p>
              <p className="text-sm text-secondary mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Challenge */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-4">The Challenge</h2>
          <p className="text-secondary leading-relaxed">{cs.challenge}</p>
        </section>
      </ScrollReveal>

      {/* Solution */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-4">The Solution</h2>
          <p className="text-secondary leading-relaxed">{cs.solution}</p>
        </section>
      </ScrollReveal>

      {/* Results */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-4">The Results</h2>
          <p className="text-secondary leading-relaxed">{cs.results}</p>
        </section>
      </ScrollReveal>

      {/* Quote */}
      <ScrollReveal>
        <blockquote className="mb-12 rounded-2xl border-l-4 border-primary bg-surface-tint p-8">
          <p className="text-lg text-foreground italic leading-relaxed mb-4">&ldquo;{cs.quote.text}&rdquo;</p>
          <footer className="text-sm text-secondary">
            — {cs.quote.author}, {cs.quote.role}, {cs.quote.company}
          </footer>
        </blockquote>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">Get Similar Results</h2>
          <p className="text-secondary mb-6">See how Infometa can protect your brand from counterfeiting.</p>
          <Button size="lg" asChild>
            <Link href="/contact?subject=demo">Book a Demo</Link>
          </Button>
        </div>
      </ScrollReveal>
    </div>
  );
}
