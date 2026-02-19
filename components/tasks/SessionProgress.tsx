import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

type SessionProgressProps = {
  current: number;
  total: number;
  completed?: number;
  className?: string;
};

export function SessionProgress({
  current,
  total,
  completed = 0,
  className,
}: SessionProgressProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-3", className)}
      aria-label={`Progress ${current} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const isDone = i < completed;
        const isCurrent = i === completed && completed < total;

        return (
          <div key={i} className="relative">
            <Star
              className={cn(
                "h-9 w-9 transition-all duration-300",
                isDone && "fill-game-star text-game-star animate-star-fill",
                isCurrent &&
                  "fill-game-star/30 text-game-star animate-pulse-glow",
                !isDone && !isCurrent && "fill-muted/50 text-border",
              )}
              strokeWidth={2.5}
            />
            {isDone && (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-amber-800">
                {i + 1}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
