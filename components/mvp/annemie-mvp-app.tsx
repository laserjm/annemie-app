"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import { LocaleProvider, useLocale } from "@/components/i18n/locale-provider";
import { Confetti } from "@/components/tasks/Confetti";
import { FeedbackOverlay } from "@/components/tasks/FeedbackOverlay";
import { HintPanel } from "@/components/tasks/HintPanel";
import { SessionProgress } from "@/components/tasks/SessionProgress";
import { TaskRenderer } from "@/components/tasks/TaskRenderer";
import {
  createEmptyProgress,
  type PersistedProgress,
  type SessionResult,
} from "@/lib/domain/session";
import type { Skill, Task } from "@/lib/domain/task";
import { formatDateTime, formatNumber } from "@/lib/i18n/format";
import type { MessageKey, MessageParams } from "@/lib/i18n/types";
import {
  appendSessionResult,
  loadProgress,
  updateLastFocusSkill,
} from "@/lib/persistence/local";
import { createSessionEngine, type SessionEngine } from "@/lib/session/engine";
import { cn } from "@/lib/utils";
import { Lightbulb, Play, RotateCcw, Star, Trophy, Zap } from "lucide-react";

type Screen = "start" | "session" | "result";

type FeedbackState = {
  kind: "correct" | "incorrect";
  message: string;
};

type HintState = {
  level: 0 | 1 | 2;
  message: string | null;
};

type AppState = {
  hydrated: boolean;
  phase: Screen;
  persisted: PersistedProgress;
  selectedFocusSkill: Skill | null;
  currentTask: Task | null;
  sessionProgress: { current: number; completed: number; total: number };
  hint: HintState;
  feedback: FeedbackState | null;
  result: SessionResult | null;
};

type AppAction =
  | { type: "hydrated"; persisted: PersistedProgress }
  | { type: "set_focus"; skill: Skill | null }
  | {
      type: "session_started";
      currentTask: Task;
      persisted: PersistedProgress;
      progress: { current: number; completed: number; total: number };
    }
  | {
      type: "next_task";
      task: Task;
      progress: { current: number; completed: number; total: number };
      feedback: FeedbackState;
    }
  | { type: "set_hint"; hint: HintState }
  | {
      type: "session_completed";
      result: SessionResult;
      persisted: PersistedProgress;
    }
  | { type: "back_to_start"; clearResult?: boolean };

const initialState: AppState = {
  hydrated: false,
  phase: "start",
  persisted: createEmptyProgress(),
  selectedFocusSkill: null,
  currentTask: null,
  sessionProgress: {
    current: 1,
    completed: 0,
    total: 5,
  },
  hint: {
    level: 0,
    message: null,
  },
  feedback: null,
  result: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "hydrated":
      return {
        ...state,
        hydrated: true,
        persisted: action.persisted,
        selectedFocusSkill: action.persisted.lastFocusSkill,
      };
    case "set_focus":
      return {
        ...state,
        selectedFocusSkill: action.skill,
      };
    case "session_started":
      return {
        ...state,
        phase: "session",
        persisted: action.persisted,
        currentTask: action.currentTask,
        sessionProgress: action.progress,
        hint: { level: 0, message: null },
        feedback: null,
        result: null,
      };
    case "next_task":
      return {
        ...state,
        currentTask: action.task,
        sessionProgress: action.progress,
        hint: { level: 0, message: null },
        feedback: action.feedback,
      };
    case "set_hint":
      return {
        ...state,
        hint: action.hint,
      };
    case "session_completed":
      return {
        ...state,
        phase: "result",
        currentTask: null,
        result: action.result,
        persisted: action.persisted,
        feedback: null,
        hint: { level: 0, message: null },
      };
    case "back_to_start":
      return {
        ...state,
        phase: "start",
        currentTask: null,
        sessionProgress: { current: 1, completed: 0, total: 5 },
        hint: { level: 0, message: null },
        feedback: null,
        result: action.clearResult ? null : state.result,
      };
    default:
      return state;
  }
};

const SKILL_LABEL_KEYS: Record<Skill, MessageKey> = {
  quantity: "skill.quantity",
  makeTen: "skill.makeTen",
  bridgeSubtract: "skill.bridgeSubtract",
};

const SKILL_ICONS: Record<Skill, string> = {
  quantity: "👀",
  makeTen: "🧩",
  bridgeSubtract: "✂️",
};

const SKILL_COLORS: Record<Skill | "balanced", string> = {
  balanced: "bg-primary text-white",
  quantity: "bg-game-teal text-white",
  makeTen: "bg-game-coral text-white",
  bridgeSubtract: "bg-game-lavender text-white",
};

