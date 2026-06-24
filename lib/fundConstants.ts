export const TRANSACTION_TYPES = ["income", "expense"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const INCOME_CATEGORIES = [
  "Membership Fee",
  "Event Registration",
  "Fine",
  "Donation",
  "Sponsorship",
  "Other Income",
] as const;

export const EXPENSE_CATEGORIES = [
  "Event Cost",
  "Venue",
  "Food & Drinks",
  "Printing",
  "Equipment",
  "Transportation",
  "Other Expense",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type TransactionCategory = IncomeCategory | ExpenseCategory;

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES] as const;

export const CURRENCY = "BDT";
export const CURRENCY_SYMBOL = "BDT";

export function formatAmount(amount: number): string {
  return `${CURRENCY_SYMBOL} ${amount.toFixed(2)}`;
}
