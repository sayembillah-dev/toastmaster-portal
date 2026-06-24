"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { CLUB_ROLES, MEMBER_STATUSES } from "@/lib/memberConstants";

export type MemberFiltersState = {
  q: string;
  status: string;
  role: string;
};

interface Props {
  filters: MemberFiltersState;
  onChange: (filters: MemberFiltersState) => void;
}

export function MemberFilters({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search members…"
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(v) => onChange({ ...filters, status: !v || v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {MEMBER_STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.role}
        onValueChange={(v) => onChange({ ...filters, role: !v || v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          {CLUB_ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
