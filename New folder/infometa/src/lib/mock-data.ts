// === TYPE DEFINITIONS ===
export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  industry: string;
  sku: string;
  imageUrl: string;
  status: "active" | "recalled" | "discontinued";
};

export type Batch = {
  id: string;
  productId: string;
  batchCode: string;
  manufactureDate: string;
  expiryDate: string;
  totalUnits: number;
  activatedAt: string;
};

export type QRCode = {
  token: string;
  batchId: string;
  productId: string;
  status: "active" | "suspicious" | "deactivated";
  scanCount: number;
  lastScannedAt: string;
  lastScannedLocation: string;
};

export type Scan = {
  id: string;
  token: string;
  timestamp: string;
  location: { lat: number; lng: number; city: string };
  deviceFingerprint: string;
  resultStatus: "authentic" | "suspicious" | "invalid";
};

export type Alert = {
  id: string;
  type: "duplicate" | "spike" | "geo_anomaly" | "recall";
  token: string;
  triggeredAt: string;
  resolved: boolean;
  message: string;
};

export type VerifyResult =
  | { status: "authentic"; product: Product; batch: Batch; scanCount: number }
  | {
      status: "suspicious";
      product: Product;
      batch: Batch;
      scanCount: number;
      locations: string[];
      message: string;
    }
  | { status: "invalid"; message: string };

// === PRODUCTS ===
export const products: Product[] = [
  {
    id: "p1",
    name: "PureLife Milk 1L",
    brand: "DairyFresh Co.",
    category: "Packaged Milk",
    industry: "dairy",
    sku: "DF-ML-1000",
    imageUrl: "/images/products/milk.webp",
    status: "active",
  },
  {
    id: "p2",
    name: "CardioShield 50mg Tablets",
    brand: "MediCore Labs",
    category: "Cardiovascular",
    industry: "pharma",
    sku: "MC-CS-050",
    imageUrl: "/images/products/medicine.webp",
    status: "active",
  },
  {
    id: "p3",
    name: "LuxeGlow Anti-Aging Serum",
    brand: "GlowVita",
    category: "Skincare",
    industry: "cosmetics",
    sku: "GV-AG-030",
    imageUrl: "/images/products/serum.webp",
    status: "active",
  },
  {
    id: "p4",
    name: "TurboLube 5W-30 Engine Oil",
    brand: "PetroMax",
    category: "Engine Oil",
    industry: "lubricants",
    sku: "PM-EO-530",
    imageUrl: "/images/products/oil.webp",
    status: "active",
  },
  {
    id: "p5",
    name: "VitaBoost Multi-Vitamin",
    brand: "NutriWell",
    category: "Supplements",
    industry: "supplements",
    sku: "NW-MV-060",
    imageUrl: "/images/products/vitamins.webp",
    status: "active",
  },
];

// === BATCHES ===
export const batches: Batch[] = [
  {
    id: "b1",
    productId: "p1",
    batchCode: "DF-2025-001",
    manufactureDate: "2025-01-15",
    expiryDate: "2025-07-15",
    totalUnits: 50000,
    activatedAt: "2025-01-16T08:00:00Z",
  },
  {
    id: "b2",
    productId: "p2",
    batchCode: "MC-2025-034",
    manufactureDate: "2025-02-01",
    expiryDate: "2027-02-01",
    totalUnits: 100000,
    activatedAt: "2025-02-02T10:00:00Z",
  },
  {
    id: "b3",
    productId: "p3",
    batchCode: "GV-2025-012",
    manufactureDate: "2025-03-01",
    expiryDate: "2026-09-01",
    totalUnits: 25000,
    activatedAt: "2025-03-02T09:00:00Z",
  },
];

// === QR CODES ===
export const qrCodes: QRCode[] = [
  {
    token: "REAL-123",
    batchId: "b1",
    productId: "p1",
    status: "active",
    scanCount: 1,
    lastScannedAt: "2025-03-20T14:30:00Z",
    lastScannedLocation: "Mumbai, India",
  },
  {
    token: "DUP-999",
    batchId: "b2",
    productId: "p2",
    status: "suspicious",
    scanCount: 7,
    lastScannedAt: "2025-03-25T09:15:00Z",
    lastScannedLocation: "Delhi, India",
  },
  {
    token: "BAD-000",
    batchId: "",
    productId: "",
    status: "deactivated",
    scanCount: 0,
    lastScannedAt: "",
    lastScannedLocation: "",
  },
];

