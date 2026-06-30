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
    all: ["transactions"] as const,
    transactions: (params: Record<string, unknown>) => ["transactions", params] as const,
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
  planner: {
    all: ["planner"] as const,
  },
  resources: {
    all: ["resources"] as const,
    list: (params: Record<string, unknown>) => ["resources", params] as const,
  },
  documents: {
    all: ["documents"] as const,
    list: (params: Record<string, unknown>) => ["documents", params] as const,
  },
};
