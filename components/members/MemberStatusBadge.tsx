import { Badge } from "@/components/ui/badge";
import type { MemberStatus } from "@/lib/memberConstants";

const VARIANT_MAP: Record<MemberStatus, "default" | "secondary" | "destructive"> = {
  active: "default",
  inactive: "secondary",
  suspended: "destructive",
};

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return (
    <Badge variant={VARIANT_MAP[status]} className="capitalize">
      {status}
    </Badge>
  );
}
