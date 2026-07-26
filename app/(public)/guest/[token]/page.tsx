"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GuestTimerView } from "@/components/events/guest/GuestTimerView";
import { GuestAhCounterView } from "@/components/events/guest/GuestAhCounterView";
import type { GuestRoleDTO } from "@/lib/guestRoleTypes";

type Props = { params: Promise<{ token: string }> };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function GuestRolePage({ params }: Props) {
  const { token } = use(params);
  const [data, setData] = useState<GuestRoleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/public/guest-role/${token}`)
      .then(async (r) => {
        if (!r.ok) { setNotFound(true); return; }
        setData(await r.json());
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5EEE1]">
        <Loader2 className="h-8 w-8 animate-spin text-[#9E1D06]" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F5EEE1] px-4 text-center">
        <p className="font-serif text-2xl text-[#2A201A]">This link isn&rsquo;t active</p>
        <p className="text-[#7B6B5C]">It may have been revoked or regenerated. Ask the organizer for a fresh link.</p>
        <Link href="/meetings" className="text-sm text-[#9E1D06] underline underline-offset-2">
          View upcoming meetings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EEE1] pb-16">
      <div className="bg-[#221A13] px-6 pt-14 pb-8 md:px-16">
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          {data.meetingNumber > 0 && (
            <Badge className="w-fit border-[#9E1D06]/30 bg-[#9E1D06]/20 text-xs text-[#E0A458]">
              Meeting #{data.meetingNumber}
            </Badge>
          )}
          <h1 className="font-serif text-2xl text-white md:text-3xl">{data.eventTitle}</h1>
          <span className="flex items-center gap-1.5 text-sm text-white/60">
            <CalendarDays className="h-4 w-4" />
            {fmtDate(data.date)}
          </span>
          <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white">
            You&rsquo;re running <strong className="font-semibold">{data.roleLabel}</strong>
            {data.roleAssigneeName && <span className="text-white/60">— {data.roleAssigneeName}</span>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6 py-8 md:px-0">
        {data.role === "timer" && <GuestTimerView token={token} data={data} />}
        {data.role === "ahCounter" && <GuestAhCounterView token={token} data={data} />}
      </div>
    </div>
  );
}
