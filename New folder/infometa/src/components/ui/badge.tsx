import { cn } from "@/lib/utils";

interface BadgeProps {
  variant: "authentic" | "suspicious" | "invalid" | "info";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  authentic: "bg-success/10 text-success border-success/20",
  suspicious: "bg-warning/10 text-warning border-warning/20",
  invalid: "bg-danger/10 text-danger border-danger/20",
  info: "bg-primary/10 text-primary border-primary/20",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: "authentic" | "suspicious" | "invalid" }) {
  const config = {
    authentic: { label: "Authentic", icon: "✓" },
    suspicious: { label: "Suspicious", icon: "⚠" },
    invalid: { label: "Invalid", icon: "✕" },
  };
  const { label, icon } = config[status];
  return (
    <Badge variant={status}>
      <span aria-hidden="true">{icon}</span>
      {label}
    </Badge>
  );
}
