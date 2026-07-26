"use client";

import { Badge } from "@/components/ui/badge";
import {
  MEMBER_PAYMENT_BADGE_COLORS,
  MEMBER_PAYMENT_BADGE_VARIANTS,
} from "@/components/members/MemberPaymentBadge";
import { useUpdateMember } from "@/hooks/useMembers";
import { MEMBER_PAYMENT_LABELS, type MemberPaymentStatus } from "@/lib/memberConstants";
import { toast } from "sonner";

// Click cycles through all three statuses in order — use the membership edit form
// (MemberFormDialog) to jump straight to a specific status instead.
const CYCLE_ORDER: MemberPaymentStatus[] = ["unpaid", "paid", "advance_paid"];

export function MemberPaymentToggle({ id, status }: { id: string; status: MemberPaymentStatus }) {
  const updateMember = useUpdateMember(id);

  function toggle() {
    const next = CYCLE_ORDER[(CYCLE_ORDER.indexOf(status) + 1) % CYCLE_ORDER.length];
    updateMember.mutate(
      { paymentStatus: next },
      { onError: (err) => toast.error(err.message) },
    );
  }

  return (
    <button type="button" onClick={toggle} disabled={updateMember.isPending} className="cursor-pointer disabled:opacity-50">
      <Badge variant={MEMBER_PAYMENT_BADGE_VARIANTS[status]} className={MEMBER_PAYMENT_BADGE_COLORS[status]}>
        {MEMBER_PAYMENT_LABELS[status]}
      </Badge>
    </button>
  );
}
