import { Badge } from "@/components/ui/badge";
import { MEMBER_PAYMENT_LABELS, type MemberPaymentStatus } from "@/lib/memberConstants";

export const MEMBER_PAYMENT_BADGE_VARIANTS: Record<MemberPaymentStatus, "default" | "destructive"> = {
  paid: "default",
  unpaid: "destructive",
  advance_paid: "default",
};

export const MEMBER_PAYMENT_BADGE_COLORS: Record<MemberPaymentStatus, string> = {
  paid: "bg-green-600 text-white hover:bg-green-700",
  unpaid: "",
  advance_paid: "bg-blue-600 text-white hover:bg-blue-700",
};

export function MemberPaymentBadge({ status }: { status: MemberPaymentStatus }) {
  return (
    <Badge variant={MEMBER_PAYMENT_BADGE_VARIANTS[status]} className={MEMBER_PAYMENT_BADGE_COLORS[status]}>
      {MEMBER_PAYMENT_LABELS[status]}
    </Badge>
  );
}
