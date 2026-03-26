import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Infometa Technologies Terms of Service governing the use of our product authentication and anti-counterfeit verification platform.",
  alternates: { canonical: "https://infometa.tech/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]} />

      <h1 className="text-4xl font-semibold text-foreground mb-2">Terms of Service</h1>
      <p className="text-sm text-secondary mb-8">Last updated: March 1, 2025</p>

      <div className="prose max-w-none text-secondary leading-relaxed space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing or using the Infometa Technologies platform, website, or services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
          <p>Infometa Technologies provides a QR-based product authentication and anti-counterfeit verification platform. Our services include QR code generation, consumer verification, scan analytics, clone detection, and related brand protection tools.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Consumer Verification</h2>
          <p>Product verification is provided free of charge to consumers. Verification results are based on data provided by participating brands and are indicative, not guaranteed. Infometa is not responsible for the quality, safety, or authenticity of physical products.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Brand Customer Obligations</h2>
          <p>Brand customers are responsible for the accuracy of product data uploaded to the platform, proper application of QR codes to products, compliance with applicable industry regulations, and timely payment of subscription fees.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Intellectual Property</h2>
          <p>All content, technology, and intellectual property of the Infometa platform remain the property of Infometa Technologies. Brand customers retain ownership of their product data and trademarks.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Data Handling</h2>
          <p>Our handling of data is governed by our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>. By using our services, you consent to the data practices described therein.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Service Availability</h2>
          <p>We strive to maintain 99.99% platform uptime. However, we do not guarantee uninterrupted service. Planned maintenance windows will be communicated in advance. See our <a href="/status" className="text-primary hover:underline">Status page</a> for real-time availability.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
          <p>Infometa Technologies shall not be liable for indirect, incidental, special, or consequential damages. Our total liability shall not exceed the fees paid by the customer in the 12 months preceding the claim.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Termination</h2>
          <p>Either party may terminate the service with 30 days written notice. Upon termination, brand customer data will be available for export for 90 days, after which it will be permanently deleted.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">11. Contact</h2>
          <p>For questions about these terms, contact us at legal@infometa.tech.</p>
        </section>
      </div>
    </div>
  );
}
