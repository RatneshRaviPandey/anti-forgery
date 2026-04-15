import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Infometa Technologies. Book a demo, discuss partnership opportunities, or get support for your anti-counterfeit product authentication needs.",
  alternates: { canonical: "https://infometa.in/contact" },
  openGraph: {
    title: "Contact Infometa Technologies",
    description: "Book a demo, discuss partnerships, or get support.",
    url: "https://infometa.in/contact",
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  mainEntity: {
    "@type": "LocalBusiness",
    name: "Infometa Technologies",
    email: "support@infometa.in",
    url: "https://infometa.in",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bangalore",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    openingHours: "Mo-Fr 09:00-18:00",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <JsonLd data={contactJsonLd} />

      <ScrollReveal>
        <h1 className="text-4xl font-semibold text-foreground sm:text-5xl mb-4">
          Get in Touch
        </h1>
        <p className="text-lg text-secondary max-w-2xl mb-12">
          Whether you want to book a demo, discuss partnerships, or need support — we are here to help.
        </p>
      </ScrollReveal>

      <div className="grid gap-12 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-3">
          <ScrollReveal>
            <ContactForm />
          </ScrollReveal>
        </div>

        {/* Info */}
        <div className="lg:col-span-2">
          <ScrollReveal delay={0.1}>
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Contact Information</h2>
                <div className="space-y-3 text-sm text-secondary">
                  <p>
                    <span className="block font-medium text-foreground">Email</span>
                    support@infometa.in
                  </p>
                  <p>
                    <span className="block font-medium text-foreground">Phone</span>
                    +91 80 4567 8900
                  </p>
                  <p>
                    <span className="block font-medium text-foreground">Address</span>
                    Infometa Technologies Pvt. Ltd.<br />
                    HSR Layout, Sector 7<br />
                    Bangalore, Karnataka 560102<br />
                    India
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Business Hours</h2>
                <div className="space-y-1 text-sm text-secondary">
                  <p>Monday — Friday: 9:00 AM — 6:00 PM IST</p>
                  <p>Saturday: 10:00 AM — 2:00 PM IST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Quick Links</h2>
                <div className="space-y-2 text-sm">
                  <a href="/brands" className="block text-primary hover:underline">For Brands — Learn More</a>
                  <a href="/pricing" className="block text-primary hover:underline">View Pricing Plans</a>
                  <a href="/trust" className="block text-primary hover:underline">Trust & Security Center</a>
                  <a href="/resources" className="block text-primary hover:underline">Resources & Blog</a>
                </div>
              </div>

              {/* Office location map */}
              <div className="rounded-xl border border-border overflow-hidden h-48">
                <iframe
                  title="Infometa Office — Bangalore, India"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=77.55%2C12.93%2C77.65%2C13.00&layer=mapnik&marker=12.9716%2C77.5946"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
