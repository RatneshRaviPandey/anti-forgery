import { ScrollReveal } from "@/components/ui/scroll-reveal";

const reasons = [
  {
    icon: "🛡️",
    title: "Security First",
    description: "Every QR code uses UUID-based cryptographic tokens with server-side validation — no client-side secrets.",
  },
  {
    icon: "📊",
    title: "Real-Time Analytics",
    description: "See where, when, and how often your products are scanned. Detect anomalies before they become problems.",
  },
  {
    icon: "🌐",
    title: "Global Scale",
    description: "Our cloud infrastructure handles millions of verifications daily with 99.99% uptime and sub-second response.",
  },
  {
    icon: "🔌",
    title: "Easy Integration",
    description: "REST API, CSV upload, and ERP connectors. Deploy QR authentication without changing your production line.",
  },
];

export function WhyInfometa() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Why Infometa
            </h2>
            <p className="mt-3 text-lg text-secondary max-w-2xl mx-auto">
              Built for enterprise reliability with consumer-grade simplicity. Here is why leading brands trust Infometa to protect their products.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="rounded-xl border border-border bg-background p-6 text-center transition-all hover:border-primary/30 hover:shadow-md">
                <div className="mb-4 text-3xl">{reason.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{reason.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{reason.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
