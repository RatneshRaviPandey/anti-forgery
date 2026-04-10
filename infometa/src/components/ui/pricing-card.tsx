import { cn } from "@/lib/utils";
import { Button } from "./button";

interface PricingCardProps {
  name: string;
  price: { monthly: number; annual: number };
  description: string;
  features: { name: string; included: boolean; detail?: string }[];
  popular: boolean;
  annual: boolean;
  cta: string;
  ctaLink: string;
  className?: string;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  popular,
  annual,
  cta,
  ctaLink,
  className,
}: PricingCardProps) {
  const displayPrice = annual ? price.annual : price.monthly;
  const isEnterprise = price.monthly === 0;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-8",
        popular ? "border-primary shadow-xl scale-105 z-10" : "border-border",
        className
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-semibold text-foreground">{name}</h3>
      <p className="mt-1 text-sm text-secondary">{description}</p>
      <div className="mt-6">
        {isEnterprise ? (
          <span className="text-3xl font-bold text-foreground">Custom</span>
        ) : (
          <>
            <span className="text-3xl font-bold text-foreground">
              ₹{displayPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-secondary">/{annual ? "year" : "month"}</span>
          </>
        )}
      </div>
      <ul className="mt-6 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f.name} className="flex items-start gap-2 text-sm">
            <span
              className={cn("mt-0.5 shrink-0", f.included ? "text-success" : "text-border")}
              aria-hidden="true"
            >
              {f.included ? "✓" : "—"}
            </span>
            <span className={f.included ? "text-foreground" : "text-secondary/50"}>
              {f.name}
              {f.detail && f.included && <span className="text-secondary"> ({f.detail})</span>}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Button
          variant={popular ? "primary" : "secondary"}
          size="md"
          className="w-full"
          asChild
        >
          <a href={ctaLink}>{cta}</a>
        </Button>
      </div>
    </div>
  );
}
