"use client";

import { useMemo, useState } from "react";
import { useMembers } from "@/hooks/useMembers";
import { MemberCard } from "./MemberCard";
import { MemberFilters, type MemberFiltersState } from "./MemberFilters";
import { MemberFormDialog } from "./MemberFormDialog";
import { DeleteMemberDialog } from "./DeleteMemberDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus } from "lucide-react";
import type { MemberDTO } from "@/lib/serializers";

export function MembersScreen() {
  const { data: members, isLoading } = useMembers();

  const [filters, setFilters] = useState<MemberFiltersState>({ q: "", status: "", role: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = useState<MemberDTO | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<MemberDTO | undefined>();

  const filtered = useMemo(() => {
    if (!members) return [];
    let list = members;
    if (filters.status) list = list.filter((m) => m.status === filters.status);
    if (filters.role) list = list.filter((m) => m.clubRole === filters.role);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.membershipNumber.toLowerCase().includes(q),
      );
    }
    return list;
  }, [members, filters]);

  function handleEdit(member: MemberDTO) {
    setEditTarget(member);
    setFormMode("edit");
    setFormOpen(true);
  }

  function handleAdd() {
    setEditTarget(undefined);
    setFormMode("create");
    setFormOpen(true);
  }

  const activeCount = members?.filter((m) => m.status === "active").length ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Members</h2>
          {members && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {members.length} total · {activeCount} active
            </p>
          )}
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add member
        </Button>
      </div>

      {/* Filters */}
      <MemberFilters filters={filters} onChange={setFilters} />

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <Users className="h-12 w-12 mb-4 opacity-30" />
          {members?.length === 0 ? (
            <>
              <p className="font-medium">No members yet</p>
              <p className="text-sm mt-1">Add the first member to get started.</p>
              <Button onClick={handleAdd} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add member
              </Button>
            </>
          ) : (
            <p className="font-medium">No members match your filters</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <MemberFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        member={editTarget}
      />

      {deleteTarget && (
        <DeleteMemberDialog
          member={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        />
      )}
    </div>
  );
}
