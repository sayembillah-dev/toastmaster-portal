"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link2, Check, Copy, RefreshCw, Ban, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateGuestLink, useRevokeGuestLink } from "@/hooks/useGuestRoleLink";
import { AGENDA_ROLE_LABELS, type AgendaRoleKey } from "@/lib/eventConstants";
import type { GuestRoleLinkDTO } from "@/lib/serializers";

type Props = {
  eventId: string;
  role: AgendaRoleKey;
  guestRoleLinks: GuestRoleLinkDTO[];
};

export function GuestRoleLinkButton({ eventId, role, guestRoleLinks }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { mutateAsync: createLink, isPending: creating } = useCreateGuestLink(eventId);
  const { mutateAsync: revokeLink, isPending: revoking } = useRevokeGuestLink(eventId);

  const existing = guestRoleLinks.find((l) => l.role === role);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = existing ? `${origin}/guest/${existing.token}` : "";

  async function handleOpen() {
    if (!existing) await createLink(role);
    setOpen(true);
  }

  async function handleRegenerate() {
    await createLink(role);
  }

  async function handleRevoke() {
    await revokeLink(role);
    setOpen(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleOpen} disabled={creating}>
        {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
        {existing ? "Guest Link" : "Share with Guest"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>{AGENDA_ROLE_LABELS[role]} — Guest Access</DialogTitle>
            <DialogDescription>
              Anyone with this link can run the {AGENDA_ROLE_LABELS[role]} role for this meeting from their phone — no account needed.
            </DialogDescription>
          </DialogHeader>

          {existing && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="rounded-xl border bg-white p-3">
                <QRCodeSVG value={url} size={180} />
              </div>
              <div className="flex w-full items-center gap-2">
                <input
                  readOnly
                  value={url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full flex-1 truncate rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs outline-none"
                />
                <Button type="button" size="icon-sm" variant="outline" onClick={handleCopy} aria-label="Copy link">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" className="gap-1.5 text-destructive hover:text-destructive" onClick={handleRevoke} disabled={revoking}>
              <Ban className="h-3.5 w-3.5" /> Revoke
            </Button>
            <Button type="button" variant="outline" className="gap-1.5" onClick={handleRegenerate} disabled={creating}>
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
