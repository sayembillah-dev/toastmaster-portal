"use client";

import { use, useState } from "react";
import { useGuest } from "@/hooks/useGuests";
import { MemberAvatar } from "@/components/shared/Avatar";
import { GuestStatusBadge } from "@/components/guests/GuestStatusBadge";
import { GuestFormDialog } from "@/components/guests/GuestFormDialog";
import { DeleteGuestDialog } from "@/components/guests/DeleteGuestDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Mail, Phone, MessageCircle, Calendar } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function GuestProfilePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: guest, isLoading } = useGuest(id);

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

  if (!guest) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Guest not found.</p>
        <Button variant="link" onClick={() => router.push("/guests")}>
          Back to guest pool
        </Button>
      </div>
    );
  }

  const whatsappNumber = guest.whatsappSameAsPhone ? guest.phone : guest.whatsapp;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/guests")} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Guest Pool
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <MemberAvatar name={guest.fullName} photoUrl={guest.photoUrl} size="lg" />
          <div>
            <h2 className="text-2xl font-bold">{guest.fullName}</h2>
            <div className="mt-1">
              <GuestStatusBadge status={guest.followUpStatus} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Remove
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {guest.email && <InfoRow icon={Mail} label="Email" value={guest.email} />}
        {guest.phone && <InfoRow icon={Phone} label="Phone" value={guest.phone} />}
        {whatsappNumber && (
          <div className="flex items-start gap-3">
            <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">WhatsApp</p>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline text-primary"
              >
                {whatsappNumber}
                {guest.whatsappSameAsPhone && (
                  <span className="ml-1 text-xs text-muted-foreground">(same as phone)</span>
                )}
              </a>
            </div>
          </div>
        )}
        <InfoRow
          icon={Calendar}
          label="Visited"
          value={new Date(guest.visitDate).toLocaleDateString("en-MY", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
      </div>

      {guest.details && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">About</h3>
            <p className="text-sm whitespace-pre-wrap">{guest.details}</p>
          </div>
        </>
      )}

      {guest.notes && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Internal notes
            </h3>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{guest.notes}</p>
          </div>
        </>
      )}

      <GuestFormDialog open={editOpen} onOpenChange={setEditOpen} mode="edit" guest={guest} />
      <DeleteGuestDialog
        guest={guest}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => router.push("/guests")}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
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
