import type { BackToTenSubtractTask, Difficulty } from "@/lib/domain/task"
import { t } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/types"
import { buildNumberChoices, pickBridgeSubtractPair } from "@/lib/generators/helpers"
import type { Rng } from "@/lib/generators/rng"

export const generateBackToTenSubtractTask = (input: {
  difficulty: Difficulty
  locale: Locale
  rng: Rng
  index: number
}): BackToTenSubtractTask => {
  const { start, subtract } = pickBridgeSubtractPair(input.rng, input.difficulty)
  const bridgeStep = start - 10
  const correct = start - subtract

  return {
    id: `bridgesub-${input.index}-${start}-${subtract}`,
    type: "backToTenSubtract",
    skill: "bridgeSubtract",
    difficulty: input.difficulty,
    prompt: t(input.locale, "task.bridgeSubtract.prompt"),
    stimulus: {
      start,
      subtract,
      bridgeStep,
      equation: `${start} - ${subtract} = ?`,
    },
    interaction: {
      mode: "singleChoice",
      options: buildNumberChoices(input.rng, correct, 1, 19),
    },
    answer: {
      correct,
    },
    hints: [
      t(input.locale, "task.bridgeSubtract.hint1"),
      t(input.locale, "task.bridgeSubtract.hint2", {
        start,
        bridgeStep,
        leftover: subtract - bridgeStep,
      }),
    ],
    scoring: {
      maxPoints: 100,
      speedBonusMs: 3500,
    },
  }
}
