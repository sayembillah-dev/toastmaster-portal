"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMembers } from "@/hooks/useMembers";
import { useGuests } from "@/hooks/useGuests";
import { useTasks } from "@/hooks/useTasks";
import { useEvents } from "@/hooks/useEvents";
import { useFundSummary } from "@/hooks/useFunds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/fundConstants";
import { FOLLOW_UP_LABELS } from "@/lib/guestConstants";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/taskConstants";
import { cn } from "@/lib/utils";
import {
  Users,
  UserSearch,
  Wallet,
  CheckSquare,
  CalendarDays,
  Crown,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p
                className={cn(
                  "text-2xl font-bold mt-1",
                  tone === "positive" && "text-green-600",
                  tone === "negative" && "text-destructive",
                )}
              >
                {value}
              </p>
            </div>
            <div
              className={cn(
                "p-2 rounded-lg bg-primary/10 text-primary",
                tone === "positive" && "bg-green-100 text-green-600",
                tone === "negative" && "bg-destructive/10 text-destructive",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

const ROLE_LABELS: Record<string, string> = {
  president: "President",
  sergeantAtArms: "Sergeant-at-Arms",
  toastmaster: "Toastmaster",
  generalEvaluator: "General Evaluator",
  tableTopicMaster: "Table Topics Master",
  tableTopicEvaluator: "Table Topics Evaluator",
  ahCounter: "Ah-Counter",
  timer: "Timer",
  grammarian: "Grammarian",
};

export function DashboardScreen() {
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: guests, isLoading: guestsLoading } = useGuests();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: fundSummary, isLoading: fundsLoading } = useFundSummary();

  const isLoading = membersLoading || guestsLoading || tasksLoading || eventsLoading || fundsLoading;

  const activeMembers = members?.filter((m) => m.status === "active") ?? [];
  const leadership = activeMembers
    .filter((m) => m.clubRole !== "Member")
    .sort((a, b) => a.clubRole.localeCompare(b.clubRole));

  const upcomingEvents = useMemo(() => {
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    return (events ?? [])
      .filter((e) => !e.isTemplate && new Date(e.date) >= startOfToday)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const nextEvent = upcomingEvents[0];
  const filledRoleCount = nextEvent
    ? Object.values(nextEvent.roles).filter((v) => v.trim() !== "").length
    : 0;

  const openTasks = (tasks ?? [])
    .filter((t) => t.status === "todo")
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  const guestPipeline = Object.entries(FOLLOW_UP_LABELS).map(([status, label]) => ({
    status,
    label,
    count: (guests ?? []).filter((g) => g.followUpStatus === status).length,
  }));

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Club overview at a glance</p>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Members"
          value={String(activeMembers.length)}
          icon={Users}
          href="/members"
        />
        <StatCard
          label="Upcoming Meetings"
          value={String(upcomingEvents.length)}
          icon={CalendarDays}
          href="/events"
        />
        <StatCard
          label="Open Tasks"
          value={String((tasks ?? []).filter((t) => t.status === "todo").length)}
          icon={CheckSquare}
          href="/tasks"
        />
        <StatCard
          label="Club Balance"
          value={formatAmount(fundSummary?.balance ?? 0)}
          icon={Wallet}
          href="/funds"
          tone={(fundSummary?.balance ?? 0) >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Next meeting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Next Meeting
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextEvent ? (
              <Link href={`/events/${nextEvent.id}`} className="block space-y-3 group">
                <div>
                  <p className="font-medium group-hover:underline">
                    {nextEvent.theme || `Meeting #${nextEvent.meetingNumber || "—"}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(nextEvent.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {nextEvent.startTime}
                  </span>
                  {nextEvent.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {nextEvent.venue}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-muted-foreground">
                    {filledRoleCount} / {Object.keys(ROLE_LABELS).length} roles assigned
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No upcoming meetings scheduled.{" "}
                <Link href="/events" className="underline">
                  Schedule one
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Open Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {openTasks.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No open tasks. Nice work.
              </p>
            ) : (
              <div className="space-y-2">
                {openTasks.map((task) => (
                  <Link
                    key={task.id}
                    href="/tasks"
                    className="flex items-center justify-between gap-3 py-1.5 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm truncate group-hover:underline">{task.title}</p>
                      {task.assignedMemberName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {task.assignedMemberName}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-xs px-1.5 py-0.5 rounded border",
                        PRIORITY_COLORS[task.priority],
                      )}
                    >
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserSearch className="h-4 w-4" />
              Guest Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(guests ?? []).length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No guests logged yet.{" "}
                <Link href="/guests" className="underline">
                  Add one
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                {guestPipeline.map(({ status, label, count }) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <Badge variant={status === "joined" ? "default" : "secondary"}>{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Club leadership */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Club Leadership
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leadership.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No officer roles assigned yet.{" "}
                <Link href="/members" className="underline">
                  Assign roles
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                {leadership.map((member) => (
                  <Link
                    key={member.id}
                    href={`/members/${member.id}`}
                    className="flex items-center justify-between gap-3 py-1 group"
                  >
                    <span className="text-sm truncate group-hover:underline">{member.fullName}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{member.clubRole}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
