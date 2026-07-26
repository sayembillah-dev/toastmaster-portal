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
  TICKET_STATUS_STYLES,
  TICKET_SEVERITY_STYLES,
  type GlobalTicket,
} from "@/lib/ticketConstants";
import { Building2, User, ArrowUpCircle, TicketX } from "lucide-react";

type Tab = "mine" | "all";
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
      className="w-full px-3 py-3 space-y-1.5 text-left hover:bg-muted/40 transition-colors"
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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", TICKET_SEVERITY_STYLES[ticket.severity])}>
            {ticket.severity}
          </Badge>
          <span className="text-xs text-muted-foreground">{ticket.date}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {ticket.parties.map((p) => {
            const Icon = PARTY_ICON[p.type];
            return (
              <Badge
                key={`${p.type}-${p.clubId ?? ""}-${p.name}`}
                variant="secondary"
                className={cn("text-xs gap-1", p.resolved && "opacity-60 line-through")}
              >
                <Icon className="h-3 w-3" />
                {p.name}
              </Badge>
            );
          })}
        </div>
      </div>
    </button>
  );
}

export function TicketsScreen({ scope, title, subtitle }: Props) {
  const { tickets, isLoading, updateTicket, deleteTicket, setPartyResolved } = useTickets();
  const [tab, setTab] = useState<Tab>("mine");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const scoped = useMemo(
    () =>
      scope === "club"
        ? tickets.filter((t) => t.parties.some((p) => p.clubId === HOME_CLUB_ID))
        : tickets,
    [tickets, scope],
  );

  const mine = useMemo(() => scoped.filter((t) => ticketStatus(t) !== "Resolved"), [scoped]);
  const visible = tab === "mine" ? mine : scoped;
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
        <TabButton active={tab === "mine"} onClick={() => setTab("mine")}>
          My Tickets ({mine.length})
        </TabButton>
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>
          Tickets ({scoped.length})
        </TabButton>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 text-center py-16 text-muted-foreground">
          <TicketX className="h-8 w-8" />
          <p className="text-sm">
            {tab === "mine" ? "Nothing needs your attention right now." : "No tickets yet."}
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
        onResolveParty={setPartyResolved}
        onUpdate={updateTicket}
        onDelete={(id) => { deleteTicket(id); setSelectedTicketId(null); }}
      />
    </div>
  );
}
