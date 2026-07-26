"use client";

import { useMemo } from "react";
import { useMembers } from "./useMembers";
import type { AreaClub, AreaClubMember } from "@/lib/areaConstants";

export type ClubMembersResult = {
  isLoading: boolean;
  members: AreaClubMember[];
};

// No dues/payment field exists on the real Member model yet — derive a stable,
// deterministic Paid/Unpaid placeholder per member id until that field exists.
function deterministicPaid(id: string): boolean {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % 100;
  return hash % 3 !== 0;
}

export function useClubMembers(club: AreaClub): ClubMembersResult {
  const { data: realMembers, isLoading } = useMembers();

  return useMemo(() => {
    if (!club.isHomeClub) {
      return { isLoading: false, members: club.members };
    }

    if (isLoading || !realMembers) {
      return { isLoading: true, members: [] };
    }

    const active = realMembers.filter((m) => m.status === "active");
    return {
      isLoading: false,
      members: active.map((m) => ({
        id: m.id,
        name: m.fullName,
        role: m.clubRole,
        paid: deterministicPaid(m.id),
      })),
    };
  }, [club, realMembers, isLoading]);
}
