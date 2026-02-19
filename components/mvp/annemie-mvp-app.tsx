"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";

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

const SKILL_LABELS: Record<Skill, string> = {
  quantity: "Count Dots",
  makeTen: "Make Ten",
  bridgeSubtract: "Subtract",
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

const encouragementFor = (result: SessionResult): string => {
  const totalPct = percentage(result.correct, result.totalTasks);

  if (totalPct === 100) return "Perfect score! You're a math superstar!";
  if (totalPct >= 80) return "Amazing! You're getting really good at this!";
  if (totalPct >= 60)
    return "Nice work! Keep practising and you'll be even better!";
  return "Great try! Every practice makes you stronger!";
};

export function AnnemieMvpApp() {
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
    label: string;
    value: Skill | null;
    icon: string;
    colorKey: Skill | "balanced";
  }> = [
    { label: "Mix it up!", value: null, icon: "🎲", colorKey: "balanced" },
    {
      label: "Count Dots",
      value: "quantity",
      icon: "👀",
      colorKey: "quantity",
    },
    { label: "Make Ten", value: "makeTen", icon: "🧩", colorKey: "makeTen" },
    {
      label: "Subtract",
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

    engine.start({ length: 5 });

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
      ? { kind: "correct", message: "Correct!" }
      : {
          kind: "incorrect",
          message: `The answer was ${state.currentTask.answer.correct}.`,
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
        label: SKILL_LABELS[skill],
        icon: SKILL_ICONS[skill],
        correct: stats.correct,
        total: stats.total,
        score: percentage(stats.correct, stats.total),
      };
    });
  }, [state.result]);

  return (
    <main className="game-bg flex min-h-dvh flex-col items-center px-4 py-6 sm:px-8 sm:py-8">
      <Confetti trigger={showConfetti} />
      <FeedbackOverlay kind={feedbackKind} answer={feedbackAnswer} />

      <div className="w-full max-w-2xl">
        {/* ─── Loading ─── */}
        {!state.hydrated && (
          <div className="flex min-h-[60dvh] items-center justify-center">
            <div className="animate-float font-display text-4xl font-bold text-primary">
              Annemie
            </div>
          </div>
        )}

        {/* ─── START SCREEN ─── */}
        {state.hydrated && state.phase === "start" && (
          <div className="flex flex-col items-center gap-8 animate-slide-up">
            {/* Logo / Title */}
            <div className="flex flex-col items-center gap-2 pt-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary clay-sm">
                <Zap className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="font-display text-5xl font-extrabold text-primary">
                Annemie
              </h1>
              <p className="font-display text-xl font-semibold text-muted-foreground">
                Let&apos;s do some math!
              </p>
            </div>

            {/* Skill picker */}
            <div className="w-full space-y-3">
              <p className="text-center font-display text-lg font-bold text-foreground/70">
                What do you want to practise?
              </p>
              <div className="grid grid-cols-2 gap-4">
                {skillButtons.map((option) => {
                  const selected = state.selectedFocusSkill === option.value;

                  return (
                    <button
                      key={option.label}
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
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Last session summary (kid-friendly) */}
            {recentSession && (
              <div className="clay-sm w-full bg-white/70 p-4 text-center">
                <p className="font-display text-base font-bold text-foreground/70">
                  Last time
                </p>
                <p className="font-display text-2xl font-extrabold text-primary">
                  {recentSession.correct} out of {recentSession.totalTasks}{" "}
                  right!
                </p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  {Array.from({ length: recentSession.totalTasks }, (_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < recentSession.correct
                          ? "fill-game-star text-game-star"
                          : "fill-muted/30 text-border",
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Start button */}
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
                Let&apos;s Go!
              </span>
            </button>
          </div>
        )}

        {/* ─── SESSION SCREEN ─── */}
        {state.hydrated && state.phase === "session" && state.currentTask && (
          <div className="flex flex-col items-center gap-5 animate-slide-up">
            {/* Top bar: skill badge + progress stars */}
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
                  {SKILL_LABELS[state.currentTask.skill]}
                </span>
              </div>

              <SessionProgress
                current={state.sessionProgress.current}
                total={state.sessionProgress.total}
                completed={state.sessionProgress.completed}
              />
            </div>

            {/* Task */}
            <div className="w-full">
              <TaskRenderer
                key={state.currentTask.id}
                task={state.currentTask}
                onAnswer={submitAnswer}
                disabled={isTransitioning}
              />
            </div>

            {/* Hint area */}
            <HintPanel
              hintLevel={state.hint.level}
              hintMessage={state.hint.message}
            />

            {/* Hint button */}
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
                  ? "Need a hint?"
                  : state.hint.level === 1
                    ? "One more hint?"
                    : "No more hints"}
              </span>
            </button>
          </div>
        )}

        {/* ─── RESULT SCREEN ─── */}
        {state.hydrated && state.phase === "result" && state.result && (
          <div className="flex flex-col items-center gap-6 animate-slide-up">
            {/* Trophy */}
            <div className="flex flex-col items-center gap-3 pt-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-game-star clay animate-tada">
                <Trophy className="h-12 w-12 text-amber-800" strokeWidth={2} />
              </div>
              <h2 className="font-display text-4xl font-extrabold text-foreground">
                Well done!
              </h2>
              <p className="text-center font-display text-xl font-semibold text-muted-foreground">
                {encouragementFor(state.result)}
              </p>
            </div>

            {/* Big score */}
            <div className="clay bg-white/80 px-10 py-6 text-center">
              <p className="font-display text-6xl font-extrabold text-primary">
                {state.result.correct}/{state.result.totalTasks}
              </p>
              <div className="mt-2 flex items-center justify-center gap-1">
                {Array.from({ length: state.result.totalTasks }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-8 w-8",
                      i < state.result!.correct
                        ? "fill-game-star text-game-star animate-star-fill"
                        : "fill-muted/30 text-border",
                    )}
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>

            {/* Per-skill breakdown */}
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
                    {row.correct}/{row.total}
                  </p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                className="clay-button flex min-h-16 flex-1 items-center justify-center gap-3 bg-game-success px-6 py-4 sm:max-w-xs"
                onClick={startSession}
              >
                <RotateCcw className="h-6 w-6 text-white" strokeWidth={2.5} />
                <span className="font-display text-xl font-extrabold text-white">
                  Play again!
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
                  Change skill
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
