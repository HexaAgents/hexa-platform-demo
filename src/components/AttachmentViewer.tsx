"use client";

import { useState } from "react";
import { Attachment } from "@/lib/types";
import {
  FileText,
  Image as ImageIcon,
  Table2,
  Code2,
  Maximize2,
} from "lucide-react";
import {
  getAttachmentKind,
  decodeBase64Content,
  parseCsv,
} from "@/lib/attachment-utils";
import { CsvTableView } from "./CsvTableView";
import { AttachmentPreviewModal } from "./AttachmentPreviewModal";

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function KindIcon({ mimeType, fileName }: { mimeType: string; fileName: string }) {
  const kind = getAttachmentKind(mimeType, fileName);
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

function InlinePreview({ att }: { att: Attachment }) {
  const kind = getAttachmentKind(att.mimeType, att.fileName);

  if (!att.content) {
    return <PlaceholderPreview att={att} kind={kind} />;
  }

  if (kind === "csv") {
    const raw = decodeBase64Content(att.content);
    const data = parseCsv(raw);
    return (
      <div className="max-h-[300px] overflow-auto border border-border bg-card">
        <CsvTableView data={data} />
      </div>
    );
  }

  if (kind === "html") {
    const html = decodeBase64Content(att.content);
    return (
      <div className="overflow-hidden border border-border bg-white">
        <iframe
          srcDoc={html}
          title={att.fileName}
          className="h-[300px] w-full border-0"
          sandbox="allow-same-origin"
        />
      </div>
    );
  }

  if (kind === "image") {
    const src = `data:${att.mimeType};base64,${att.content}`;
    return (
      <div className="overflow-hidden border border-border bg-muted/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={att.fileName}
          className="h-auto w-full object-contain"
          style={{ maxHeight: 400 }}
        />
      </div>
    );
  }

  if (kind === "pdf") {
    const src = `data:${att.mimeType};base64,${att.content}`;
    return (
      <div className="overflow-hidden border border-border bg-muted/20">
        <object data={src} type="application/pdf" className="h-[400px] w-full">
          <PlaceholderPreview att={att} kind={kind} />
        </object>
      </div>
    );
  }

  return <PlaceholderPreview att={att} kind={kind} />;
}

function PlaceholderPreview({
  att,
  kind,
}: {
  att: Attachment;
  kind: string;
}) {
  return (
    <div className="overflow-hidden border border-border bg-muted/20">
      <div className="flex min-h-[180px] items-center justify-center p-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-border bg-card">
            <KindIcon mimeType={att.mimeType} fileName={att.fileName} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-foreground/85">
              {att.fileName}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {kind.toUpperCase()} &middot; {formatFileSize(att.size)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AttachmentViewer({
  attachments,
}: {
  attachments: Attachment[];
}) {
  const [previewAtt, setPreviewAtt] = useState<Attachment | null>(null);

  if (attachments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center border border-dashed border-border bg-muted/20">
        <p className="text-[13px] text-muted-foreground">No attachments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Source Attachments
      </h3>

      {attachments.map((att) => (
        <div key={att.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px]">
              <KindIcon mimeType={att.mimeType} fileName={att.fileName} />
              <span className="font-medium text-foreground/85">
                {att.fileName}
              </span>
              <span className="text-muted-foreground">
                ({formatFileSize(att.size)})
              </span>
            </div>
            {att.content && (
              <button
                onClick={() => setPreviewAtt(att)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Maximize2 className="h-3 w-3" />
                Expand
              </button>
            )}
          </div>

          <div
            className={att.content ? "cursor-pointer" : ""}
            onClick={() => att.content && setPreviewAtt(att)}
          >
            <InlinePreview att={att} />
          </div>
        </div>
      ))}

      {previewAtt && (
        <AttachmentPreviewModal
          attachment={previewAtt}
          onClose={() => setPreviewAtt(null)}
        />
      )}
    </div>
  );
}