// === SCANS (500 events) ===
const cities = [
  { city: "Mumbai", lat: 19.076, lng: 72.8777 },
  { city: "Delhi", lat: 28.6139, lng: 77.209 },
  { city: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { city: "Chennai", lat: 13.0827, lng: 80.2707 },
  { city: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { city: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { city: "Pune", lat: 18.5204, lng: 73.8567 },
  { city: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { city: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { city: "Lucknow", lat: 26.8467, lng: 80.9462 },
];

const tokens = ["REAL-123", "DUP-999", ...Array.from({ length: 48 }, (_, i) => `QR-${String(i + 100).padStart(4, "0")}`)];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const scans: Scan[] = Array.from({ length: 500 }, (_, i) => {
  const r = seededRandom(i + 1);
  const cityIdx = Math.floor(r * cities.length);
  const loc = cities[cityIdx];
  const tokenIdx = Math.floor(seededRandom(i + 500) * tokens.length);
  const token = tokens[tokenIdx];
  const day = Math.floor(seededRandom(i + 1000) * 28) + 1;
  const hour = Math.floor(seededRandom(i + 2000) * 24);
  const status: Scan["resultStatus"] =
    token === "DUP-999" ? "suspicious" : token === "BAD-000" ? "invalid" : "authentic";
  return {
    id: `scan-${String(i + 1).padStart(4, "0")}`,
    token,
    timestamp: `2025-03-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(Math.floor(seededRandom(i + 3000) * 60)).padStart(2, "0")}:00Z`,
    location: { lat: loc.lat, lng: loc.lng, city: loc.city },
    deviceFingerprint: `dev-${Math.floor(seededRandom(i + 4000) * 99999)}`,
    resultStatus: status,
  };
});

// === ALERTS ===
export const alerts: Alert[] = [
  {
    id: "alert-001",
    type: "duplicate",
    token: "DUP-999",
    triggeredAt: "2025-03-25T09:20:00Z",
    resolved: false,
    message: "QR code DUP-999 scanned 7 times from 3 different cities. Possible cloning detected.",
  },
  {
    id: "alert-002",
    type: "spike",
    token: "QR-0115",
    triggeredAt: "2025-03-24T18:00:00Z",
    resolved: false,
    message: "Unusual scan spike: 45 scans in 1 hour from Pune region.",
  },
  {
    id: "alert-003",
    type: "geo_anomaly",
    token: "QR-0120",
    triggeredAt: "2025-03-23T12:00:00Z",
    resolved: true,
    message: "Same code scanned in Mumbai and Delhi within 30 minutes. Geographic anomaly flagged.",
  },
  {
    id: "alert-004",
    type: "duplicate",
    token: "QR-0130",
    triggeredAt: "2025-03-22T07:30:00Z",
    resolved: true,
    message: "QR code QR-0130 scanned 5 times across 2 locations.",
  },
  {
    id: "alert-005",
    type: "spike",
    token: "QR-0105",
    triggeredAt: "2025-03-21T20:00:00Z",
    resolved: false,
    message: "30 scans in 15 minutes from unknown location cluster.",
  },
  {
    id: "alert-006",
    type: "recall",
    token: "QR-0140",
    triggeredAt: "2025-03-20T10:00:00Z",
    resolved: false,
    message: "Batch DF-2025-001 flagged for quality recall. All codes deactivated.",
  },
  {
    id: "alert-007",
    type: "geo_anomaly",
    token: "DUP-999",
    triggeredAt: "2025-03-19T15:00:00Z",
    resolved: false,
    message: "DUP-999 scanned in Chennai and Kolkata simultaneously.",
  },
  {
    id: "alert-008",
    type: "duplicate",
    token: "QR-0110",
    triggeredAt: "2025-03-18T11:00:00Z",
    resolved: true,
    message: "QR-0110 showing duplicate scan pattern — 4 scans from 3 cities.",
  },
  {
    id: "alert-009",
    type: "spike",
    token: "QR-0100",
    triggeredAt: "2025-03-17T22:00:00Z",
    resolved: true,
    message: "Scan volume anomaly: 60 scans from Ahmedabad region in 2 hours.",
  },
  {
    id: "alert-010",
    type: "geo_anomaly",
    token: "QR-0125",
    triggeredAt: "2025-03-16T08:00:00Z",
    resolved: false,
    message: "QR-0125 scanned across 4 states in 6 hours. Distribution anomaly.",
  },
  {
    id: "alert-011",
    type: "recall",
    token: "QR-0135",
    triggeredAt: "2025-03-15T14:00:00Z",
    resolved: true,
    message: "Product p3 batch recalled due to packaging defect.",
  },
  {
    id: "alert-012",
    type: "duplicate",
    token: "QR-0145",
    triggeredAt: "2025-03-14T06:00:00Z",
    resolved: false,
    message: "QR-0145 scanned 8 times in 48 hours — clone likelihood: high.",
  },
];

// === VERIFY FUNCTION ===
export function verify(code: string): VerifyResult {
  const qr = qrCodes.find((q) => q.token === code);
  if (!qr || qr.status === "deactivated" || !qr.productId) {
    return { status: "invalid", message: "This code is not registered in the Infometa verification registry. The product may be counterfeit or the code may have been tampered with." };
  }
  const product = products.find((p) => p.id === qr.productId)!;
  const batch = batches.find((b) => b.id === qr.batchId)!;

  if (qr.scanCount >= 3) {
    return {
      status: "suspicious",
      product,
      batch,
      scanCount: qr.scanCount,
      locations: ["Mumbai", "Delhi", "Chennai"],
      message: "This QR code has been scanned multiple times from different locations. This may indicate product cloning or counterfeit distribution.",
    };
  }

  return { status: "authentic", product, batch, scanCount: qr.scanCount };
}

// === INDUSTRIES DATA ===
export type Industry = {
  slug: string;
  name: string;
  icon: string;
  shortDescription: string;
  longTailKeyword: string;
  problemStatement: string;
  impactDescription: string;
  scenarios: { title: string; description: string }[];
  riskTable: { productType: string; riskLevel: "High" | "Medium" | "Low" }[];
  stats: { stat: string; source: string }[];
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
};

export const industries: Industry[] = [
  {
    slug: "dairy",
    name: "Dairy",
    icon: "🥛",
    shortDescription: "Protect packaged milk, butter, cheese, and dairy products from adulteration and counterfeit packaging.",
    longTailKeyword: "milk packet authentication India",
    problemStatement: "Dairy counterfeiting in India often involves repackaging expired or adulterated milk in branded packaging. Counterfeit dairy products not only damage brand reputation but pose serious health risks to consumers, including children and the elderly. Grey market operators refill genuine-looking pouches with substandard milk or mix water and chemicals to mimic branded products.",
    impactDescription: "The Indian dairy market loses an estimated ₹15,000 crores annually to adulteration and counterfeit packaging. Consumer trust in packaged dairy brands erodes with every food safety scandal, pushing buyers toward unpackaged alternatives. Brands face regulatory penalties under FSSAI guidelines when counterfeit products bearing their name fail quality tests.",
    scenarios: [
      { title: "Refilled Milk Pouches", description: "Counterfeiters collect used branded pouches, refill them with adulterated milk, and reseal them for sale in local shops and rural markets." },
      { title: "Copied QR Codes on Butter Packs", description: "A single legitimate QR code is photographed and printed on hundreds of fake butter packages, making each appear verified." },
      { title: "Grey Market Cheese Distribution", description: "Expired cheese blocks are relabeled with new dates and distributed through unauthorized channels, bypassing cold-chain requirements." },
    ],
    riskTable: [
      { productType: "Packaged Milk (Pouch)", riskLevel: "High" },
      { productType: "Butter & Ghee", riskLevel: "High" },
      { productType: "Cheese & Paneer", riskLevel: "Medium" },
      { productType: "Yogurt & Curd", riskLevel: "Medium" },
      { productType: "Milk Powder", riskLevel: "Low" },
    ],
    stats: [
      { stat: "68% of milk samples in India found adulterated in FSSAI survey", source: "FSSAI National Milk Quality Survey 2023" },
      { stat: "₹15,000 Cr annual loss to dairy adulteration in India", source: "National Dairy Development Board Report" },
      { stat: "34% of consumers distrust packaged milk brands due to counterfeiting fears", source: "Consumer Trust Index 2024" },
    ],
    faqs: [
      { question: "How does QR verification work for milk packets?", answer: "Each milk packet receives a unique encrypted QR code during packaging. When a consumer scans it, our cloud system verifies the code against the registered batch, confirming authenticity in under 2 seconds." },
      { question: "Can counterfeiters copy the QR code from a genuine pack?", answer: "If a code is copied and scanned multiple times from different locations, our clone detection algorithm flags it immediately and alerts the brand within seconds." },
      { question: "Is the verification free for consumers?", answer: "Yes. Consumers can scan and verify any Infometa-protected product without signing up or paying. It works with any smartphone camera." },
      { question: "How does Infometa comply with FSSAI guidelines?", answer: "Infometa helps brands meet FSSAI traceability requirements by providing unit-level tracking from production to point of sale, with full audit trails." },
      { question: "What happens if a counterfeit dairy product is detected?", answer: "The system alerts the brand immediately with location data, scan patterns, and evidence. Brands can then coordinate with authorities for enforcement." },
    ],
    relatedSlugs: ["fmcg", "beverages", "supplements"],
  },
  {
    slug: "pharma",
    name: "Pharmaceuticals",
    icon: "💊",
    shortDescription: "Ensure medicine authenticity and patient safety with unit-level QR verification for every strip, vial, and box.",
    longTailKeyword: "medicine authentication QR code India",
    problemStatement: "Counterfeit pharmaceuticals are one of the deadliest forms of product fraud. In developing markets, up to 30% of medicines sold may be substandard or falsified. Fake drugs range from placebos with no active ingredient to dangerous concoctions with toxic substances. The pharma supply chain's complexity — from API sourcing to last-mile distribution — creates multiple entry points for counterfeit products.",
    impactDescription: "The WHO estimates that counterfeit medicines cause over 250,000 deaths annually in children alone. Pharmaceutical brands face billions in lost revenue, regulatory penalties, and irreparable damage to patient trust. In India, CDSCO regularly seizes counterfeit drug shipments, but enforcement alone cannot solve the scale of the problem.",
    scenarios: [
      { title: "Fake Antibiotic Strips", description: "Counterfeit antibiotic strips with chalk fillers are packaged in near-identical blister packs and sold through unauthorized pharmacies." },
      { title: "Copied QR on Insulin Vials", description: "A single QR code from a legitimate insulin vial is replicated across thousands of counterfeit vials, each appearing 'verified' on first scan." },
      { title: "Grey Market Cancer Drugs", description: "Expired or improperly stored cancer medications are relabeled and sold at discount through unauthorized online pharmacies." },
    ],
    riskTable: [
      { productType: "Tablets & Capsules", riskLevel: "High" },
      { productType: "Injectable & Vials", riskLevel: "High" },
      { productType: "Syrups & Suspensions", riskLevel: "Medium" },
      { productType: "Topical Creams", riskLevel: "Medium" },
      { productType: "Surgical Supplies", riskLevel: "Low" },
    ],
    stats: [
      { stat: "Up to 30% of medicines in developing countries are counterfeit", source: "World Health Organization 2024" },
      { stat: "250,000+ child deaths annually linked to fake medicines", source: "WHO Substandard & Falsified Medical Products Report" },
      { stat: "$4.03 billion counterfeit pharma market in India", source: "ASSOCHAM-NEC Study 2023" },
    ],
    faqs: [
      { question: "How does QR verification help prevent counterfeit medicines?", answer: "Every medicine unit gets a unique cryptographic QR code. When scanned, our cloud verifies it against the manufacturer's registered batch data, confirming if the product is genuine." },
      { question: "Does Infometa comply with CDSCO track-and-trace requirements?", answer: "Yes. Our platform supports serialization and track-and-trace requirements mandated by CDSCO for pharmaceutical products in India." },
      { question: "Can pharmacists use Infometa to verify stock?", answer: "Absolutely. Pharmacists can scan incoming stock to verify authenticity before dispensing, adding an extra layer of patient safety." },
      { question: "What data is collected when a consumer scans a medicine?", answer: "We collect only the scan location (approximate), timestamp, and device type. No personal information or health data is collected from consumers." },
      { question: "How quickly can counterfeit medicines be detected?", answer: "Clone detection triggers within seconds of a duplicate scan. Brands receive real-time alerts with geographic data to enable rapid enforcement response." },
    ],
    relatedSlugs: ["supplements", "cosmetics", "industrial-chemicals"],
  },
  {
    slug: "cosmetics",
    name: "Cosmetics",
    icon: "💄",
    shortDescription: "Protect beauty and personal care brands from counterfeit products that risk consumer safety and brand integrity.",
    longTailKeyword: "fake cosmetics detection",
    problemStatement: "The cosmetics industry faces a massive counterfeiting crisis with fake products flooding online marketplaces and retail stores. Counterfeit cosmetics often contain harmful substances including lead, mercury, arsenic, and bacteria that cause severe allergic reactions, chemical burns, and long-term health damage. The visual similarity of fake packaging makes it nearly impossible for consumers to identify counterfeits.",
    impactDescription: "The global counterfeit cosmetics market exceeds $75 billion annually. Brands suffer revenue loss, legal liability from consumer harm, and erosion of the premium positioning that drives their business model. Social media amplifies negative experiences with counterfeit products, creating brand crises that are expensive and time-consuming to resolve.",
    scenarios: [
      { title: "Fake Luxury Skincare on Marketplaces", description: "Counterfeit versions of premium serums and creams sold on e-commerce platforms at slight discounts, using copied product images and fake reviews." },
      { title: "Refilled Perfume Bottles", description: "Genuine designer perfume bottles are collected, refilled with cheap chemical substitutes, resealed, and sold at 'duty-free' prices." },
      { title: "Copied QR on Sunscreen Tubes", description: "A single QR code is printed across thousands of fake sunscreen tubes containing substandard UV protection." },
    ],
    riskTable: [
      { productType: "Premium Skincare (Serums, Creams)", riskLevel: "High" },
      { productType: "Perfumes & Fragrances", riskLevel: "High" },
      { productType: "Color Cosmetics (Lipstick, Foundation)", riskLevel: "High" },
      { productType: "Hair Care Products", riskLevel: "Medium" },
      { productType: "Body Care (Lotions, Soaps)", riskLevel: "Low" },
    ],
    stats: [
      { stat: "$75+ billion global counterfeit cosmetics market", source: "OECD/EUIPO Counterfeit Trade Report 2024" },
      { stat: "70% of counterfeit cosmetics contain hazardous substances", source: "FDA Consumer Safety Report" },
      { stat: "1 in 4 beauty products sold online may be counterfeit", source: "Red Points Brand Protection Survey 2024" },
    ],
    faqs: [
      { question: "How can consumers verify if their cosmetics are genuine?", answer: "Simply scan the QR code on the product packaging with any smartphone camera. Our system instantly verifies the product against the brand's registered database." },
      { question: "What harmful substances are found in counterfeit cosmetics?", answer: "Common toxins include lead, mercury, arsenic, cyanide, and dangerous bacteria. These can cause skin damage, allergic reactions, and long-term health issues." },
      { question: "Can Infometa protect against online marketplace counterfeits?", answer: "Yes. Our scan data reveals distribution patterns that help brands identify unauthorized sellers and counterfeit hotspots on e-commerce platforms." },
      { question: "Is the QR code tamper-evident?", answer: "Our QR codes use cryptographic tokens that cannot be reverse-engineered. Any attempt to copy or modify them is detected by our clone detection system." },
      { question: "How do cosmetic brands integrate with Infometa?", answer: "Brands integrate through our API or batch upload system. QR codes are generated for each unit during production and activated when the batch ships." },
    ],
    relatedSlugs: ["luxury", "fmcg", "pharma"],
  },
  {
    slug: "fmcg",
    name: "FMCG",
    icon: "🛒",
    shortDescription: "Shield fast-moving consumer goods from counterfeit distribution across retail and e-commerce channels.",
    longTailKeyword: "FMCG anti-counterfeit solution",
    problemStatement: "FMCG brands face counterfeiting at massive scale due to high volumes, wide distribution networks, and the low unit cost that makes individual product authentication seem impractical. Counterfeit FMCG products span everything from detergents and snacks to personal care items, often manufactured in unregulated facilities with no quality controls.",
    impactDescription: "Global FMCG counterfeiting costs the industry over $50 billion annually. Beyond revenue loss, brands face consumer safety incidents, regulatory penalties, and market share erosion. The distributed nature of FMCG retail — spanning modern trade, general trade, and e-commerce — makes monitoring especially challenging.",
    scenarios: [
      { title: "Fake Detergent in Rural Markets", description: "Counterfeit detergent powders in look-alike packaging sold in rural kirana stores where consumers have limited ability to verify authenticity." },
      { title: "Copied Snack Brand Packaging", description: "Near-identical packaging of popular snack brands manufactured in unauthorized facilities with inferior ingredients." },
      { title: "Grey Market Personal Care", description: "Products intended for export are diverted back to domestic markets, often with altered shelf-life dates." },
    ],
    riskTable: [
      { productType: "Packaged Foods & Snacks", riskLevel: "High" },
      { productType: "Detergents & Cleaning", riskLevel: "High" },
      { productType: "Personal Care & Hygiene", riskLevel: "Medium" },
      { productType: "Cooking Oils & Spices", riskLevel: "High" },
      { productType: "Batteries & Small Accessories", riskLevel: "Medium" },
    ],
    stats: [
      { stat: "$50+ billion annual cost of FMCG counterfeiting globally", source: "Brand Protection Survey 2024" },
      { stat: "15% of FMCG products in emerging markets are estimated to be counterfeit", source: "FICCI CASCADE Report" },
      { stat: "42% of consumers have unknowingly purchased counterfeit FMCG products", source: "Consumer Awareness Study 2024" },
    ],
    faqs: [
      { question: "Is QR authentication practical for low-cost FMCG products?", answer: "Yes. Our per-unit cost starts at fractions of a paisa, making it viable even for ₹5 and ₹10 products. The QR is printed during the existing packaging process." },
      { question: "How do FMCG brands handle millions of SKUs?", answer: "Our platform supports batch-level QR generation with CSV upload, API integration, and automated activation — designed for FMCG scale." },
      { question: "Can Infometa work with existing packaging lines?", answer: "Yes. We provide integration guidance for all major packaging equipment. QR codes can be printed, labeled, or etched during production." },
      { question: "How does scan data help FMCG brands?", answer: "Scan data reveals real-time demand signals, geographic distribution patterns, counterfeit hotspots, and consumer engagement metrics." },
      { question: "Does Infometa work for export products?", answer: "Absolutely. Our platform supports multi-region products with localized verification pages and geo-specific alert routing." },
    ],
    relatedSlugs: ["dairy", "beverages", "cosmetics"],
  },
  {
    slug: "agro-products",
    name: "Agro Products",
    icon: "🌾",
    shortDescription: "Verify authenticity of pesticides, fertilizers, seeds, and agricultural inputs to protect farmers and crops.",
    longTailKeyword: "agrochemical product verification",
    problemStatement: "Counterfeit agricultural inputs — pesticides, fertilizers, and seeds — devastate farmer livelihoods and food security. Fake pesticides that fail to control pests can lead to crop failures affecting entire communities. Spurious fertilizers alter soil chemistry, reducing productivity for years. The agrochemical supply chain's reliance on distributors and sub-dealers creates numerous points where counterfeit products can enter.",
    impactDescription: "Indian agriculture loses an estimated ₹15,000 crores annually to counterfeit agrochemicals. Crop failures from fake products push farmers into debt cycles, contributing to the ongoing agrarian crisis. Legitimate manufacturers lose market share and face blame for product failures caused by counterfeits.",
    scenarios: [
      { title: "Fake Pesticide Bottles", description: "Water or diluted chemicals packaged in copied branded bottles, sold through unauthorized dealers in farming districts." },
      { title: "Counterfeit Seeds in Original Packaging", description: "Low-quality seeds repackaged in branded bags, leading to poor germination and crop failure." },
      { title: "Diluted Liquid Fertilizers", description: "Premium liquid fertilizers diluted with water and resealed, providing insufficient nutrition to crops." },
    ],
    riskTable: [
      { productType: "Pesticides & Insecticides", riskLevel: "High" },
      { productType: "Seeds (Hybrid & GM)", riskLevel: "High" },
      { productType: "Chemical Fertilizers", riskLevel: "Medium" },
      { productType: "Organic Inputs", riskLevel: "Medium" },
      { productType: "Farm Equipment Parts", riskLevel: "Low" },
    ],
    stats: [
      { stat: "₹15,000 Cr annual loss from counterfeit agro-inputs in India", source: "FICCI Report on Agrochemical Counterfeiting" },
      { stat: "25-30% of pesticides in India are estimated to be fake or substandard", source: "CII-KPMG Study 2023" },
      { stat: "Crop failures from fake inputs affect 10+ million farmers annually", source: "Ministry of Agriculture Estimates" },
    ],
    faqs: [
      { question: "How can farmers verify pesticides before using them?", answer: "Farmers simply scan the QR code on the product with their smartphone. The system shows the product details, batch information, and authenticity status in their local language." },
      { question: "Does Infometa work in areas with limited internet?", answer: "Our verification works with minimal data connectivity. Results are optimized for 2G/3G networks and load in under 3 seconds even on basic smartphones." },
      { question: "Can agricultural dealers verify incoming stock?", answer: "Yes. Dealers can scan products when receiving shipments to confirm authenticity before adding them to inventory." },
      { question: "How does this help with BIS certification compliance?", answer: "Infometa's traceability data helps manufacturers demonstrate product integrity through the supply chain, supporting BIS and ISI mark audit requirements." },
      { question: "What languages does the verification page support?", answer: "The consumer verification page can be configured in Hindi, English, and major regional languages to ensure accessibility for all farmers." },
    ],
    relatedSlugs: ["industrial-chemicals", "fmcg", "dairy"],
  },
  {
    slug: "electronics",
    name: "Electronics",
    icon: "📱",
    shortDescription: "Authenticate electronic components, devices, and accessories to prevent counterfeit failures and safety hazards.",
    longTailKeyword: "electronics anti-fake verification",
    problemStatement: "Counterfeit electronics range from fake smartphone chargers and batteries that cause fires, to cloned components that fail in critical systems. The complexity of electronics supply chains — spanning multiple countries and hundreds of suppliers — makes them especially vulnerable. Counterfeit components can enter legitimate supply chains through unauthorized distributors.",
    impactDescription: "The counterfeit electronics market costs the global industry over $100 billion annually. Beyond revenue loss, counterfeit electronics cause safety incidents including fires, electrocution, and system failures. For industrial and automotive electronics, counterfeit components can have life-threatening consequences.",
    scenarios: [
      { title: "Fake Smartphone Chargers & Batteries", description: "Non-certified chargers and batteries sold in branded packaging, lacking proper safety circuits and causing overheating or fires." },
      { title: "Cloned Electronic Components", description: "Recycled or inferior chips remarked with premium brand logos, sold to manufacturers who unknowingly incorporate them into consumer products." },
      { title: "Counterfeit Audio Equipment", description: "Fake headphones and speakers with premium branding sold online at slight discounts, with poor audio quality and no safety certifications." },
    ],
    riskTable: [
      { productType: "Chargers & Power Adapters", riskLevel: "High" },
      { productType: "Batteries (Li-ion)", riskLevel: "High" },
      { productType: "Semiconductor Components", riskLevel: "High" },
      { productType: "Audio/Video Accessories", riskLevel: "Medium" },
      { productType: "Storage Devices", riskLevel: "Medium" },
    ],
    stats: [
      { stat: "$100+ billion annual global counterfeit electronics market", source: "OECD Counterfeit Trade Report 2024" },
      { stat: "Counterfeit chargers cause 1,000+ fire incidents annually in India", source: "National Consumer Forum Data" },
      { stat: "1 in 5 electronic components sourced from open market may be counterfeit", source: "IHS Markit Component Intelligence" },
    ],
    faqs: [
      { question: "How does QR verification work for electronics?", answer: "Each product or component gets a unique QR code linked to its serial number, model, and manufacturing details. Scanning verifies this against the manufacturer's registry." },
      { question: "Can Infometa verify electronic components in bulk?", answer: "Yes. Our API supports batch verification for manufacturers receiving components from suppliers, enabling quality gates in the procurement process." },
      { question: "How does this help consumers buying online?", answer: "Consumers can scan the QR code immediately upon delivery to verify the product is genuine before opening or using it." },
      { question: "Does Infometa work with BIS certification for electronics?", answer: "Our platform can integrate with BIS certification workflows, providing additional traceability and authentication as required by Indian regulatory standards." },
      { question: "What about electronics recycling and refurbishment?", answer: "Our system can track product lifecycle stages, distinguishing between new, refurbished, and recycled products to prevent misrepresentation." },
    ],
    relatedSlugs: ["auto-parts", "luxury", "industrial-chemicals"],
  },
  {
    slug: "auto-parts",
    name: "Auto Parts",
    icon: "🔧",
    shortDescription: "Authenticate automotive spare parts and accessories to prevent counterfeit failures on the road.",
    longTailKeyword: "auto spare parts authentication",
    problemStatement: "Counterfeit auto parts are a major safety hazard, with fake brake pads, filters, belts, and electrical components flooding aftermarket channels. These parts are designed to look identical to genuine OEM products but lack proper materials, engineering, and quality testing. The automotive aftermarket's fragmented distribution through thousands of small dealers makes it a prime target.",
    impactDescription: "Counterfeit auto parts contribute to an estimated 2 million accidents globally each year. The automotive aftermarket loses over $45 billion annually to counterfeits. OEM brands face warranty fraud, liability claims, and reputation damage when fake parts fail.",
    scenarios: [
      { title: "Fake Brake Pads", description: "Counterfeit brake pads made from compressed grass and sawdust in OEM-lookalike packaging, failing catastrophically under emergency braking." },
      { title: "Copied QR on Oil Filters", description: "A single QR code replicated across thousands of substandard oil filters, each appearing 'verified' on first scan." },
      { title: "Counterfeit Electrical Components", description: "Fake alternators and starters with inferior copper windings that fail prematurely, causing breakdowns and potential fires." },
    ],
    riskTable: [
      { productType: "Brake Components", riskLevel: "High" },
      { productType: "Filters (Oil, Air, Fuel)", riskLevel: "High" },
      { productType: "Electrical Parts", riskLevel: "High" },
      { productType: "Suspension & Steering", riskLevel: "Medium" },
      { productType: "Body Parts & Accessories", riskLevel: "Low" },
    ],
    stats: [
      { stat: "2 million accidents globally attributed to counterfeit auto parts annually", source: "Federal Trade Commission Automotive Report" },
      { stat: "$45 billion annual global counterfeit auto parts market", source: "MEMA Group Automotive Study 2024" },
      { stat: "30% of auto parts sold in Indian aftermarket estimated to be counterfeit", source: "ACMA Industry Report" },
    ],
    faqs: [
      { question: "How can mechanics verify auto parts?", answer: "Mechanics scan the QR code when receiving parts. The system displays the genuine part details, compatible vehicle models, and batch authenticity status." },
      { question: "Does Infometa work with auto part distributors?", answer: "Yes. Distributors can verify entire shipments using our batch scan feature, ensuring only genuine parts enter their inventory." },
      { question: "Can consumers verify parts at the workshop?", answer: "Absolutely. Consumers can ask their mechanic to scan the part before installation, or scan it themselves for peace of mind." },
      { question: "How does this help OEM warranty programs?", answer: "Our system creates a verifiable chain of custody from manufacturer to installation, helping OEMs validate warranty claims and detect fraud." },
      { question: "What about multi-brand auto part retailers?", answer: "Our platform supports multi-brand verification — retailers can scan and verify products from any participating OEM through a single interface." },
    ],
    relatedSlugs: ["lubricants", "electronics", "industrial-chemicals"],
  },
  {
    slug: "lubricants",
    name: "Lubricants",
    icon: "🛢️",
    shortDescription: "Protect engine oils, industrial lubricants, and greases from counterfeit products that damage equipment.",
    longTailKeyword: "lubricant authenticity check",
    problemStatement: "Counterfeit lubricants are manufactured by blending low-grade base oils with minimal additives, then packaging them in convincing replicas of premium brand containers. These fake products fail to provide proper engine or machinery protection, leading to accelerated wear, overheating, and catastrophic equipment failures. The lubricant market's reliance on visual identification makes QR-based verification essential.",
    impactDescription: "Counterfeit lubricants cost the global industry over $12 billion annually. Equipment failures from fake oils result in billions more in repair costs, downtime, and warranty claims. In India alone, an estimated 20-25% of lubricants sold in the aftermarket are suspected to be counterfeit.",
    scenarios: [
      { title: "Refilled Engine Oil Containers", description: "Used premium oil containers collected from workshops, refilled with cheap base oil, resealed, and sold at full price." },
      { title: "Fake Industrial Lubricants", description: "Substandard industrial oils in branded packaging are sold to factories, causing machinery failures and production downtime." },
      { title: "Diluted Gear Oils", description: "Premium gear oils diluted with base stock, failing to protect transmissions under heavy loads." },
    ],
    riskTable: [
      { productType: "Engine Oils (Passenger)", riskLevel: "High" },
      { productType: "Engine Oils (Commercial)", riskLevel: "High" },
      { productType: "Industrial Lubricants", riskLevel: "Medium" },
      { productType: "Greases & Specialties", riskLevel: "Medium" },
      { productType: "Coolants & Fluids", riskLevel: "Low" },
    ],
    stats: [
      { stat: "$12+ billion annual global counterfeit lubricants market", source: "Kline & Company Lubricants Study 2024" },
      { stat: "20-25% of lubricants in Indian aftermarket suspected counterfeit", source: "Indian Oil Corporation Industry Report" },
      { stat: "Counterfeit oils reduce engine life by up to 60%", source: "SAE International Technical Paper" },
    ],
    faqs: [
      { question: "How can vehicle owners verify their engine oil?", answer: "Scan the QR code on the container before pouring. The system confirms the product, batch, grade, and authenticity in seconds." },
      { question: "Can workshops verify lubricant shipments?", answer: "Yes. Workshop owners can scan incoming stock to ensure every container is genuine before servicing customer vehicles." },
      { question: "Does Infometa work for industrial lubricant buyers?", answer: "Absolutely. Procurement teams can verify bulk shipments at receiving docks, adding a quality gate to the supply chain." },
      { question: "What if the QR code is damaged?", answer: "Consumers can manually enter the product code printed alongside the QR code for verification. Brands can also use tamper-evident QR labels." },
      { question: "How does clone detection work for lubricant packaging?", answer: "If the same QR code is scanned from multiple distant locations, our system flags it as a potential clone and alerts the brand immediately." },
    ],
    relatedSlugs: ["auto-parts", "industrial-chemicals", "fmcg"],
  },
  {
    slug: "supplements",
    name: "Supplements",
    icon: "💪",
    shortDescription: "Verify health supplements, nutraceuticals, and sports nutrition products against counterfeiting and adulteration.",
    longTailKeyword: "supplement authenticity verification",
    problemStatement: "The booming health supplement industry faces rampant counterfeiting, with fake products containing anything from chalk to dangerous pharmaceutical compounds. Consumers purchasing supplements online or from unauthorized retailers have no way to verify what they are actually consuming. The lack of stringent regulation in many markets makes supplements a prime target for counterfeiters.",
    impactDescription: "The counterfeit supplement market is estimated at over $25 billion globally. Fake supplements cause adverse health reactions, hospitalization, and in severe cases, organ damage. Brands lose consumer trust rapidly when counterfeit products bearing their name cause health incidents, particularly in the social media age.",
    scenarios: [
      { title: "Fake Protein Powder Online", description: "Counterfeit protein powder sold on e-commerce platforms contains flour and sugar instead of whey protein, sometimes with added steroids." },
      { title: "Copied Vitamin Brand Packaging", description: "Premium vitamin brands replicated with identical packaging but containing chalk or low-dose generic ingredients." },
      { title: "Adulterated Weight Loss Supplements", description: "Fake weight loss supplements containing banned pharmaceutical compounds (sibutramine, phenolphthalein) sold under established brand names." },
    ],
    riskTable: [
      { productType: "Protein Powders & Bars", riskLevel: "High" },
      { productType: "Vitamins & Minerals", riskLevel: "High" },
      { productType: "Weight Loss Products", riskLevel: "High" },
      { productType: "Herbal Supplements", riskLevel: "Medium" },
      { productType: "Sports Nutrition", riskLevel: "Medium" },
    ],
    stats: [
      { stat: "$25+ billion global counterfeit supplement market", source: "Grand View Research 2024" },
      { stat: "46% of supplement users worry about product authenticity", source: "CRN Consumer Survey 2024" },
      { stat: "FDA issued 700+ warnings for tainted supplements in 3 years", source: "FDA Tainted Supplements Database" },
    ],
    faqs: [
      { question: "How can I verify my supplements are genuine?", answer: "Scan the QR code on the product packaging or container. Our system shows the authentic product details, batch, expiry date, and verification status." },
      { question: "Does Infometa detect supplement adulteration?", answer: "While our system verifies product identity (not chemical composition), the traceability data helps brands identify where counterfeits enter the supply chain for testing and enforcement." },
      { question: "Can gyms and fitness centers verify products they sell?", answer: "Yes. Any retailer or fitness center can scan incoming supplement stock to verify authenticity before selling to members." },
      { question: "Is verification available for imported supplements?", answer: "Yes. Our platform supports global products. Brands register their products regardless of origin, and verification works worldwide." },
      { question: "What about subscription box supplements?", answer: "Each unit in a subscription box can have its own QR code, allowing monthly subscribers to verify every delivery." },
    ],
    relatedSlugs: ["pharma", "cosmetics", "beverages"],
  },
  {
    slug: "beverages",
    name: "Beverages",
    icon: "🍷",
    shortDescription: "Protect alcoholic and non-alcoholic beverage brands from counterfeit products and unauthorized refilling.",
    longTailKeyword: "beverage anti-counterfeit",
    problemStatement: "Counterfeit beverages pose significant health risks, particularly in the alcoholic drinks segment where fake products have caused mass poisonings. Non-alcoholic beverages are also targeted, with counterfeit water, juices, and soft drinks manufactured in unsanitary conditions. The high-volume, high-margin nature of beverages makes the industry attractive to counterfeiters.",
    impactDescription: "Counterfeit alcoholic beverages cause thousands of deaths annually from methanol poisoning. The legitimate beverage industry loses over $40 billion annually to counterfeiting. Premium spirits, wines, and craft beverages are especially targeted due to their higher margins.",
    scenarios: [
      { title: "Counterfeit Spirits in Genuine Bottles", description: "Collected branded spirit bottles refilled with cheap or dangerous alcohol (sometimes containing methanol) and resealed with copied labels." },
      { title: "Fake Premium Water Brands", description: "Tap water bottled in counterfeit premium water brand packaging and distributed through local stores." },
      { title: "Copied Juice Brand Packaging", description: "Low-quality fruit concentrates packaged in replicated premium juice brand packaging with forged batch numbers." },
    ],
    riskTable: [
      { productType: "Spirits & Whisky", riskLevel: "High" },
      { productType: "Wine & Champagne", riskLevel: "High" },
      { productType: "Packaged Water", riskLevel: "Medium" },
      { productType: "Juices & Health Drinks", riskLevel: "Medium" },
      { productType: "Soft Drinks & Carbonated", riskLevel: "Low" },
    ],
    stats: [
      { stat: "$40+ billion annual global counterfeit beverage market", source: "Euromonitor International 2024" },
      { stat: "Methanol poisoning from fake liquor kills 10,000+ annually worldwide", source: "WHO Alcohol Policy Report" },
      { stat: "35% of spirits sold in developing markets may be counterfeit", source: "IWSR Drinks Market Analysis" },
    ],
    faqs: [
      { question: "How does QR verification work for beverages?", answer: "Each bottle or pack gets a unique QR code on the label or cap. Consumers scan before opening to verify the product is genuine and from the correct batch." },
      { question: "Can QR codes be placed on bottle caps?", answer: "Yes. QR codes can be printed on caps, labels, neck bands, or cartons — wherever works best for the packaging format." },
      { question: "How does this help prevent refilling of spirit bottles?", answer: "Our QR codes can be paired with tamper-evident seals. Once scanned and opened, the code is marked as consumed, preventing reuse." },
      { question: "Does Infometa work for craft beverage brands?", answer: "Absolutely. Our Starter plan is designed for smaller brands, with per-unit pricing that scales with production volume." },
      { question: "Can bars and restaurants verify their beverage stock?", answer: "Yes. Establishments can scan incoming bottles to verify authenticity, protecting their reputation and their customers." },
    ],
    relatedSlugs: ["dairy", "fmcg", "luxury"],
  },
  {
    slug: "luxury",
    name: "Luxury Goods",
    icon: "👜",
    shortDescription: "Authenticate luxury fashion, accessories, and premium products to protect brand value and consumer confidence.",
    longTailKeyword: "luxury brand authentication",
    problemStatement: "Luxury goods are the most counterfeited product category globally, with fake designer products accounting for over 60% of all seized counterfeits. The sophisticated reproduction of luxury packaging, materials, and branding makes physical identification nearly impossible for consumers. Online marketplaces and social media have made it easier than ever for counterfeit luxury goods to reach consumers.",
    impactDescription: "The counterfeit luxury goods market exceeds $450 billion annually, representing the single largest category of counterfeit trade. Luxury brands invest hundreds of millions in anti-counterfeiting measures, legal enforcement, and brand protection. Beyond revenue loss, counterfeits erode the exclusivity and aspirational value that defines luxury positioning.",
    scenarios: [
      { title: "Fake Designer Handbags Online", description: "Nearly identical designer handbag replicas sold through social media and grey-market websites at 'outlet' prices." },
      { title: "Counterfeit Watch Components", description: "High-quality replicas using genuine-looking but inferior components, sometimes sold through unauthorized dealers as genuine." },
      { title: "Copied QR on Premium Accessories", description: "QR codes from genuine luxury items photographed and printed on counterfeit products to pass basic authentication." },
    ],
    riskTable: [
      { productType: "Handbags & Wallets", riskLevel: "High" },
      { productType: "Watches & Jewelry", riskLevel: "High" },
      { productType: "Designer Apparel", riskLevel: "High" },
      { productType: "Sunglasses & Eyewear", riskLevel: "High" },
      { productType: "Leather Goods & Accessories", riskLevel: "Medium" },
    ],
    stats: [
      { stat: "$450+ billion annual global counterfeit luxury goods market", source: "OECD/EUIPO Trends in Trade 2024" },
      { stat: "60% of all seized counterfeits are luxury goods", source: "World Customs Organization Report" },
      { stat: "79% of luxury consumers concerned about buying counterfeits online", source: "McKinsey Luxury Consumer Survey" },
    ],
    faqs: [
      { question: "How does luxury brand authentication work with Infometa?", answer: "Each luxury product receives a unique cryptographic QR embedded in the product or packaging. Buyers scan to verify authenticity, provenance, and ownership history." },
      { question: "Can Infometa provide digital certificates of authenticity?", answer: "Yes. Verified products display a digital authenticity certificate with product details, craftsmanship information, and brand verification." },
      { question: "How does this help with resale authentication?", answer: "Our system maintains product history, enabling authentication for pre-owned luxury markets and protecting both buyers and sellers." },
      { question: "Does the QR code affect the luxury product experience?", answer: "QR codes are designed to integrate seamlessly with luxury aesthetics — embedded in labels, certificates, or discrete locations that don't affect the premium experience." },
      { question: "Can Infometa detect parallel imports?", answer: "Yes. Geographic scan data reveals when products intended for specific markets appear in unauthorized regions, helping brands enforce distribution agreements." },
    ],
    relatedSlugs: ["cosmetics", "electronics", "beverages"],
  },
  {
    slug: "industrial-chemicals",
    name: "Industrial Chemicals",
    icon: "🏭",
    shortDescription: "Verify industrial chemical products to prevent safety hazards from counterfeit or adulterated chemicals.",
    longTailKeyword: "chemical product verification",
    problemStatement: "Counterfeit industrial chemicals pose catastrophic safety risks to workers, manufacturing processes, and the environment. Fake chemicals may be diluted, substituted with cheaper alternatives, or contaminated with hazardous substances. The specialized nature of chemical products means that counterfeits are often only discovered when they cause failures — sometimes with fatal consequences.",
    impactDescription: "Counterfeit industrial chemicals cause workplace accidents, equipment damage, product defects, and environmental contamination. The chemical industry loses an estimated $20 billion annually to counterfeiting. Liability exposure for incidents caused by counterfeit chemicals can be devastating for legitimate brands.",
    scenarios: [
      { title: "Diluted Industrial Solvents", description: "Premium solvents diluted with cheaper alternatives, causing inconsistent results in manufacturing processes and potentially hazardous reactions." },
      { title: "Fake Safety Equipment Chemicals", description: "Counterfeit fire retardants and safety chemicals that fail to meet the standards printed on their labels, creating life-threatening risks." },
      { title: "Relabeled Chemical Drums", description: "Industrial chemicals past their shelf life are relabeled with new dates and sold through unauthorized distributors." },
    ],
    riskTable: [
      { productType: "Industrial Solvents", riskLevel: "High" },
      { productType: "Safety & Fire Chemicals", riskLevel: "High" },
      { productType: "Adhesives & Coatings", riskLevel: "Medium" },
      { productType: "Cleaning & Maintenance", riskLevel: "Medium" },
      { productType: "Water Treatment Chemicals", riskLevel: "High" },
    ],
    stats: [
      { stat: "$20+ billion annual cost of counterfeit industrial chemicals", source: "American Chemistry Council Report 2024" },
      { stat: "12% of industrial chemical incidents linked to substandard products", source: "OSHA Incident Analysis Database" },
      { stat: "Chemical counterfeiting growing at 7% annually", source: "World Chemical Safety Board" },
    ],
    faqs: [
      { question: "How can factories verify incoming chemical shipments?", answer: "Receiving teams scan the QR code on each drum or container upon delivery. The system verifies the product, grade, batch, and supplier against the manufacturer's registry." },
      { question: "Does Infometa help with chemical safety compliance?", answer: "Yes. Our traceability data supports chemical safety documentation requirements, including SDS sheet verification and chain of custody for regulated substances." },
      { question: "Can bulk chemical purchases be verified?", answer: "Yes. Our system supports bulk verification through barcode scanning integration and API-based batch verification for large shipments." },
      { question: "How does this help with ISO certification requirements?", answer: "Infometa's audit trail provides documented proof of raw material authenticity, supporting ISO 9001 and ISO 14001 certification processes." },
      { question: "What about chemical products with long supply chains?", answer: "Our platform tracks products through multi-tier supply chains, flagging anomalies at any stage from manufacturing to final delivery." },
    ],
    relatedSlugs: ["lubricants", "agro-products", "electronics"],
  },
];

// === CASE STUDIES ===
export type CaseStudy = {
  slug: string;
  title: string;
  industry: string;
  category: string;
  challenge: string;
  solution: string;
  results: string;
  metrics: { label: string; value: string }[];
  quote: { text: string; author: string; role: string; company: string };
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "dairy-brand-stops-repackaging",
    title: "How a Leading Dairy Brand Stopped Repackaging Fraud Across 5 States",
    industry: "Dairy",
    category: "Packaged Milk",
    challenge: "A top-5 dairy brand in India discovered that counterfeit milk pouches bearing their branding were circulating in rural markets across 5 states. The fake products used repackaged pouches with expired or adulterated milk, causing customer complaints and regulatory scrutiny from FSSAI. The brand had no way to trace or authenticate individual packs at the consumer level.",
    solution: "Infometa deployed unique QR codes on every milk pouch during the packaging process. Each code linked to the specific batch, manufacturing line, and distribution channel. The scan data enabled real-time monitoring of verification patterns, while clone detection identified copied QR codes within minutes of the first duplicate scan.",
    results: "Within 6 months, the brand reduced counterfeit incidents by 87%. Consumer scans provided unprecedented visibility into distribution patterns, enabling the brand to identify and shut down 23 unauthorized redistribution points. Customer complaint rates dropped by 62%, and FSSAI compliance scores improved significantly.",
    metrics: [
      { label: "Counterfeit Reduction", value: "87%" },
      { label: "Unauthorized Dealers Identified", value: "23" },
      { label: "Consumer Complaints Reduced", value: "62%" },
    ],
    quote: {
      text: "Infometa gave us something we never had before — real-time visibility into how our products are being distributed and the ability to stop counterfeits before they reach consumers.",
      author: "Supply Chain Director",
      role: "VP Supply Chain",
      company: "Leading Dairy Brand",
    },
  },
  {
    slug: "pharma-company-secures-supply-chain",
    title: "Pharmaceutical Company Secures Supply Chain Across 12,000 Pharmacies",
    industry: "Pharmaceuticals",
    category: "Cardiovascular Drugs",
    challenge: "A pharmaceutical manufacturer discovered counterfeit versions of their bestselling cardiovascular medication being sold through unauthorized pharmacies. The fake tablets contained only 30% of the active ingredient, putting patient lives at risk. CDSCO enforcement was slow due to the fragmented nature of the pharmacy distribution network.",
    solution: "Infometa implemented unit-level QR authentication for every strip and box. The system integrated with the manufacturer's ERP to auto-generate QR codes during packaging. Pharmacists were trained to scan incoming stock, and patients could verify their medication instantly. The clone detection system flagged suspicious activity in real-time.",
    results: "In the first year, over 2.3 million patient verifications were processed. The system identified 15 counterfeit distribution networks, leading to coordinated enforcement actions with CDSCO. Patient trust scores increased measurably, and the brand saw an 18% increase in prescription preferences from doctors who valued the authentication layer.",
    metrics: [
      { label: "Patient Verifications", value: "2.3M+" },
      { label: "Counterfeit Networks Identified", value: "15" },
      { label: "Prescription Preference Increase", value: "18%" },
    ],
    quote: {
      text: "Patient safety is our top priority. Infometa's verification system gives doctors, pharmacists, and patients confidence that every tablet is genuine.",
      author: "Quality Assurance Head",
      role: "Head of Quality",
      company: "Leading Pharma Manufacturer",
    },
  },
  {
    slug: "cosmetics-brand-fights-online-fakes",
    title: "Premium Cosmetics Brand Eliminates 90% of Online Counterfeits",
    industry: "Cosmetics",
    category: "Premium Skincare",
    challenge: "A premium skincare brand found that over 40% of their products listed on popular e-commerce marketplaces were counterfeit. Customer reviews mentioning skin reactions from fake products were damaging the brand's reputation. Marketplace enforcement was slow and counterfeit listings reappeared within days of takedown.",
    solution: "Infometa deployed QR authentication with a consumer education campaign. Every genuine product featured a prominent 'Verify Me' QR code with clear instructions. Scan data was analyzed to identify marketplace sellers distributing counterfeits, providing evidence for enforcement actions.",
    results: "Online counterfeits dropped by 90% within 8 months. Consumer verification became a purchasing decision factor, with verified products selling 35% better. The brand recovered an estimated ₹120 crores in revenue previously lost to counterfeits and successfully removed 2,400 fake listings across 4 major marketplaces.",
    metrics: [
      { label: "Online Counterfeits Reduced", value: "90%" },
      { label: "Revenue Recovered", value: "₹120 Cr" },
      { label: "Fake Listings Removed", value: "2,400+" },
    ],
    quote: {
      text: "Infometa turned product authentication into a competitive advantage. Our customers now actively seek the verification badge before purchasing.",
      author: "Brand Manager",
      role: "Director of Brand Protection",
      company: "Premium Skincare Brand",
    },
  },
  {
    slug: "auto-parts-oem-reduces-warranty-fraud",
    title: "Auto Parts OEM Reduces Warranty Fraud by 74% with QR Authentication",
    industry: "Auto Parts",
    category: "Brake Components",
    challenge: "An auto parts OEM was losing ₹85 crores annually to warranty fraud, with counterfeit parts being submitted for warranty claims as genuine products. The existing hologram-based authentication was easily replicated and did not provide any data feedback. Mechanics couldn't reliably distinguish genuine from counterfeit parts.",
    solution: "Infometa replaced the hologram system with unique QR codes on every part, linked to the OEM's product and warranty database. Mechanics scanned parts before installation, and the warranty claim process required a verified scan. The system tracked each part's lifecycle from production to installation.",
    results: "Warranty fraud dropped by 74% in the first year, saving ₹63 crores. Mechanics using the verification system reported 95% satisfaction with the ease of authentication. The OEM gained valuable data on parts distribution patterns and identified 8 unauthorized importers of counterfeit brake components.",
    metrics: [
      { label: "Warranty Fraud Reduction", value: "74%" },
      { label: "Annual Savings", value: "₹63 Cr" },
      { label: "Mechanic Satisfaction", value: "95%" },
    ],
    quote: {
      text: "The data from Infometa revealed an entire shadow distribution network we didn't know existed. The ROI was evident within the first quarter.",
      author: "Aftermarket Director",
      role: "Head of Aftermarket",
      company: "Leading Auto Parts OEM",
    },
  },
  {
    slug: "agro-brand-protects-farmers",
    title: "Agrochemical Brand Protects 500,000 Farmers from Fake Pesticides",
    industry: "Agro Products",
    category: "Pesticides",
    challenge: "A leading agrochemical company found that counterfeit versions of their flagship pesticide were causing crop failures in North Indian farming regions. Fake products contained ineffective chemicals that failed to control pests, resulting in devastating losses for farmers. The company's reputation was being damaged despite the counterfeits being beyond their control.",
    solution: "Infometa deployed QR codes on every pesticide bottle and pack, with verification in Hindi and regional languages. The system was designed for rural smartphone users with minimal data connectivity. Agricultural extension officers were trained to promote verification, and the company ran awareness campaigns through dealer networks.",
    results: "Over 500,000 farmers used the verification system in the first year. The system identified 31 counterfeit manufacturing operations across 6 states, leading to FIR filings and coordinated law enforcement action. Farmer trust in the brand improved measurably, with 89% of surveyed users saying they would only purchase verified products.",
    metrics: [
      { label: "Farmers Protected", value: "500K+" },
      { label: "Counterfeit Operations Found", value: "31" },
      { label: "Consumer Trust Increase", value: "89%" },
    ],
    quote: {
      text: "Our farmers deserve genuine products. Infometa made it possible for every farmer with a simple smartphone to verify their purchases and protect their livelihood.",
      author: "Managing Director",
      role: "Managing Director",
      company: "Leading Agrochemical Company",
    },
  },
];

// === TESTIMONIALS ===
export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
};

export const testimonials: Testimonial[] = [
  {
    quote: "Infometa's platform was operational within weeks. The counterfeit detection alerts have been a game-changer for our brand protection team.",
    author: "Rajesh Mehta",
    role: "VP Supply Chain",
    company: "DairyFresh Co.",
    avatar: "/images/avatars/avatar-1.webp",
  },
  {
    quote: "Patient safety improved dramatically after we deployed QR verification. We now have full traceability from production to the pharmacy shelf.",
    author: "Dr. Priya Sharma",
    role: "Head of Quality",
    company: "MediCore Labs",
    avatar: "/images/avatars/avatar-2.webp",
  },
  {
    quote: "We reduced counterfeit sales on marketplaces by 90% in 8 months. Our customers trust the verified badge and actively scan before buying.",
    author: "Ananya Kulkarni",
    role: "Brand Director",
    company: "GlowVita",
    avatar: "/images/avatars/avatar-3.webp",
  },
  {
    quote: "The warranty fraud data alone justified the investment. Infometa revealed distribution patterns we'd been blind to for years.",
    author: "Suresh Patil",
    role: "Aftermarket Head",
    company: "AutoSafe Components",
    avatar: "/images/avatars/avatar-4.webp",
  },
  {
    quote: "Simple enough for our farmers to use and powerful enough for our compliance team. The multilingual support was exactly what we needed.",
    author: "Karthik Reddy",
    role: "Managing Director",
    company: "AgroChem Solutions",
    avatar: "/images/avatars/avatar-5.webp",
  },
];

// === BLOG ARTICLES METADATA ===
export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  lastModified: string;
  author: string;
  category: string;
  tags: string[];
  readTime: string;
  ogImage: string;
  featured: boolean;
};

export const blogArticles: BlogArticle[] = [
  {
    slug: "how-qr-code-verification-works",
    title: "How QR Code Verification Works",
    description: "A complete guide to QR-based product authentication — how it works, why it matters, and how brands are using it to fight counterfeiting.",
    publishDate: "2025-01-15",
    lastModified: "2025-03-01",
    author: "Infometa Team",
    category: "Technology",
    tags: ["QR verification", "product authentication", "anti-counterfeit"],
    readTime: "8 min",
    ogImage: "/images/og/blog-qr-verification.jpg",
    featured: true,
  },
  {
    slug: "how-counterfeiters-copy-qr-codes",
    title: "How Counterfeiters Copy QR Codes (and How to Stop Them)",
    description: "Learn the common methods counterfeiters use to clone QR codes, and the advanced clone detection technology that stops them.",
    publishDate: "2025-02-01",
    lastModified: "2025-03-10",
    author: "Infometa Team",
    category: "Security",
    tags: ["clone detection", "QR security", "counterfeit prevention"],
    readTime: "10 min",
    ogImage: "/images/og/blog-clone-detection.jpg",
    featured: true,
  },
  {
    slug: "brand-trust-playbook",
    title: "Brand Trust Playbook: Protecting Consumer Confidence in 2025",
    description: "Strategies for building and maintaining consumer trust in an era of widespread product counterfeiting and fake products.",
    publishDate: "2025-02-15",
    lastModified: "2025-03-15",
    author: "Infometa Team",
    category: "Strategy",
    tags: ["brand trust", "consumer confidence", "brand protection"],
    readTime: "12 min",
    ogImage: "/images/og/blog-brand-trust.jpg",
    featured: true,
  },
  {
    slug: "top-10-industries-affected-by-counterfeiting",
    title: "Top 10 Industries Most Affected by Product Counterfeiting",
    description: "An in-depth look at the industries hardest hit by counterfeiting — from pharmaceuticals to luxury goods — and the solutions making a difference.",
    publishDate: "2025-03-01",
    lastModified: "2025-03-20",
    author: "Infometa Team",
    category: "Industry",
    tags: ["counterfeiting", "industry analysis", "brand protection"],
    readTime: "15 min",
    ogImage: "/images/og/blog-industries.jpg",
    featured: false,
  },
  {
    slug: "what-is-clone-detection",
    title: "What is Clone Detection and Why Your Brand Needs It",
    description: "Understanding clone detection technology — how it identifies copied QR codes in real time and protects brands from sophisticated counterfeiting.",
    publishDate: "2025-03-10",
    lastModified: "2025-03-20",
    author: "Infometa Team",
    category: "Technology",
    tags: ["clone detection", "anti-counterfeit technology", "brand protection"],
    readTime: "9 min",
    ogImage: "/images/og/blog-clone-detection-explained.jpg",
    featured: false,
  },
  {
    slug: "dairy-brands-smart-packaging",
    title: "How Dairy Brands Can Use Smart Packaging to Fight Fakes",
    description: "A practical guide for dairy brands on implementing QR-based smart packaging to combat counterfeit milk, butter, and dairy products.",
    publishDate: "2025-03-15",
    lastModified: "2025-03-22",
    author: "Infometa Team",
    category: "Industry",
    tags: ["dairy", "smart packaging", "anti-counterfeit", "FSSAI"],
    readTime: "11 min",
    ogImage: "/images/og/blog-dairy-packaging.jpg",
    featured: false,
  },
];

// === PRICING DATA ===
export type PricingTier = {
  name: string;
  price: { monthly: number; annual: number };
  popular: boolean;
  description: string;
  features: { name: string; included: boolean; detail?: string }[];
  cta: string;
  ctaLink: string;
};

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: { monthly: 9999, annual: 99990 },
    popular: false,
    description: "For emerging brands starting their authentication journey.",
    features: [
      { name: "Products", included: true, detail: "Up to 10" },
      { name: "QR codes/month", included: true, detail: "10,000" },
      { name: "Scan analytics", included: true, detail: "Basic" },
      { name: "API access", included: false },
      { name: "Custom branding", included: false },
      { name: "SLA", included: true, detail: "99.9%" },
      { name: "Support", included: true, detail: "Email" },
      { name: "Clone detection", included: true },
      { name: "Dashboard access", included: true },
      { name: "Export reports", included: false },
    ],
    cta: "Start Free Trial",
    ctaLink: "/contact?plan=starter",
  },
  {
    name: "Growth",
    price: { monthly: 49999, annual: 499990 },
    popular: true,
    description: "For growing brands that need advanced analytics and API integration.",
    features: [
      { name: "Products", included: true, detail: "Up to 100" },
      { name: "QR codes/month", included: true, detail: "500,000" },
      { name: "Scan analytics", included: true, detail: "Advanced" },
      { name: "API access", included: true },
      { name: "Custom branding", included: true },
      { name: "SLA", included: true, detail: "99.9%" },
      { name: "Support", included: true, detail: "Priority" },
      { name: "Clone detection", included: true },
      { name: "Dashboard access", included: true },
      { name: "Export reports", included: true },
    ],
    cta: "Start Free Trial",
    ctaLink: "/contact?plan=growth",
  },
  {
    name: "Enterprise",
    price: { monthly: 0, annual: 0 },
    popular: false,
    description: "For large brands with custom requirements and dedicated support.",
    features: [
      { name: "Products", included: true, detail: "Unlimited" },
      { name: "QR codes/month", included: true, detail: "Custom" },
      { name: "Scan analytics", included: true, detail: "Full" },
      { name: "API access", included: true },
      { name: "Custom branding", included: true },
      { name: "SLA", included: true, detail: "99.99%" },
      { name: "Support", included: true, detail: "Dedicated CSM" },
      { name: "Clone detection", included: true },
      { name: "Dashboard access", included: true },
      { name: "Export reports", included: true },
    ],
    cta: "Talk to Sales",
    ctaLink: "/contact?plan=enterprise",
  },
];

