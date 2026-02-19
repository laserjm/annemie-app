import type { BackToTenSubtractTask, Difficulty } from "@/lib/domain/task"
import { buildNumberChoices, pickBridgeSubtractPair } from "@/lib/generators/helpers"
import type { Rng } from "@/lib/generators/rng"

export const generateBackToTenSubtractTask = (input: {
  difficulty: Difficulty
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
    prompt: "Subtract by crossing ten.",
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
      "First subtract to 10, then subtract what is left.",
      `${start} -> 10 removes ${bridgeStep}. Then remove ${subtract - bridgeStep}.`,
    ],
    scoring: {
      maxPoints: 100,
      speedBonusMs: 3500,
    },
  }
}
