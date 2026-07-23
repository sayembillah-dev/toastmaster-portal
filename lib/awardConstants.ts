export const AWARD_CATEGORIES = [
  "Best Prepared Speaker",
  "Best Table Topics Speaker",
  "Best Evaluator",
  "Best Role Player",
] as const;
export type AwardCategory = (typeof AWARD_CATEGORIES)[number];
