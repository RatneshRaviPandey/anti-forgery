import { industries } from "@/lib/mock-data";
import { IndustryCard } from "@/components/ui/industry-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function IndustriesGrid() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Industries We Protect
            </h2>
            <p className="mt-3 text-lg text-secondary max-w-2xl mx-auto">
              From dairy farms to luxury boutiques, Infometa shields products across 12 major industries from counterfeit threats.
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
      </div>
    </section>
  );
}
