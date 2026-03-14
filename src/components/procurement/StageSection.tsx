"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StageSectionProps {
  stageName: string;
  isActive: boolean;
  completedDate?: string;
  summary?: string;
  isLast?: boolean;
  children: React.ReactNode;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function StageSection({
  stageName,
  isActive,
  completedDate,
  summary,
  isLast = false,
  children,
}: StageSectionProps) {
  const [expanded, setExpanded] = useState(isActive);

  return (
    <div>
      {isActive ? (
        <div className="border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center px-4 py-3">
            <h3 className="text-[14px] font-semibold text-foreground">
              {stageName}
            </h3>
          </div>
          <div className="border-t border-blue-500/15 px-4 py-4">{children}</div>
        </div>
      ) : (
        <div className="border border-border bg-card">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left group"
          >
            <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
              <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                  {stageName}
                </h3>
                {completedDate && (
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(completedDate)}
                  </span>
                )}
              </div>
              {summary && !expanded && (
                <p className="mt-0.5 text-[12px] text-muted-foreground truncate max-w-xl">
                  {summary}
                </p>
              )}
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-180"
              )}
            />
          </button>
          {expanded && (
            <div className="border-t border-border px-4 py-3">{children}</div>
          )}
        </div>
      )}

      {!isLast && (
        <div className="ml-[25px] h-5">
          <div className="h-full border-l-[1.5px] border-dashed border-border" />
        </div>
      )}
    </div>
  );
}
