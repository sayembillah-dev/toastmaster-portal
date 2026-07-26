import { Badge } from "@/components/ui/badge";
import { MEMBER_PAYMENT_LABELS, type MemberPaymentStatus } from "@/lib/memberConstants";

const VARIANT_MAP: Record<MemberPaymentStatus, "default" | "destructive"> = {
  paid: "default",
  unpaid: "destructive",
};

const COLOR_MAP: Record<MemberPaymentStatus, string> = {
  paid: "bg-green-600 text-white hover:bg-green-700",
  unpaid: "",
};

export function MemberPaymentBadge({ status }: { status: MemberPaymentStatus }) {
  return (
    <Badge variant={VARIANT_MAP[status]} className={COLOR_MAP[status]}>
      {MEMBER_PAYMENT_LABELS[status]}
    </Badge>
  );
}
