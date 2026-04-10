# SEO Checklist — Infometa Technologies

## Technical SEO
- [x] Semantic HTML (`<main>`, `<nav>`, `<article>`, `<section>`)
- [x] Skip-to-content link
- [x] Canonical URLs on all pages
- [x] `robots` meta tag per page
- [x] `hreflang` tag for `en-IN`
- [x] Geo meta tags (`geo.region`, `geo.placename`)
- [x] next-sitemap configuration for XML sitemap
- [x] robots.txt generation via next-sitemap
- [x] HTML sitemap page at `/sitemap-page`
- [x] 404 / error handling via Next.js conventions
- [x] Security headers (CSP, X-Frame-Options, etc.) in next.config.ts

## Structured Data (JSON-LD)
- [x] Organization schema (root layout)
- [x] WebSite schema (home page)
- [x] SoftwareApplication schema (home page)
- [x] WebApplication schema (verify page)
- [x] FAQPage schema (industry detail pages, pricing)
- [x] Service schema (brands page)
- [x] ContactPage + LocalBusiness schema (contact page)
- [x] Article + Review schema (case study detail pages)
- [x] BlogPosting schema (blog article pages)
- [x] BreadcrumbList schema (via Breadcrumbs component)

## On-Page SEO
- [x] Unique `<title>` per page with template
- [x] Unique `<meta description>` per page
- [x] Open Graph tags per page
- [x] Twitter Card tags per page
- [x] Heading hierarchy (single H1 per page, logical H2/H3)
- [x] Alt text for images
- [x] Internal linking across pages

## Performance
- [x] Next.js Image optimization (AVIF, WebP)
- [x] Font optimization (next/font with `display: swap`)
- [x] Component-level code splitting via Next.js App Router
- [x] Tailwind CSS purging (built-in with v4)

## Content
- [x] 12 industry detail pages with long-tail keywords
- [x] 6 blog articles with category/tag taxonomy
- [x] 5 case studies with metrics and quotes
- [x] FAQ sections with FAQPage schema
- [x] Trust center and legal pages
