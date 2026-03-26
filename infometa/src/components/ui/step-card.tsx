import { cn } from "@/lib/utils";

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  icon: string;
  className?: string;
}

export function StepCard({ step, title, description, icon, className }: StepCardProps) {
  return (
    <div className={cn("relative flex flex-col items-center text-center", className)}>
      <div className="relative mb-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {step}
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

interface HowItWorksTimelineProps {
  steps: { title: string; description: string; icon: string }[];
  className?: string;
}

export function HowItWorksTimeline({ steps, className }: HowItWorksTimelineProps) {
  return (
    <div className={cn("grid gap-8 md:grid-cols-3 md:gap-12", className)}>
      {steps.map((step, i) => (
        <div key={i} className="relative">
          <StepCard step={i + 1} {...step} />
          {i < steps.length - 1 && (
            <div
              className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] border-t-2 border-dashed border-primary/30"
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}
