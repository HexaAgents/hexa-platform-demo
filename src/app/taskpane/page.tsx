"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ExternalLink, X } from "lucide-react";

declare global {
  interface Window {
    Office?: {
      context: {
        ui?: {
          messageParent: (message: string) => void;
        };
      };
    };
  }
}

function closeDialog() {
  try {
    window.Office?.context.ui?.messageParent("done");
  } catch {
    window.close();
  }
}

export default function TaskpanePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]" />}>
      <ResultView />
    </Suspense>
  );
}

function ResultView() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const platformUrl = orderId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/orders/${orderId}`
    : `${typeof window !== "undefined" ? window.location.origin : ""}/orders`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] p-6 text-[#fafafa]">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        </div>
        <p className="text-sm font-semibold">Order Created</p>
        <div className="flex items-center gap-2">
          <a
            href={platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#fafafa] px-3 py-1.5 text-xs font-medium text-[#0a0a0f] transition-colors hover:bg-[#e4e4e7]"
          >
            <ExternalLink className="h-3 w-3" />
            Open in Platform
          </a>
          <button
            onClick={closeDialog}
            className="inline-flex items-center gap-1 border border-[#1e1e2a] bg-[#131318] px-3 py-1.5 text-xs font-medium text-[#71717a] transition-colors hover:bg-[#1c1c24]"
          >
            <X className="h-3 w-3" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
