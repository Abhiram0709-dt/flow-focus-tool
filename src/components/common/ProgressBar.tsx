import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "accent";
}

const variantStyles = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  accent: "gradient-accent",
};

export function ProgressBar({
  value,
  max,
  className,
  showLabel = false,
  variant = "default",
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground mt-1">
          {value} / {max} ({percentage}%)
        </p>
      )}
    </div>
  );
}
