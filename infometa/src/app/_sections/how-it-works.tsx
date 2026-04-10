import { HowItWorksTimeline } from "@/components/ui/step-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const steps = [
  {
    icon: "📦",
    title: "Brand Registers Product & Batch",
    description:
      "Upload your product catalog and create batches through the dashboard or API. Each batch generates a pool of unique, encrypted QR codes ready for printing.",
  },
  {
    icon: "🏷️",
    title: "Unique Encrypted QR Printed on Pack",
    description:
      "QR codes are printed, labeled, or etched on product packaging during your existing production process. No new equipment needed — just integrate with your packaging line.",
  },
  {
    icon: "📱",
    title: "Consumer Scans — Verified Instantly",
    description:
      "Consumers scan the QR code with any smartphone camera. Our cloud registry verifies the code in under 2 seconds, returning the product's authenticity status and details.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-lg text-secondary max-w-2xl mx-auto">
              Three simple steps from packaging line to consumer confidence. No app downloads required.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <HowItWorksTimeline steps={steps} />
        </ScrollReveal>
      </div>
    </section>
  );
}
