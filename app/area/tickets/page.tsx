import { TicketsScreen } from "@/components/shared/TicketsScreen";

export const metadata = { title: "Area Tickets | NTC" };

export default function AreaTicketsPage() {
  return <TicketsScreen scope="area" title="Tickets" subtitle="Every ticket across your area" />;
}
