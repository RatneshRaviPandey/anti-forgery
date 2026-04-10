import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { JsonLd } from "@/components/seo/json-ld";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://infometa.tech"),
  title: {
    default: "Infometa Technologies — Scan. Verify. Trust.",
    template: "%s | Infometa Technologies",
  },
  description:
    "Real-time QR-based product authentication and anti-counterfeit verification platform. Protect your brand and your customers with secure cloud verification.",
  keywords: [
    "product authentication QR code",
    "anti-counterfeit software",
    "QR code verification system",
    "brand protection technology",
    "counterfeit detection platform",
    "product verification SaaS",
  ],
  authors: [{ name: "Infometa Technologies" }],
  creator: "Infometa Technologies",
  publisher: "Infometa Technologies",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://infometa.tech" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://infometa.tech",
    siteName: "Infometa Technologies",
    title: "Infometa Technologies — Scan. Verify. Trust.",
    description:
      "Real-time QR-based product authentication and anti-counterfeit verification platform.",
    images: [{ url: "/images/og/og-home.jpg", width: 1200, height: 630, alt: "Infometa Technologies" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infometa Technologies — Scan. Verify. Trust.",
    description:
      "Real-time QR-based product authentication and anti-counterfeit verification platform.",
    images: ["/images/og/og-home.jpg"],
  },
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Infometa Technologies",
  url: "https://infometa.tech",
  logo: "https://infometa.tech/images/logo.png",
  sameAs: [],
  description:
    "Real-time QR-based product authentication and anti-counterfeit verification platform.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@infometa.tech",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <link rel="alternate" hrefLang="en-IN" href="https://infometa.tech" />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <JsonLd data={organizationJsonLd} />
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
