import { ScrollReveal } from "@/components/ui/scroll-reveal";

const props = [
  {
    icon: "🔐",
    title: "Unique QR for every pack",
    description:
      "Each product unit receives a cryptographically unique QR code during manufacturing — impossible to guess, impractical to clone at scale.",
  },
  {
    icon: "☁️",
    title: "Secure cloud verification",
    description:
      "Every scan is verified server-side against our encrypted registry. No local databases to tamper with, no offline vulnerabilities.",
  },
  {
    icon: "🚨",
    title: "Clone detection alerts",
    description:
      "When the same QR code is scanned from multiple locations, our anomaly engine flags it instantly and alerts your brand protection team.",
  },
];

export function ValueProps() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {props.map((prop, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                    {prop.icon}
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{prop.title}</h3>
                <p className="text-secondary leading-relaxed">{prop.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
