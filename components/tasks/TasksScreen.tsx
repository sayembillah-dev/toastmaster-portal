"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, User, CalendarDays, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks, useUpdateTask } from "@/hooks/useTasks";
import { TaskFormDialog } from "./TaskFormDialog";
import { DeleteTaskDialog } from "./DeleteTaskDialog";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/taskConstants";
import { toast } from "sonner";
import type { TaskDTO } from "@/lib/serializers";

function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: TaskDTO;
  onEdit: (t: TaskDTO) => void;
  onDelete: (t: TaskDTO) => void;
}) {
  const updateTask = useUpdateTask(task.id);
  const isDone = task.status === "done";

  function toggleStatus() {
    updateTask.mutate(
      { status: isDone ? "todo" : "done" },
      { onError: (err) => toast.error(err.message) },
    );
  }

  const dueDateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={`group flex items-start gap-3 p-4 rounded-lg border transition-colors ${
        isDone ? "bg-muted/40 border-border/50" : "bg-card border-border hover:border-primary/30"
      }`}
    >
      {/* Status toggle */}
      <button
        type="button"
        onClick={toggleStatus}
        disabled={updateTask.isPending}
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
        aria-label={isDone ? "Mark as incomplete" : "Mark as done"}
      >
        {isDone ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span className={`text-sm font-medium leading-snug ${isDone ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded border font-medium shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>

        {task.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        <div className="mt-2 flex items-center gap-3 flex-wrap">
          {task.assignedMemberName && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {task.assignedMemberName}
            </span>
          )}
          {dueDateStr && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {dueDateStr}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onDelete(task)}
          aria-label="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function TasksScreen() {
  const { data: tasks = [], isLoading } = useTasks();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDTO | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskDTO | null>(null);

  const todo = tasks.filter((t) => t.status === "todo");
  const done = tasks.filter((t) => t.status === "done");

  function handleEdit(task: TaskDTO) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function handleCloseForm(open: boolean) {
    setFormOpen(open);
    if (!open) setEditingTask(null);
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {todo.length} pending · {done.length} done
          </p>
        </div>
        <Button onClick={() => { setEditingTask(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />
          New task
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && tasks.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No tasks yet</p>
          <p className="text-sm mt-1">Create your first task to get started.</p>
        </div>
      )}

      {/* Todo */}
      {todo.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            To do <Badge variant="secondary" className="ml-1 text-xs">{todo.length}</Badge>
          </h2>
          <div className="space-y-2">
            {todo.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={setDeletingTask} />
            ))}
          </div>
        </section>
      )}

      {/* Done */}
      {done.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Completed <Badge variant="secondary" className="ml-1 text-xs">{done.length}</Badge>
          </h2>
          <div className="space-y-2">
            {done.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={setDeletingTask} />
            ))}
          </div>
        </section>
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={handleCloseForm}
        mode={editingTask ? "edit" : "create"}
        task={editingTask ?? undefined}
      />

      <DeleteTaskDialog
        open={!!deletingTask}
        onOpenChange={(open) => { if (!open) setDeletingTask(null); }}
        task={deletingTask}
      />
    </div>
  );
}
