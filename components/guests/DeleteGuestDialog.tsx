"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteGuest } from "@/hooks/useGuests";
import { toast } from "sonner";
import type { GuestDTO } from "@/lib/serializers";

interface Props {
  guest: GuestDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteGuestDialog({ guest, open, onOpenChange, onDeleted }: Props) {
  const { mutate, isPending } = useDeleteGuest();

  function handleConfirm() {
    mutate(guest.id, {
      onSuccess: () => {
        toast.success(`${guest.fullName} has been removed`);
        onOpenChange(false);
        onDeleted?.();
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Remove guest?</DialogTitle>
          <DialogDescription>
            This will permanently remove <strong>{guest.fullName}</strong> from the guest pool.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Removing…" : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
