"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useResources, useUploadResource, useDeleteResource } from "@/hooks/useResources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Download,
  Trash2,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  MoreHorizontal,
  ZoomIn,
} from "lucide-react";
import type { ClubResourceDTO } from "@/lib/serializers";

const PAGE_SIZE = 12;

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function pickImageFromDataTransfer(dt: DataTransfer): File | null {
  if (dt.files.length > 0) {
    const f = dt.files[0];
    if (f.type.startsWith("image/")) return f;
  }
  for (const item of Array.from(dt.items)) {
    if (item.kind === "file" && item.type.startsWith("image/")) return item.getAsFile();
  }
  return null;
}

export function ImagesSection({
  pendingFile,
  onClearPendingFile,
}: {
  pendingFile: File | null;
  onClearPendingFile: () => void;
}) {
  const [q, setQ]               = useState("");
  const [page, setPage]         = useState(1);
  const [uploadOpen, setUploadOpen]     = useState(false);
  const [viewTarget, setViewTarget]     = useState<ClubResourceDTO | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<ClubResourceDTO | undefined>();

  const debouncedQ = useDebounce(q);
  useEffect(() => { setPage(1); }, [debouncedQ]);

  // Open upload when parent drops/pastes a file
  useEffect(() => {
    if (pendingFile) setUploadOpen(true);
  }, [pendingFile]);

  const params = {
    ...(debouncedQ && { q: debouncedQ }),
    page,
    pageSize: PAGE_SIZE,
  };

  const { data: paged, isLoading } = useResources(params);
  const resources  = paged?.data ?? [];
  const total      = paged?.total ?? 0;
  const totalPages = paged?.totalPages ?? 1;
  const pageStart  = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd    = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {paged ? `${total} image${total !== 1 ? "s" : ""}${debouncedQ ? " matching search" : ""}` : ""}
        </p>
        <Button onClick={() => setUploadOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Upload image
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by title…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 pr-8"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          {!debouncedQ && total === 0 ? (
            <div className="space-y-3">
              <ImageIcon className="h-12 w-12 mx-auto opacity-20" />
              <p className="font-medium">No images yet</p>
              <p className="text-sm">Upload, drop, or paste an image to get started.</p>
              <Button onClick={() => setUploadOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Upload image
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">No images match your search</p>
              <Button variant="ghost" size="sm" onClick={() => setQ("")}>Clear search</Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {resources.map((r) => (
              <ResourceCard key={r.id} resource={r} onView={setViewTarget} onDelete={setDeleteTarget} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">{pageStart}–{pageEnd} of {total}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8"
                  onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-16 text-center text-sm tabular-nums">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={(open) => {
          setUploadOpen(open);
          if (!open) onClearPendingFile();
        }}
        initialFile={pendingFile}
      />

      {viewTarget && (
        <ImagePreviewDialog
          resource={viewTarget}
          open={!!viewTarget}
          onOpenChange={(open) => !open && setViewTarget(undefined)}
          onDelete={(r) => { setViewTarget(undefined); setDeleteTarget(r); }}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          resource={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        />
      )}
    </div>
  );
}

// ── Download helper ───────────────────────────────────────────────────────────

function downloadResource(resource: ClubResourceDTO) {
  // API returns a 302 to a signed Cloudinary URL; browser follows it and downloads
  window.location.href = `/api/resources/${resource.id}/download`;
}

// ── Resource card ─────────────────────────────────────────────────────────────

function ResourceCard({
  resource, onView, onDelete,
}: {
  resource: ClubResourceDTO;
  onView:   (r: ClubResourceDTO) => void;
  onDelete: (r: ClubResourceDTO) => void;
}) {
  function handleDownload() { downloadResource(resource); }

  return (
    <div className="group rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        type="button"
        onClick={() => onView(resource)}
        className="block w-full aspect-square bg-muted relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <img src={resource.imageUrl} alt={resource.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
        </div>
      </button>
      <div className="flex items-center gap-1 px-3 py-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" title={resource.title}>{resource.title}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(resource.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="More options">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(resource)}>
              <ZoomIn className="h-4 w-4 mr-2" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(resource)} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ── Image preview ─────────────────────────────────────────────────────────────

function ImagePreviewDialog({
  resource, open, onOpenChange, onDelete,
}: {
  resource: ClubResourceDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (r: ClubResourceDTO) => void;
}) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <div className="bg-black flex items-center justify-center max-h-[80vh]">
          <img src={resource.imageUrl} alt={resource.title} className="max-w-full max-h-[80vh] object-contain" />
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-t bg-card">
          <div className="min-w-0">
            <p className="font-medium truncate">{resource.title}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(resource.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => downloadResource(resource)} className="gap-2">
              <Download className="h-4 w-4" /> Download
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(resource)} className="gap-2">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Upload dialog ─────────────────────────────────────────────────────────────

function UploadDialog({
  open, onOpenChange, initialFile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFile: File | null;
}) {
  const [title, setTitle]     = useState("");
  const [file, setFile]       = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef               = useRef<HTMLInputElement>(null);
  const { mutateAsync, isPending } = useUploadResource();

  useEffect(() => {
    if (!open || !initialFile) return;
    setFile(initialFile);
    const url = URL.createObjectURL(initialFile);
    setPreview(url);
    setTitle((prev) => prev || initialFile.name.replace(/\.[^.]+$/, ""));
    return () => URL.revokeObjectURL(url);
  }, [open, initialFile]);

  function applyFile(f: File) {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  }

  function handleClose() {
    if (isPending) return;
    setTitle(""); setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onOpenChange(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;
    try {
      await mutateAsync({ title: title.trim(), file });
      toast.success("Image uploaded");
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Upload image</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
            onDrop={(e) => {
              e.preventDefault();
              const f = pickImageFromDataTransfer(e.dataTransfer);
              if (f) applyFile(f);
            }}
            className="relative border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/60 transition-colors overflow-hidden"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full max-h-60 object-contain bg-muted" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                <ImageIcon className="h-10 w-10 opacity-30" />
                <p className="text-sm font-medium">Click, drop, or paste an image</p>
                <p className="text-xs">Any format, original quality preserved</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => {
              const f = e.target.files?.[0]; if (f) applyFile(f);
            }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={!file || !title.trim() || isPending}>
              {isPending ? "Uploading…" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete dialog ─────────────────────────────────────────────────────────────

function DeleteDialog({
  resource, open, onOpenChange,
}: {
  resource: ClubResourceDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate, isPending } = useDeleteResource();

  function handleDelete() {
    mutate(resource.id, {
      onSuccess: () => { toast.success("Image deleted"); onOpenChange(false); },
      onError:   () => toast.error("Failed to delete image"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Delete image?</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          &ldquo;{resource.title}&rdquo; will be permanently deleted. This cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
