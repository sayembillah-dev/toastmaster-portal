import { UserRoundPlus, CalendarCheck, StickyNote } from "lucide-react";
import type { ActivityLogEntryDTO } from "@/lib/serializers";
import type { ActivityLogType } from "@/lib/memberConstants";

const TYPE_ICONS: Record<ActivityLogType, React.ElementType> = {
  guest_attendance: CalendarCheck,
  conversion: UserRoundPlus,
  note: StickyNote,
};

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-MY", { year: "numeric", month: "short", day: "numeric" });
}

export function MemberActivityLog({ entries }: { entries: ActivityLogEntryDTO[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Activity Log</h3>
      <div className="border rounded-lg divide-y">
        {entries.map((entry, i) => {
          const Icon = TYPE_ICONS[entry.type];
          return (
            <div key={i} className="flex items-start gap-3 px-3 py-2.5">
              <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">{entry.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(entry.occurredAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
