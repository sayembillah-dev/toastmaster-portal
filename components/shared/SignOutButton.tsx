"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
