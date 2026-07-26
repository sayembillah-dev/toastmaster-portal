import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import type { GuestAttendanceEntryDTO } from "@/lib/serializers";

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-MY", { year: "numeric", month: "short", day: "numeric" });
}

export function GuestAttendanceHistory({ entries }: { entries: GuestAttendanceEntryDTO[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Meeting Attendance</h3>

      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          No confirmed meeting attendance yet. This fills in automatically once a meeting host marks this guest present.
        </p>
      ) : (
        <div className="border rounded-lg divide-y">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-start gap-3 px-3 py-2.5">
              <CalendarCheck className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                {entry.eventId ? (
                  <Link href={`/events/${entry.eventId}`} className="text-sm font-medium hover:underline">
                    {entry.eventTitle || "Meeting"}
                  </Link>
                ) : (
                  <p className="text-sm font-medium">{entry.eventTitle || "Meeting"}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(entry.eventDate)} · confirmed {formatDate(entry.confirmedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
