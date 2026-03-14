"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineSectionProps {
  title: string;
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

export function TimelineSection({
  title,
  isActive,
  completedDate,
  summary,
  isLast = false,
  children,
}: TimelineSectionProps) {
  const [expanded, setExpanded] = useState(isActive);
  const prevActiveRef = useRef(isActive);

  useEffect(() => {
    if (isActive && !prevActiveRef.current) {
      setExpanded(true);
    }
    prevActiveRef.current = isActive;
  }, [isActive]);

  return (
    <div className="flex gap-0">
      <div className="flex flex-col items-center w-8 shrink-0">
        {isActive ? (
          <div className="relative flex h-6 w-6 items-center justify-center mt-0.5">
            <span className="absolute h-6 w-6 animate-ping rounded-full bg-blue-400/30" />
            <span className="relative h-3.5 w-3.5 rounded-full bg-blue-600" />
          </div>
        ) : (
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600 mt-0.5" />
        )}
        {!isLast && (
          <div
            className={cn(
              "w-px flex-1 min-h-[16px]",
              isActive ? "bg-border" : "bg-emerald-400"
            )}
          />
        )}
      </div>

      <div className={cn("flex-1 min-w-0 pb-6", isLast && "pb-0")}>
        {isActive ? (
          <>
            <div className="mb-4">
              <h3 className="text-[14px] font-semibold text-foreground">
                {title}
              </h3>
            </div>
            <div>{children}</div>
          </>
        ) : (
          <>
            <button
              onClick={() => setExpanded((p) => !p)}
              className="flex w-full items-center gap-3 text-left group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                    {title}
                  </h3>
                  {completedDate && (
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(completedDate)}
                    </span>
                  )}
                </div>
                {summary && !expanded && (
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
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
              <div className="mt-3">{children}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
