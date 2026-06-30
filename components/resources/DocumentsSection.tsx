"use client";

import { useEffect, useRef, useState } from "react";
import {
  useDocuments,
  useUploadDocument,
  useCreateLink,
  useCreateText,
  useDeleteDocument,
} from "@/hooks/useDocuments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  ChevronLeft,
  ChevronRight,
  X,
  MoreHorizontal,
  FileText,
  Link as LinkIcon,
  AlignLeft,
  File,
  ExternalLink,
  Eye,
} from "lucide-react";
import type { ClubDocumentDTO } from "@/lib/serializers";
import type { DocumentType } from "@/models/ClubDocument";

const PAGE_SIZE = 15;

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function docIcon(doc: ClubDocumentDTO) {
  if (doc.type === "link") return <LinkIcon className="h-4 w-4" />;
  if (doc.type === "text") return <AlignLeft className="h-4 w-4" />;
  const mime = doc.mimeType ?? "";
  if (mime.includes("pdf") || mime.includes("word") || mime.includes("text"))
    return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
}

const TYPE_BADGE: Record<DocumentType, string> = {
  file: "bg-blue-100 text-blue-700",
  link: "bg-purple-100 text-purple-700",
  text: "bg-amber-100 text-amber-700",
};

const TYPE_LABEL: Record<DocumentType, string> = {
  file: "File",
  link: "Link",
  text: "Text",
};

