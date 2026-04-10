"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";

const metrics = [
  { value: "50M+", label: "Verifications Processed" },
  { value: "200+", label: "Brands Protected" },
  { value: "12", label: "Industries Covered" },
  { value: "99.99%", label: "Platform Uptime" },
];

export function SocialProof() {
  return (
    <section className="bg-primary py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="text-center">
                <div className="text-4xl font-bold text-white sm:text-5xl">
                  {m.value}
                </div>
                <p className="mt-2 text-base text-white/80">{m.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
