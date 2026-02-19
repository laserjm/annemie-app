import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

type HintPanelProps = {
  hintLevel: 0 | 1 | 2;
  hintMessage: string | null;
  className?: string;
};

export function HintPanel({
  hintLevel,
  hintMessage,
  className,
}: HintPanelProps) {
  if (!hintMessage || hintLevel === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "clay-sm flex items-start gap-3 bg-game-star/20 p-4 animate-slide-up",
        className,
      )}
      aria-live="polite"
    >
      <Lightbulb
        className="mt-0.5 h-6 w-6 shrink-0 text-amber-500 animate-float"
        strokeWidth={2.5}
      />
      <div>
        <p className="font-display text-base font-bold text-amber-800">
          Hint {hintLevel}
        </p>
        <p className="text-base text-foreground/80">{hintMessage}</p>
      </div>
    </div>
  );
}
