"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteTask } from "@/hooks/useTasks";
import { toast } from "sonner";
import type { TaskDTO } from "@/lib/serializers";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskDTO | null;
}

export function DeleteTaskDialog({ open, onOpenChange, task }: Props) {
  const deleteTask = useDeleteTask();

  function handleDelete() {
    if (!task) return;
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        toast.success("Task deleted");
        onOpenChange(false);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete task</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">&ldquo;{task?.title}&rdquo;</span>?
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteTask.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteTask.isPending}>
            {deleteTask.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
