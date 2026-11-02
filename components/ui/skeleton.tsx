import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-surface-2/80 border border-line/40",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
