import { testimonials } from "@/lib/mock-data";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function TestimonialsSection() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Trusted by Leading Brands
            </h2>
            <p className="mt-3 text-lg text-secondary max-w-2xl mx-auto">
              Hear from brand leaders who have transformed their product protection strategy with Infometa.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 3).map((t, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <TestimonialCard {...t} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
