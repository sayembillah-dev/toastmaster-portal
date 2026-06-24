"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateEvent } from "@/hooks/useEvents";

export default function NewEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();

  useEffect(() => {
    const date = new Date().toISOString().split("T")[0];
    createEvent
      .mutateAsync({ date, startTime: "18:00", isTemplate: false, meetingNumber: 0 } as Parameters<typeof createEvent.mutateAsync>[0])
      .then((doc) => router.replace(`/events/${doc.id}`))
      .catch(() => {
        toast.error("Failed to create event");
        router.replace("/events");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">Creating event…</p>
      </div>
    </div>
  );
}