// === PRICING FAQ ===
export const pricingFaqs = [
  { question: "Is there a free trial?", answer: "Yes. All plans come with a 14-day free trial. No credit card required. You can test the full platform including QR generation, verification, and analytics." },
  { question: "Can I change plans later?", answer: "Absolutely. You can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle, and any unused credits are prorated." },
  { question: "What counts as a 'product'?", answer: "A product is a unique SKU in your catalog. Different sizes, variants, or packaging formats of the same product count as separate products." },
  { question: "Do unused QR codes roll over?", answer: "Monthly QR code allocations do not roll over. However, annual plan customers receive their full allocation upfront and can distribute usage throughout the year." },
  { question: "Is there a setup fee?", answer: "No. There are no setup fees for any plan. Our onboarding team will help you get started within 48 hours of signing up." },
  { question: "What payment methods do you accept?", answer: "We accept credit cards, debit cards, UPI, net banking, and wire transfers. Enterprise customers can be invoiced with NET-30 terms." },
  { question: "Can I cancel anytime?", answer: "Yes. There is no lock-in period. You can cancel at any time, and your account remains active until the end of the current billing period." },
  { question: "What happens when I exceed my QR code limit?", answer: "You will receive a notification at 80% usage. If you exceed the limit, additional QR codes are billed at a per-unit rate, or you can upgrade your plan." },
  { question: "Do you offer custom enterprise pricing?", answer: "Yes. Enterprise pricing is customized based on your volume, integrations, and support requirements. Contact our sales team for a tailored quote." },
  { question: "Is my data secure?", answer: "Absolutely. We use industry-standard encryption (TLS 1.3 in transit, AES-256 at rest), role-based access controls, and regular security audits. We are SOC2-ready and GDPR-aligned." },
];

// === ADMIN DASHBOARD DATA ===
export const dashboardKPIs = [
  { label: "Total Verifications", value: "2,847,392", trend: "+12.5%", trendUp: true },
  { label: "Active Products", value: "347", trend: "+8", trendUp: true },
  { label: "Active Alerts", value: "7", trend: "-3", trendUp: false },
  { label: "Uptime", value: "99.99%", trend: "0%", trendUp: true },
];

export const scanChartData = Array.from({ length: 30 }, (_, i) => ({
  date: `Mar ${i + 1}`,
  scans: Math.floor(8000 + seededRandom(i + 9000) * 4000),
  authentic: Math.floor(7000 + seededRandom(i + 9500) * 3500),
  suspicious: Math.floor(50 + seededRandom(i + 9800) * 200),
}));
