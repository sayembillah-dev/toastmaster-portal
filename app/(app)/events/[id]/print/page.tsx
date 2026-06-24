"use client";

import { use } from "react";
import { Loader2 } from "lucide-react";
import { PrintableAgenda } from "@/components/events/PrintableAgenda";
import { useEvent } from "@/hooks/useEvents";

type Props = { params: Promise<{ id: string }> };

export default function PrintAgendaPage({ params }: Props) {
  const { id } = use(params);
  const { data: event, isLoading, isError } = useEvent(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen text-sm text-muted-foreground">
        Event not found.
      </div>
    );
  }

  return <PrintableAgenda event={event} />;
}
