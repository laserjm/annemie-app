import { cn } from "@/lib/utils";

type TenFrameProps = {
  count: number;
  className?: string;
  dimmed?: boolean;
};

const DOT_COLORS = [
  "bg-game-coral",
  "bg-game-teal",
  "bg-primary",
  "bg-game-peach",
  "bg-game-lavender",
  "bg-game-coral",
  "bg-game-teal",
  "bg-primary",
  "bg-game-peach",
  "bg-game-lavender",
];

export function TenFrame({ count, className, dimmed = false }: TenFrameProps) {
  const totalCells = 10;

  return (
    <div
      className={cn(
        "clay inline-grid grid-cols-5 gap-3 bg-white/80 p-4",
        className,
      )}
      aria-label={`Ten frame showing ${count}`}
    >
      {Array.from({ length: totalCells }, (_, index) => {
        const filled = index < count;

        return (
          <div
            key={index}
            className={cn(
              "aspect-square w-12 rounded-full border-3 transition-all duration-300",
              filled
                ? `${DOT_COLORS[index]} border-black/10 animate-pop-in stagger-${index + 1}`
                : "bg-muted/50 border-dashed border-border",
              dimmed && "opacity-30",
            )}
          />
        );
      })}
    </div>
  );
}
