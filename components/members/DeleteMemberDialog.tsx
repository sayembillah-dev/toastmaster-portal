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
import { useDeleteMember } from "@/hooks/useMembers";
import { toast } from "sonner";
import type { MemberDTO } from "@/lib/serializers";

interface Props {
  member: MemberDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteMemberDialog({ member, open, onOpenChange }: Props) {
  const { mutate, isPending } = useDeleteMember();

  function handleConfirm() {
    mutate(member.id, {
      onSuccess: () => {
        toast.success(`${member.fullName} has been removed`);
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Remove member?</DialogTitle>
          <DialogDescription>
            This will permanently remove <strong>{member.fullName}</strong> from the club roster.
            This action cannot be undone.
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
