"use client";

import { Badge } from "@/components/ui/badge";
import { useUpdateMember } from "@/hooks/useMembers";
import { MEMBER_PAYMENT_LABELS, type MemberPaymentStatus } from "@/lib/memberConstants";
import { toast } from "sonner";

export function MemberPaymentToggle({ id, status }: { id: string; status: MemberPaymentStatus }) {
  const updateMember = useUpdateMember(id);

  function toggle() {
    const next: MemberPaymentStatus = status === "paid" ? "unpaid" : "paid";
    updateMember.mutate(
      { paymentStatus: next },
      { onError: (err) => toast.error(err.message) },
    );
  }

  return (
    <button type="button" onClick={toggle} disabled={updateMember.isPending} className="cursor-pointer disabled:opacity-50">
      <Badge
        variant={status === "paid" ? "default" : "destructive"}
        className={status === "paid" ? "bg-green-600 text-white hover:bg-green-700" : ""}
      >
        {MEMBER_PAYMENT_LABELS[status]}
      </Badge>
    </button>
  );
}
