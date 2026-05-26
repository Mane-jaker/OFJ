import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const steps = [
  { step: 1, label: "Profile", href: "/profile" },
  { step: 2, label: "Search", href: "/search" },
  { step: 3, label: "Results", href: "/results" },
];

export function ProgressBar({
  currentStep,
  totalSteps = 3,
}: ProgressBarProps) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {steps.slice(0, totalSteps).map((s, index) => {
        const isActive = s.step === currentStep;
        const isCompleted = s.step < currentStep;

        return (
          <div key={s.step} className="flex items-center gap-2">
            <Link
              href={s.href}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                isActive &&
                  "bg-[var(--color-accent)] text-white",
                isCompleted &&
                  "bg-[var(--color-accent)]/20 text-[var(--color-accent)]",
                !isActive &&
                  !isCompleted &&
                  "border border-[var(--color-border)] text-[var(--color-muted)]",
              )}
            >
              {isCompleted ? "✓" : s.step}
            </Link>

            <span
              className={cn(
                "hidden text-sm sm:inline",
                isActive && "text-[var(--color-fg)] font-medium",
                !isActive && "text-[var(--color-muted)]",
              )}
            >
              {s.label}
            </span>

            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "mx-1 h-px w-6 sm:mx-2 sm:w-10",
                  isCompleted
                    ? "bg-[var(--color-accent)]"
                    : "bg-[var(--color-border)]",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
