interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rect";
}

export function Skeleton({ className = "", variant = "text" }: SkeletonProps) {
  const baseClasses =
    "bg-bg3 animate-pulse";
  const variantClasses = {
    text: "h-4 rounded",
    circle: "rounded-full",
    rect: "rounded-card",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
}
