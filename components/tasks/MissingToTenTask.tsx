import { useLocale } from "@/components/i18n/locale-provider";
import { NumberChoices } from "@/components/tasks/NumberChoices";
import { TenFrame } from "@/components/tasks/TenFrame";
import type { MissingToTenTask as MissingToTenTaskType } from "@/lib/domain/task";

type MissingToTenTaskProps = {
  task: MissingToTenTaskType;
  disabled?: boolean;
  onAnswer: (value: number) => void;
};

export function MissingToTenTask({
  task,
  onAnswer,
  disabled = false,
}: MissingToTenTaskProps) {
  const { t } = useLocale();
  const options =
    task.interaction.mode === "singleChoice" ? task.interaction.options : [];

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-display text-2xl font-bold text-foreground">
        {task.prompt || t("task.makeTen.prompt")}
      </p>

      <div className="clay bg-white/60 p-6">
        <div className="flex flex-col items-center gap-4">
          <p className="font-display text-4xl font-extrabold text-primary animate-bounce-in">
            {task.stimulus.equation}
          </p>
          <p className="font-display text-base font-semibold text-muted-foreground">
            {t("task.makeTen.moreToTen")}
          </p>
          <TenFrame count={task.stimulus.start} className="mx-auto" />
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
