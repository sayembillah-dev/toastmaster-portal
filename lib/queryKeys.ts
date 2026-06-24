export const qk = {
  members: {
    all: ["members"] as const,
    detail: (id: string) => ["members", id] as const,
  },
  guests: {
    all: ["guests"] as const,
    detail: (id: string) => ["guests", id] as const,
  },
  funds: {
    transactions: ["transactions"] as const,
    detail: (id: string) => ["transactions", id] as const,
    summary: ["funds-summary"] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    detail: (id: string) => ["tasks", id] as const,
  },
  events: {
    all: ["events"] as const,
    detail: (id: string) => ["events", id] as const,
    templates: ["events", "templates"] as const,
  },
};
