"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useMembers } from "@/hooks/useMembers";
import { TASK_PRIORITIES, PRIORITY_LABELS, type TaskPriority } from "@/lib/taskConstants";
import { toast } from "sonner";
import type { TaskDTO } from "@/lib/serializers";

type Mode = "create" | "edit";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  task?: TaskDTO;
}

type FormState = {
  title: string;
  description: string;
  priority: TaskPriority;
  assignedMemberId: string;
  assignedMemberName: string;
  dueDate: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  priority: "medium",
  assignedMemberId: "",
  assignedMemberName: "",
  dueDate: "",
};

export function TaskFormDialog({ open, onOpenChange, mode, task }: Props) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask(task?.id ?? "");
  const { data: members = [] } = useMembers();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [memberSearch, setMemberSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const memberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && task) {
        setForm({
          title: task.title,
          description: task.description,
          priority: task.priority,
          assignedMemberId: task.assignedMemberId,
          assignedMemberName: task.assignedMemberName,
          dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        });
        setMemberSearch(task.assignedMemberName);
      } else {
        setForm(EMPTY_FORM);
        setMemberSearch("");
      }
      setDropdownOpen(false);
    }
  }, [open, mode, task]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (memberRef.current && !memberRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleMemberSelect(id: string, name: string) {
    setForm((f) => ({ ...f, assignedMemberId: id, assignedMemberName: name }));
    setMemberSearch(name);
    setDropdownOpen(false);
  }

  function handleMemberSearchChange(value: string) {
    setMemberSearch(value);
    setForm((f) => ({ ...f, assignedMemberId: "", assignedMemberName: "" }));
    setDropdownOpen(true);
  }

  function handleClearMember() {
    setForm((f) => ({ ...f, assignedMemberId: "", assignedMemberName: "" }));
    setMemberSearch("");
  }

  const filteredMembers = memberSearch.trim()
    ? members.filter((m) =>
        m.fullName.toLowerCase().includes(memberSearch.toLowerCase())
      )
    : members;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description,
      priority: form.priority,
      status: task?.status ?? "todo" as const,
      assignedMemberId: form.assignedMemberId,
      assignedMemberName: form.assignedMemberName,
      dueDate: form.dueDate || "",
    };

    const onSuccess = () => {
      toast.success(mode === "create" ? "Task created" : "Task updated");
      onOpenChange(false);
    };
    const onError = (err: Error) => toast.error(err.message);

    if (mode === "create") {
      createTask.mutate(payload, { onSuccess, onError });
    } else {
      updateTask.mutate(payload, { onSuccess, onError });
    }
  }

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New task" : "Edit task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Task title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Add details…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              maxLength={2000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1.5">
              <Label>Priority *</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => { if (v) set("priority", v as TaskPriority); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due date */}
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">
                Due date <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </div>
          </div>

          {/* Assigned member */}
          <div className="space-y-1.5" ref={memberRef}>
            <Label htmlFor="memberSearch">
              Assign to <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <div className="relative flex gap-2">
              <Input
                id="memberSearch"
                autoComplete="off"
                placeholder="Search member…"
                value={memberSearch}
                onChange={(e) => handleMemberSearchChange(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
                className="flex-1"
              />
              {memberSearch && (
                <Button type="button" variant="outline" size="sm" onClick={handleClearMember} className="shrink-0">
                  Clear
                </Button>
              )}
              {dropdownOpen && filteredMembers.length > 0 && (
                <ul className="absolute z-50 top-full mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-border bg-popover shadow-md text-sm">
                  {filteredMembers.map((m) => (
                    <li
                      key={m.id}
                      onMouseDown={() => handleMemberSelect(m.id, m.fullName)}
                      className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                        form.assignedMemberId === m.id ? "bg-muted font-medium" : ""
                      }`}
                    >
                      {m.fullName}
                    </li>
                  ))}
                </ul>
              )}
              {dropdownOpen && memberSearch.trim() && filteredMembers.length === 0 && (
                <div className="absolute z-50 top-full mt-1 w-full rounded-md border border-border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
                  No members found
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
