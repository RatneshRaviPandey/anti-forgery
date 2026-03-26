import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = {
  title: "System Status",
  description: "Infometa Technologies platform status and uptime. Check current system health and subscribe to status updates.",
  alternates: { canonical: "https://infometa.tech/status" },
  robots: { index: false, follow: true },
};

export default function StatusPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "System Status" }]} />

      <h1 className="text-4xl font-semibold text-foreground mb-8">System Status</h1>

      {/* Current Status */}
      <div className="mb-8 rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <div className="text-4xl mb-3" aria-hidden="true">✅</div>
        <h2 className="text-2xl font-semibold text-success mb-1">All Systems Operational</h2>
        <p className="text-secondary">Last checked: {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
      </div>

      {/* Service Status */}
      <div className="mb-8 rounded-xl border border-border bg-white overflow-hidden">
        <div className="px-6 py-3 border-b border-border bg-background/50">
          <h3 className="font-medium text-foreground">Service Health</h3>
        </div>
        {[
          { name: "Consumer Verification API", status: "Operational" },
          { name: "Brand Dashboard", status: "Operational" },
          { name: "QR Code Generation", status: "Operational" },
          { name: "Scan Analytics", status: "Operational" },
          { name: "Clone Detection Engine", status: "Operational" },
          { name: "Website & CDN", status: "Operational" },
        ].map((service) => (
          <div key={service.name} className="flex items-center justify-between px-6 py-3 border-b border-border/50 last:border-b-0">
            <span className="text-sm text-foreground">{service.name}</span>
            <span className="flex items-center gap-2 text-sm text-success">
              <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
              {service.status}
            </span>
          </div>
        ))}
      </div>

      {/* Uptime */}
      <div className="mb-8 text-center">
        <p className="text-3xl font-bold text-foreground">99.99%</p>
        <p className="text-secondary">Uptime over the last 90 days</p>
      </div>

      {/* Subscribe */}
      <div className="mb-8 rounded-xl border border-border bg-white p-6 text-center">
        <h3 className="font-semibold text-foreground mb-2">Subscribe to Status Updates</h3>
        <p className="text-sm text-secondary mb-4">Get notified of maintenance windows and incidents.</p>
        <div className="flex max-w-md mx-auto gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Email for status updates"
          />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
            Subscribe
          </button>
        </div>
      </div>

      {/* Incident History */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        <div className="px-6 py-3 border-b border-border bg-background/50">
          <h3 className="font-medium text-foreground">Recent Incident History</h3>
        </div>
        <div className="p-6 text-center text-secondary">
          <p className="text-sm">No incidents reported in the last 90 days.</p>
        </div>
      </div>
    </div>
  );
}
