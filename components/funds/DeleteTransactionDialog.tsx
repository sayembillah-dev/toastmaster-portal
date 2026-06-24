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
import { useDeleteTransaction } from "@/hooks/useFunds";
import { formatAmount } from "@/lib/fundConstants";
import { toast } from "sonner";
import type { TransactionDTO } from "@/lib/serializers";

interface Props {
  transaction: TransactionDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTransactionDialog({ transaction, open, onOpenChange }: Props) {
  const { mutate, isPending } = useDeleteTransaction();

  function handleConfirm() {
    mutate(transaction.id, {
      onSuccess: () => {
        toast.success("Transaction deleted");
        onOpenChange(false);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete transaction?</DialogTitle>
          <DialogDescription>
            This will permanently remove the{" "}
            <strong>{formatAmount(transaction.amount)}</strong>{" "}
            {transaction.type} — <em>{transaction.description}</em>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
