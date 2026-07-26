"use client";

import { useCallback, useEffect, useState } from "react";
import { AREA_CLUBS_STORAGE_KEY, SEED_AREA_CLUBS, type AreaClub } from "@/lib/areaConstants";

function loadAreaClubs(): AreaClub[] {
  if (typeof window === "undefined") return SEED_AREA_CLUBS;
  try {
    const raw = window.localStorage.getItem(AREA_CLUBS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(AREA_CLUBS_STORAGE_KEY, JSON.stringify(SEED_AREA_CLUBS));
      return SEED_AREA_CLUBS;
    }
    return JSON.parse(raw) as AreaClub[];
  } catch {
    return SEED_AREA_CLUBS;
  }
}

export function useAreaClubs() {
  const [clubs, setClubs] = useState<AreaClub[]>(SEED_AREA_CLUBS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setClubs(loadAreaClubs());
    setIsLoading(false);
  }, []);

  const updateClub = useCallback((id: string, patch: Partial<AreaClub>) => {
    setClubs((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
      window.localStorage.setItem(AREA_CLUBS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { clubs, isLoading, updateClub };
}
