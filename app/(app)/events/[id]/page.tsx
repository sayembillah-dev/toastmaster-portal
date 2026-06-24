"use client";

import { use } from "react";
import { Loader2 } from "lucide-react";
import { EventDetailPage } from "@/components/events/EventDetailPage";
import { useEvent } from "@/hooks/useEvents";

type Props = { params: Promise<{ id: string }> };

export default function EventPage({ params }: Props) {
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

  return <EventDetailPage event={event} />;
}
