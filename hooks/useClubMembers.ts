"use client";

import { useMemo } from "react";
import { useMembers } from "./useMembers";
import type { AreaClub, AreaClubMember } from "@/lib/areaConstants";

export type ClubMembersResult = {
  isLoading: boolean;
  members: AreaClubMember[];
};

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
        paymentStatus: m.paymentStatus,
      })),
    };
  }, [club, realMembers, isLoading]);
}
