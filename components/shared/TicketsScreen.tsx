"use client";

import { useMemo, useState } from "react";
import { useTickets } from "@/hooks/useTickets";
import { TicketDetailModal } from "./TicketDetailModal";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { HOME_CLUB_ID } from "@/lib/areaConstants";
import {
  ticketStatus,
  sameName,
  partyLabel,
  partyDisplayKey,
  CURRENT_USER_LABEL,
  TICKET_STATUS_STYLES,
  TICKET_SEVERITY_STYLES,
  type GlobalTicket,
} from "@/lib/ticketConstants";
import { Building2, User, UserPen, ArrowUpCircle, TicketX } from "lucide-react";

type Tab = "created" | "tagged";
type Props = { scope: "club" | "area"; title: string; subtitle?: string };

const PARTY_ICON = { club: Building2, person: User, division: ArrowUpCircle } as const;

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
        active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function TicketRow({ ticket, onClick }: { ticket: GlobalTicket; onClick: () => void }) {
  const status = ticketStatus(ticket);
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-3 py-3 space-y-2 text-left hover:bg-muted/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{ticket.title}</p>
        <Badge variant="outline" className={cn("text-xs shrink-0", TICKET_STATUS_STYLES[status])}>
          {status}
        </Badge>
      </div>
      {ticket.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
      )}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <UserPen className="h-3 w-3 shrink-0" />
        <span>
          Created by <span className="font-medium text-foreground">{ticket.createdBy}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn("text-xs", TICKET_SEVERITY_STYLES[ticket.severity])}>
          {ticket.severity}
        </Badge>
        <span className="text-xs text-muted-foreground">{ticket.date}</span>
      </div>
      {ticket.parties.length > 0 && (
        <div className="flex items-start gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground shrink-0 pt-0.5">Involved:</span>
          <div className="flex flex-wrap gap-1">
            {ticket.parties.map((p) => {
              const Icon = PARTY_ICON[p.type];
              return (
                <Badge key={partyDisplayKey(p)} variant="secondary" className="text-xs gap-1">
                  <Icon className="h-3 w-3" />
                  {partyLabel(p)}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </button>
  );
}

export function TicketsScreen({ scope, title, subtitle }: Props) {
  const { tickets, isLoading, updateTicket, deleteTicket, setTicketResolved } = useTickets();
  const [tab, setTab] = useState<Tab>("created");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const scoped = useMemo(
    () =>
      scope === "club"
        ? tickets.filter((t) => t.parties.some((p) => p.clubId === HOME_CLUB_ID))
        : tickets,
    [tickets, scope],
  );

  const created = useMemo(
    () => scoped.filter((t) => sameName(t.createdBy, CURRENT_USER_LABEL)),
    [scoped],
  );
  const taggedIn = useMemo(
    () => scoped.filter((t) => t.parties.some((p) => p.type === "person" && sameName(p.name, CURRENT_USER_LABEL))),
    [scoped],
  );
  const visible = tab === "created" ? created : taggedIn;
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? null;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-64" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex gap-1 border-b">
        <TabButton active={tab === "created"} onClick={() => setTab("created")}>
          Tickets you created ({created.length})
        </TabButton>
        <TabButton active={tab === "tagged"} onClick={() => setTab("tagged")}>
          Tickets you&apos;re tagged in ({taggedIn.length})
        </TabButton>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 text-center py-16 text-muted-foreground">
          <TicketX className="h-8 w-8" />
          <p className="text-sm">
            {tab === "created" ? "You haven't created any tickets yet." : "No tickets are tagged to you yet."}
          </p>
        </div>
      ) : (
        <div className="divide-y border rounded-lg overflow-hidden">
          {visible.map((t) => (
            <TicketRow key={t.id} ticket={t} onClick={() => setSelectedTicketId(t.id)} />
          ))}
        </div>
      )}

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
