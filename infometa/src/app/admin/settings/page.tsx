"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [cloneThreshold, setCloneThreshold] = useState("3");
  const [alertEmail, setAlertEmail] = useState("admin@infometa.in");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [brandName, setBrandName] = useState("DairyFresh Co.");
  const [verifyPageLogo, setVerifyPageLogo] = useState("/images/logo.png");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-secondary">Configure your authentication platform preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Clone Detection */}
        <Card>
          <h2 className="text-base font-semibold text-foreground mb-4">Clone Detection</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="threshold" className="block text-sm font-medium text-foreground mb-1">
                Duplicate Scan Threshold
              </label>
              <input
                id="threshold"
                type="number"
                min="1"
                max="100"
                value={cloneThreshold}
                onChange={(e) => setCloneThreshold(e.target.value)}
                className="h-10 w-32 rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-secondary">
                Number of scans from different locations before flagging as suspicious.
              </p>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <h2 className="text-base font-semibold text-foreground mb-4">Notifications</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Alert Email
              </label>
              <input
                id="email"
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="webhook" className="block text-sm font-medium text-foreground mb-1">
                Webhook URL (optional)
              </label>
              <input
                id="webhook"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-app.com/webhooks/alerts"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm placeholder:text-secondary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </Card>

        {/* Branding */}
        <Card>
          <h2 className="text-base font-semibold text-foreground mb-4">Verification Page Branding</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-foreground mb-1">
                Brand Name
              </label>
              <input
                id="brand"
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-foreground mb-1">
                Logo URL
              </label>
              <input
                id="logo"
                type="text"
                value={verifyPageLogo}
                onChange={(e) => setVerifyPageLogo(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit">
            <Save className="h-4 w-4" /> Save Settings
          </Button>
          {saved && (
            <span className="text-sm text-success font-medium">Settings saved successfully.</span>
          )}
        </div>
      </form>
    </div>
  );
}
