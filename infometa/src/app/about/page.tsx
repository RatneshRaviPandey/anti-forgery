import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "About Us",
  description: "Infometa Technologies: Making every product verifiable and every consumer confident. Learn about our mission, team, and approach to anti-counterfeit technology.",
  alternates: { canonical: "https://infometa.tech/about" },
  openGraph: {
    title: "About Infometa Technologies",
    description: "Making every product verifiable and every consumer confident.",
    url: "https://infometa.tech/about",
  },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Infometa Technologies",
  url: "https://infometa.tech",
  description: "Real-time QR-based product authentication and anti-counterfeit verification platform.",
  foundingDate: "2023",
  founder: { "@type": "Person", name: "Founding Team" },
};

const team = [
  { name: "Arjun Nair", role: "CEO & Co-Founder", bio: "15+ years in enterprise software and supply chain technology. Previously led product at a Fortune 500 logistics company." },
  { name: "Dr. Meera Iyer", role: "CTO & Co-Founder", bio: "PhD in Cryptography from IISc Bangalore. Expert in secure systems design, QR cryptography, and distributed verification architectures." },
  { name: "Vikram Singh", role: "VP Engineering", bio: "Built and scaled platforms serving 100M+ users. Former engineering lead at a leading Indian fintech." },
  { name: "Priya Deshmukh", role: "Head of Product", bio: "10 years in SaaS product management. Passionate about building products that protect consumers and empower brands." },
  { name: "Karthik Rao", role: "Head of Security", bio: "CISSP certified. 12 years in cybersecurity. Previously led security at a global pharmaceutical company." },
];

const milestones = [
  { year: "2023 Q1", event: "Infometa Technologies founded in Bangalore" },
  { year: "2023 Q3", event: "Core platform development completed — QR generation, verification, and analytics" },
  { year: "2024 Q1", event: "First 10 enterprise brands onboarded across dairy and pharmaceuticals" },
  { year: "2024 Q2", event: "Clone detection engine launched — real-time duplicate QR identification" },
  { year: "2024 Q4", event: "1 million verifications milestone reached" },
  { year: "2025 Q1", event: "Expanded to 12 industries, 200+ brand customers, 50M+ verifications" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <JsonLd data={aboutJsonLd} />

      {/* Mission */}
      <ScrollReveal>
        <section className="mb-16 text-center">
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl mb-4">
            About Infometa Technologies
          </h1>
          <p className="text-2xl text-primary font-medium mb-6">
            Make every product verifiable and every consumer confident.
          </p>
          <p className="text-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            Infometa Technologies builds real-time QR-based product authentication technology that protects brands from counterfeiting and gives consumers the power to verify what they buy — instantly, freely, and securely.
          </p>
        </section>
      </ScrollReveal>

      {/* Vision & Values */}
      <ScrollReveal>
        <section className="mb-16 grid gap-8 md:grid-cols-3">
          {[
            { title: "Vision", desc: "A world where every product can be verified and counterfeiting is economically unviable." },
            { title: "Mission", desc: "To build the most trusted product authentication infrastructure — accessible to every brand and every consumer." },
            { title: "Why Now", desc: "Counterfeiting costs $4.5 trillion annually and is accelerating. Technology finally makes unit-level authentication scalable and affordable." },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border border-border bg-white p-8">
              <h2 className="text-xl font-semibold text-foreground mb-3">{item.title}</h2>
              <p className="text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>
      </ScrollReveal>

      {/* Approach */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground text-center mb-8">Our Approach</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: "🔒", title: "Security-First", desc: "Every decision prioritizes data security and cryptographic integrity. No shortcuts, no compromises." },
              { icon: "👤", title: "Consumer-Friendly", desc: "Verification works with any smartphone camera — no app downloads, no sign-ups, no complexity." },
              { icon: "🏢", title: "Brand-Enabling", desc: "Designed for enterprise scale with API integration, batch management, and real-time analytics." },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface-tint p-6 text-center">
                <div className="text-3xl mb-3" aria-hidden="true">{item.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Team */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground text-center mb-8">Our Team</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {team.map((member) => (
              <div key={member.name} className="rounded-xl border border-border bg-white p-6 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <p className="text-xs text-primary mb-2">{member.role}</p>
                <p className="text-xs text-secondary leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Timeline */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground text-center mb-8">Our Journey</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  {i < milestones.length - 1 && <div className="w-px flex-1 bg-primary/20" />}
                </div>
                <div className="pb-6">
                  <p className="text-sm font-semibold text-primary">{m.year}</p>
                  <p className="text-secondary">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Security & Trust */}
      <ScrollReveal>
        <section className="mb-16 rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">Security & Trust</h2>
          <p className="text-secondary max-w-2xl mx-auto mb-6">
            Trust is the foundation of everything we build. Our platform uses military-grade encryption, role-based access controls,
            and is SOC2-ready and GDPR-aligned. Learn more about our security practices.
          </p>
          <Button variant="secondary" asChild>
            <Link href="/trust">Visit Trust Center</Link>
          </Button>
        </section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <section className="text-center">
          <h2 className="text-3xl font-semibold text-foreground mb-4">
            Join Us in Making Products Trustworthy
          </h2>
          <p className="text-secondary max-w-xl mx-auto mb-8">
            Whether you are a brand looking to protect your products or a professional who wants to make a difference in the fight against counterfeiting — we would love to hear from you.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/contact?subject=demo">Book a Demo</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
