"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PublicEvent = {
  id: string;
  meetingNumber: number;
  date: string;
  startTime: string;
  theme: string;
  venue: string;
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function PublicUpcomingEvents() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/events")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl border border-[#E7DAC6] bg-[#F5EEE1] animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-[#7B6B5C] py-4">No upcoming meetings scheduled yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((e) => (
        <div
          key={e.id}
          className="flex flex-col gap-4 rounded-2xl border border-[#E7DAC6] bg-[#FBF6EC] p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-serif text-xl text-[#2A201A]">
              {e.theme || `Meeting #${e.meetingNumber}`}
            </p>
            <p className="mt-1 text-sm text-[#7B6B5C]">
              {fmtDate(e.date)} · {fmtTime(e.startTime)}
            </p>
            {e.venue && (
              <p className="mt-0.5 text-sm text-[#7B6B5C]">{e.venue}</p>
            )}
          </div>
          <Link
            href={`/meetings/${e.id}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#9E1D06] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#83180a]"
          >
            Join
            <span aria-hidden>↗</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
