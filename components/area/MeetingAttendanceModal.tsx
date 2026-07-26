"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { MeetingAttendanceRow } from "@/hooks/useClubMeetingStats";

export function MeetingAttendanceModal({
  open,
  onOpenChange,
  clubName,
  attendancePercentage,
  meetings,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubName: string;
  attendancePercentage: number | null;
  meetings: MeetingAttendanceRow[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{clubName} — Attendance Breakdown</DialogTitle>
          <DialogDescription>
            {attendancePercentage !== null
              ? `${attendancePercentage}% aggregate attendance across recorded meetings.`
              : "No headcounts have been recorded yet."}
          </DialogDescription>
        </DialogHeader>

        {meetings.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No meetings recorded yet.</p>
        ) : (
          <div className="divide-y border rounded-lg overflow-hidden">
            {meetings.map((m) => {
              const recorded = m.total !== null && m.present !== null;
              const pct = recorded ? Math.round((m.present! / m.total!) * 100) : null;
              return (
                <div key={m.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <span className="text-sm truncate">{m.label}</span>
                  {recorded ? (
                    <span className="text-sm text-muted-foreground shrink-0">
                      {m.present}/{m.total}{" "}
                      <span className="font-medium text-foreground">({pct}%)</span>
                    </span>
                  ) : (
                    <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground">
                      Not recorded
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