const percentage = (numerator: number, denominator: number): number => {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
};

type TranslateFn = (key: MessageKey, params?: MessageParams) => string;

const encouragementFor = (result: SessionResult, t: TranslateFn): string => {
  const totalPct = percentage(result.correct, result.totalTasks);

  if (totalPct === 100) return t("result.encouragement.perfect");
  if (totalPct >= 80) return t("result.encouragement.great");
  if (totalPct >= 60) return t("result.encouragement.good");
  return t("result.encouragement.try");
};

function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="clay-sm inline-flex items-center gap-1 bg-white/70 p-1">
      <span className="px-2 font-display text-xs font-bold text-foreground/70">
        {t("locale.label")}
      </span>
      <button
        type="button"
        className={cn(
          "rounded-xl px-3 py-1.5 font-display text-sm font-bold transition-colors",
          locale === "de"
            ? "bg-primary text-white"
            : "bg-transparent text-foreground/70 hover:bg-muted",
        )}
        onClick={() => setLocale("de")}
      >
        {t("locale.de")}
      </button>
      <button
        type="button"
        className={cn(
          "rounded-xl px-3 py-1.5 font-display text-sm font-bold transition-colors",
          locale === "en"
            ? "bg-primary text-white"
            : "bg-transparent text-foreground/70 hover:bg-muted",
        )}
        onClick={() => setLocale("en")}
      >
        {t("locale.en")}
      </button>
    </div>
  );
}

