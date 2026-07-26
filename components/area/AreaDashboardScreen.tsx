"use client";

import { useState } from "react";
import { useAreaClubs } from "@/hooks/useAreaClubs";
import { useTickets } from "@/hooks/useTickets";
import { AreaClubCard } from "./AreaClubCard";
import { CreateAreaTicketDialog } from "./CreateAreaTicketDialog";
import { DateRangeSelect } from "@/components/shared/DateRangeSelect";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AREA_NAME, AREA_DIVISION } from "@/lib/areaConstants";
import type { DateRangePreset } from "@/lib/dateRangeConstants";
import { Plus } from "lucide-react";

export function AreaDashboardScreen() {
  const { clubs, isLoading } = useAreaClubs();
  const { addTicket } = useTickets();
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [range, setRange] = useState<DateRangePreset>("this_month");

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{AREA_NAME} Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {AREA_DIVISION} · {clubs.length} clubs under your area
            </p>
          </div>
          <DateRangeSelect value={range} onChange={setRange} />
        </div>
        <Button type="button" size="sm" className="gap-1.5" onClick={() => setTicketDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => (
          <AreaClubCard key={club.id} club={club} range={range} />
        ))}
      </div>

      <CreateAreaTicketDialog
        open={ticketDialogOpen}
        onOpenChange={setTicketDialogOpen}
        clubs={clubs}
        onCreate={addTicket}
      />
    </div>
  );
}
