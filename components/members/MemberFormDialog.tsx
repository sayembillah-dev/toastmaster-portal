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
import { useCreateMember, useUpdateMember } from "@/hooks/useMembers";
import { api } from "@/lib/clientApi";
import { CLUB_ROLES, MEMBER_STATUSES, type ClubRole, type MemberStatus } from "@/lib/memberConstants";
import { MemberAvatar } from "@/components/shared/Avatar";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import type { MemberDTO } from "@/lib/serializers";

type Mode = "create" | "edit";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  member?: MemberDTO;
}

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  membershipNumber: string;
  joinDate: string;
  status: MemberStatus;
  clubRole: ClubRole;
  bio: string;
};

const EMPTY_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  membershipNumber: "",
  joinDate: new Date().toISOString().split("T")[0],
  status: "active",
  clubRole: "Member",
  bio: "",
};

export function MemberFormDialog({ open, onOpenChange, mode, member }: Props) {
  const createMember = useCreateMember();
  const updateMember = useUpdateMember(member?.id ?? "");

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && member) {
        setForm({
          fullName: member.fullName,
          email: member.email,
          phone: member.phone,
          membershipNumber: member.membershipNumber,
          joinDate: member.joinDate.split("T")[0],
          status: member.status,
          clubRole: member.clubRole,
          bio: member.bio,
        });
        setPhotoPreview(member.photoUrl || "");
      } else {
        setForm(EMPTY_FORM);
        setPhotoPreview("");
      }
      setPhotoFile(null);
    }
  }, [open, mode, member]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const onSuccess = async (saved: { id: string }) => {
      if (photoFile) {
        await api.members.uploadPhoto(saved.id, photoFile).catch((err: Error) => {
          toast.error(`Member saved but photo upload failed: ${err.message}`);
        });
      }
      toast.success(mode === "create" ? "Member added" : "Member updated");
      onOpenChange(false);
    };

    const onError = (err: Error) => toast.error(err.message);

    if (mode === "create") {
      createMember.mutate(form, { onSuccess, onError });
    } else {
      updateMember.mutate(form, { onSuccess, onError });
    }
  }

  const isPending = createMember.isPending || updateMember.isPending;
  const title = mode === "create" ? "Add member" : "Edit member";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <MemberAvatar
                name={form.fullName || "?"}
                photoUrl={photoPreview}
                size="lg"
              />
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
            <div className="text-sm text-muted-foreground">
              Click the camera icon to add a photo
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name *</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="e.g. Jane Doe"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+60 12-345 6789"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Membership number */}
            <div className="space-y-1.5">
              <Label htmlFor="membershipNumber">Membership #</Label>
              <Input
                id="membershipNumber"
                value={form.membershipNumber}
                onChange={(e) => set("membershipNumber", e.target.value)}
                placeholder="NTC-001"
              />
            </div>
            {/* Join date */}
            <div className="space-y-1.5">
              <Label htmlFor="joinDate">Join date *</Label>
              <Input
                id="joinDate"
                type="date"
                value={form.joinDate}
                onChange={(e) => set("joinDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => { if (v) set("status", v as MemberStatus); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEMBER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Club role */}
            <div className="space-y-1.5">
              <Label>Club role</Label>
              <Select
                value={form.clubRole}
                onValueChange={(v) => { if (v) set("clubRole", v as ClubRole); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLUB_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="A short bio…"
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : mode === "create" ? "Add member" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
