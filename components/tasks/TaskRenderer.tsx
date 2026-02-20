import {
  TASK_RENDERER_REGISTRY,
  type TaskRendererProps,
} from "@/components/tasks/task-renderer-registry"

export function TaskRenderer({ task, onAnswer, disabled = false }: TaskRendererProps) {
  const Renderer = TASK_RENDERER_REGISTRY[task.type]

  return (
    <Renderer
      task={task as never}
      onAnswer={onAnswer}
      disabled={disabled}
    />
  )
}
