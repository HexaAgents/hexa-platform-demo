"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import {
  Paperclip,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink,
  Maximize2,
  X,
  Table2,
  Code2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import {
  getAttachmentKind,
  decodeBase64Content,
  parseCsv,
  type AttachmentKind,
} from "@/lib/attachment-utils";

declare global {
  interface Window {
    Office?: {
      onReady: (callback: (info: { host: string }) => void) => void;
      context: {
        mailbox: {
          item: {
            from: { displayName: string; emailAddress: string };
            subject: string;
            getAttachmentsAsync: (
              callback: (result: {
                value: {
                  id: string;
                  name: string;
                  size: number;
                  contentType: string;
                }[];
              }) => void
            ) => void;
            getAttachmentContentAsync: (
              id: string,
              callback: (result: {
                status: string;
                value: { content: string; format: string };
              }) => void
            ) => void;
          };
        };
      };
    };
  }
}

interface AttachmentInfo {
  id: string;
  name: string;
  size: number;
  contentType: string;
  content?: string;
}

type ViewState = "loading" | "ready" | "sending" | "success" | "error";

const SUPPORTED_TYPES = [
  "image/",
  "application/pdf",
  "text/csv",
  "application/csv",
  "text/html",
  "application/html",
];

function isSupportedType(contentType: string, fileName: string): boolean {
  if (SUPPORTED_TYPES.some((t) => contentType.startsWith(t))) return true;
  const ext = fileName.toLowerCase();
  return ext.endsWith(".csv") || ext.endsWith(".html") || ext.endsWith(".htm");
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function KindIcon({ kind }: { kind: AttachmentKind }) {
  switch (kind) {
    case "csv":
      return <Table2 className="h-3.5 w-3.5 text-emerald-600" />;
    case "html":
      return <Code2 className="h-3.5 w-3.5 text-primary" />;
    case "pdf":
      return <FileText className="h-3.5 w-3.5 text-destructive/70" />;
    case "image":
      return <ImageIcon className="h-3.5 w-3.5 text-primary" />;
    default:
      return <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function readAttachmentContent(
  item: NonNullable<Window["Office"]>["context"]["mailbox"]["item"],
  attachmentId: string
): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      if (typeof item.getAttachmentContentAsync !== "function") {
        resolve(null);
        return;
      }
      item.getAttachmentContentAsync(attachmentId, (result) => {
        if (result.status === "succeeded" && result.value?.content) {
          resolve(result.value.content);
        } else {
          resolve(null);
        }
      });
    } catch {
      resolve(null);
    }
  });
}

