# Schema Registry — Infometa Technologies

All structured data is implemented as JSON-LD via the `<JsonLd>` component in `src/components/seo/json-ld.tsx`.

## Active Schemas

### Organization
- **Page:** Root layout (`src/app/layout.tsx`)
- **Type:** `Organization`
- **Fields:** name, url, logo, description, contactPoint

### WebSite
- **Page:** Home (`src/app/page.tsx`)
- **Type:** `WebSite`
- **Fields:** name, url, description, potentialAction (SearchAction)

### SoftwareApplication
- **Page:** Home (`src/app/page.tsx`)
- **Type:** `SoftwareApplication`
- **Fields:** name, operatingSystem, applicationCategory, offers

### WebApplication
- **Page:** Verify (`src/app/verify/page.tsx`)
- **Type:** `WebApplication`
- **Fields:** name, url, applicationCategory, operatingSystem, offers

### FAQPage
- **Pages:** Industry detail pages, Pricing
- **Type:** `FAQPage`
- **Fields:** mainEntity[] → Question → acceptedAnswer

### Service
- **Page:** Brands (`src/app/brands/page.tsx`)
- **Type:** `Service`
- **Fields:** name, description, provider, serviceType, areaServed

### ContactPage + LocalBusiness
- **Page:** Contact (`src/app/contact/page.tsx`)
- **Types:** `ContactPage`, `LocalBusiness`
- **Fields:** name, address, email, telephone, openingHours

### Article + Review
- **Pages:** Case study detail pages
- **Types:** `Article`, `Review`
- **Fields:** headline, description, author, datePublished, reviewBody, reviewRating

### BlogPosting
- **Pages:** Blog article pages
- **Type:** `BlogPosting`
- **Fields:** headline, description, author, datePublished, dateModified, image, publisher

### BreadcrumbList
- **Component:** `Breadcrumbs` (`src/components/layout/breadcrumbs.tsx`)
- **Type:** `BreadcrumbList`
- **Fields:** itemListElement[] → ListItem → name, item
