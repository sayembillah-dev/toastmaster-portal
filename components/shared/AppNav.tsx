"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserSearch, DollarSign, CheckSquare, CalendarDays, BookOpen, Menu, TableProperties } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "./SignOutButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { label: "Members", href: "/members", icon: Users },
  { label: "Guest Pool", href: "/guests", icon: UserSearch },
  { label: "Funds", href: "/funds", icon: DollarSign },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Planner", href: "/planner", icon: TableProperties },
  { label: "Ground Rules", href: "/rules", icon: BookOpen, soon: true },
];

function NavLink({ item }: { item: typeof NAV_ITEMS[0] }) {
  const pathname = usePathname();
  const active = pathname.startsWith(item.href);
  const Icon = item.icon;

  if (item.soon) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground/50 cursor-not-allowed select-none">
        <Icon className="h-4 w-4" />
        {item.label}
        <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground font-medium"
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
        <h1 className="text-lg font-bold tracking-tight">NTC</h1>
        <p className="text-xs text-muted-foreground">Toastmasters Club</p>
      </div>
      <Separator />
      <nav className="flex-1 px-2 py-3 space-y-1">
        {NAV_ITEMS.map((item) => (
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

export function AppNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 border-r flex-col h-screen sticky top-0 overflow-y-auto">
        <NavContent />
      </aside>

      {/* Mobile top bar — sits above <main> in the flex-col layout; no sticky needed */}
      <header className="md:hidden shrink-0 flex items-center gap-3 px-4 py-3 border-b bg-background">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent cursor-pointer">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            <NavContent />
          </SheetContent>
        </Sheet>
        <h1 className="font-bold text-lg">NTC</h1>
      </header>
    </>
  );
}
