import type { Metadata } from "next";
import { HeroSection } from "./_sections/hero";
import { LiveVerifyWidget } from "./_sections/live-verify-widget";
import { ValueProps } from "./_sections/value-props";
import { WhyInfometa } from "./_sections/why-infometa";
import { HowItWorks } from "./_sections/how-it-works";
import { IndustriesGrid } from "./_sections/industries-grid";
import { SocialProof } from "./_sections/social-proof";
import { TestimonialsSection } from "./_sections/testimonials-section";
import { BlogPreview } from "./_sections/blog-preview";
import { CTABanner } from "./_sections/cta-banner";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Infometa Technologies — Scan. Verify. Trust. | Anti-Counterfeit QR Verification",
  description:
    "Protect your brand and your customers with real-time QR-based product authentication — built for the scale of modern supply chains. 50M+ verifications processed.",
  alternates: { canonical: "https://infometa.in" },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Infometa Technologies",
  url: "https://infometa.in",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://infometa.in/verify?code={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Infometa Verify",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "Free consumer product verification",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={appJsonLd} />
      <HeroSection />
      <LiveVerifyWidget />
      <ValueProps />
      <WhyInfometa />
      <HowItWorks />
      <IndustriesGrid />
      <SocialProof />
      <TestimonialsSection />
      <BlogPreview />
      <CTABanner />
    </>
  );
}
