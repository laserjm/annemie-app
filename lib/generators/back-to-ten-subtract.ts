import type { BackToTenSubtractTask, Difficulty } from "@/lib/domain/task"
import { t } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/types"
import { buildNumberChoices, pickBridgeSubtractPair } from "@/lib/generators/helpers"
import type { Rng } from "@/lib/generators/rng"
import type { SkillDifficultyConfig } from "@/lib/skills/registry"

export const generateBackToTenSubtractTask = (input: {
  difficulty: Difficulty
  difficultyConfig: SkillDifficultyConfig
  locale: Locale
  rng: Rng
  index: number
}): BackToTenSubtractTask => {
  const base = input.difficultyConfig.base
  const { start, subtract } = pickBridgeSubtractPair({
    rng: input.rng,
    startRange: input.difficultyConfig.range,
    subtractRange: input.difficultyConfig.secondaryRange ?? { min: 2, max: 9 },
    base,
    crossingRule: input.difficultyConfig.crossingRule,
  })
  const bridgeStep = start - base
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
      base,
      equation: `${start} - ${subtract} = ?`,
    },
    interaction: {
      mode: "singleChoice",
      options: buildNumberChoices(
        input.rng,
        correct,
        1,
        Math.max(19, base * 2 - 1)
      ),
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
