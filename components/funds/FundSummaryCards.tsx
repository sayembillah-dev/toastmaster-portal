"use client";

import { useFundSummary } from "@/hooks/useFunds";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatAmount } from "@/lib/fundConstants";
import { cn } from "@/lib/utils";

export function FundSummaryCards() {
  const { data, isLoading } = useFundSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    );
  }

  const cards = [
    {
      label: "Current Balance",
      value: data?.balance ?? 0,
      icon: Wallet,
      positive: (data?.balance ?? 0) >= 0,
      highlight: true,
    },
    {
      label: "Total Income",
      value: data?.totalIncome ?? 0,
      icon: TrendingUp,
      positive: true,
      highlight: false,
    },
    {
      label: "Total Expenses",
      value: data?.totalExpense ?? 0,
      icon: TrendingDown,
      positive: false,
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ label, value, icon: Icon, positive, highlight }) => (
        <Card key={label} className={cn(highlight && "border-primary/30 bg-primary/5")}>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={cn(
                  "text-2xl font-bold mt-1",
                  highlight && (positive ? "text-primary" : "text-destructive"),
                  !highlight && positive && "text-green-600",
                  !highlight && !positive && "text-destructive",
                )}>
                  {formatAmount(value)}
                </p>
              </div>
              <div className={cn(
                "p-2 rounded-lg",
                positive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600",
                highlight && "bg-primary/10 text-primary",
              )}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
