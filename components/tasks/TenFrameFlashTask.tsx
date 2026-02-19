import { useCallback, useEffect, useRef, useState } from "react";

import { useLocale } from "@/components/i18n/locale-provider";
import { NumberChoices } from "@/components/tasks/NumberChoices";
import { TenFrame } from "@/components/tasks/TenFrame";
import type { TenFrameFlashTask as TenFrameFlashTaskType } from "@/lib/domain/task";
import { Eye } from "lucide-react";

type TenFrameFlashTaskProps = {
  task: TenFrameFlashTaskType;
  disabled?: boolean;
  onAnswer: (value: number) => void;
};

export function TenFrameFlashTask({
  task,
  onAnswer,
  disabled = false,
}: TenFrameFlashTaskProps) {
  const { t } = useLocale();
  const [phase, setPhase] = useState<"countdown" | "visible" | "hidden">(
    "countdown",
  );
  const [countdown, setCountdown] = useState<3 | 2 | 1>(3);
  const [showAgainUsed, setShowAgainUsed] = useState(false);
  const timerRefs = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const timer of timerRefs.current) {
      window.clearTimeout(timer);
    }
    timerRefs.current = [];
  }, []);

  const startCountdownFlow = useCallback(() => {
    const stepMs = 850;

    timerRefs.current.push(
      window.setTimeout(() => setCountdown(2), stepMs),
      window.setTimeout(() => setCountdown(1), stepMs * 2),
      window.setTimeout(() => setPhase("visible"), stepMs * 3),
      window.setTimeout(
        () => setPhase("hidden"),
        stepMs * 3 + task.stimulus.flashMs,
      ),
    );
  }, [task.stimulus.flashMs]);

  const startFlashOnlyFlow = useCallback(() => {
    setPhase("visible");
    timerRefs.current.push(
      window.setTimeout(() => setPhase("hidden"), task.stimulus.flashMs),
    );
  }, [task.stimulus.flashMs]);

  useEffect(() => {
    startCountdownFlow();

    return () => {
      clearTimers();
    };
  }, [clearTimers, startCountdownFlow, task.id]);

  const options =
    task.interaction.mode === "singleChoice" ? task.interaction.options : [];
  const canShowAgain = !disabled && phase === "hidden" && !showAgainUsed;
  const answerDisabled = disabled || phase !== "hidden";

  const handleShowAgain = () => {
    if (!canShowAgain) {
      return;
    }

    setShowAgainUsed(true);
    clearTimers();
    startFlashOnlyFlow();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-display text-2xl font-bold text-foreground">
        {task.prompt || t("task.quantity.prompt")}
      </p>

      <div className="clay bg-white/60 p-6">
        {phase === "countdown" ? (
          <div className="flex h-44 w-72 flex-col items-center justify-center">
            <p className="font-display text-lg font-semibold text-primary/60">
              {t("task.quantity.getReady")}
            </p>
            <p
              key={countdown}
              className="animate-countdown-pop font-display text-9xl font-extrabold leading-none text-primary"
            >
              {countdown}
            </p>
          </div>
        ) : phase === "visible" ? (
          <TenFrame count={task.stimulus.count} className="mx-auto" />
        ) : (
          <div className="flex h-44 w-72 flex-col items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Eye className="h-8 w-8 text-primary/40" />
            </div>
            <p className="font-display text-lg font-semibold text-muted-foreground">
              {t("task.quantity.pickAnswer")}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        className="clay-button flex min-h-14 items-center gap-2 bg-game-star/80 px-6 py-3 font-display text-lg font-bold text-amber-900"
        onClick={handleShowAgain}
        disabled={!canShowAgain}
      >
        <Eye className="h-5 w-5" />
        {showAgainUsed ? t("task.quantity.peekUsed") : t("task.quantity.peekAgain")}
      </button>

      <NumberChoices
        options={options}
        onChoose={onAnswer}
        disabled={answerDisabled}
      />
    </div>
  );
}
