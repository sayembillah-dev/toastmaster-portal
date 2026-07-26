import { AreaNav } from "@/components/shared/AreaNav";
import { OrgSwitcher } from "@/components/shared/OrgSwitcher";
import { TicketNotificationBell } from "@/components/shared/TicketNotificationBell";

export default function AreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <AreaNav />
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="hidden md:flex shrink-0 items-center justify-end gap-2 px-4 py-3 border-b">
          <TicketNotificationBell scope="area" />
          <OrgSwitcher />
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
