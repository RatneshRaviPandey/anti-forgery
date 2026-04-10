import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "A complete list of all pages on the Infometa Technologies website.",
  robots: { index: true, follow: true },
};

const siteLinks = [
  {
    heading: "Main Pages",
    links: [
      { label: "Home", href: "/" },
      { label: "Verify Product", href: "/verify" },
      { label: "For Brands", href: "/brands" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
      { label: "About", href: "/about" },
    ],
  },
  {
    heading: "Industries",
    links: [
      { label: "Industries Overview", href: "/industries" },
      { label: "Dairy", href: "/industries/dairy" },
      { label: "Pharmaceuticals", href: "/industries/pharma" },
      { label: "Cosmetics", href: "/industries/cosmetics" },
      { label: "FMCG", href: "/industries/fmcg" },
      { label: "Agro Products", href: "/industries/agro-products" },
      { label: "Electronics", href: "/industries/electronics" },
      { label: "Auto Parts", href: "/industries/auto-parts" },
      { label: "Lubricants", href: "/industries/lubricants" },
      { label: "Supplements", href: "/industries/supplements" },
      { label: "Beverages", href: "/industries/beverages" },
      { label: "Luxury Goods", href: "/industries/luxury" },
      { label: "Industrial Chemicals", href: "/industries/industrial-chemicals" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog & Resources", href: "/resources" },
      { label: "How QR Code Verification Works", href: "/resources/how-qr-code-verification-works" },
      { label: "How Counterfeiters Copy QR Codes", href: "/resources/how-counterfeiters-copy-qr-codes" },
      { label: "Brand Trust Playbook", href: "/resources/brand-trust-playbook" },
      { label: "Top 10 Industries Affected", href: "/resources/top-10-industries-affected-by-counterfeiting" },
      { label: "What is Clone Detection?", href: "/resources/what-is-clone-detection" },
      { label: "Dairy Smart Packaging", href: "/resources/dairy-brands-smart-packaging" },
    ],
  },
  {
    heading: "Case Studies",
    links: [
      { label: "Case Studies Overview", href: "/case-studies" },
      { label: "Dairy Brand Stops Repackaging", href: "/case-studies/dairy-brand-stops-repackaging" },
      { label: "Pharma Secures Supply Chain", href: "/case-studies/pharma-company-secures-supply-chain" },
      { label: "Cosmetics Brand Fights Online Fakes", href: "/case-studies/cosmetics-brand-fights-online-fakes" },
      { label: "Auto Parts OEM Reduces Warranty Fraud", href: "/case-studies/auto-parts-oem-reduces-warranty-fraud" },
      { label: "Agro Brand Protects Farmers", href: "/case-studies/agro-brand-protects-farmers" },
    ],
  },
  {
    heading: "Trust & Legal",
    links: [
      { label: "Trust Center", href: "/trust" },
      { label: "Security", href: "/security" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "System Status", href: "/status" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">Sitemap</h1>
      <p className="mt-2 text-secondary">A complete list of all pages on the Infometa Technologies website.</p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {siteLinks.map((section) => (
          <div key={section.heading}>
            <h2 className="text-base font-semibold text-foreground mb-3">{section.heading}</h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
