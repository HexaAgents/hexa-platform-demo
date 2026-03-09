"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Table2, Image as ImageIcon, Code2 } from "lucide-react";
import { Attachment } from "@/lib/types";
import {
  getAttachmentKind,
  decodeBase64Content,
  parseCsv,
  type AttachmentKind,
} from "@/lib/attachment-utils";
import { CsvTableView } from "./CsvTableView";

function KindIcon({ kind }: { kind: AttachmentKind }) {
  switch (kind) {
    case "csv":
      return <Table2 className="h-4 w-4 text-emerald-600" />;
    case "html":
      return <Code2 className="h-4 w-4 text-primary" />;
    case "pdf":
      return <FileText className="h-4 w-4 text-destructive/70" />;
    case "image":
      return <ImageIcon className="h-4 w-4 text-primary" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
}

function ModalContent({ attachment }: { attachment: Attachment }) {
  const kind = getAttachmentKind(attachment.mimeType, attachment.fileName);

  if (!attachment.content) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <p className="text-[13px]">No preview available — content not loaded.</p>
      </div>
    );
  }

  if (kind === "csv") {
    const raw = decodeBase64Content(attachment.content);
    const data = parseCsv(raw);
    return <CsvTableView data={data} />;
  }

  if (kind === "html") {
    const html = decodeBase64Content(attachment.content);
    return (
      <iframe
        srcDoc={html}
        title={attachment.fileName}
        className="h-[70vh] w-full border-0 bg-white"
        sandbox="allow-same-origin"
      />
    );
  }

  if (kind === "image") {
    const src = `data:${attachment.mimeType};base64,${attachment.content}`;
    return (
      <div className="flex items-center justify-center bg-muted/20 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={attachment.fileName}
          className="max-h-[70vh] w-auto object-contain"
        />
      </div>
    );
  }

  if (kind === "pdf") {
    const src = `data:${attachment.mimeType};base64,${attachment.content}`;
    return (
      <object data={src} type="application/pdf" className="h-[70vh] w-full">
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <p className="text-[13px]">PDF preview not available in this browser.</p>
        </div>
      </object>
    );
  }

  return (
    <div className="flex h-64 items-center justify-center text-muted-foreground">
      <p className="text-[13px]">
        Preview not available for this file type.
      </p>
    </div>
  );
}

export function AttachmentPreviewModal({
  attachment,
  onClose,
}: {
  attachment: Attachment;
  onClose: () => void;
}) {
  const kind = getAttachmentKind(attachment.mimeType, attachment.fileName);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 mx-4 flex max-h-[90vh] w-full max-w-5xl flex-col border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2.5">
            <KindIcon kind={kind} />
            <span className="text-[13px] font-medium text-foreground">
              {attachment.fileName}
            </span>
            <span className="text-[11px] text-muted-foreground uppercase">
              {kind}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <ModalContent attachment={attachment} />
        </div>
      </div>
    </div>,
    document.body
  );
}