export function DocumentsSection() {
  const [q, setQ]           = useState("");
  const [page, setPage]     = useState(1);
  const [addOpen, setAddOpen]         = useState(false);
  const [viewTarget, setViewTarget]   = useState<ClubDocumentDTO | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<ClubDocumentDTO | undefined>();

  const debouncedQ = useDebounce(q);
  useEffect(() => { setPage(1); }, [debouncedQ]);

  const params = {
    ...(debouncedQ && { q: debouncedQ }),
    page,
    pageSize: PAGE_SIZE,
  };

  const { data: paged, isLoading } = useDocuments(params);
  const docs       = paged?.data ?? [];
  const total      = paged?.total ?? 0;
  const totalPages = paged?.totalPages ?? 1;
  const pageStart  = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd    = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {paged ? `${total} item${total !== 1 ? "s" : ""}${debouncedQ ? " matching search" : ""}` : ""}
        </p>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add document
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
          <button onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          {!debouncedQ && total === 0 ? (
            <div className="space-y-3">
              <File className="h-12 w-12 mx-auto opacity-20" />
              <p className="font-medium">No documents yet</p>
              <p className="text-sm">Add a file, link, or text note to get started.</p>
              <Button onClick={() => setAddOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add document
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">No documents match your search</p>
              <Button variant="ghost" size="sm" onClick={() => setQ("")}>Clear search</Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {docs.map((d) => (
              <DocumentRow
                key={d.id}
                doc={d}
                onView={setViewTarget}
                onDelete={setDeleteTarget}
              />
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

      <AddDocumentDialog open={addOpen} onOpenChange={setAddOpen} />

      {viewTarget && (
        <ViewDocumentDialog
          doc={viewTarget}
          open={!!viewTarget}
          onOpenChange={(open) => !open && setViewTarget(undefined)}
          onDelete={(d) => { setViewTarget(undefined); setDeleteTarget(d); }}
        />
      )}

      {deleteTarget && (
        <DeleteDocumentDialog
          doc={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        />
      )}
    </div>
  );
}

// ── Document row ──────────────────────────────────────────────────────────────

function DocumentRow({
  doc, onView, onDelete,
}: {
  doc: ClubDocumentDTO;
  onView:   (d: ClubDocumentDTO) => void;
  onDelete: (d: ClubDocumentDTO) => void;
}) {
  function handleDownload() {
    // API returns 302 → signed Cloudinary URL; browser follows and downloads
    window.location.href = `/api/documents/${doc.id}/download`;
  }

  function handlePrimaryAction() {
    if (doc.type === "link") {
      window.open(doc.url, "_blank", "noopener,noreferrer");
    } else {
      onView(doc);
    }
  }

  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-xl border bg-card hover:shadow-sm transition-shadow">
      {/* Icon */}
      <div className="shrink-0 w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        {docIcon(doc)}
      </div>

      {/* Info — clickable */}
      <button
        type="button"
        onClick={handlePrimaryAction}
        className="flex-1 min-w-0 text-left"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">{doc.title}</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[doc.type]}`}>
            {TYPE_LABEL[doc.type]}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {doc.type === "link" && doc.url}
          {doc.type === "text" && doc.content.slice(0, 80)}
          {doc.type === "file" && (doc.originalFilename || doc.mimeType)}
        </p>
      </button>

      {/* Date */}
      <span className="shrink-0 text-xs text-muted-foreground hidden sm:block">
        {new Date(doc.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
      </span>

      {/* Three-dot menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="More options">
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {doc.type === "link" ? (
            <DropdownMenuItem onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}>
              <ExternalLink className="h-4 w-4 mr-2" /> Open link
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => onView(doc)}>
              <Eye className="h-4 w-4 mr-2" /> View
            </DropdownMenuItem>
          )}
          {doc.type === "file" && (
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onDelete(doc)} className="text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── Add document dialog ───────────────────────────────────────────────────────

type AddTab = DocumentType;

function AddDocumentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [tab, setTab]     = useState<AddTab>("file");
  const [title, setTitle] = useState("");
  // file
  const [file, setFile]   = useState<File | null>(null);
  const fileRef           = useRef<HTMLInputElement>(null);
  // link
  const [url, setUrl]           = useState("");
  const [description, setDesc]  = useState("");
  // text
  const [content, setContent]   = useState("");

  const uploadDoc  = useUploadDocument();
  const createLink = useCreateLink();
  const createText = useCreateText();

  const isPending = uploadDoc.isPending || createLink.isPending || createText.isPending;

  function reset() {
    setTab("file"); setTitle(""); setFile(null);
    setUrl(""); setDesc(""); setContent("");
  }

  function handleClose() {
    if (isPending) return;
    reset(); onOpenChange(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (tab === "file") {
        if (!file || !title.trim()) return;
        await uploadDoc.mutateAsync({ title: title.trim(), file });
      } else if (tab === "link") {
        if (!title.trim() || !url.trim()) return;
        await createLink.mutateAsync({ title: title.trim(), url: url.trim(), description: description.trim() });
      } else {
        if (!title.trim() || !content.trim()) return;
        await createText.mutateAsync({ title: title.trim(), content: content.trim() });
      }
      toast.success("Document added");
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add document");
    }
  }

  const isValid =
    tab === "file" ? !!(file && title.trim()) :
    tab === "link" ? !!(title.trim() && url.trim()) :
    !!(title.trim() && content.trim());

  const TABS: { key: AddTab; label: string }[] = [
    { key: "file", label: "File" },
    { key: "link", label: "Link" },
    { key: "text", label: "Text" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add document</DialogTitle>
        </DialogHeader>

        {/* Type tabs */}
        <div className="flex gap-0 border-b -mx-6 px-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Title (all tabs) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title" required />
          </div>

          {/* File tab */}
          {tab === "file" && (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); }
              }}
              className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/60 transition-colors text-muted-foreground"
            >
              {file ? (
                <>
                  <File className="h-8 w-8 text-primary" />
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                </>
              ) : (
                <>
                  <File className="h-8 w-8 opacity-30" />
                  <p className="text-sm font-medium">Click or drop a file here</p>
                  <p className="text-xs">PDF, Word, Excel, and more</p>
                </>
              )}
              <input ref={fileRef} type="file" className="sr-only" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); }
              }} />
            </div>
          )}

          {/* Link tab */}
          {tab === "link" && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">URL</label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" type="url" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Description <span className="font-normal">(optional)</span></label>
                <Input value={description} onChange={(e) => setDesc(e.target.value)} placeholder="Brief description" />
              </div>
            </>
          )}

          {/* Text tab */}
          {tab === "text" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your text note here…"
                rows={6}
                required
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending ? "Saving…" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── View dialog (text / file) ─────────────────────────────────────────────────

function ViewDocumentDialog({
  doc, open, onOpenChange, onDelete,
}: {
  doc: ClubDocumentDTO;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDelete: (d: ClubDocumentDTO) => void;
}) {
  function handleDownload() {
    window.location.href = `/api/documents/${doc.id}/download`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              {docIcon(doc)}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base leading-snug">{doc.title}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(doc.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </DialogHeader>

        {doc.type === "text" && (
          <div className="max-h-72 overflow-y-auto rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap">
            {doc.content}
          </div>
        )}

        {doc.type === "file" && (
          <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            {doc.originalFilename || "File"}{doc.mimeType ? ` · ${doc.mimeType}` : ""}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {doc.type === "file" && (
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" /> Download
            </Button>
          )}
          <Button variant="destructive" onClick={() => onDelete(doc)} className="gap-2">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete dialog ─────────────────────────────────────────────────────────────

function DeleteDocumentDialog({
  doc, open, onOpenChange,
}: {
  doc: ClubDocumentDTO;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { mutate, isPending } = useDeleteDocument();

  function handleDelete() {
    mutate(doc.id, {
      onSuccess: () => { toast.success("Document deleted"); onOpenChange(false); },
      onError:   () => toast.error("Failed to delete document"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Delete document?</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          &ldquo;{doc.title}&rdquo; will be permanently deleted. This cannot be undone.
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
