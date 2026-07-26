"use client";

import { Building2, ChevronsUpDown, MapPin, Check } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { AREA_NAME } from "@/lib/areaConstants";

const CURRENT_CLUB = "NTC";

export function OrgSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const inArea = pathname.startsWith("/area");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-accent cursor-pointer">
        {inArea ? (
          <MapPin className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Building2 className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="font-medium">{inArea ? AREA_NAME : CURRENT_CLUB}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Switch to</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => router.push("/area/dashboard")}>
            {inArea ? <Check className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
            Area
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Building2 className="h-4 w-4" />
              Club
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                {!inArea && <Check className="h-4 w-4" />}
                {CURRENT_CLUB}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
