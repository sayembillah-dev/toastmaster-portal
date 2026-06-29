import type { MemberDTO, GuestDTO, TransactionDTO, FundSummaryDTO, PaginatedTransactionsDTO, TaskDTO, EventDTO, PlannerRowDTO } from "./serializers";
import type { MemberInput, MemberUpdateInput, GuestInput, GuestUpdateInput, TransactionInput, TransactionUpdateInput, TaskInput, TaskUpdateInput, EventInput, EventUpdateInput, PlannerRowInput, PlannerRowUpdateInput } from "./validation";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body?.error?.message ?? `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  members: {
    list: (params?: { status?: string; role?: string; q?: string }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.role) qs.set("role", params.role);
      if (params?.q) qs.set("q", params.q);
      const query = qs.toString();
      return apiFetch<MemberDTO[]>(`/api/members${query ? `?${query}` : ""}`);
    },

    get: (id: string) => apiFetch<MemberDTO>(`/api/members/${id}`),

    create: (data: MemberInput) =>
      apiFetch<MemberDTO>("/api/members", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: MemberUpdateInput) =>
      apiFetch<MemberDTO>(`/api/members/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    remove: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/members/${id}`, { method: "DELETE" }),

    uploadPhoto: (id: string, file: File) => {
      const form = new FormData();
      form.append("photo", file);
      return fetch(`/api/members/${id}/photo`, { method: "POST", body: form }).then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error?.message ?? "Photo upload failed");
        }
        return res.json() as Promise<{ photoUrl: string }>;
      });
    },
  },

  guests: {
    list: (params?: { status?: string; q?: string }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.q) qs.set("q", params.q);
      const query = qs.toString();
      return apiFetch<GuestDTO[]>(`/api/guests${query ? `?${query}` : ""}`);
    },

    get: (id: string) => apiFetch<GuestDTO>(`/api/guests/${id}`),

    create: (data: GuestInput) =>
      apiFetch<GuestDTO>("/api/guests", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: GuestUpdateInput) =>
      apiFetch<GuestDTO>(`/api/guests/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    remove: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/guests/${id}`, { method: "DELETE" }),

    uploadPhoto: (id: string, file: File) => {
      const form = new FormData();
      form.append("photo", file);
      return fetch(`/api/guests/${id}/photo`, { method: "POST", body: form }).then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error?.message ?? "Photo upload failed");
        }
        return res.json() as Promise<GuestDTO>;
      });
    },
  },

  funds: {
    list: (params?: {
      type?: string; category?: string; from?: string; to?: string;
      month?: string; year?: string; q?: string; page?: number; pageSize?: number;
    }) => {
      const qs = new URLSearchParams();
      if (params?.type)     qs.set("type",     params.type);
      if (params?.category) qs.set("category", params.category);
      if (params?.from)     qs.set("from",     params.from);
      if (params?.to)       qs.set("to",       params.to);
      if (params?.month)    qs.set("month",    params.month);
      if (params?.year)     qs.set("year",     params.year);
      if (params?.q)        qs.set("q",        params.q);
      if (params?.page)     qs.set("page",     String(params.page));
      if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
      const query = qs.toString();
      return apiFetch<PaginatedTransactionsDTO>(`/api/funds${query ? `?${query}` : ""}`);
    },

    summary: () => apiFetch<FundSummaryDTO>("/api/funds/summary"),

    get: (id: string) => apiFetch<TransactionDTO>(`/api/funds/${id}`),

    create: (data: TransactionInput) =>
      apiFetch<TransactionDTO>("/api/funds", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: TransactionUpdateInput) =>
      apiFetch<TransactionDTO>(`/api/funds/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    remove: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/funds/${id}`, { method: "DELETE" }),

    bulkCreate: (transactions: TransactionInput[]) =>
      apiFetch<TransactionDTO[]>("/api/funds/bulk", {
        method: "POST",
        body: JSON.stringify({ transactions }),
      }),
  },

  tasks: {
    list: () => apiFetch<TaskDTO[]>("/api/tasks"),

    create: (data: TaskInput) =>
      apiFetch<TaskDTO>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: TaskUpdateInput) =>
      apiFetch<TaskDTO>(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    remove: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/tasks/${id}`, { method: "DELETE" }),
  },

  events: {
    list: (params?: { template?: boolean; upcoming?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.template) qs.set("template", "true");
      if (params?.upcoming) qs.set("upcoming", "true");
      const query = qs.toString();
      return apiFetch<EventDTO[]>(`/api/events${query ? `?${query}` : ""}`);
    },

    get: (id: string) => apiFetch<EventDTO>(`/api/events/${id}`),

    create: (data: EventInput) =>
      apiFetch<EventDTO>("/api/events", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: EventUpdateInput) =>
      apiFetch<EventDTO>(`/api/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    remove: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/events/${id}`, { method: "DELETE" }),
  },

  planner: {
    list: () => apiFetch<PlannerRowDTO[]>("/api/planner"),

    create: (data: PlannerRowInput) =>
      apiFetch<PlannerRowDTO>("/api/planner", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: PlannerRowUpdateInput) =>
      apiFetch<PlannerRowDTO>(`/api/planner/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    remove: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/planner/${id}`, { method: "DELETE" }),
  },
};
