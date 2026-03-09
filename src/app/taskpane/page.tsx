"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import {
  Paperclip,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

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

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
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
            const files = result.value.filter(
              (a) =>
                a.contentType.startsWith("image/") ||
                a.contentType === "application/pdf"
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

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hexa-logo.png"
            alt="Hexa"
            width={20}
            height={20}
          />
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
                <div className="space-y-1.5">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 border border-border bg-card p-2.5"
                    >
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-foreground">
                          {att.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatFileSize(att.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="border border-dashed border-border p-3 text-center text-[12px] text-muted-foreground">
                  No PDF or image attachments detected.
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
