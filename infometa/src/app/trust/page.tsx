import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Trust Center — Security, Privacy & Transparency",
  description: "Learn about Infometa's commitment to security, privacy, and transparency. SOC2-ready, GDPR-aligned, and built with security-by-design principles.",
  alternates: { canonical: "https://infometa.in/trust" },
};

const sections = [
  {
    icon: "🔒",
    title: "Security",
    description: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Role-based access controls ensure only authorized personnel access brand data. Our infrastructure is hosted on SOC2-certified cloud providers with continuous monitoring and penetration testing.",
    link: "/security",
    linkText: "View Security Details",
  },
  {
    icon: "🔐",
    title: "Privacy",
    description: "Consumer privacy is paramount. Product verification requires no personal information — no sign-up, no tracking cookies, no PII collection from consumers. Brand data is isolated per tenant with strict access controls and retention policies.",
    link: "/privacy",
    linkText: "Read Privacy Policy",
  },
  {
    icon: "📋",
    title: "Compliance",
    description: "Infometa is SOC2 Type II ready and GDPR-aligned. We are actively pursuing ISO 27001 certification. Our platform supports industry-specific compliance requirements including FSSAI, CDSCO, and BIS traceability standards.",
    link: "/security",
    linkText: "View Compliance Details",
  },
  {
    icon: "👁️",
    title: "Transparency",
    description: "We believe in full transparency about data handling. Each QR scan collects only: approximate location, timestamp, device type, and scan result. No personal data. All data is retained for 24 months unless otherwise configured by the brand.",
    link: "/privacy",
    linkText: "View Data Practices",
  },
];

export default function TrustPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trust Center" }]} />

      <ScrollReveal>
        <div className="text-center mb-16">
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            Trust Center
          </h1>
          <p className="mt-4 text-xl text-secondary max-w-3xl mx-auto">
            Security, Privacy, and Transparency — by Design. We built Infometa on the principle that trust must be earned through action, not just words.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-8 md:grid-cols-2 mb-16">
        {sections.map((section, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <div className="rounded-2xl border border-border bg-white p-8 h-full">
              <div className="text-3xl mb-4" aria-hidden="true">{section.icon}</div>
              <h2 className="text-xl font-semibold text-foreground mb-3">{section.title}</h2>
              <p className="text-secondary leading-relaxed mb-4">{section.description}</p>
              <Link href={section.link} className="text-sm font-medium text-primary hover:underline">
                {section.linkText} →
              </Link>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <div className="text-center">
          <p className="text-secondary mb-4">Questions about our security or privacy practices?</p>
          <Link href="/contact" className="text-primary font-medium hover:underline">
            Contact our security team →
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
