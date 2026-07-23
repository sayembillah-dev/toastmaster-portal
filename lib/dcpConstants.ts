export const DCP_GOAL_TYPES = [
  "education_goal_1",
  "education_goal_2",
  "education_goal_3",
  "education_goal_4",
  "education_goal_5",
  "membership_goal_1",
  "membership_goal_2",
  "membership_goal_3",
  "admin_goal_1",
  "admin_goal_2",
] as const;
export type DCPGoalType = (typeof DCP_GOAL_TYPES)[number];

export const DCP_GOAL_LABELS: Record<DCPGoalType, string> = {
  education_goal_1: "Goal 1 — CC / Level 1 (×2 members)",
  education_goal_2: "Goal 2 — Advanced Communicator or Level 2+ (×2)",
  education_goal_3: "Goal 3 — Advanced Communicator Gold/Platinum or Level 3+ (×2)",
  education_goal_4: "Goal 4 — CL/AL/DTM/Pathway Level Complete (×2)",
  education_goal_5: "Goal 5 — 5 Members from same Pathway",
  membership_goal_1: "Goal 6 — ≥20 active members at year-end",
  membership_goal_2: "Goal 7 — ≥4 new members added",
  membership_goal_3: "Goal 8 — No Net Loss (renewals ≥ charter strength)",
  admin_goal_1: "Goal 9 — 2 dues-paid officers in Dec & June",
  admin_goal_2: "Goal 10 — Club Website/Social Media / Officer Training",
};
