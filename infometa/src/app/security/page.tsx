import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Security",
  description: "Learn about Infometa's security architecture, encryption standards, access controls, and vulnerability disclosure program.",
  alternates: { canonical: "https://infometa.in/security" },
};

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trust Center", href: "/trust" }, { label: "Security" }]} />

      <ScrollReveal>
        <h1 className="text-4xl font-semibold text-foreground mb-6">Security at Infometa</h1>
        <p className="text-lg text-secondary mb-12 leading-relaxed">
          Security is not an afterthought at Infometa — it is the foundation of everything we build.
          Our platform is designed with security-by-design principles, ensuring that brand data, product registries,
          and consumer verification remain protected at every layer.
        </p>
      </ScrollReveal>

      <div className="prose prose-lg max-w-none">
        <ScrollReveal>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Encryption</h2>
          <ul className="space-y-3 text-secondary mb-8">
            <li><strong className="text-foreground">In Transit:</strong> All data transmitted between clients and our servers is encrypted using TLS 1.3, the latest and most secure transport layer protocol.</li>
            <li><strong className="text-foreground">At Rest:</strong> All stored data is encrypted using AES-256 encryption, the gold standard for data protection used by governments and financial institutions worldwide.</li>
            <li><strong className="text-foreground">QR Tokens:</strong> Each QR code contains a UUID-based cryptographic token that is cryptographically signed and non-guessable. Tokens cannot be reverse-engineered or predicted.</li>
          </ul>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Access Controls</h2>
          <ul className="space-y-3 text-secondary mb-8">
            <li><strong className="text-foreground">RBAC:</strong> The brand portal implements role-based access control with distinct permission levels for administrators, operators, and viewers.</li>
            <li><strong className="text-foreground">Multi-Tenant Isolation:</strong> Each brand&apos;s data is strictly isolated in separate logical partitions with no cross-tenant data access possible.</li>
            <li><strong className="text-foreground">Session Management:</strong> Automatic session expiry, IP-based anomaly detection, and forced re-authentication for sensitive operations.</li>
          </ul>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Infrastructure</h2>
          <ul className="space-y-3 text-secondary mb-8">
            <li>Hosted on SOC2-certified cloud infrastructure with 99.99% uptime SLA</li>
            <li>Automated backup with point-in-time recovery across multiple availability zones</li>
            <li>DDoS protection and Web Application Firewall (WAF) on all endpoints</li>
            <li>Network segmentation with private subnets for database and internal services</li>
          </ul>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-semibold text-foreground mb-4">QR Token Security</h2>
          <p className="text-secondary mb-4">
            Each QR code in the Infometa system contains a unique cryptographic token composed of:
          </p>
          <ul className="space-y-2 text-secondary mb-8">
            <li>UUID v4 — universally unique, non-sequential identifier</li>
            <li>HMAC-SHA256 signature — ensures the token has not been tampered with</li>
            <li>Server-side validation — every scan is verified against the cloud registry, not locally</li>
            <li>Rate limiting — prevents brute-force scanning or enumeration attacks</li>
          </ul>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Vulnerability Disclosure</h2>
          <p className="text-secondary mb-4">
            We welcome responsible disclosure of security vulnerabilities. If you discover a security issue, please report it to:
          </p>
          <div className="rounded-xl border border-border bg-surface-tint p-6 mb-8">
            <p className="font-medium text-foreground mb-1">Security Contact</p>
            <p className="text-secondary">Email: security@infometa.in</p>
            <p className="text-secondary mt-2 text-sm">
              We commit to acknowledging reports within 24 hours and providing a resolution timeline within 72 hours.
              We will not take legal action against researchers who follow responsible disclosure guidelines.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
