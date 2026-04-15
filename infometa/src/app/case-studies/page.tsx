import type { Metadata } from "next";
import Link from "next/link";
import { caseStudies } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Case Studies — Real-World Anti-Counterfeit Success Stories",
  description: "See how leading brands across dairy, pharma, cosmetics, auto parts, and agriculture reduced counterfeiting by up to 90% with Infometa's QR verification platform.",
  alternates: { canonical: "https://infometa.in/case-studies" },
};

export default function CaseStudiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Case Studies" }]} />

      <ScrollReveal>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">Case Studies</h1>
          <p className="mt-4 text-lg text-secondary max-w-2xl mx-auto">
            Real results from real brands. See how companies across industries are using Infometa to fight counterfeiting and protect their customers.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {caseStudies.map((cs, i) => (
          <ScrollReveal key={cs.slug} delay={i * 0.1}>
            <Link href={`/case-studies/${cs.slug}`}>
              <Card variant="hover" className="h-full">
                <CardContent>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{cs.industry}</span>
                    <span className="text-xs text-secondary">{cs.category}</span>
                  </div>
                  <h2 className="mb-3 text-lg font-semibold text-foreground leading-snug">{cs.title}</h2>
                  <p className="text-sm text-secondary line-clamp-3 mb-4">{cs.challenge}</p>
                  <div className="flex gap-4">
                    {cs.metrics.slice(0, 2).map((m) => (
                      <div key={m.label}>
                        <p className="text-lg font-bold text-primary">{m.value}</p>
                        <p className="text-xs text-secondary">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-medium text-primary">Read case study →</p>
                </CardContent>
              </Card>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
