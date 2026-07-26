"use client";

import { useCallback, useEffect, useState } from "react";
import { SEED_TICKETS, TICKETS_STORAGE_KEY, type GlobalTicket } from "@/lib/ticketConstants";

function loadTickets(): GlobalTicket[] {
  if (typeof window === "undefined") return SEED_TICKETS;
  try {
    const raw = window.localStorage.getItem(TICKETS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(SEED_TICKETS));
      return SEED_TICKETS;
    }
    return JSON.parse(raw) as GlobalTicket[];
  } catch {
    return SEED_TICKETS;
  }
}

export function useTickets() {
  const [tickets, setTickets] = useState<GlobalTicket[]>(SEED_TICKETS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTickets(loadTickets());
    setIsLoading(false);
  }, []);

  const persist = useCallback((next: GlobalTicket[]) => {
    window.localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addTicket = useCallback(
    (ticket: GlobalTicket) => {
      setTickets((prev) => {
        const next = [ticket, ...prev];
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const updateTicket = useCallback(
    (id: string, patch: Partial<GlobalTicket>) => {
      setTickets((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const deleteTicket = useCallback(
    (id: string) => {
      setTickets((prev) => {
        const next = prev.filter((t) => t.id !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setTicketResolved = useCallback(
    (ticketId: string, resolved: boolean) => {
      setTickets((prev) => {
        const next = prev.map((t) => (t.id === ticketId ? { ...t, resolved } : t));
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return { tickets, isLoading, addTicket, updateTicket, deleteTicket, setTicketResolved };
}
