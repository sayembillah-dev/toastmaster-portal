"use client";

import { Users, RefreshCcw, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMembers } from "@/hooks/useMembers";
import type { EventFormState, UpdateFormFn } from "./eventTabTypes";
import type { MemberAttendanceDTO } from "@/lib/serializers";

type Props = { form: EventFormState; update: UpdateFormFn };

export function AttendanceTab({ form, update }: Props) {
  const { data: members } = useMembers();
  const roster = form.memberAttendance;

  const activeMembers = (members ?? []).filter((m) => m.status === "active");
  const missingCount = activeMembers.filter(
    (m) => !roster.some((r) => r.memberId === m.id),
  ).length;

  const present = roster.filter((r) => r.present).length;

  const syncRoster = () => {
    const existingIds = new Set(roster.map((r) => r.memberId));
    const additions: MemberAttendanceDTO[] = activeMembers
      .filter((m) => !existingIds.has(m.id))
      .map((m) => ({ memberId: m.id, name: m.fullName, present: false }));
    update({ memberAttendance: [...roster, ...additions] }, true);
  };

  const toggle = (memberId: string) => {
    update(
      {
        memberAttendance: roster.map((r) =>
          r.memberId === memberId ? { ...r, present: !r.present } : r,
        ),
      },
      true,
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Attendance Headcount</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mark who showed up. Used to calculate the club&apos;s attendance rate.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-muted-foreground block">{roster.length} on roster</span>
          {roster.length > 0 && (
            <span className="text-xs text-green-600 font-medium">{present} present</span>
          )}
        </div>
      </div>

      {roster.length === 0 ? (
        <div className="border border-dashed rounded-xl p-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            No headcount taken yet for this meeting.
          </p>
          <Button type="button" size="sm" className="gap-2" onClick={syncRoster}>
            <Users className="h-4 w-4" />
            Load Active Members
          </Button>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden divide-y">
            {roster.map((r) => (
              <button
                key={r.memberId}
                type="button"
                onClick={() => toggle(r.memberId)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                  r.present ? "bg-green-50/50 dark:bg-green-950/20" : "hover:bg-muted/50"
                }`}
              >
                <span className="text-sm font-medium truncate">{r.name}</span>
                {r.present ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
              </button>
            ))}
          </div>

          {missingCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 w-full"
              onClick={syncRoster}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Add {missingCount} New Active {missingCount === 1 ? "Member" : "Members"} to Roster
            </Button>
          )}
        </>
      )}
    </div>
  );
}
