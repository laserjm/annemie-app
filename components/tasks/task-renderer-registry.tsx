import type { ComponentType } from "react"

import { BackToTenSubtractTask } from "@/components/tasks/BackToTenSubtractTask"
import { MissingToTenTask } from "@/components/tasks/MissingToTenTask"
import { TenFrameFlashTask } from "@/components/tasks/TenFrameFlashTask"
import type { Task } from "@/lib/domain/task"

export type TaskRendererProps<TTask extends Task = Task> = {
  task: TTask
  disabled?: boolean
  onAnswer: (value: number) => void
}

type TaskRendererRegistry = {
  [TType in Task["type"]]: ComponentType<
    TaskRendererProps<Extract<Task, { type: TType }>>
  >
}

export const TASK_RENDERER_REGISTRY: TaskRendererRegistry = {
  tenFrameFlashCount: TenFrameFlashTask,
  missingToTen: MissingToTenTask,
  backToTenSubtract: BackToTenSubtractTask,
}
