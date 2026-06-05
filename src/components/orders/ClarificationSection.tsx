"use client";

import { useState } from "react";
import { Order } from "@/lib/types";
import { Mail, ArrowRight, Paperclip, ImageOff } from "lucide-react";

interface Props {
  order: Order;
  mode: "active" | "completed";
}

function ReplyPhoto({ url, caption }: { url: string; caption?: string }) {
  const [errored, setErrored] = useState(false);
  return (
    <div className="mt-3 max-w-sm border border-emerald-500/20 bg-background">
      <div className="flex items-center gap-1.5 border-b border-emerald-500/20 px-2.5 py-1.5 text-[11px] font-medium text-emerald-800">
        <Paperclip className="h-3 w-3" />
        Photo attachment
      </div>
      {errored ? (
        <div className="flex h-40 flex-col items-center justify-center gap-1.5 bg-muted/30 text-muted-foreground">
          <ImageOff className="h-5 w-5" />
          <span className="text-[11px]">{url.split("/").pop()}</span>
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={url}
          alt={caption ?? "Customer photo"}
          className="h-auto w-full object-contain"
          style={{ maxHeight: 280 }}
          onError={() => setErrored(true)}
        />
      )}
      {caption && (
        <p className="px-2.5 py-1.5 text-[11px] text-muted-foreground">{caption}</p>
      )}
    </div>
  );
}

export function ClarificationSection({ order, mode }: Props) {
  const clarifications = order.demoFlow?.clarifications;
  if (!clarifications || clarifications.length === 0) return null;

  return (
    <div className="space-y-4">
      {clarifications.map((round, idx) => (
        <div key={idx} className="space-y-3">
          {clarifications.length > 1 && (
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Round {idx + 1}
            </p>
          )}

          <div className="border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              Sent to {round.emailSent.to} &middot;{" "}
              {new Date(round.emailSent.sentAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
            <p className="mt-1.5 text-[12px] font-medium text-foreground/85">
              {round.emailSent.subject}
            </p>
            <div className="mt-2 space-y-1">
              {round.questions.map((q, qi) => (
                <p key={qi} className="text-[12px] text-muted-foreground">
                  {qi + 1}. {q}
                </p>
              ))}
            </div>
          </div>

          {round.replyReceived && (
            <>
              <div className="flex justify-center">
                <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground/40" />
              </div>
              <div className="border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-700">
                  <Mail className="h-3.5 w-3.5" />
                  Customer replied &middot;{" "}
                  {new Date(round.replyReceived.receivedAt).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  {round.replyReceived.parsedAnswers.map((a, ai) => (
                    <p key={ai} className="text-[12px] text-emerald-800/80">
                      {ai + 1}. {a}
                    </p>
                  ))}
                </div>
                {round.replyReceived.photoUrl && (
                  <ReplyPhoto
                    url={round.replyReceived.photoUrl}
                    caption={round.replyReceived.photoCaption}
                  />
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
