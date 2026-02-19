"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { formatNumber } from "@/lib/i18n/format";
import type { MessageKey } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

type FeedbackOverlayProps = {
  kind: "correct" | "incorrect" | null;
  answer?: number | string;
};

const CORRECT_MESSAGE_KEYS: MessageKey[] = [
  "feedback.correct.1",
  "feedback.correct.2",
  "feedback.correct.3",
  "feedback.correct.4",
  "feedback.correct.5",
];

const INCORRECT_MESSAGE_KEYS: MessageKey[] = [
  "feedback.incorrect.1",
  "feedback.incorrect.2",
  "feedback.incorrect.3",
  "feedback.incorrect.4",
];

export function FeedbackOverlay({ kind, answer }: FeedbackOverlayProps) {
  const { locale, t } = useLocale();
  const [showKey, setShowKey] = useState(0);
  const prevKind = useRef<typeof kind>(null);

  const message = useMemo(() => {
    if (showKey === 0) return "";
    const keys =
      kind === "correct" ? CORRECT_MESSAGE_KEYS : INCORRECT_MESSAGE_KEYS;
    const key = keys[showKey % keys.length];
    return t(key);
  }, [showKey, kind, t]);

  // Track transitions: when kind changes to a non-null value, show the overlay
  useEffect(() => {
    let timer: number | null = null;

    if (kind && kind !== prevKind.current) {
      timer = window.setTimeout(() => {
        setShowKey((k) => k + 1);
      }, 0);
    }

    prevKind.current = kind;

    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [kind]);

  useEffect(() => {
    if (showKey === 0) return;
    const timer = window.setTimeout(() => setShowKey(0), 1200);
    return () => window.clearTimeout(timer);
  }, [showKey]);

  if (showKey === 0 || !kind) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-40 flex items-center justify-center",
      )}
      aria-live="polite"
    >
      <div
        className={cn(
          "flex flex-col items-center gap-2 rounded-3xl px-12 py-8",
          kind === "correct"
            ? "bg-game-success/90 animate-tada"
            : "bg-game-error/80 animate-wiggle",
        )}
      >
        <span className="text-6xl">{kind === "correct" ? "⭐" : "💪"}</span>
        <p className="font-display text-3xl font-extrabold text-white">
          {message}
        </p>
        {kind === "incorrect" && answer != null && (
          <p className="font-display text-xl font-bold text-white/80">
            {t("feedback.answerWas", {
              answer:
                typeof answer === "number"
                  ? formatNumber(locale, answer)
                  : String(answer),
            })}
          </p>
        )}
      </div>
    </div>
  );
}
