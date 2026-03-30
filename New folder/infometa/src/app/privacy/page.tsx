import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Infometa Technologies Privacy Policy. Learn how we handle data, protect consumer privacy, and ensure compliance with GDPR and Indian data protection laws.",
  alternates: { canonical: "https://infometa.tech/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />

      <h1 className="text-4xl font-semibold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-secondary mb-8">Last updated: March 1, 2025</p>

      <div className="prose max-w-none text-secondary leading-relaxed space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
          <p>Infometa Technologies (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) is committed to protecting your privacy. This policy explains how we collect, use, and safeguard information when you use our website and product verification services.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Consumer Verification — What We Collect</h2>
          <p>When consumers scan a QR code to verify a product, we collect minimal, non-personal data:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Approximate geographic location (city-level, not precise GPS)</li>
            <li>Timestamp of the scan</li>
            <li>Device type and browser (for compatibility purposes)</li>
            <li>Scan result (authentic, suspicious, or invalid)</li>
          </ul>
          <p className="font-medium text-foreground mt-2">We do NOT collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Names, email addresses, or phone numbers of consumers</li>
            <li>Precise GPS coordinates</li>
            <li>Photos or camera data (QR scanning is processed locally on your device)</li>
            <li>Health, financial, or demographic information</li>
          </ul>
          <p><strong>No sign-up or account creation is required for consumers to verify products.</strong></p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Brand Portal Data</h2>
          <p>For brand customers using our dashboard and API, we collect business information necessary to provide our services, including company name, contact details of authorized users, product catalog data, and billing information. This data is protected by encryption and role-based access controls.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Data Retention</h2>
          <p>Scan data is retained for 24 months by default. Brand customers can configure custom retention periods. All data is permanently deleted upon account termination or upon request.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Data Security</h2>
          <p>We use industry-standard security measures including TLS 1.3 encryption in transit, AES-256 encryption at rest, role-based access controls, and regular security audits. See our <a href="/security" className="text-primary hover:underline">Security page</a> for details.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Third-Party Sharing</h2>
          <p>We do not sell, rent, or trade personal data. Aggregated, anonymized scan analytics may be shared with brand customers to help them understand product verification patterns. We may share data with law enforcement when required by law or to prevent fraud.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Cookies</h2>
          <p>Our website uses essential cookies for functionality and optional analytics cookies to improve our services. See our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a> for details and preferences.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. For brand portal users, you can manage your data through account settings. For any data requests, contact us at privacy@infometa.tech.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. GDPR & Compliance</h2>
          <p>Infometa is aligned with GDPR requirements and Indian data protection regulations. We process data lawfully, fairly, and transparently, collecting only what is necessary for the specified purpose.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
          <p>For privacy-related questions or requests:</p>
          <p>Email: privacy@infometa.tech<br />Infometa Technologies Pvt. Ltd., HSR Layout, Bangalore, Karnataka 560102, India</p>
        </section>
      </div>
    </div>
  );
}
