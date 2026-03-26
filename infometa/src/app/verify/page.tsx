import type { Metadata } from "next";
import { VerifyClient } from "./verify-client";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Verify Product Authenticity",
  description:
    "Scan or enter a QR code to instantly verify if your product is authentic. Free verification for consumers — no sign-up required. Powered by Infometa Technologies.",
  alternates: { canonical: "https://infometa.tech/verify" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Verify Product Authenticity | Infometa Technologies",
    description: "Instantly verify if your product is genuine by scanning the QR code or entering the product code.",
    url: "https://infometa.tech/verify",
    images: [{ url: "/images/og/og-verify.jpg", width: 1200, height: 630 }],
  },
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Infometa Product Verifier",
  url: "https://infometa.tech/verify",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  description: "Free instant product authentication. Scan QR code or enter product code to verify authenticity.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
};

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Verify Product" },
        ]}
      />
      <JsonLd data={webAppJsonLd} />
      <VerifyClient />
    </div>
  );
}
