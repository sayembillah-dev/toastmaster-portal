"use client";

import Link from "next/link";
import { Phone, Mail, MessageCircle, Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MemberAvatar } from "@/components/shared/Avatar";
import { GuestStatusBadge } from "./GuestStatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GuestDTO } from "@/lib/serializers";

interface Props {
  guest: GuestDTO;
  onEdit: (guest: GuestDTO) => void;
  onDelete: (guest: GuestDTO) => void;
}

export function GuestCard({ guest, onEdit, onDelete }: Props) {
  const visitDate = new Date(guest.visitDate).toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const whatsappNumber = guest.whatsappSameAsPhone ? guest.phone : guest.whatsapp;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/guests/${guest.id}`} className="flex items-center gap-3 min-w-0">
            <MemberAvatar name={guest.fullName} photoUrl={guest.photoUrl} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{guest.fullName}</p>
              <div className="mt-0.5">
                <GuestStatusBadge status={guest.followUpStatus} />
              </div>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md hover:bg-accent cursor-pointer">
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(guest)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(guest)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {guest.email && (
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{guest.email}</span>
            </div>
          )}
          {guest.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{guest.phone}</span>
            </div>
          )}
          {whatsappNumber && (
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-3 w-3 shrink-0" />
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {whatsappNumber}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>Visited {visitDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
