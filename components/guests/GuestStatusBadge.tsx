import { Badge } from "@/components/ui/badge";
import { FOLLOW_UP_LABELS, type FollowUpStatus } from "@/lib/guestConstants";

const VARIANT_MAP: Record<FollowUpStatus, "default" | "secondary" | "destructive" | "outline"> = {
  new: "outline",
  contacted: "secondary",
  interested: "default",
  not_interested: "destructive",
  joined: "default",
};

const COLOR_MAP: Record<FollowUpStatus, string> = {
  new: "",
  contacted: "",
  interested: "",
  not_interested: "",
  joined: "bg-green-600 text-white hover:bg-green-700",
};

export function GuestStatusBadge({ status }: { status: FollowUpStatus }) {
  return (
    <Badge variant={VARIANT_MAP[status]} className={COLOR_MAP[status]}>
      {FOLLOW_UP_LABELS[status]}
    </Badge>
  );
}
