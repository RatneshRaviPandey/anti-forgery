import Link from "next/link";
import { blogArticles } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function BlogPreview() {
  const featured = blogArticles.slice(0, 3);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Resources & Insights
              </h2>
              <p className="mt-3 text-lg text-secondary">
                Expert guides on product authentication, brand protection, and anti-counterfeit technology.
              </p>
            </div>
            <Link
              href="/resources"
              className="hidden sm:inline-flex text-sm font-medium text-primary hover:underline"
            >
              View all articles →
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((article, i) => (
            <ScrollReveal key={article.slug} delay={i * 0.1}>
              <Link href={`/resources/${article.slug}`}>
                <Card variant="hover" className="h-full">
                  <CardContent>
                    <div className="mb-3 flex items-center gap-2 text-xs text-secondary">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">
                        {article.category}
                      </span>
                      <span>{article.readTime} read</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-sm text-secondary leading-relaxed line-clamp-3">
                      {article.description}
                    </p>
                    <p className="mt-4 text-sm font-medium text-primary">
                      Read article →
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/resources" className="text-sm font-medium text-primary hover:underline">
            View all articles →
          </Link>
        </div>
      </div>
    </section>
  );
}
