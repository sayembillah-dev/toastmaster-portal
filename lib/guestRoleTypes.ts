import type { TimerEntryDTO, AhCounterEntryDTO } from "@/lib/serializers";
import type { AgendaRoleKey } from "@/lib/eventConstants";

export type GuestRoleBaseDTO = {
  eventId: string;
  eventTitle: string;
  meetingNumber: number;
  date: string;
  role: AgendaRoleKey;
  roleLabel: string;
  roleAssigneeName: string;
};

export type GuestTimerRoleDTO = GuestRoleBaseDTO & { role: "timer"; timerEntries: TimerEntryDTO[] };
export type GuestAhCounterRoleDTO = GuestRoleBaseDTO & {
  role: "ahCounter";
  fillerWords: string[];
  ahCounterReport: AhCounterEntryDTO[];
};

export type GuestRoleDTO = GuestTimerRoleDTO | GuestAhCounterRoleDTO;
