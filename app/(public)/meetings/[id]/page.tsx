"use client";

import { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, MapPin, CheckCircle2, Loader2, User, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { buildAgendaSchedule } from "@/lib/agendaSchedule";
import { AGENDA_ROLE_LABELS } from "@/lib/eventConstants";
import type { EventDTO } from "@/lib/serializers";

type PublicEvent = Omit<EventDTO, "attendees">;

type Props = { params: Promise<{ id: string }> };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

// ── Join Form ─────────────────────────────────────────────────────────────────
type JoinFormState = { fullName: string; email: string; phone: string; details: string };
const EMPTY: JoinFormState = { fullName: "", email: "", phone: "", details: "" };

function JoinForm({ eventId }: { eventId: string }) {
  const [form, setForm] = useState<JoinFormState>(EMPTY);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = <K extends keyof JoinFormState>(k: K, v: JoinFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("whatsapp", form.phone);
      fd.append("whatsappSameAsPhone", "true");
      fd.append("details", form.details);
      fd.append("eventId", eventId);
      if (photo) fd.append("photo", photo);

      const res = await fetch("/api/public/join", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error?.message ?? "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircle2 className="h-14 w-14 text-green-500" />
        <h3 className="text-xl font-bold text-[#2A201A]">You're registered!</h3>
        <p className="text-sm text-[#7B6B5C] max-w-xs">
          Thanks, <strong>{form.fullName}</strong>. We've added you to the guest list for this meeting. See you there!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Photo */}
      <div className="flex flex-col items-center gap-2">
        <label htmlFor="join-photo" className="relative cursor-pointer group">
          {preview ? (
            <img src={preview} alt="Your photo" className="h-20 w-20 rounded-full object-cover border-2 border-[#E7DAC6]" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-[#F5EEE1] flex items-center justify-center border-2 border-dashed border-[#E7DAC6] group-hover:border-[#9E1D06] transition-colors">
              <User className="h-8 w-8 text-[#7B6B5C]" />
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 bg-[#9E1D06] text-white rounded-full p-1.5 shadow-md group-hover:bg-[#83180a] transition-colors pointer-events-none">
            <Camera className="h-3 w-3" />
          </span>
          <input id="join-photo" type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
        </label>
        <p className="text-xs text-[#7B6B5C]">Add a photo (optional)</p>
      </div>

      <div>
        <Label htmlFor="jf-name" className="text-sm font-medium text-[#2A201A]">Full name *</Label>
        <Input
          id="jf-name"
          value={form.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          placeholder="Your full name"
          required
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="jf-email" className="text-sm font-medium text-[#2A201A]">Email</Label>
          <Input
            id="jf-email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="jf-phone" className="text-sm font-medium text-[#2A201A]">Phone</Label>
          <Input
            id="jf-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+60 12-345 6789"
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="jf-details" className="text-sm font-medium text-[#2A201A]">About yourself (optional)</Label>
        <Textarea
          id="jf-details"
          value={form.details}
          onChange={(e) => set("details", e.target.value)}
          placeholder="Profession, how you heard about us…"
          rows={3}
          className="mt-1 resize-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#9E1D06] hover:bg-[#83180a] text-white"
      >
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Registering…</> : "Confirm My Spot"}
      </Button>
      <p className="text-xs text-center text-[#7B6B5C]">Your info is only shared with the club committee.</p>
    </form>
  );
}

// ── Agenda view ───────────────────────────────────────────────────────────────
function ReadonlyAgenda({ event }: { event: PublicEvent }) {
  const schedule = buildAgendaSchedule(event as EventDTO);

  const filledRoles = Object.entries(event.roles).filter(([, v]) => v);

  return (
    <div className="space-y-6">
      {/* Roles */}
      {filledRoles.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9E1D06] mb-3">
            Today's Roles
          </h3>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {filledRoles.map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-[#E7DAC6] bg-[#FBF6EC] px-3 py-2 text-sm">
                <span className="text-[#7B6B5C]">
                  {AGENDA_ROLE_LABELS[key as keyof typeof AGENDA_ROLE_LABELS] ?? key}
                </span>
                <span className="font-medium text-[#2A201A]">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Speakers */}
      {event.speakers.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9E1D06] mb-3">
            Prepared Speakers
          </h3>
          <div className="space-y-2">
            {event.speakers.map((s, i) => (
              <div key={`speaker-${i}`} className="rounded-lg border border-[#E7DAC6] bg-[#FBF6EC] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#9E1D06]">#{i + 1}</span>
                  <span className="font-medium text-[#2A201A]">{s.name || "TBA"}</span>
                  <span className="ml-auto text-xs text-[#7B6B5C]">{s.duration} min</span>
                </div>
                {s.speechTitle && (
                  <p className="text-sm italic text-[#7B6B5C] mt-0.5">"{s.speechTitle}"</p>
                )}
                {(s.speechProject || s.speechLevel) && (
                  <p className="text-xs text-[#7B6B5C]/70 mt-0.5">
                    {[s.speechProject, s.speechLevel].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Word of Day */}
      {event.wordOfDay.word && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9E1D06] mb-3">
            Word of the Day
          </h3>
          <div className="rounded-lg border border-[#E7DAC6] bg-[#FBF6EC] px-4 py-3">
            <p className="font-serif text-2xl text-[#2A201A]">
              {event.wordOfDay.word}
              {event.wordOfDay.partOfSpeech && (
                <span className="ml-2 text-sm font-sans font-normal text-[#7B6B5C] italic">
                  {event.wordOfDay.partOfSpeech}
                </span>
              )}
            </p>
            {event.wordOfDay.meaning && (
              <p className="mt-1 text-sm text-[#7B6B5C]">{event.wordOfDay.meaning}</p>
            )}
            {event.wordOfDay.example && (
              <p className="mt-1 text-sm italic text-[#7B6B5C]/80">"{event.wordOfDay.example}"</p>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      {schedule.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9E1D06] mb-3">
            Agenda Timeline
          </h3>
          <div className="rounded-xl border border-[#E7DAC6] overflow-hidden">
            {schedule.map((row, i) => (
              <div key={`row-${i}`}>
                <div className={`flex items-start gap-3 px-4 py-3 text-sm ${row.bold ? "bg-[#F5EEE1] font-semibold" : "bg-[#FBF6EC]"} ${i > 0 ? "border-t border-[#E7DAC6]" : ""}`}>
                  <span className="w-16 shrink-0 text-xs font-medium text-[#9E1D06]">{row.time}</span>
                  <span className="flex-1 text-[#2A201A]">{row.label}</span>
                  {row.person && <span className="text-[#7B6B5C] text-xs shrink-0">{row.person}</span>}
                  {row.duration != null && (
                    <span className="text-xs text-[#7B6B5C] shrink-0">{row.duration}′</span>
                  )}
                </div>
                {row.subRows?.map((sub, si) => (
                  <div key={`sub-${i}-${si}`} className={`flex items-start gap-3 pl-8 pr-4 py-1.5 text-xs bg-[#FBF6EC] border-t border-[#E7DAC6]/60 ${sub.italic ? "italic text-[#7B6B5C]" : "text-[#2A201A]"}`}>
                    <span className="w-16 shrink-0" />
                    <span className="flex-1">{sub.label}</span>
                    {sub.person && <span className="text-[#7B6B5C] shrink-0">{sub.person}</span>}
                    {sub.duration != null && <span className="text-[#7B6B5C] shrink-0">{sub.duration}′</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PublicMeetingPage({ params }: Props) {
  const { id } = use(params);
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const joinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/public/events/${id}`)
      .then(async (r) => {
        if (!r.ok) { setNotFound(true); return; }
        setEvent(await r.json());
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#9E1D06]" />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <p className="text-2xl font-serif text-[#2A201A]">Meeting not found</p>
        <p className="text-[#7B6B5C]">This meeting may have been removed or the link is invalid.</p>
        <Link href="/meetings" className="text-sm text-[#9E1D06] underline underline-offset-2">
          View all upcoming meetings
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F5EEE1] min-h-screen pb-20">
      {/* Header strip */}
      <div className="bg-[#221A13] px-6 pt-28 pb-10 md:px-16">
        <Link href="/meetings" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          All meetings
        </Link>
        <div className="flex flex-col gap-2 max-w-2xl">
          {event.meetingNumber > 0 && (
            <Badge className="w-fit bg-[#9E1D06]/20 text-[#E0A458] border-[#9E1D06]/30 text-xs">
              Meeting #{event.meetingNumber}
            </Badge>
          )}
          <h1 className="font-serif text-3xl text-white md:text-4xl">
            {event.theme || event.title || "General Meeting"}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-white/60 mt-1">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {fmtDate(event.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {fmtTime(event.startTime)}
            </span>
            {event.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {event.venue}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => joinRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#9E1D06] px-6 py-3 text-sm font-medium text-white hover:bg-[#83180a] transition-colors"
        >
          Join This Meeting ↗
        </button>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 py-10 md:px-16 space-y-12">
        {/* Agenda */}
        <ReadonlyAgenda event={event} />

        {/* Join form */}
        <div ref={joinRef} className="rounded-2xl border border-[#E7DAC6] bg-white p-6 md:p-8 shadow-sm">
          <h2 className="font-serif text-2xl text-[#2A201A] mb-1">Join This Meeting</h2>
          <p className="text-sm text-[#7B6B5C] mb-6">
            Fill in your details and we'll add you to the guest list.
          </p>
          <JoinForm eventId={id} />
        </div>
      </div>
    </div>
  );
}
