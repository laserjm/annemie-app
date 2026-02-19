import type { Difficulty, TenFrameFlashTask } from "@/lib/domain/task"
import { buildNumberChoices, pickFlashMs, pickTenFrameCount } from "@/lib/generators/helpers"
import type { Rng } from "@/lib/generators/rng"

export const generateTenFrameFlashTask = (input: {
  difficulty: Difficulty
  rng: Rng
  index: number
}): TenFrameFlashTask => {
  const count = pickTenFrameCount(input.rng, input.difficulty)

  return {
    id: `quantity-${input.index}-${count}`,
    type: "tenFrameFlashCount",
    skill: "quantity",
    difficulty: input.difficulty,
    prompt: "How many dots did you see?",
    stimulus: {
      count,
      flashMs: pickFlashMs(input.difficulty),
      layout: "tenFrame",
    },
    interaction: {
      mode: "singleChoice",
      options: buildNumberChoices(input.rng, count, 1, 10),
    },
    answer: {
      correct: count,
    },
    hints: [
      "Look for groups: first to 5, then count extras.",
      "Use 5 + extras. For example, 8 is 5 and 3.",
    ],
    scoring: {
      maxPoints: 100,
      speedBonusMs: 2500,
    },
  }
}
