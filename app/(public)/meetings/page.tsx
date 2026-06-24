"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Loader2 } from "lucide-react";

type PublicEvent = {
  id: string;
  meetingNumber: number;
  date: string;
  startTime: string;
  theme: string;
  title: string;
  venue: string;
  speakers: { name: string }[];
  roles: { toastmaster: string };
};

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

export default function MeetingsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/events")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#F5EEE1] min-h-screen">
      {/* Header */}
      <div className="bg-[#221A13] px-6 pt-28 pb-14 md:px-16">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#E0A458]">Open to all</p>
        <h1 className="font-serif text-4xl text-white md:text-5xl lg:text-6xl">
          Upcoming Meetings
        </h1>
        <p className="mt-4 max-w-md text-base text-white/60 leading-relaxed">
          Guests are always welcome. Come sit in, see how it works, and speak only when you're ready.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 md:px-16">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#9E1D06]" />
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-16">
            <p className="font-serif text-2xl text-[#2A201A]">No upcoming meetings yet</p>
            <p className="mt-2 text-[#7B6B5C]">Check back soon — we meet four times a month.</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="flex flex-col gap-4">
            {events.map((e) => (
              <div
                key={e.id}
                className="rounded-2xl border border-[#E7DAC6] bg-[#FBF6EC] p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 min-w-0">
                  {e.meetingNumber > 0 && (
                    <p className="text-xs font-medium text-[#9E1D06] uppercase tracking-wide mb-1">
                      Meeting #{e.meetingNumber}
                    </p>
                  )}
                  <h2 className="font-serif text-xl text-[#2A201A] truncate">
                    {e.theme || e.title || "General Meeting"}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-[#7B6B5C]">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      {fmtDate(e.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {fmtTime(e.startTime)}
                    </span>
                    {e.venue && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {e.venue}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/meetings/${e.id}`}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#9E1D06] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#83180a]"
                >
                  View & Join
                  <span aria-hidden>↗</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
