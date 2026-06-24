"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Camera, UserCircle2, Loader2 } from "lucide-react";
import { GUEST_PREFERRED_ROLES } from "@/lib/guestConstants";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  whatsappSameAsPhone: boolean;
  details: string;
  preferredRole: string;
};

const EMPTY: FormState = {
  fullName: "",
  email: "",
  phone: "",
  whatsapp: "",
  whatsappSameAsPhone: true,
  details: "",
  preferredRole: "",
};

export default function JoinPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
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
    setError("");
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("whatsapp", form.whatsappSameAsPhone ? form.phone : form.whatsapp);
      fd.append("whatsappSameAsPhone", String(form.whatsappSameAsPhone));
      fd.append("details", form.details);
      fd.append("preferredRole", form.preferredRole);
      if (photoFile) fd.append("photo", photoFile);

      const res = await fetch("/api/public/guests", { method: "POST", body: fd });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error?.message ?? "Something went wrong. Please try again.");
        return;
      }

      setDone(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">You're in!</h2>
          <p className="text-muted-foreground">
            Thanks for registering, <strong>{form.fullName}</strong>. We've added you to our guest
            list and will be in touch soon. We hope to see you at our next meeting!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Club header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">NTC</h1>
          <p className="text-muted-foreground">Toastmasters Club</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Join our guest list</CardTitle>
            <CardDescription>
              Fill in your details and we'll reach out about upcoming meetings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo picker */}
              <div className="flex flex-col items-center gap-2">
                <label htmlFor="photo-input" className="relative cursor-pointer group">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Your photo"
                      className="h-24 w-24 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border group-hover:border-primary transition-colors">
                      <UserCircle2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md group-hover:bg-primary/90 transition-colors pointer-events-none">
                    <Camera className="h-3.5 w-3.5" />
                  </span>
                  <input
                    id="photo-input"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handlePhotoChange}
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  {photoPreview ? "Tap to change photo" : "Add a photo (optional)"}
                </p>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name *</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Your full name"
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
                  placeholder="you@example.com"
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

              {/* Preferred role */}
              <div className="space-y-1.5">
                <Label htmlFor="preferredRole">Preferred role <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <select
                  id="preferredRole"
                  value={form.preferredRole}
                  onChange={(e) => set("preferredRole", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:border-ring focus:outline-none"
                >
                  <option value="">No preference</option>
                  {GUEST_PREFERRED_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* About */}
              <div className="space-y-1.5">
                <Label htmlFor="details">About yourself</Label>
                <Textarea
                  id="details"
                  value={form.details}
                  onChange={(e) => set("details", e.target.value)}
                  placeholder="Tell us a bit about yourself — your profession, how you heard about us, what you're hoping to gain…"
                  rows={4}
                  maxLength={2000}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</>
                ) : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Your information is only shared with the club committee.
        </p>
      </div>
    </div>
  );
}
