"use client";

import { useMemo } from "react";
import { useEvents } from "./useEvents";
import type { AreaClub } from "@/lib/areaConstants";

export type MeetingAttendanceRow = {
  id: string;
  label: string;
  present: number | null;
  total: number | null;
};

export type ClubMeetingStats = {
  isLoading: boolean;
  meetingsConducted: number;
  attendancePercentage: number | null;
  meetings: MeetingAttendanceRow[];
};

function aggregate(
  rows: MeetingAttendanceRow[],
): { present: number; total: number }[] {
  return rows.filter(
    (r): r is { id: string; label: string; present: number; total: number } =>
      r.total !== null && r.present !== null,
  );
}

export function useClubMeetingStats(club: AreaClub): ClubMeetingStats {
  const { data: events, isLoading: eventsLoading } = useEvents();

  return useMemo(() => {
    if (!club.isHomeClub) {
      const rows: MeetingAttendanceRow[] = club.meetings.map((m) => ({
        id: m.id,
        label: m.label,
        present: m.total > 0 ? m.present : null,
        total: m.total > 0 ? m.total : null,
      }));
      const recorded = aggregate(rows);
      const totalPresent = recorded.reduce((sum, r) => sum + r.present, 0);
      const totalRoster = recorded.reduce((sum, r) => sum + r.total, 0);
      return {
        isLoading: false,
        meetingsConducted: club.meetings.length,
        attendancePercentage: totalRoster > 0 ? Math.round((totalPresent / totalRoster) * 100) : null,
        meetings: rows,
      };
    }

    if (eventsLoading || !events) {
      return { isLoading: true, meetingsConducted: 0, attendancePercentage: null, meetings: [] };
    }

    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const pastMeetings = events
      .filter((e) => !e.isTemplate && new Date(e.date) < startOfToday)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const rows: MeetingAttendanceRow[] = pastMeetings.map((e) => {
      const roster = e.memberAttendance ?? [];
      const presentCount = roster.filter((m) => m.present).length;
      const dateLabel = new Date(e.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return {
        id: e.id,
        label: e.theme ? `${dateLabel} — ${e.theme}` : dateLabel,
        present: roster.length > 0 ? presentCount : null,
        total: roster.length > 0 ? roster.length : null,
      };
    });

    const recorded = aggregate(rows);
    const totalPresent = recorded.reduce((sum, r) => sum + r.present, 0);
    const totalRoster = recorded.reduce((sum, r) => sum + r.total, 0);

    return {
      isLoading: false,
      meetingsConducted: pastMeetings.length,
      attendancePercentage: totalRoster > 0 ? Math.round((totalPresent / totalRoster) * 100) : null,
      meetings: rows,
    };
  }, [club, events, eventsLoading]);
}
