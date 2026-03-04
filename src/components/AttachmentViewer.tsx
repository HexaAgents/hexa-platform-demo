import { Attachment } from "@/lib/types";
import { FileText, Image as ImageIcon, Download } from "lucide-react";

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function RealImagePreview({ att }: { att: Attachment }) {
  const src = `data:${att.mimeType};base64,${att.content}`;
  return (
    <div className="overflow-hidden border border-border bg-muted/20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={att.fileName}
        className="h-auto w-full object-contain"
        style={{ maxHeight: 500 }}
      />
    </div>
  );
}

function RealPdfPreview({ att }: { att: Attachment }) {
  const src = `data:${att.mimeType};base64,${att.content}`;
  return (
    <div className="overflow-hidden border border-border bg-muted/20">
      <object
        data={src}
        type="application/pdf"
        className="h-[500px] w-full"
      >
        <div className="flex flex-col items-center justify-center gap-3 p-8">
          <FileText className="h-10 w-10 text-red-400" />
          <p className="text-sm text-muted-foreground">
            PDF preview not available in this browser.
          </p>
          <a
            href={src}
            download={att.fileName}
            className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </a>
        </div>
      </object>
    </div>
  );
}

function MockImagePreview({ att }: { att: Attachment }) {
  return (
    <div className="overflow-hidden border border-border bg-muted/20">
      <div className="relative flex min-h-[300px] items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20 p-8">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border bg-card">
            <ImageIcon className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Handwritten Order Note</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {att.fileName}
            </p>
          </div>
          <div className="mx-auto max-w-[240px] border border-border bg-card p-4 text-left font-mono text-xs leading-relaxed text-muted-foreground">
            <p>50x Blue Widget 10pk WDG-BLU-10</p>
            <p>20 Red Gadgets</p>
            <p>10 boxes Green Sprockets SPR-100</p>
            <p>5 Flux Capacitors FLX-???</p>
            <p>100 Copper Fasteners CF-250</p>
            <p>30 rubber seals</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockPdfPreview({ att }: { att: Attachment }) {
  return (
    <div className="overflow-hidden border border-border bg-muted/20">
      <div className="relative flex min-h-[300px] items-center justify-center bg-gradient-to-br from-red-500/5 to-orange-500/5 p-8">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border bg-card">
            <FileText className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium">PDF Order Document</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {att.fileName}
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
  if (attachments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center border border-dashed border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">No attachments</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Source Attachments
      </h3>
      {attachments.map((att) => {
        const isImage = att.mimeType.startsWith("image/");
        const hasContent = !!att.content;

        return (
          <div key={att.id} className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {isImage ? (
                <ImageIcon className="h-4 w-4 text-blue-400" />
              ) : (
                <FileText className="h-4 w-4 text-red-400" />
              )}
              <span className="font-medium">{att.fileName}</span>
              <span className="text-muted-foreground">
                ({formatFileSize(att.size)})
              </span>
            </div>

            {hasContent && isImage && <RealImagePreview att={att} />}
            {hasContent && !isImage && <RealPdfPreview att={att} />}
            {!hasContent && isImage && <MockImagePreview att={att} />}
            {!hasContent && !isImage && <MockPdfPreview att={att} />}
          </div>
        );
      })}
    </div>
  );
}
