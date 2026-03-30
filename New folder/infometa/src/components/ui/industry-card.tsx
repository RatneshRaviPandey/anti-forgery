import { cn } from "@/lib/utils";

interface IndustryCardProps {
  icon: string;
  title: string;
  summary: string;
  href: string;
  className?: string;
}

export function IndustryCard({ icon, title, summary, href, className }: IndustryCardProps) {
  return (
    <a
      href={href}
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg",
        className
      )}
    >
      <span className="mb-3 text-3xl" aria-hidden="true">{icon}</span>
      <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
      <p className="mb-4 flex-1 text-sm text-secondary">{summary}</p>
      <span className="text-sm font-medium text-primary group-hover:underline">
        Learn more →
      </span>
    </a>
  );
}
