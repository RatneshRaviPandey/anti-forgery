export const colors = {
  primary: "#0F766E",
  primaryDark: "#115E59",
  surfaceTint: "#ECFEFF",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  background: "#F8FAFC",
  text: "#0F172A",
  secondary: "#475569",
  border: "#E2E8F0",
} as const;

export const typography = {
  h1: { size: "48px", lineHeight: "56px", weight: "600" },
  h2: { size: "32px", lineHeight: "40px", weight: "600" },
  h3: { size: "24px", lineHeight: "32px", weight: "500" },
  body: { size: "16px", lineHeight: "24px", weight: "400" },
  small: { size: "14px", lineHeight: "20px", weight: "400" },
} as const;

export const siteConfig = {
  name: "Infometa Technologies",
  tagline: "Scan. Verify. Trust.",
  url: "https://infometa.in",
  description:
    "Real-time QR-based product authentication and anti-counterfeit verification platform. Protect your brand and your customers.",
  email: "support@infometa.in",
  ogImage: "/images/og/og-home.jpg",
} as const;