function AttachmentMiniPreview({ att }: { att: AttachmentInfo }) {
  const kind = getAttachmentKind(att.contentType, att.name);

  if (!att.content) return null;

  if (kind === "csv") {
    try {
      const raw = decodeBase64Content(att.content);
      const data = parseCsv(raw);
      if (data.headers.length === 0) return null;
      const previewRows = data.rows.slice(0, 3);
      return (
        <div className="mt-1.5 max-h-[120px] overflow-hidden border border-border bg-card">
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                {data.headers.slice(0, 4).map((h, i) => (
                  <th
                    key={i}
                    className="px-1.5 py-1 text-left text-[9px] font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {h.length > 12 ? h.slice(0, 12) + "…" : h}
                  </th>
                ))}
                {data.headers.length > 4 && (
                  <th className="px-1.5 py-1 text-[9px] text-muted-foreground">
                    +{data.headers.length - 4}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, ri) => (
                <tr key={ri} className="border-b border-border">
                  {row.slice(0, 4).map((cell, ci) => (
                    <td
                      key={ci}
                      className="truncate px-1.5 py-1 text-foreground/70"
                      style={{ maxWidth: 80 }}
                    >
                      {cell || "—"}
                    </td>
                  ))}
                  {data.headers.length > 4 && (
                    <td className="px-1.5 py-1 text-muted-foreground">…</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {data.rows.length > 3 && (
            <div className="border-t border-border bg-muted/30 px-1.5 py-0.5 text-center text-[9px] text-muted-foreground">
              +{data.rows.length - 3} more rows
            </div>
          )}
        </div>
      );
    } catch {
      return null;
    }
  }

  if (kind === "image") {
    try {
      const src = `data:${att.contentType};base64,${att.content}`;
      return (
        <div className="mt-1.5 overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={att.name}
            className="h-auto max-h-[120px] w-full object-contain bg-muted/20"
          />
        </div>
      );
    } catch {
      return null;
    }
  }

  if (kind === "html") {
    return (
      <div className="mt-1.5 overflow-hidden border border-border bg-white">
        <iframe
          srcDoc={decodeBase64Content(att.content)}
          title={att.name}
          className="h-[100px] w-full border-0 pointer-events-none"
          sandbox="allow-same-origin"
        />
      </div>
    );
  }

  return null;
}

function TaskpanePreviewModal({
  att,
  onClose,
}: {
  att: AttachmentInfo;
  onClose: () => void;
}) {
  const kind = getAttachmentKind(att.contentType, att.name);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <KindIcon kind={kind} />
          <span className="text-[12px] font-medium text-foreground">
            {att.name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {kind === "csv" && att.content && (
          <div className="overflow-auto">
            <TaskpaneCsvFull content={att.content} />
          </div>
        )}
        {kind === "html" && att.content && (
          <iframe
            srcDoc={decodeBase64Content(att.content)}
            title={att.name}
            className="h-full w-full border-0 bg-white"
            sandbox="allow-same-origin"
          />
        )}
        {kind === "image" && att.content && (
          <div className="flex h-full items-center justify-center bg-muted/20 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:${att.contentType};base64,${att.content}`}
              alt={att.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
        {kind === "pdf" && att.content && (
          <object
            data={`data:${att.contentType};base64,${att.content}`}
            type="application/pdf"
            className="h-full w-full"
          >
            <div className="flex h-full items-center justify-center text-[13px] text-muted-foreground">
              PDF preview not available.
            </div>
          </object>
        )}
        {!att.content && (
          <div className="flex h-full items-center justify-center text-[13px] text-muted-foreground">
            No preview available.
          </div>
        )}
      </div>
    </div>
  );
}

function TaskpaneCsvFull({ content }: { content: string }) {
  const raw = decodeBase64Content(content);
  const data = parseCsv(raw);

  if (data.headers.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-[13px] text-muted-foreground">
        Empty CSV file.
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-[11px]">
      <thead>
        <tr className="border-b border-border bg-muted/60">
          {data.headers.map((h, i) => (
            <th
              key={i}
              className="whitespace-nowrap px-2 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, ri) => (
          <tr key={ri} className="border-b border-border hover:bg-primary/5">
            {row.map((cell, ci) => (
              <td
                key={ci}
                className="whitespace-nowrap px-2 py-1.5 text-foreground/80"
              >
                {cell || <span className="text-muted-foreground/50">—</span>}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function TaskpanePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <TaskpaneContent />
    </Suspense>
  );
}

function TaskpaneContent() {
  const [state, setState] = useState<ViewState>("loading");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [previewAtt, setPreviewAtt] = useState<AttachmentInfo | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js";
    script.onload = () => {
      window.Office?.onReady(() => {
        try {
          const item = window.Office!.context.mailbox.item;
          setSenderName(item.from.displayName);
          setSenderEmail(item.from.emailAddress);
          setSubject(item.subject);

          item.getAttachmentsAsync(async (result) => {
            const files = result.value.filter((a) =>
              isSupportedType(a.contentType, a.name)
            );

            const withContent: AttachmentInfo[] = [];
            for (const file of files) {
              const content = await readAttachmentContent(item, file.id);
              withContent.push({ ...file, content: content ?? undefined });
            }
            setAttachments(withContent);
            setState("ready");
          });
        } catch {
          setState("ready");
        }
      });
    };
    script.onerror = () => {
      setState("ready");
    };
    document.head.appendChild(script);
  }, []);

  const handleSend = useCallback(async () => {
    setState("sending");

    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          senderEmail,
          emailSubject: subject,
          customer: {
            id: `cust-${Date.now()}`,
            name: senderName || "Unknown Sender",
            email: senderEmail || "unknown@example.com",
            phone: "",
            company: senderEmail
              ? senderEmail.split("@")[1]?.split(".")[0] || "Unknown"
              : "Unknown",
            billingAddress: "Not provided",
            shippingAddress: "Not provided",
          },
          attachments: attachments.map((a) => ({
            id: `att-${Date.now()}-${a.id.slice(-6)}`,
            fileName: a.name,
            mimeType: a.contentType,
            size: a.size,
            url: "/attachment-placeholder",
            ...(a.content ? { content: a.content } : {}),
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to create order");

      const order = await res.json();
      setCreatedOrderId(order.id);
      setState("success");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
      setState("error");
    }
  }, [senderName, senderEmail, subject, attachments]);

  if (previewAtt) {
    return (
      <TaskpanePreviewModal
        att={previewAtt}
        onClose={() => setPreviewAtt(null)}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hexa-logo.png" alt="Hexa" width={20} height={20} />
          <span className="font-display text-sm font-medium tracking-tight text-foreground">
            Hexa
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {state === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-[13px] text-muted-foreground">
              Connecting to Outlook...
            </p>
          </div>
        )}

        {state === "ready" && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-base font-medium text-foreground">
                Parse & add to Hexa?
              </h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Create a new order from this email&apos;s attachments.
              </p>
            </div>

            {(senderName || senderEmail) && (
              <div className="border border-border bg-card p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  From
                </p>
                <p className="mt-0.5 text-[13px] font-medium text-foreground">
                  {senderName || senderEmail}
                </p>
                {senderName && senderEmail && (
                  <p className="text-[12px] text-muted-foreground">
                    {senderEmail}
                  </p>
                )}
                {subject && (
                  <>
                    <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Subject
                    </p>
                    <p className="mt-0.5 text-[12px] text-foreground/70">
                      {subject}
                    </p>
                  </>
                )}
              </div>
            )}

            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Attachments
              </p>
              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((att) => {
                    const kind = getAttachmentKind(att.contentType, att.name);
                    return (
                      <div
                        key={att.id}
                        className="border border-border bg-card p-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <KindIcon kind={kind} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12px] font-medium text-foreground">
                                {att.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {kind.toUpperCase()} &middot;{" "}
                                {formatFileSize(att.size)}
                              </p>
                            </div>
                          </div>
                          {att.content && (
                            <button
                              onClick={() => setPreviewAtt(att)}
                              className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              <Maximize2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        <AttachmentMiniPreview att={att} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="border border-dashed border-border p-3 text-center text-[12px] text-muted-foreground">
                  No supported attachments detected.
                </p>
              )}
            </div>

            <button
              onClick={handleSend}
              className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
            >
              <Send className="h-3.5 w-3.5" />
              Parse & Add to Hexa
            </button>
          </div>
        )}

        {state === "sending" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-[13px] text-muted-foreground">
              Creating order...
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-11 w-11 items-center justify-center bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-display text-base font-medium text-foreground">
                Order Created
              </h3>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Sent to Hexa for processing.
              </p>
            </div>
            <a
              href={
                createdOrderId
                  ? `${window.location.origin}/orders/${createdOrderId}`
                  : `${window.location.origin}/orders`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ExternalLink className="h-3 w-3" />
              View in Platform
            </a>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-11 w-11 items-center justify-center bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-display text-base font-medium text-foreground">
                Something went wrong
              </h3>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {errorMsg}
              </p>
            </div>
            <button
              onClick={() => setState("ready")}
              className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-accent"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
