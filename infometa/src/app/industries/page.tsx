import type { Metadata } from "next";
import Link from "next/link";
import { industries } from "@/lib/mock-data";
import { IndustryCard } from "@/components/ui/industry-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Industries We Protect from Counterfeiting",
  description:
    "Counterfeiting costs global brands $4.5 trillion annually. Infometa protects 12 major industries with real-time QR-based product authentication.",
  alternates: { canonical: "https://infometa.tech/industries" },
  openGraph: {
    title: "Industries We Protect | Infometa Technologies",
    description: "From dairy to luxury goods — real-time anti-counterfeit protection across 12 industries.",
    url: "https://infometa.tech/industries",
  },
};

export default function IndustriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Industries" },
        ]}
      />

      <ScrollReveal>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            Industries We Protect
          </h1>
          <p className="mt-4 text-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            Counterfeiting costs global brands <strong className="text-foreground">$4.5 trillion annually</strong>.
            Infometa provides real-time QR-based product authentication across 12 major industries,
            protecting brands and consumers from counterfeit products.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {industries.map((ind, i) => (
          <ScrollReveal key={ind.slug} delay={i * 0.05}>
            <IndustryCard
              icon={ind.icon}
              title={ind.name}
              summary={ind.shortDescription}
              href={`/industries/${ind.slug}`}
            />
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <div className="mt-16 text-center">
          <p className="text-lg text-secondary mb-4">
            Do not see your industry? We customize solutions for any product category.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Talk to Us About Your Industry
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
