"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAreaClubs } from "@/hooks/useAreaClubs";
import { useClubMeetingStats } from "@/hooks/useClubMeetingStats";
import { useClubMembers } from "@/hooks/useClubMembers";
import { useTickets } from "@/hooks/useTickets";
import { StatTile } from "./StatTile";
import { CreateTicketDialog } from "./CreateTicketDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MemberPaymentBadge } from "@/components/members/MemberPaymentBadge";
import { DateRangeSelect } from "@/components/shared/DateRangeSelect";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketDetailModal } from "@/components/shared/TicketDetailModal";
import { cn } from "@/lib/utils";
import { STATUS_BADGE_STYLES, type AreaClub } from "@/lib/areaConstants";
import { resolveDateRange, isWithinRange, type DateRangePreset } from "@/lib/dateRangeConstants";
import { ticketStatus, TICKET_STATUS_STYLES, type GlobalTicket } from "@/lib/ticketConstants";
import {
  ArrowLeft,
  Building2,
  Star,
  Clock,
  MapPin,
  Users,
  CalendarCheck,
  Percent,
  Ticket,
  Gauge,
  Plus,
} from "lucide-react";

function KpiTile({ label, value }: { label: string; value: number }) {
  const tone = value >= 70 ? "bg-green-500" : value >= 40 ? "bg-amber-500" : "bg-destructive";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ClubDetailScreen({ clubId }: { clubId: string }) {
  const { clubs, isLoading } = useAreaClubs();

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const club = clubs.find((c) => c.id === clubId);

  if (!club) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
        <Link href="/area/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Area Dashboard
        </Link>
        <p className="text-muted-foreground">Club not found.</p>
      </div>
    );
  }

  return <ClubDetailContent club={club} />;
}

function ClubDetailContent({ club }: { club: AreaClub }) {
  const [range, setRange] = useState<DateRangePreset>("this_month");
  const meetingStats = useClubMeetingStats(club, range);
  const memberStats = useClubMembers(club);
  const { tickets, addTicket, updateTicket, deleteTicket, setTicketResolved } = useTickets();
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const dateRange = useMemo(() => resolveDateRange(range), [range]);
  const clubTickets = useMemo(
    () =>
      tickets.filter((t) => t.parties.some((p) => p.clubId === club.id)).filter((t) => {
        const d = new Date(t.date);
        return !Number.isNaN(d.getTime()) && isWithinRange(d, dateRange);
      }),
    [tickets, club.id, dateRange],
  );
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? null;

  const attendanceTone =
    meetingStats.attendancePercentage === null
      ? "default"
      : meetingStats.attendancePercentage >= 70
        ? "positive"
        : meetingStats.attendancePercentage < 40
          ? "negative"
          : "default";

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/area/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Area Dashboard
        </Link>
        <Button type="button" size="sm" className="gap-1.5" onClick={() => setTicketDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {club.name}
              {club.isHomeClub && (
                <Badge variant="outline" className="gap-1 border-indigo-200 text-indigo-600">
                  <Star className="h-3 w-3" />
                  Your Club
                </Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
              <span>Club #{club.clubNumber}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {club.meetingDay}s, {club.meetingTime}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {club.location}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DateRangeSelect value={range} onChange={setRange} />
          <Badge variant="outline" className={cn(STATUS_BADGE_STYLES[club.status])}>
            {club.status}
          </Badge>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Members"
          value={memberStats.isLoading ? "—" : String(memberStats.members.length)}
          icon={Users}
        />
        <StatTile
          label="Meetings Held"
          value={meetingStats.isLoading ? "—" : String(meetingStats.meetingsConducted)}
          icon={CalendarCheck}
        />
        <StatTile
          label="Attendance %"
          value={
            meetingStats.isLoading
              ? "—"
              : meetingStats.attendancePercentage !== null
                ? `${meetingStats.attendancePercentage}%`
                : "N/A"
          }
          icon={Percent}
          tone={attendanceTone}
        />
        <StatTile label="Tickets" value={String(clubTickets.length)} icon={Ticket} />
      </div>

      {/* Meeting list | Role activeness */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Meeting List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {meetingStats.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : meetingStats.meetings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No meetings recorded yet.</p>
            ) : (
              <div className="divide-y border rounded-lg overflow-hidden">
                {meetingStats.meetings.map((m) => {
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Role Activeness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground -mt-1">
              Placeholder scores — will be computed from each officer&apos;s audit trail (e.g.
              agendas initiated and finalized) once that tracking exists.
            </p>
            {club.roleActivity.map((r) => (
              <KpiTile key={r.role} label={r.role} value={r.activityPercentage} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Members | Tickets */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Club Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {memberStats.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : memberStats.members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No members yet.</p>
            ) : (
              <div className="divide-y border rounded-lg overflow-hidden">
                {memberStats.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                    </div>
                    <MemberPaymentBadge status={m.paymentStatus} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Recent Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clubTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No tickets.</p>
            ) : (
              <div className="divide-y border rounded-lg overflow-hidden">
                {clubTickets.map((t) => {
                  const status = ticketStatus(t);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTicketId(t.id)}
                      className="w-full px-3 py-2.5 space-y-1.5 text-left hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium">{t.title}</p>
                        <Badge variant="outline" className={cn("text-xs shrink-0", TICKET_STATUS_STYLES[status])}>
                          {status}
                        </Badge>
                      </div>
                      {t.description && (
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created by <span className="font-medium text-foreground">{t.createdBy}</span> · {t.severity} severity · {t.date}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateTicketDialog
        open={ticketDialogOpen}
        onOpenChange={setTicketDialogOpen}
        club={club}
        onCreate={addTicket}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        open={selectedTicketId !== null}
        onOpenChange={(open) => { if (!open) setSelectedTicketId(null); }}
        onResolveTicket={setTicketResolved}
        onUpdate={updateTicket}
        onDelete={(id) => { deleteTicket(id); setSelectedTicketId(null); }}
      />
    </div>
  );
}
