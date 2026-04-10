import { cn } from "@/lib/utils";

interface CardProps {
  variant?: "default" | "hover" | "featured";
  className?: string;
  children: React.ReactNode;
}

export function Card({ variant = "default", className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-white p-6",
        variant === "hover" && "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        variant === "featured" && "border-primary/30 bg-surface-tint shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn("text-lg font-semibold text-foreground", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("text-sm text-secondary", className)}>{children}</p>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mt-4 flex items-center", className)}>{children}</div>;
}
