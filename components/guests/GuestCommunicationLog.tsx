"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddGuestLog } from "@/hooks/useGuests";
import { COMMUNICATION_CHANNELS, COMMUNICATION_CHANNEL_LABELS, type CommunicationChannel } from "@/lib/guestConstants";
import type { CommunicationLogEntryDTO } from "@/lib/serializers";
import { toast } from "sonner";
import { MessageSquarePlus, Phone, MessageCircle, Mail, UserRound, MoreHorizontal } from "lucide-react";

const CHANNEL_ICONS: Record<CommunicationChannel, React.ElementType> = {
  call: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  in_person: UserRound,
  other: MoreHorizontal,
};

function formatWhen(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function GuestCommunicationLog({ guestId, entries }: { guestId: string; entries: CommunicationLogEntryDTO[] }) {
  const addLog = useAddGuestLog(guestId);
  const [channel, setChannel] = useState<CommunicationChannel>("call");
  const [message, setMessage] = useState("");

  function handleSubmit() {
    if (!message.trim()) return;
    addLog.mutate(
      { channel, message: message.trim() },
      {
        onSuccess: () => {
          setMessage("");
          toast.success("Logged");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Communication Log</h3>

      <div className="flex gap-2">
        <Select value={channel} onValueChange={(v) => v && setChannel(v as CommunicationChannel)}>
          <SelectTrigger className="w-36 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMMUNICATION_CHANNELS.map((c) => (
              <SelectItem key={c} value={c}>
                {COMMUNICATION_CHANNEL_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What happened in this touchpoint?"
          rows={1}
          className="min-h-9 resize-none"
        />
        <Button
          type="button"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={handleSubmit}
          disabled={!message.trim() || addLog.isPending}
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          Log
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No communication logged yet.</p>
      ) : (
        <div className="border rounded-lg divide-y">
          {entries.map((entry, i) => {
            const Icon = CHANNEL_ICONS[entry.channel];
            return (
              <div key={i} className="flex items-start gap-3 px-3 py-2.5">
                <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{entry.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {COMMUNICATION_CHANNEL_LABELS[entry.channel]} · {formatWhen(entry.loggedAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
