import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  className?: string;
}

export function TestimonialCard({ quote, author, role, company, avatar, className }: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-white p-6",
        className
      )}
    >
      <div className="mb-4 text-3xl text-primary" aria-hidden="true">&ldquo;</div>
      <blockquote className="flex-1 text-base text-foreground leading-relaxed">
        {quote}
      </blockquote>
      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {author.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{author}</p>
          <p className="text-xs text-secondary">{role}, {company}</p>
        </div>
      </div>
    </div>
  );
}