function AnnemieMvpAppContent() {
  const { locale, t } = useLocale();
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackKind, setFeedbackKind] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [feedbackAnswer, setFeedbackAnswer] = useState<
    number | string | undefined
  >();

  const engineRef = useRef<SessionEngine | null>(null);
  const taskStartRef = useRef<number>(0);

  useEffect(() => {
    const persisted = loadProgress();
    dispatch({ type: "hydrated", persisted });
  }, []);

  useEffect(() => {
    if (state.currentTask) {
      taskStartRef.current = performance.now();
    }
  }, [state.currentTask]);

  const recentSession = state.persisted.sessionHistory[0] ?? null;

  const skillButtons: Array<{
    labelKey: MessageKey;
    value: Skill | null;
    icon: string;
    colorKey: Skill | "balanced";
  }> = [
    {
      labelKey: "skill.balanced",
      value: null,
      icon: "🎲",
      colorKey: "balanced",
    },
    {
      labelKey: "skill.quantity",
      value: "quantity",
      icon: "👀",
      colorKey: "quantity",
    },
    {
      labelKey: "skill.makeTen",
      value: "makeTen",
      icon: "🧩",
      colorKey: "makeTen",
    },
    {
      labelKey: "skill.bridgeSubtract",
      value: "bridgeSubtract",
      icon: "✂️",
      colorKey: "bridgeSubtract",
    },
  ];

  const startSession = () => {
    const nextPersisted = updateLastFocusSkill(state.selectedFocusSkill);

    const engine = createSessionEngine({
      initialDifficultyBySkill: {
        quantity: nextPersisted.skillSnapshot.quantity.difficulty,
        makeTen: nextPersisted.skillSnapshot.makeTen.difficulty,
        bridgeSubtract: nextPersisted.skillSnapshot.bridgeSubtract.difficulty,
      },
      focusSkill: state.selectedFocusSkill,
    });

    engine.start({ length: 5, locale });

    engineRef.current = engine;

    dispatch({
      type: "session_started",
      currentTask: engine.getCurrentTask(),
      persisted: nextPersisted,
      progress: engine.getProgress(),
    });
  };

  const requestHint = () => {
    if (!engineRef.current || !state.currentTask) {
      return;
    }

    const hint = engineRef.current.useHint();

    dispatch({
      type: "set_hint",
      hint: {
        level: hint.hintLevel,
        message: hint.message,
      },
    });
  };

  const submitAnswer = (value: number) => {
    if (!engineRef.current || !state.currentTask || isTransitioning) {
      return;
    }

    setIsTransitioning(true);

    const responseMs = performance.now() - taskStartRef.current;
    const submission = engineRef.current.submitAnswer({ value, responseMs });

    if (submission.isCorrect) {
      setShowConfetti(true);
      setFeedbackKind("correct");
      setFeedbackAnswer(undefined);
      window.setTimeout(() => setShowConfetti(false), 1500);
    } else {
      setFeedbackKind("incorrect");
      setFeedbackAnswer(state.currentTask.answer.correct);
    }

    const feedback: FeedbackState = submission.isCorrect
      ? { kind: "correct", message: t("feedback.correct.1") }
      : {
          kind: "incorrect",
          message: t("feedback.answerWas", {
            answer:
              typeof state.currentTask.answer.correct === "number"
                ? formatNumber(locale, state.currentTask.answer.correct)
                : String(state.currentTask.answer.correct),
          }),
        };

    if (submission.nextTaskReady) {
      const nextTask = engineRef.current.getCurrentTask();
      const progress = engineRef.current.getProgress();

      window.setTimeout(() => {
        dispatch({ type: "next_task", task: nextTask, progress, feedback });
        setIsTransitioning(false);
        setFeedbackKind(null);
      }, 1200);

      return;
    }

    const result = engineRef.current.finish();
    const persisted = appendSessionResult(result);

    window.setTimeout(() => {
      dispatch({ type: "session_completed", result, persisted });
      setIsTransitioning(false);
      setFeedbackKind(null);
      setShowConfetti(true);
      window.setTimeout(() => setShowConfetti(false), 2000);
    }, 1200);
  };

  const resultRows = useMemo(() => {
    if (!state.result) {
      return [];
    }

    const skills: Skill[] = ["quantity", "makeTen", "bridgeSubtract"];

    return skills.map((skill) => {
      const stats = state.result!.bySkill[skill];

      return {
        skill,
        label: t(SKILL_LABEL_KEYS[skill]),
        icon: SKILL_ICONS[skill],
        correct: stats.correct,
        total: stats.total,
        score: percentage(stats.correct, stats.total),
      };
    });
  }, [state.result, t]);

  return (
    <main className="game-bg flex min-h-dvh flex-col items-center px-4 py-6 sm:px-8 sm:py-8">
      <Confetti trigger={showConfetti} />
      <FeedbackOverlay kind={feedbackKind} answer={feedbackAnswer} />

      <div className="w-full max-w-2xl">
        {/* Loading */}
        {!state.hydrated && (
          <div className="flex min-h-[60dvh] items-center justify-center">
            <div className="animate-float font-display text-4xl font-bold text-primary">
              {t("app.name")}
            </div>
          </div>
        )}

        {/* Start */}
        {state.hydrated && state.phase === "start" && (
          <div className="flex flex-col items-center gap-8 animate-slide-up">
            {/* <div className="flex w-full justify-end">
              <LocaleSwitcher />
            </div> */}

            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary clay-sm">
                <Zap className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="font-display text-5xl font-extrabold text-primary">
                {t("app.name")}
              </h1>
              <p className="font-display text-xl font-semibold text-muted-foreground">
                {t("app.tagline")}
              </p>
            </div>

            <div className="w-full space-y-3">
              <p className="text-center font-display text-lg font-bold text-foreground/70">
                {t("start.practiceQuestion")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {skillButtons.map((option) => {
                  const selected = state.selectedFocusSkill === option.value;

                  return (
                    <button
                      key={option.labelKey}
                      type="button"
                      className={cn(
                        "clay-button flex min-h-20 flex-col items-center justify-center gap-1 px-4 py-3 transition-all",
                        selected
                          ? `${SKILL_COLORS[option.colorKey]} ring-4 ring-white/60 scale-105`
                          : "bg-white text-foreground hover:scale-[1.02]",
                      )}
                      onClick={() =>
                        dispatch({ type: "set_focus", skill: option.value })
                      }
                    >
                      <span className="text-2xl" role="img" aria-hidden="true">
                        {option.icon}
                      </span>
                      <span className="font-display text-lg font-bold">
                        {t(option.labelKey)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {recentSession && (
              <div className="clay-sm w-full bg-white/70 p-4 text-center">
                <p className="font-display text-base font-bold text-foreground/70">
                  {t("start.lastTime")}
                </p>
                <p className="font-display text-2xl font-extrabold text-primary">
                  {t("start.lastScore", {
                    correct: formatNumber(locale, recentSession.correct),
                    total: formatNumber(locale, recentSession.totalTasks),
                  })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(locale, recentSession.finishedAt)}
                </p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  {Array.from(
                    { length: recentSession.totalTasks },
                    (_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          "h-5 w-5",
                          index < recentSession.correct
                            ? "fill-game-star text-game-star"
                            : "fill-muted/30 text-border",
                        )}
                      />
                    ),
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              className="clay-button flex min-h-18 w-full max-w-sm items-center justify-center gap-3 bg-game-success px-8 py-4"
              onClick={startSession}
            >
              <Play
                className="h-7 w-7 text-white"
                fill="white"
                strokeWidth={0}
              />
              <span className="font-display text-2xl font-extrabold text-white">
                {t("start.go")}
              </span>
            </button>
          </div>
        )}

        {/* Session */}
        {state.hydrated && state.phase === "session" && state.currentTask && (
          <div className="flex flex-col items-center gap-5 animate-slide-up">
            <div className="flex w-full items-center justify-between">
              <div
                className={cn(
                  "clay-sm inline-flex items-center gap-2 px-4 py-2",
                  SKILL_COLORS[state.currentTask.skill],
                )}
              >
                <span role="img" aria-hidden="true">
                  {SKILL_ICONS[state.currentTask.skill]}
                </span>
                <span className="font-display text-sm font-bold">
                  {t(SKILL_LABEL_KEYS[state.currentTask.skill])}
                </span>
              </div>

              <SessionProgress
                current={state.sessionProgress.current}
                total={state.sessionProgress.total}
                completed={state.sessionProgress.completed}
              />
            </div>

            <div className="w-full">
              <TaskRenderer
                key={state.currentTask.id}
                task={state.currentTask}
                onAnswer={submitAnswer}
                disabled={isTransitioning}
              />
            </div>

            <HintPanel
              hintLevel={state.hint.level}
              hintMessage={state.hint.message}
            />

            <button
              type="button"
              className={cn(
                "clay-button flex min-h-14 items-center gap-2 px-6 py-3",
                state.hint.level === 2
                  ? "bg-muted text-muted-foreground"
                  : "bg-game-star/70 text-amber-900",
              )}
              onClick={requestHint}
              disabled={isTransitioning || state.hint.level === 2}
            >
              <Lightbulb className="h-5 w-5" strokeWidth={2.5} />
              <span className="font-display text-lg font-bold">
                {state.hint.level === 0
                  ? t("session.hint.button.0")
                  : state.hint.level === 1
                    ? t("session.hint.button.1")
                    : t("session.hint.button.2")}
              </span>
            </button>
          </div>
        )}

        {/* Result */}
        {state.hydrated && state.phase === "result" && state.result && (
          <div className="flex flex-col items-center gap-6 animate-slide-up">
            <div className="flex w-full justify-end">
              <LocaleSwitcher />
            </div>

            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-game-star clay animate-tada">
                <Trophy className="h-12 w-12 text-amber-800" strokeWidth={2} />
              </div>
              <h2 className="font-display text-4xl font-extrabold text-foreground">
                {t("result.title")}
              </h2>
              <p className="text-center font-display text-xl font-semibold text-muted-foreground">
                {encouragementFor(state.result, t)}
              </p>
            </div>

            <div className="clay bg-white/80 px-10 py-6 text-center">
              <p className="font-display text-6xl font-extrabold text-primary">
                {formatNumber(locale, state.result.correct)}/
                {formatNumber(locale, state.result.totalTasks)}
              </p>
              <div className="mt-2 flex items-center justify-center gap-1">
                {Array.from({ length: state.result.totalTasks }, (_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "h-8 w-8",
                      index < state.result!.correct
                        ? "fill-game-star text-game-star animate-star-fill"
                        : "fill-muted/30 text-border",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                ))}
              </div>
            </div>

            <div className="grid w-full grid-cols-3 gap-3">
              {resultRows.map((row) => (
                <div
                  key={row.skill}
                  className="clay-sm flex flex-col items-center gap-1 bg-white/70 p-4"
                >
                  <span className="text-2xl" role="img" aria-hidden="true">
                    {row.icon}
                  </span>
                  <p className="font-display text-sm font-bold text-foreground/70">
                    {row.label}
                  </p>
                  <p className="font-display text-2xl font-extrabold text-primary">
                    {formatNumber(locale, row.correct)}/
                    {formatNumber(locale, row.total)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                className="clay-button flex min-h-16 flex-1 items-center justify-center gap-3 bg-game-success px-6 py-4 sm:max-w-xs"
                onClick={startSession}
              >
                <RotateCcw className="h-6 w-6 text-white" strokeWidth={2.5} />
                <span className="font-display text-xl font-extrabold text-white">
                  {t("result.playAgain")}
                </span>
              </button>
              <button
                type="button"
                className="clay-button flex min-h-16 flex-1 items-center justify-center gap-3 bg-white px-6 py-4 text-foreground sm:max-w-xs"
                onClick={() =>
                  dispatch({ type: "back_to_start", clearResult: false })
                }
              >
                <span className="font-display text-xl font-bold">
                  {t("result.changeSkill")}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export function AnnemieMvpApp() {
  return (
    <LocaleProvider>
      <AnnemieMvpAppContent />
    </LocaleProvider>
  );
}
