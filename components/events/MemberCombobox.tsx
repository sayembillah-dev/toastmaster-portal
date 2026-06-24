"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X, Search, Check } from "lucide-react";
import { useMembers } from "@/hooks/useMembers";
import { useGuests } from "@/hooks/useGuests";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function MemberCombobox({ value, onChange, placeholder = "Select member…", className }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { data: members = [] } = useMembers();
  const { data: guests = [] } = useGuests();

  const activeMembers = members.filter((m) => m.status === "active");
  const q = search.trim().toLowerCase();

  const filteredMembers = q
    ? activeMembers.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.clubRole.toLowerCase().includes(q),
      )
    : activeMembers;

  const filteredGuests = q
    ? guests.filter((g) => g.fullName.toLowerCase().includes(q))
    : guests;

  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  const openDropdown = () => {
    computePosition();
    setOpen(true);
    setSearch("");
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSearch("");
  }, []);

  const select = (name: string) => {
    onChange(name);
    closeDropdown();
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current && !triggerRef.current.closest("[data-combobox-root]")?.contains(target)) {
        const dropdown = document.getElementById("member-combobox-portal");
        if (!dropdown?.contains(target)) closeDropdown();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closeDropdown]);

  // Close on Escape; reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeDropdown(); };
    const onScroll = () => computePosition();
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, closeDropdown, computePosition]);

  const dropdown = (
    <div
      id="member-combobox-portal"
      style={dropdownStyle}
      className="bg-popover border rounded-md shadow-lg overflow-hidden min-w-50"
    >
      {/* Search */}
      <div className="flex items-center gap-2 px-2.5 py-2 border-b">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members or guests…"
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* List */}
      <div className="max-h-64 overflow-y-auto py-1">
        {filteredMembers.length === 0 && filteredGuests.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground">No match</div>
        ) : (
          <>
            {/* Members */}
            {filteredMembers.length > 0 && (
              <>
                <p className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Members
                </p>
                {filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => select(m.fullName)}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors hover:bg-accent",
                      value === m.fullName && "bg-accent/60",
                    )}
                  >
                    <Check className={cn("h-3.5 w-3.5 shrink-0 text-primary", value === m.fullName ? "opacity-100" : "opacity-0")} />
                    <span className="flex-1 truncate font-medium">{m.fullName}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{m.clubRole}</span>
                  </button>
                ))}
              </>
            )}

            {/* Guests */}
            {filteredGuests.length > 0 && (
              <>
                {filteredMembers.length > 0 && <div className="my-1 border-t" />}
                <p className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Guests
                </p>
                {filteredGuests.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => select(g.fullName)}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors hover:bg-accent",
                      value === g.fullName && "bg-accent/60",
                    )}
                  >
                    <Check className={cn("h-3.5 w-3.5 shrink-0 text-primary", value === g.fullName ? "opacity-100" : "opacity-0")} />
                    <span className="flex-1 truncate font-medium">{g.fullName}</span>
                    <span className="text-xs text-muted-foreground shrink-0">Guest</span>
                  </button>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div data-combobox-root className={cn("relative", className)}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closeDropdown() : openDropdown())}
        className={cn(
          "flex items-center justify-between w-full h-8 px-3 text-sm border rounded-md bg-background transition-colors text-left",
          open ? "border-ring ring-1 ring-ring" : "hover:bg-accent",
        )}
      >
        <span className={cn("truncate", value ? "text-foreground" : "text-muted-foreground")}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1 ml-1 shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={-1}
              onClick={clear}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {/* Portal dropdown — renders outside overflow:hidden parents */}
      {open && typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  );
}
