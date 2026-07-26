"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTickets } from "@/hooks/useTickets";
import { HOME_CLUB_ID } from "@/lib/areaConstants";
import { ticketStatus, TICKET_STATUS_STYLES } from "@/lib/ticketConstants";
import { TicketDetailModal } from "./TicketDetailModal";

type Props = {
  scope: "club" | "area";
};

export function TicketNotificationBell({ scope }: Props) {
  const router = useRouter();
  const { tickets, updateTicket, deleteTicket, setPartyResolved } = useTickets();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const relevant = useMemo(() => {
    const scoped =
      scope === "club" ? tickets.filter((t) => t.parties.some((p) => p.clubId === HOME_CLUB_ID)) : tickets;
    return scoped.filter((t) => ticketStatus(t) !== "Resolved");
  }, [tickets, scope]);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? null;
  const ticketsHref = scope === "club" ? "/tickets" : "/area/tickets";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="relative flex items-center justify-center rounded-md border h-8 w-8 hover:bg-accent cursor-pointer">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {relevant.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {relevant.length > 9 ? "9+" : relevant.length}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Tickets needing attention</DropdownMenuLabel>
            {relevant.length === 0 ? (
              <p className="px-1.5 py-4 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
            ) : (
              relevant.slice(0, 8).map((t) => {
                const status = ticketStatus(t);
                return (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className="flex-col items-start gap-1 py-2"
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="text-sm truncate">{t.title}</span>
                      <Badge variant="outline" className={cn("text-xs shrink-0", TICKET_STATUS_STYLES[status])}>
                        {status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{t.severity} severity · {t.date}</span>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(ticketsHref)}>View all tickets</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TicketDetailModal
        ticket={selectedTicket}
        open={selectedTicketId !== null}
        onOpenChange={(open) => { if (!open) setSelectedTicketId(null); }}
        onResolveParty={setPartyResolved}
        onUpdate={updateTicket}
        onDelete={(id) => { deleteTicket(id); setSelectedTicketId(null); }}
      />
    </>
  );
}
