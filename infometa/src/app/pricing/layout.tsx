import type { Metadata } from "next";
import { pricingFaqs } from "@/lib/mock-data";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Pricing — Anti-Counterfeit Product Authentication Plans",
  description:
    "Simple, transparent pricing for Infometa's QR-based product authentication platform. Starter, Growth, and Enterprise plans with 14-day free trial.",
  alternates: { canonical: "https://infometa.in/pricing" },
  openGraph: {
    title: "Pricing | Infometa Technologies",
    description: "Choose your anti-counterfeit protection plan. Start with a 14-day free trial.",
    url: "https://infometa.in/pricing",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: pricingFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      {children}
    </>
  );
}
