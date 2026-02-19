"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type FeedbackOverlayProps = {
  kind: "correct" | "incorrect" | null;
  answer?: number | string;
};

const CORRECT_MESSAGES = ["Super!", "Yeah!", "Wow!", "Bravo!", "Toll!"];

const INCORRECT_MESSAGES = [
  "Nächstes Mal!",
  "Fast!",
  "Versuch's nochmal!",
  "Weiter so!",
];

export function FeedbackOverlay({ kind, answer }: FeedbackOverlayProps) {
  const [showKey, setShowKey] = useState(0);
  const prevKind = useRef<typeof kind>(null);

  const message = useMemo(() => {
    if (showKey === 0) return "";
    const messages = kind === "correct" ? CORRECT_MESSAGES : INCORRECT_MESSAGES;
    return messages[Math.floor(Math.random() * messages.length)];
  }, [showKey, kind]);

  // Track transitions: when kind changes to a non-null value, show the overlay
  useEffect(() => {
    if (kind && kind !== prevKind.current) {
      setShowKey((k) => k + 1);
    }
    prevKind.current = kind;
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
            It was {answer}
          </p>
        )}
      </div>
    </div>
  );
}
