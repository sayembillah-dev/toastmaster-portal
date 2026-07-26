"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Star, CalendarCheck, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_BADGE_STYLES, type AreaClub } from "@/lib/areaConstants";
import type { DateRangePreset } from "@/lib/dateRangeConstants";
import { useClubMeetingStats } from "@/hooks/useClubMeetingStats";
import { MeetingAttendanceModal } from "./MeetingAttendanceModal";

function attendanceTone(value: number | null) {
  if (value === null) return "text-muted-foreground";
  if (value >= 70) return "text-green-600";
  if (value >= 40) return "text-amber-600";
  return "text-destructive";
}

export function AreaClubCard({ club, range }: { club: AreaClub; range: DateRangePreset }) {
  const goalMet = club.memberCount >= club.goalMemberCount;
  const stats = useClubMeetingStats(club, range);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Link href={`/area/clubs/${club.id}`}>
        <Card className="transition-colors hover:bg-muted/50">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-muted text-muted-foreground shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="truncate">{club.name}</span>
              </CardTitle>
              {club.isHomeClub && (
                <Badge variant="outline" className="shrink-0 gap-1 border-primary/30 text-primary">
                  <Star className="h-3 w-3" />
                  Your Club
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Club #{club.clubNumber}</span>
              <Badge variant="outline" className={cn("text-xs", STATUS_BADGE_STYLES[club.status])}>
                {club.status}
              </Badge>
            </div>

            {/* Meetings held / Attendance % */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border px-2.5 py-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  Meetings
                </div>
                <p className="text-lg font-semibold mt-0.5">
                  {stats.isLoading ? "—" : stats.meetingsConducted}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setModalOpen(true);
                }}
                className="rounded-lg border px-2.5 py-2 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Percent className="h-3.5 w-3.5" />
                  Attendance
                </div>
                <p className={cn("text-lg font-semibold mt-0.5", attendanceTone(stats.attendancePercentage))}>
                  {stats.isLoading ? "—" : stats.attendancePercentage !== null ? `${stats.attendancePercentage}%` : "N/A"}
                </p>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-sm">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={cn("font-medium", goalMet ? "text-green-600" : "text-foreground")}>
                {club.memberCount}
              </span>
              <span className="text-muted-foreground">/ {club.goalMemberCount} members</span>
            </div>
          </CardContent>
        </Card>
      </Link>

      <MeetingAttendanceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        clubName={club.name}
        attendancePercentage={stats.attendancePercentage}
        meetings={stats.meetings}
      />
    </>
  );
}
