"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { usePlatformStats } from "@/hooks/use-platform-stats";

export function SocialProof() {
  const { stats, loading, formatStat } = usePlatformStats();

  const metrics = [
    { value: stats ? formatStat(stats.totalVerifications) : "—", label: "Verifications Processed" },
    { value: stats ? formatStat(stats.totalBrands) : "—", label: "Brands Protected" },
    { value: stats ? String(stats.industriesCovered) : "—", label: "Industries Covered" },
    { value: stats ? `${stats.uptimePercent}%` : "—", label: "Platform Uptime" },
  ];

  return (
    <section className="bg-primary py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="text-center">
                <div className={`text-4xl font-bold text-white sm:text-5xl ${loading ? 'animate-pulse' : ''}`}>
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
