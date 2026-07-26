import { TicketsScreen } from "@/components/shared/TicketsScreen";

export const metadata = { title: "Tickets | NTC" };

export default function TicketsPage() {
  return <TicketsScreen scope="club" title="Tickets" subtitle="Issues raised for or by NTC" />;
}
