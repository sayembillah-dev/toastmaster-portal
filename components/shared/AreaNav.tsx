"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Menu, MapPin, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "./SignOutButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { OrgSwitcher } from "./OrgSwitcher";
import { TicketNotificationBell } from "./TicketNotificationBell";
import { AREA_NAME } from "@/lib/areaConstants";

const AREA_NAV_ITEMS = [
  { label: "Dashboard", href: "/area/dashboard", icon: LayoutGrid },
  { label: "Tickets", href: "/area/tickets", icon: Ticket },
];

function NavLink({ item }: { item: (typeof AREA_NAV_ITEMS)[0] }) {
  const pathname = usePathname();
  const active = pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        active
          ? "bg-indigo-600 text-white font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

function NavContent() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-4">
        <h1 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-indigo-600" />
          {AREA_NAME}
        </h1>
        <p className="text-xs text-muted-foreground">Area Director</p>
      </div>
      <Separator />
      <nav className="flex-1 px-2 py-3 space-y-1">
        {AREA_NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
      <Separator />
      <div className="px-2 py-3">
        <SignOutButton />
      </div>
    </div>
  );
}

export function AreaNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 border-r bg-indigo-50/40 flex-col h-screen sticky top-0 overflow-y-auto">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden shrink-0 flex items-center gap-3 px-4 py-3 border-b bg-indigo-50/40">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent cursor-pointer">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            <NavContent />
          </SheetContent>
        </Sheet>
        <h1 className="font-bold text-lg flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-indigo-600" />
          {AREA_NAME}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <TicketNotificationBell scope="area" />
          <OrgSwitcher />
        </div>
      </header>
    </>
  );
}
