"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EventFormState, UpdateFormFn } from "./eventTabTypes";
import type { ResourceDTO } from "@/lib/serializers";

type Props = {
  form: EventFormState;
  update: UpdateFormFn;
};

function addResource(resources: ResourceDTO[]): ResourceDTO[] {
  return [...resources, { title: "", description: "" }];
}

function updateResource(
  resources: ResourceDTO[],
  i: number,
  patch: Partial<ResourceDTO>,
): ResourceDTO[] {
  return resources.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
}

function removeResource(resources: ResourceDTO[], i: number): ResourceDTO[] {
  return resources.filter((_, idx) => idx !== i);
}

export function ResourcesTab({ form, update }: Props) {
  const resources = form.resources ?? [];

  const set = (next: ResourceDTO[]) => update({ resources: next });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Resources</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Links, notes, or documents for this meeting.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => set(addResource(resources))}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </Button>
      </div>

      {/* Empty state */}
      {resources.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-muted py-16 text-center">
          <p className="text-base font-medium text-muted-foreground">No resources yet</p>
          <p className="text-sm text-muted-foreground/70 max-w-xs">
            Add links, files, reference notes, or any content you want to share with attendees.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 mt-1"
            onClick={() => set(addResource(resources))}
          >
            <Plus className="h-4 w-4" />
            Add a new resource
          </Button>
        </div>
      )}

      {/* Resource cards */}
      {resources.map((r, i) => (
        <div
          key={`resource-${i}`}
          className="rounded-xl border bg-card p-5 space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-0.5">
              Resource {i + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => set(removeResource(resources, i))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor={`res-title-${i}`}>
              Title
            </label>
            <Input
              id={`res-title-${i}`}
              value={r.title}
              onChange={(e) => set(updateResource(resources, i, { title: e.target.value }))}
              placeholder="e.g. Meeting Recording, Slide Deck, Useful Article…"
              className="text-base h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor={`res-desc-${i}`}>
              Description
            </label>
            <Textarea
              id={`res-desc-${i}`}
              value={r.description}
              onChange={(e) => set(updateResource(resources, i, { description: e.target.value }))}
              placeholder="Add a URL, notes, instructions, or any details about this resource…"
              rows={5}
              className="text-base resize-none"
            />
          </div>
        </div>
      ))}

      {/* Bottom add button when list is non-empty */}
      {resources.length > 0 && (
        <Button
          variant="outline"
          className="w-full gap-1.5"
          onClick={() => set(addResource(resources))}
        >
          <Plus className="h-4 w-4" />
          Add Another Resource
        </Button>
      )}
    </div>
  );
}
