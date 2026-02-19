import { BackToTenSubtractTask } from "@/components/tasks/BackToTenSubtractTask"
import { MissingToTenTask } from "@/components/tasks/MissingToTenTask"
import { TenFrameFlashTask } from "@/components/tasks/TenFrameFlashTask"
import type { Task } from "@/lib/domain/task"

type TaskRendererProps = {
  task: Task
  disabled?: boolean
  onAnswer: (value: number) => void
}

export function TaskRenderer({ task, onAnswer, disabled = false }: TaskRendererProps) {
  switch (task.type) {
    case "tenFrameFlashCount":
      return <TenFrameFlashTask task={task} onAnswer={onAnswer} disabled={disabled} />
    case "missingToTen":
      return <MissingToTenTask task={task} onAnswer={onAnswer} disabled={disabled} />
    case "backToTenSubtract":
      return (
        <BackToTenSubtractTask task={task} onAnswer={onAnswer} disabled={disabled} />
      )
    default:
      return null
  }
}
