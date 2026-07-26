"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUpdateGuest, useConvertGuest } from "@/hooks/useGuests";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight, UserPlus } from "lucide-react";
import type { GuestDTO } from "@/lib/serializers";

export function GuestConversionPanel({ guest }: { guest: GuestDTO }) {
  const router = useRouter();
  const updateGuest = useUpdateGuest(guest.id);
  const convertGuest = useConvertGuest(guest.id);
  const [approved, setApproved] = useState(false);

  if (guest.convertedToMemberId) {
    return (
      <div className="border rounded-lg p-4 bg-green-50/50 dark:bg-green-950/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <span>
            Converted to club member
            {guest.convertedAt && ` on ${new Date(guest.convertedAt).toLocaleDateString("en-MY", { year: "numeric", month: "short", day: "numeric" })}`}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0"
          render={<Link href={`/members/${guest.convertedToMemberId}`} />}
        >
          View member <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  function handleConvert() {
    convertGuest.mutate(undefined, {
      onSuccess: (member) => {
        toast.success(`${guest.fullName} is now a club member`);
        router.push(`/members/${member.id}`);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-semibold">Convert to Member</h3>

      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          className="accent-primary"
          checked={guest.feePaid}
          onChange={(e) => updateGuest.mutate({ feePaid: e.target.checked })}
        />
        Membership fee received
      </label>

      <label
        className={`flex items-center gap-2 text-sm select-none ${guest.feePaid ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
      >
        <input
          type="checkbox"
          className="accent-primary"
          checked={approved}
          disabled={!guest.feePaid}
          onChange={(e) => setApproved(e.target.checked)}
        />
        I approve converting this guest into a club member
      </label>

      <Button
        type="button"
        size="sm"
        className="gap-2"
        disabled={!guest.feePaid || !approved || convertGuest.isPending}
        onClick={handleConvert}
      >
        <UserPlus className="h-4 w-4" />
        {convertGuest.isPending ? "Converting…" : "Convert to Member"}
      </Button>
    </div>
  );
}
