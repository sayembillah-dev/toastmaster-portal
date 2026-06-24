import type { AgendaRoleKey } from "@/lib/eventConstants";
import type { SpeakerDTO, AttendeeDTO, ResourceDTO, TimerEntryDTO, TableTopicQuestionDTO, AhCounterEntryDTO } from "@/lib/serializers";

export type EventFormState = {
  title: string;
  meetingNumber: string;
  date: string;
  startTime: string;
  theme: string;
  venue: string;
  isTemplate: boolean;
  templateName: string;
  roles: Record<AgendaRoleKey, string>;
  speakers: SpeakerDTO[];
  wordOfDay: { word: string; partOfSpeech: string; meaning: string; example: string };
  joinUrl: string;
  tableTopicQuestions: TableTopicQuestionDTO[];
  attendees: AttendeeDTO[];
  resources: ResourceDTO[];
  timerEntries: TimerEntryDTO[];
  fillerWords: string[];
  ahCounterReport: AhCounterEntryDTO[];
};

export type UpdateFormFn = (patch: Partial<EventFormState>, immediate?: boolean) => void;
