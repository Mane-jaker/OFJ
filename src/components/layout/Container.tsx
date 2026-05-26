import { cn } from "@/lib/utils";

type ContainerVariant = "landing" | "form" | "results";

interface ContainerProps {
  children: React.ReactNode;
  variant?: ContainerVariant;
  className?: string;
}

export function Container({
  children,
  variant = "landing",
  className,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4",
        {
          "max-w-landing": variant === "landing",
          "max-w-form": variant === "form",
          "max-w-results": variant === "results",
        },
        className,
      )}
    >
      {children}
    </div>
  );
}
