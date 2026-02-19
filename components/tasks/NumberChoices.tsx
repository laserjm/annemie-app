import { cn } from "@/lib/utils";

type NumberChoicesProps = {
  options: number[];
  onChoose: (value: number) => void;
  disabled?: boolean;
  className?: string;
};

const CHOICE_COLORS = [
  "bg-game-coral text-white",
  "bg-game-teal text-white",
  "bg-primary text-white",
  "bg-game-peach text-white",
  "bg-game-lavender text-white",
  "bg-game-mint text-foreground",
];

export function NumberChoices({
  options,
  onChoose,
  disabled = false,
  className,
}: NumberChoicesProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-4", className)}>
      {options.map((value, index) => (
        <button
          key={value}
          type="button"
          disabled={disabled}
          className={cn(
            "clay-button flex min-h-18 items-center justify-center px-6 py-4 font-display text-3xl font-bold",
            `animate-bounce-in stagger-${index + 1}`,
            CHOICE_COLORS[index % CHOICE_COLORS.length],
            disabled && "pointer-events-none",
          )}
          onClick={() => onChoose(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
