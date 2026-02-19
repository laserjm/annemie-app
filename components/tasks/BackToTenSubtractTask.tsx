import { NumberChoices } from "@/components/tasks/NumberChoices";
import type { BackToTenSubtractTask as BackToTenSubtractTaskType } from "@/lib/domain/task";
import { ArrowDown } from "lucide-react";

type BackToTenSubtractTaskProps = {
  task: BackToTenSubtractTaskType;
  disabled?: boolean;
  onAnswer: (value: number) => void;
};

export function BackToTenSubtractTask({
  task,
  onAnswer,
  disabled = false,
}: BackToTenSubtractTaskProps) {
  const options =
    task.interaction.mode === "singleChoice" ? task.interaction.options : [];
  const leftover = task.stimulus.subtract - task.stimulus.bridgeStep;

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-display text-2xl font-bold text-foreground">
        {task.prompt || "Subtract through 10!"}
      </p>

      <div className="clay bg-white/60 p-6">
        <p className="mb-5 text-center font-display text-4xl font-extrabold text-primary animate-bounce-in">
          {task.stimulus.equation}
        </p>

        <div className="flex flex-col items-center gap-2">
          {/* Step 1 */}
          <div className="clay-sm flex w-full items-center gap-3 bg-game-teal/15 px-5 py-3 animate-slide-up">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-game-teal font-display text-lg font-bold text-white">
              1
            </span>
            <p className="font-display text-xl font-bold text-foreground">
              {task.stimulus.start} − {task.stimulus.bridgeStep} = 10
            </p>
          </div>

          <ArrowDown className="h-5 w-5 text-muted-foreground" />

          {/* Step 2 */}
          <div className="clay-sm flex w-full items-center gap-3 bg-game-coral/15 px-5 py-3 animate-slide-up stagger-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-game-coral font-display text-lg font-bold text-white">
              2
            </span>
            <p className="font-display text-xl font-bold text-foreground">
              10 − {leftover} = ?
            </p>
          </div>
        </div>
      </div>

      <NumberChoices
        options={options}
        onChoose={onAnswer}
        disabled={disabled}
      />
    </div>
  );
}
