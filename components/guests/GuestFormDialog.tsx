"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateGuest, useUpdateGuest } from "@/hooks/useGuests";
import { FOLLOW_UP_STATUSES, FOLLOW_UP_LABELS, GUEST_PREFERRED_ROLES, type FollowUpStatus } from "@/lib/guestConstants";
import { MemberAvatar } from "@/components/shared/Avatar";
import { api } from "@/lib/clientApi";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import type { GuestDTO } from "@/lib/serializers";

type Mode = "create" | "edit";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  guest?: GuestDTO;
}

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  whatsappSameAsPhone: boolean;
  details: string;
  preferredRole: string;
  visitDate: string;
  followUpStatus: FollowUpStatus;
  notes: string;
};

const EMPTY_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  whatsapp: "",
  whatsappSameAsPhone: true,
  details: "",
  preferredRole: "",
  visitDate: new Date().toISOString().split("T")[0],
  followUpStatus: "new",
  notes: "",
};

export function GuestFormDialog({ open, onOpenChange, mode, guest }: Props) {
  const createGuest = useCreateGuest();
  const updateGuest = useUpdateGuest(guest?.id ?? "");

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && guest) {
        setForm({
          fullName: guest.fullName,
          email: guest.email,
          phone: guest.phone,
          whatsapp: guest.whatsapp,
          whatsappSameAsPhone: guest.whatsappSameAsPhone,
          details: guest.details,
          preferredRole: guest.preferredRole ?? "",
          visitDate: guest.visitDate.split("T")[0],
          followUpStatus: guest.followUpStatus,
          notes: guest.notes,
        });
        setPhotoPreview(guest.photoUrl || "");
      } else {
        setForm(EMPTY_FORM);
        setPhotoPreview("");
      }
      setPhotoFile(null);
    }
  }, [open, mode, guest]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handlePhoneChange(value: string) {
    setForm((f) => ({
      ...f,
      phone: value,
      whatsapp: f.whatsappSameAsPhone ? value : f.whatsapp,
    }));
  }

  function handleWhatsappToggle(checked: boolean) {
    setForm((f) => ({
      ...f,
      whatsappSameAsPhone: checked,
      whatsapp: checked ? f.phone : f.whatsapp,
    }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      ...form,
      whatsapp: form.whatsappSameAsPhone ? form.phone : form.whatsapp,
    };

    const onSuccess = async (saved: { id: string }) => {
      if (photoFile) {
        await api.guests.uploadPhoto(saved.id, photoFile).catch((err: Error) => {
          toast.error(`Guest saved but photo upload failed: ${err.message}`);
        });
      }
      toast.success(mode === "create" ? "Guest added" : "Guest updated");
      onOpenChange(false);
    };

    const onError = (err: Error) => toast.error(err.message);

    if (mode === "create") {
      createGuest.mutate(payload, { onSuccess, onError });
    } else {
      updateGuest.mutate(payload, { onSuccess, onError });
    }
  }

  const isPending = createGuest.isPending || updateGuest.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add guest" : "Edit guest"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <MemberAvatar name={form.fullName || "?"} photoUrl={photoPreview} size="lg" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 shadow"
              >
                <Camera className="h-3 w-3" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <p className="text-sm text-muted-foreground">Click the camera icon to add a photo</p>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name *</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="e.g. John Smith"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+60 12-345 6789"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="whatsapp">WhatsApp number</Label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.whatsappSameAsPhone}
                  onChange={(e) => handleWhatsappToggle(e.target.checked)}
                  className="accent-primary"
                />
                Same as phone
              </label>
            </div>
            <Input
              id="whatsapp"
              type="tel"
              value={form.whatsappSameAsPhone ? form.phone : form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="+60 12-345 6789"
              disabled={form.whatsappSameAsPhone}
              className={form.whatsappSameAsPhone ? "opacity-50" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Visit date */}
            <div className="space-y-1.5">
              <Label htmlFor="visitDate">Visit date *</Label>
              <Input
                id="visitDate"
                type="date"
                value={form.visitDate}
                onChange={(e) => set("visitDate", e.target.value)}
                required
              />
            </div>
            {/* Follow-up status */}
            <div className="space-y-1.5">
              <Label>Follow-up status</Label>
              <Select
                value={form.followUpStatus}
                onValueChange={(v) => { if (v) set("followUpStatus", v as FollowUpStatus); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOW_UP_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {FOLLOW_UP_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preferred role */}
          <div className="space-y-1.5">
            <Label>
              Preferred role
              <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Select
              value={form.preferredRole || "none"}
              onValueChange={(v) => set("preferredRole", v && v !== "none" ? v : "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="No preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No preference</SelectItem>
                {GUEST_PREFERRED_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <Label htmlFor="details">About yourself</Label>
            <Textarea
              id="details"
              value={form.details}
              onChange={(e) => set("details", e.target.value)}
              placeholder="Tell us a bit about yourself…"
              rows={3}
              maxLength={2000}
            />
          </div>

          {/* Notes (internal) */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">
              Internal notes
              <span className="ml-1 text-xs text-muted-foreground">(club use only)</span>
            </Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any follow-up notes for the club…"
              rows={2}
              maxLength={1000}
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : mode === "create" ? "Add guest" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
