import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { JsonLd } from "@/components/seo/json-ld";
import { ToastProvider } from "@/components/ui/toast-provider";
import { InactivityGuard } from "@/components/auth/InactivityGuard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://infometa.in"),
  title: {
    default: "Infometa Technologies — Scan. Verify. Trust. | Anti-Counterfeit Platform",
    template: "%s | Infometa Technologies",
  },
  description:
    "India's leading QR-based product authentication and anti-counterfeit verification platform. Protect your brand from counterfeiting with real-time cloud verification. Used by 200+ brands across dairy, pharma, cosmetics, FMCG & more.",
  keywords: [
    "product authentication QR code",
    "anti-counterfeit software India",
    "QR code verification system",
    "brand protection technology",
    "counterfeit detection platform",
    "product verification SaaS",
    "fake product detection",
    "supply chain authentication",
    "anti-forgery solution",
    "product traceability",
    "QR code scanner verify",
    "infometa",
  ],
  authors: [{ name: "Infometa Technologies", url: "https://infometa.in" }],
  creator: "Infometa Technologies",
  publisher: "Infometa Technologies",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://infometa.in",
    languages: { "en-IN": "https://infometa.in" },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://infometa.in",
    siteName: "Infometa Technologies",
    title: "Infometa Technologies — Scan. Verify. Trust.",
    description:
      "India's leading QR-based product authentication and anti-counterfeit verification platform. Protect your brand with real-time cloud verification.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Infometa Technologies — Anti-Counterfeit Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@infometa_tech",
    creator: "@infometa_tech",
    title: "Infometa Technologies — Scan. Verify. Trust.",
    description:
      "India's leading QR-based product authentication platform. Real-time cloud verification for brands.",
    images: ["/og-image.png"],
  },
  other: {
    "geo.region": "IN-KA",
    "geo.placename": "Bangalore, India",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Infometa Technologies",
  url: "https://infometa.in",
  logo: "https://infometa.in/icon.svg",
  sameAs: [
    "https://linkedin.com/company/infometa",
    "https://x.com/infometa_tech",
  ],
  description:
    "India's leading QR-based product authentication and anti-counterfeit verification platform.",
  foundingDate: "2024",
  founders: [{ "@type": "Person", name: "Ratnesh Ravi Pandey" }],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangalore",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@infometa.in",
    availableLanguage: ["English", "Hindi"],
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
        <link rel="alternate" hrefLang="en-IN" href="https://infometa.in" />
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
        <ToastProvider />
        <InactivityGuard />
      </body>
    </html>
  );
}
