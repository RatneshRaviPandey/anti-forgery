import type { Metadata } from "next";
import Link from "next/link";
import { blogArticles } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Resources — Anti-Counterfeit Technology Blog & Guides",
  description: "Expert guides, insights, and analysis on product authentication, QR verification, clone detection, and brand protection technology from Infometa Technologies.",
  alternates: { canonical: "https://infometa.in/resources" },
};

export default function ResourcesPage() {
  const featured = blogArticles.filter((a) => a.featured);
  const all = blogArticles;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Resources" }]} />

      <ScrollReveal>
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">Resources & Insights</h1>
          <p className="mt-4 text-lg text-secondary max-w-2xl">
            Expert guides on product authentication, brand protection, and anti-counterfeit technology. Stay ahead of counterfeiters with knowledge.
          </p>
        </div>
      </ScrollReveal>

      {/* Featured */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-foreground mb-6">Featured Articles</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((article) => (
              <Link key={article.slug} href={`/resources/${article.slug}`}>
                <Card variant="featured" className="h-full hover:-translate-y-1 transition-transform">
                  <CardContent>
                    <div className="mb-3 flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-primary font-medium">{article.category}</span>
                      <span className="text-secondary">{article.readTime} read</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground leading-snug">{article.title}</h3>
                    <p className="text-sm text-secondary leading-relaxed line-clamp-3">{article.description}</p>
                    <p className="mt-4 text-sm font-medium text-primary">Read article →</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* All Articles */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-foreground mb-6">All Articles</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {all.map((article) => (
              <Link key={article.slug} href={`/resources/${article.slug}`}>
                <Card variant="hover" className="h-full">
                  <CardContent>
                    <div className="mb-3 flex items-center gap-2 text-xs text-secondary">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">{article.category}</span>
                      <span>{article.readTime} read</span>
                      <span>·</span>
                      <span>{new Date(article.publishDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground leading-snug">{article.title}</h3>
                    <p className="text-sm text-secondary line-clamp-3">{article.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded bg-background px-2 py-0.5 text-xs text-secondary">{tag}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Newsletter */}
      <ScrollReveal>
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">Stay Informed</h2>
          <p className="text-secondary mb-6 max-w-md mx-auto">
            Get the latest insights on anti-counterfeit technology, brand protection strategies, and industry trends delivered to your inbox.
          </p>
          <div className="flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 rounded-lg border border-border bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Email for newsletter"
            />
            <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
