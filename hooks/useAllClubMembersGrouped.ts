"use client";

import { useMemo } from "react";
import { useClubMembers } from "./useClubMembers";
import type { AreaClub, AreaClubMember } from "@/lib/areaConstants";

export type ClubMemberGroup = {
  clubId: string;
  clubName: string;
  members: AreaClubMember[];
};

// Only the home club needs a live fetch (via useClubMembers -> useMembers); every other
// club's roster is already sitting in local state, so this needs exactly one hook call
// regardless of how many clubs exist.
export function useAllClubMembersGrouped(clubs: AreaClub[]): {
  isLoading: boolean;
  groups: ClubMemberGroup[];
} {
  const homeClub = clubs.find((c) => c.isHomeClub) ?? clubs[0];
  const homeMembers = useClubMembers(homeClub);

  return useMemo(() => {
    const groups: ClubMemberGroup[] = clubs.map((c) => ({
      clubId: c.id,
      clubName: c.name,
      // Global tickets only tag officers, not the general membership.
      members: (c.isHomeClub ? homeMembers.members : c.members).filter((m) => m.role !== "Member"),
    }));
    return { isLoading: homeMembers.isLoading, groups };
  }, [clubs, homeMembers]);
}
