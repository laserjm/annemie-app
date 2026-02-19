import type { Difficulty } from "@/lib/domain/task"
import type { Rng } from "@/lib/generators/rng"
import { randomInt, shuffle } from "@/lib/generators/rng"

const TEN_FRAME_RANGES: Record<Difficulty, [number, number]> = {
  1: [1, 5],
  2: [1, 7],
  3: [2, 10],
  4: [3, 10],
  5: [1, 10],
}

const SUBTRACT_START_RANGES: Record<Difficulty, [number, number]> = {
  1: [11, 13],
  2: [11, 15],
  3: [12, 16],
  4: [13, 18],
  5: [14, 19],
}

const SUBTRACT_AMOUNT_RANGES: Record<Difficulty, [number, number]> = {
  1: [2, 4],
  2: [2, 5],
  3: [3, 6],
  4: [4, 8],
  5: [5, 9],
}

const FLASH_MS_BY_DIFFICULTY: Record<Difficulty, number> = {
  1: 850,
  2: 700,
  3: 600,
  4: 500,
  5: 420,
}

export const pickTenFrameCount = (rng: Rng, difficulty: Difficulty): number => {
  const [min, max] = TEN_FRAME_RANGES[difficulty]
  return randomInt(rng, min, max)
}

export const pickFlashMs = (difficulty: Difficulty): number => FLASH_MS_BY_DIFFICULTY[difficulty]

export const buildNumberChoices = (
  rng: Rng,
  correct: number,
  min: number,
  max: number,
  size = 4
): number[] => {
  const values = new Set<number>([correct])

  while (values.size < size) {
    const candidate = randomInt(rng, min, max)
    values.add(candidate)
  }

  return shuffle(rng, [...values])
}

export const pickMissingToTenStart = (rng: Rng, difficulty: Difficulty): number => {
  const minByDifficulty: Record<Difficulty, number> = {
    1: 6,
    2: 6,
    3: 7,
    4: 7,
    5: 8,
  }

  return randomInt(rng, minByDifficulty[difficulty], 9)
}

export const pickBridgeSubtractPair = (
  rng: Rng,
  difficulty: Difficulty
): { start: number; subtract: number } => {
  const [startMin, startMax] = SUBTRACT_START_RANGES[difficulty]
  const [subMin, subMax] = SUBTRACT_AMOUNT_RANGES[difficulty]

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const start = randomInt(rng, startMin, startMax)
    const subtract = randomInt(rng, subMin, Math.min(subMax, start - 1))

    if (start > 10 && start - subtract < 10) {
      return { start, subtract }
    }
  }

  // Deterministic fallback that still crosses 10
  return {
    start: 13,
    subtract: 5,
  }
}
