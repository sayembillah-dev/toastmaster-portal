import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p
              className={cn(
                "text-2xl font-bold mt-1",
                tone === "positive" && "text-green-600",
                tone === "negative" && "text-destructive",
              )}
            >
              {value}
            </p>
          </div>
          <div
            className={cn(
              "p-2 rounded-lg bg-primary/10 text-primary",
              tone === "positive" && "bg-green-100 text-green-600",
              tone === "negative" && "bg-destructive/10 text-destructive",
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
