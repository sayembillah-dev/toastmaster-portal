"use client";

import Link from "next/link";
import { Phone, Mail, Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MemberAvatar } from "@/components/shared/Avatar";
import { MemberStatusBadge } from "./MemberStatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MemberDTO } from "@/lib/serializers";

interface Props {
  member: MemberDTO;
  onEdit: (member: MemberDTO) => void;
  onDelete: (member: MemberDTO) => void;
}

export function MemberCard({ member, onEdit, onDelete }: Props) {
  const joinYear = new Date(member.joinDate).getFullYear();

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/members/${member.id}`} className="flex items-center gap-3 min-w-0">
            <MemberAvatar name={member.fullName} photoUrl={member.photoUrl} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{member.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{member.clubRole}</p>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md hover:bg-accent cursor-pointer">
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(member)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(member)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 space-y-1.5">
          <MemberStatusBadge status={member.status} />
          {member.membershipNumber && (
            <p className="text-xs text-muted-foreground"># {member.membershipNumber}</p>
          )}
        </div>

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {member.email && (
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          {member.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{member.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>Joined {joinYear}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
