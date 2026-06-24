"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "ABOUT", href: "/about" },
  { label: "MEMBERS", href: "/#committee" },
  { label: "MEETINGS", href: "/meetings" },
  { label: "JOIN ↗", href: "/join" },
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 md:px-16">
      <Link href="/" className="text-sm font-bold tracking-widest text-white uppercase select-none">
        Nifty Toastmasters Club.
      </Link>

      {/* Desktop nav */}
      <nav className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="text-xs font-semibold tracking-widest text-white/60 uppercase transition-colors hover:text-white"
          >
            {label}
          </Link>
        ))}
        <Link
          href="/login"
          className="text-xs font-semibold tracking-widest text-white uppercase border border-white/40 px-4 py-1.5 rounded transition-colors hover:bg-white hover:text-black"
        >
          LOGIN
        </Link>
      </nav>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <button
              type="button"
              aria-label="Open menu"
              className="flex items-center justify-center rounded-md p-2 text-white transition-colors hover:bg-white/10 md:hidden"
            />
          }
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="right" className="w-72 bg-[#221A13] text-white border-white/10">
          <SheetTitle className="px-5 pt-5 text-sm font-bold tracking-widest text-white uppercase">
            Menu
          </SheetTitle>
          <nav className="flex flex-col gap-1 px-3 pt-4">
            {NAV_LINKS.map(({ label, href }) => (
              <SheetClose
                key={label}
                render={
                  <Link
                    href={href}
                    className="rounded-lg px-3 py-3 text-sm font-semibold tracking-widest text-white/70 uppercase transition-colors hover:bg-white/10 hover:text-white"
                  />
                }
              >
                {label}
              </SheetClose>
            ))}
            <SheetClose
              render={
                <Link
                  href="/login"
                  className="mt-3 rounded-lg border border-white/40 px-3 py-3 text-center text-sm font-semibold tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-black"
                />
              }
            >
              LOGIN
            </SheetClose>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
