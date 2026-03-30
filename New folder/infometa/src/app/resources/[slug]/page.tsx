import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { blogArticles } from "@/lib/mock-data";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { articleContent } from "./article-content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `https://infometa.tech/resources/${slug}` },
    openGraph: {
      title: `${article.title} | Infometa Technologies`,
      description: article.description,
      url: `https://infometa.tech/resources/${slug}`,
      type: "article",
      publishedTime: article.publishDate,
      modifiedTime: article.lastModified,
      authors: [article.author],
      tags: article.tags,
      images: [{ url: article.ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [article.ogImage],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);
  if (!article) notFound();

  const content = articleContent[slug];
  const relatedArticles = blogArticles.filter((a) => a.slug !== slug).slice(0, 3);

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.publishDate,
    dateModified: article.lastModified,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "Infometa Technologies",
      logo: { "@type": "ImageObject", url: "https://infometa.tech/images/logo.png" },
    },
    url: `https://infometa.tech/resources/${slug}`,
    image: `https://infometa.tech${article.ogImage}`,
    mainEntityOfPage: `https://infometa.tech/resources/${slug}`,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Resources", href: "/resources" }, { label: article.title }]} />
      <JsonLd data={blogPostingJsonLd} />

      <div className="lg:grid lg:grid-cols-4 lg:gap-12">
        {/* Article */}
        <article className="lg:col-span-3">
          <ScrollReveal>
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4 text-sm text-secondary">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary font-medium">{article.category}</span>
                <span>{article.readTime} read</span>
                <span>·</span>
                <time dateTime={article.publishDate}>
                  {new Date(article.publishDate).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
                </time>
              </div>
              <h1 className="text-3xl font-semibold text-foreground sm:text-4xl mb-4">{article.title}</h1>
              <p className="text-lg text-secondary leading-relaxed">{article.description}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-secondary">
                <span>By {article.author}</span>
                {article.lastModified !== article.publishDate && (
                  <>
                    <span>·</span>
                    <span>Updated {new Date(article.lastModified).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </>
                )}
              </div>
            </header>
          </ScrollReveal>

          <ScrollReveal>
            <div className="prose prose-lg max-w-none text-secondary leading-relaxed">
              {content}
            </div>
          </ScrollReveal>

          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-background border border-border px-3 py-1 text-xs text-secondary">{tag}</span>
            ))}
          </div>

          {/* Share */}
          <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
            <span className="text-sm font-medium text-foreground">Share:</span>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`https://infometa.tech/resources/${slug}`)}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary">
              Twitter
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://infometa.tech/resources/${slug}`)}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary">
              LinkedIn
            </a>
          </div>

          {/* Newsletter */}
          <div className="mt-8 rounded-xl bg-primary/5 border border-primary/20 p-6">
            <h3 className="font-semibold text-foreground mb-2">Enjoyed this article?</h3>
            <p className="text-sm text-secondary mb-4">Subscribe to get the latest insights on anti-counterfeit technology.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="your@email.com" className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none" aria-label="Subscribe email" />
              <button className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark transition-colors">Subscribe</button>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Related Articles</h3>
              <div className="space-y-4">
                {relatedArticles.map((ra) => (
                  <Link key={ra.slug} href={`/resources/${ra.slug}`} className="block group">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">{ra.title}</p>
                    <p className="text-xs text-secondary mt-1">{ra.readTime} read</p>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Popular Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {["QR verification", "brand protection", "clone detection", "anti-counterfeit", "smart packaging"].map((tag) => (
                  <span key={tag} className="rounded bg-background border border-border px-2 py-0.5 text-xs text-secondary">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
