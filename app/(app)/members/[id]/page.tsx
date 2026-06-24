"use client";

import { use, useState } from "react";
import { useMember } from "@/hooks/useMembers";
import { MemberAvatar } from "@/components/shared/Avatar";
import { MemberStatusBadge } from "@/components/members/MemberStatusBadge";
import { MemberFormDialog } from "@/components/members/MemberFormDialog";
import { DeleteMemberDialog } from "@/components/members/DeleteMemberDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Calendar, Hash } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function MemberProfilePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: member, isLoading } = useMember(id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-24" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Member not found.</p>
        <Button variant="link" onClick={() => router.push("/members")}>
          Back to members
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/members")}
        className="gap-2 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Members
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <MemberAvatar name={member.fullName} photoUrl={member.photoUrl} size="lg" />
          <div>
            <h2 className="text-2xl font-bold">{member.fullName}</h2>
            <p className="text-muted-foreground">{member.clubRole}</p>
            <div className="mt-1">
              <MemberStatusBadge status={member.status} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>

      <Separator />

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {member.membershipNumber && (
          <InfoRow icon={Hash} label="Membership #" value={member.membershipNumber} />
        )}
        {member.email && (
          <InfoRow icon={Mail} label="Email" value={member.email} />
        )}
        {member.phone && (
          <InfoRow icon={Phone} label="Phone" value={member.phone} />
        )}
        <InfoRow
          icon={Calendar}
          label="Joined"
          value={new Date(member.joinDate).toLocaleDateString("en-MY", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
      </div>

      {member.bio && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Bio</h3>
            <p className="text-sm whitespace-pre-wrap">{member.bio}</p>
          </div>
        </>
      )}

      {/* Dialogs */}
      <MemberFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        member={member}
      />
      <DeleteMemberDialog
        member={member}
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) router.push("/members");
        }}
      />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
