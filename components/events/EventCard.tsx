"use client";

import { CalendarDays, Users, Trash2, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EventDTO } from "@/lib/serializers";

type Props = {
  event: EventDTO;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function EventCard({ event, onDelete, isDeleting = false }: Props) {
  const router = useRouter();

  return (
    <div
      className="border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow cursor-pointer"
      onClick={() => router.push(`/events/${event.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">Meeting #{event.meetingNumber}</span>
            {event.isTemplate && (
              <Badge variant="secondary" className="text-xs">Template</Badge>
            )}
          </div>
          <h3 className="font-semibold text-sm leading-snug truncate">
            {event.theme || event.title || "Untitled Meeting"}
          </h3>
          {event.theme && event.title && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{event.title}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
          disabled={isDeleting}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(event.id);
          }}
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <div className="mt-3 space-y-1.5">
        {!event.isTemplate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(event.date)} · {formatTime(event.startTime)}</span>
          </div>
        )}
        {event.isTemplate && event.templateName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span>{event.templateName}</span>
          </div>
        )}
        {event.speakers.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>
              {event.speakers.length} speaker{event.speakers.length !== 1 ? "s" : ""}
              {event.speakers[0]?.name ? ` · ${event.speakers.map((s) => s.name).filter(Boolean).join(", ")}` : ""}
            </span>
          </div>
        )}
        {event.roles.toastmaster && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium">TMOE:</span>
            <span>{event.roles.toastmaster}</span>
          </div>
        )}
      </div>
    </div>
  );
}
