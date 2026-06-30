"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagesSection, pickImageFromDataTransfer } from "./ImagesSection";
import { DocumentsSection } from "./DocumentsSection";
import { ImageIcon } from "lucide-react";

type Tab = "images" | "documents";

const TABS: { key: Tab; label: string }[] = [
  { key: "images",    label: "Images" },
  { key: "documents", label: "Documents" },
];

export function ResourcesScreen() {
  const [tab, setTab]               = useState<Tab>("images");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver]   = useState(false);
  const dragCounterRef = useRef(0);

  // Drop/paste only makes sense on the Images tab
  const openWithFile = useCallback((file: File) => {
    setTab("images");
    setPendingFile(file);
  }, []);

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) return;
      if (!e.clipboardData) return;
      const file = pickImageFromDataTransfer(e.clipboardData as unknown as DataTransfer);
      if (file) openWithFile(file);
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [openWithFile]);

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (e.dataTransfer.types.includes("Files")) setIsDragOver(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragOver(false);
  }
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    const file = pickImageFromDataTransfer(e.dataTransfer);
    if (file) openWithFile(file);
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Full-page drop overlay */}
      {isDragOver && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-4 border-dashed border-primary">
          <div className="flex flex-col items-center gap-3 text-primary">
            <ImageIcon className="h-16 w-16" />
            <p className="text-xl font-semibold">Drop image to upload</p>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="px-6 pt-6 pb-0">
        <h2 className="text-2xl font-bold">Resources</h2>
      </div>

      {/* Tab bar */}
      <div className="border-b px-6 mt-4">
        <div className="flex gap-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 p-6 max-w-5xl w-full mx-auto">
        {tab === "images" && (
          <ImagesSection
            pendingFile={pendingFile}
            onClearPendingFile={() => setPendingFile(null)}
          />
        )}
        {tab === "documents" && <DocumentsSection />}
      </div>
    </div>
  );
}
