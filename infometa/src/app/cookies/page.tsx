import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Infometa Technologies Cookie Policy. Learn about the cookies we use, their purposes, and how to manage your preferences.",
  alternates: { canonical: "https://infometa.tech/cookies" },
  robots: { index: false, follow: true },
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cookie Policy" }]} />

      <h1 className="text-4xl font-semibold text-foreground mb-2">Cookie Policy</h1>
      <p className="text-sm text-secondary mb-8">Last updated: March 1, 2025</p>

      <div className="prose max-w-none text-secondary leading-relaxed space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground">What Are Cookies</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and improve your browsing experience.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Cookies We Use</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="px-4 py-3 text-left font-medium">Cookie</th>
                  <th className="px-4 py-3 text-left font-medium">Purpose</th>
                  <th className="px-4 py-3 text-left font-medium">Duration</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="px-4 py-3 font-mono text-xs">cookie-consent</td>
                  <td className="px-4 py-3">Stores your cookie preference</td>
                  <td className="px-4 py-3">1 year</td>
                  <td className="px-4 py-3">Essential</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="px-4 py-3 font-mono text-xs">session-id</td>
                  <td className="px-4 py-3">Admin portal authentication</td>
                  <td className="px-4 py-3">Session</td>
                  <td className="px-4 py-3">Essential</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="px-4 py-3 font-mono text-xs">_analytics</td>
                  <td className="px-4 py-3">Anonymous usage analytics</td>
                  <td className="px-4 py-3">90 days</td>
                  <td className="px-4 py-3">Analytics</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Essential Cookies</h2>
          <p>Essential cookies are required for the website to function properly. They cannot be disabled. These include cookies for authentication, security, and basic functionality.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Analytics Cookies</h2>
          <p>Analytics cookies help us understand how visitors interact with our website. All analytics data is anonymized and aggregated. You can opt out of analytics cookies through the cookie consent banner.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Managing Your Preferences</h2>
          <p>You can manage your cookie preferences at any time by clicking the &quot;Cookie Preferences&quot; link in the website footer, or by adjusting your browser settings to block or delete cookies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p>For questions about our use of cookies, contact us at privacy@infometa.tech.</p>
        </section>
      </div>
    </div>
  );
}
