"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/clientApi";
import { qk } from "@/lib/queryKeys";
import { MemberAvatar } from "@/components/shared/Avatar";
import { FOLLOW_UP_STATUSES, FOLLOW_UP_LABELS, type FollowUpStatus } from "@/lib/guestConstants";
import type { GuestDTO } from "@/lib/serializers";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

type Props = { guests: GuestDTO[] };

const COLUMN_ACCENT: Record<FollowUpStatus, string> = {
  new: "border-t-slate-400",
  contacted: "border-t-blue-400",
  interested: "border-t-amber-400",
  not_interested: "border-t-red-400",
  joined: "border-t-green-500",
};

export function GuestPipelineBoard({ guests }: Props) {
  const qc = useQueryClient();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<FollowUpStatus | null>(null);

  const { mutate: moveGuest } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FollowUpStatus }) =>
      api.guests.update(id, { followUpStatus: status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.guests.all }),
  });

  const columns = FOLLOW_UP_STATUSES.map((status) => ({
    status,
    guests: guests.filter((g) => g.followUpStatus === status),
  }));

  function handleDrop(status: FollowUpStatus) {
    setOverColumn(null);
    if (!dragId || status === "joined") {
      setDragId(null);
      return;
    }
    const dragged = guests.find((g) => g.id === dragId);
    if (dragged && dragged.followUpStatus !== "joined" && dragged.followUpStatus !== status) {
      moveGuest({ id: dragId, status });
    }
    setDragId(null);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map((col) => (
        <div
          key={col.status}
          onDragOver={(e) => {
            if (col.status === "joined") return;
            e.preventDefault();
            setOverColumn(col.status);
          }}
          onDragLeave={() => setOverColumn((c) => (c === col.status ? null : c))}
          onDrop={() => handleDrop(col.status)}
          className={cn(
            "w-72 shrink-0 rounded-xl border border-t-4 bg-muted/20 flex flex-col",
            COLUMN_ACCENT[col.status],
            overColumn === col.status && "bg-muted/50 ring-2 ring-primary/30",
          )}
        >
          <div className="px-3 py-2.5 flex items-center justify-between border-b bg-background/60 rounded-t-[10px]">
            <span className="text-sm font-semibold">{FOLLOW_UP_LABELS[col.status]}</span>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {col.guests.length}
            </span>
          </div>

          <div className="flex-1 p-2 space-y-2 min-h-[120px]">
            {col.guests.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No guests</p>
            ) : (
              col.guests.map((guest) => (
                <div
                  key={guest.id}
                  draggable={guest.followUpStatus !== "joined"}
                  onDragStart={() => setDragId(guest.id)}
                  onDragEnd={() => setDragId(null)}
                  className={cn(
                    "group bg-background border rounded-lg p-2.5 shadow-sm transition-opacity",
                    guest.followUpStatus === "joined" ? "cursor-default" : "cursor-grab active:cursor-grabbing",
                    dragId === guest.id && "opacity-40",
                  )}
                >
                  <Link href={`/guests/${guest.id}`} className="flex items-center gap-2 min-w-0">
                    <MemberAvatar name={guest.fullName} photoUrl={guest.photoUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{guest.fullName}</p>
                      {(guest.phone || guest.email) && (
                        <p className="text-xs text-muted-foreground truncate">
                          {guest.phone || guest.email}
                        </p>
                      )}
                    </div>
                    {guest.followUpStatus !== "joined" && (
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100" />
                    )}
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
