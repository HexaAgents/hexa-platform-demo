"use client";

import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FileText, Download, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";

interface PoDocumentViewerProps {
  /** Display name shown in the card / modal header, e.g. "PO-2026-0061.pdf" */
  fileName: string;
  /** The rendered PO document */
  children: ReactNode;
  /** Inline preview height in px (matches the attachment PDF preview) */
  previewHeight?: number;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

function printNode(node: HTMLElement | null, title: string) {
  if (!node) return;
  const w = window.open("", "_blank", "width=920,height=1100");
  if (!w) return;
  const headStyles = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style')
  )
    .map((el) => el.outerHTML)
    .join("\n");
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${headStyles}` +
      `<style>body{margin:24px;background:#fff;display:flex;justify-content:center}` +
      `.po-print-doc{width:680px;max-width:100%}</style></head>` +
      `<body><div class="po-print-doc">${node.innerHTML}</div></body></html>`
  );
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
  }, 400);
}

export function PoDocumentViewer({
  fileName,
  children,
  previewHeight = 400,
}: PoDocumentViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const inlineDocRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = useCallback(() => {
    printNode(inlineDocRef.current, fileName.replace(/\.pdf$/i, ""));
  }, [fileName]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setExpanded(false);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [expanded, handleKeyDown]);

  useEffect(() => {
    if (expanded) setZoom(1);
  }, [expanded]);

  return (
    <div className="space-y-2">
      {/* Header row — mirrors the attachment viewer layout */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px]">
          <FileText className="h-4 w-4 text-destructive/70" />
          <span className="font-medium text-foreground/85">{fileName}</span>
          <span className="text-muted-foreground">(PDF)</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Download className="h-3 w-3" />
            Download
          </button>
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Maximize2 className="h-3 w-3" />
            Expand
          </button>
        </div>
      </div>

      {/* Inline preview — fixed height, click to expand */}
      <div
        className="cursor-pointer overflow-auto border border-border bg-muted/20"
        style={{ maxHeight: previewHeight }}
        onClick={() => setExpanded(true)}
      >
        <div ref={inlineDocRef} className="pointer-events-none p-4">
          {children}
        </div>
      </div>

      {expanded &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setExpanded(false)}
            />
            <div className="relative z-10 mx-4 flex max-h-[90vh] w-full max-w-5xl flex-col border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-destructive/70" />
                  <span className="text-[13px] font-medium text-foreground">
                    {fileName}
                  </span>
                  <span className="text-[11px] uppercase text-muted-foreground">
                    pdf
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 border border-border">
                    <button
                      onClick={() =>
                        setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))
                      }
                      disabled={zoom <= MIN_ZOOM}
                      className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-[11px] tabular-nums text-muted-foreground">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={() =>
                        setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))
                      }
                      disabled={zoom >= MAX_ZOOM}
                      className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                  <button
                    onClick={() => setExpanded(false)}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto bg-muted/30 p-6">
                <div
                  className="mx-auto w-[680px] max-w-full origin-top transition-transform"
                  style={{ transform: `scale(${zoom})` }}
                >
                  {children}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
