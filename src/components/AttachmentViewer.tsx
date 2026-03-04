import { Attachment } from "@/lib/types";
import { FileText, Image as ImageIcon } from "lucide-react";

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
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
            <div className="overflow-hidden border border-border bg-muted/20">
              {isImage ? (
                <div className="relative flex min-h-[300px] items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20 p-8">
                  <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border bg-card">
                      <ImageIcon className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Handwritten Order Note
                      </p>
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
              ) : (
                <div className="relative flex min-h-[300px] items-center justify-center bg-gradient-to-br from-red-500/5 to-orange-500/5 p-8">
                  <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border bg-card">
                      <FileText className="h-7 w-7 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        PDF Order Document
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {att.fileName}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
