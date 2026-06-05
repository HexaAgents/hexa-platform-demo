"use client";

import { useEffect, useRef, useState } from "react";
import type { Order } from "@/lib/types";
import type { DemoContext } from "../OrderWorkspace";
import {
  Search,
  Check,
  Star,
  ChevronDown,
  Loader2,
  Boxes,
  FileText,
  Sparkles,
  PackageSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  order: Order;
  mode: "active" | "completed";
  demoCtx?: DemoContext;
}

type Candidate = NonNullable<
  NonNullable<Order["demoFlow"]>["skuAdvisory"]
>["candidates"][number];

const SEARCH_STEPS = [
  "Reading customer reply & extracting requirements",
  "Inspecting attached photo — existing fastener & measurements",
  "Searching inventory · 12,480 SKUs across fasteners",
  "Reviewing product spec sheets & material datasheets",
  "Cross-referencing corrosion resistance for washdown",
  "Ranking candidates by fit, availability & cost",
];

const STEP_INTERVAL_MS = 1050;

function CandidateImage({ src, alt }: { src?: string; alt: string }) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const sources = [src, "/products/bolts-fasteners.jpg"];
  const current = stage < 2 ? sources[stage] : undefined;

  useEffect(() => {
    setStage(src ? 0 : 1);
  }, [src]);

  if (!current) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground">
        <PackageSearch className="h-6 w-6" />
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={current}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setStage((s) => (s < 2 ? ((s + 1) as 0 | 1 | 2) : s))}
    />
  );
}

function ThinkingAnimation() {
  const [activeIdx, setActiveIdx] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const timer = setInterval(() => {
      setActiveIdx((prev) => {
        if (prev >= SEARCH_STEPS.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, STEP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border border-blue-500/20 bg-blue-500/[0.04] p-4">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-blue-800">
        <Search className="h-3.5 w-3.5 animate-pulse" />
        Hexa is searching inventory &amp; product specifications
      </div>
      <p className="mt-1 text-[11px] text-blue-700/70">
        Matching the customer&apos;s requirements and photo against stock and spec
        sheets to recommend the right part.
      </p>

      <ul className="mt-3 space-y-1.5">
        {SEARCH_STEPS.map((label, i) => {
          const done = i < activeIdx;
          const active = i === activeIdx;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2 text-[12px] transition-colors",
                done
                  ? "text-emerald-700"
                  : active
                    ? "text-foreground/85"
                    : "text-muted-foreground/50"
              )}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                {done ? (
                  <span className="flex h-4 w-4 items-center justify-center border border-emerald-500/40 bg-emerald-500/10">
                    <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
                  </span>
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                )}
              </span>
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CandidateCard({
  candidate,
  rank,
  selectable,
  isSelected,
  onSelect,
}: {
  candidate: Candidate;
  rank: number;
  selectable: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const recommended = candidate.recommended;

  return (
    <div
      className={cn(
        "border bg-card transition-colors",
        isSelected
          ? "border-foreground/60 ring-1 ring-foreground/20"
          : recommended
            ? "border-emerald-500/40 bg-emerald-500/[0.03]"
            : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-border bg-muted text-[10px] font-semibold text-muted-foreground">
            {rank}
          </span>
          {recommended ? (
            <span className="inline-flex items-center gap-1 border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              <Star className="h-3 w-3 fill-emerald-500/30" />
              Recommended
            </span>
          ) : (
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Alternative
            </span>
          )}
        </div>
        {isSelected && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            Selected
          </span>
        )}
      </div>

      <div className="flex gap-3 p-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden border border-border bg-muted/20">
          <CandidateImage src={candidate.imageUrl} alt={candidate.name} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-snug text-foreground">
            {candidate.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
            <span className="font-mono text-muted-foreground">{candidate.sku}</span>
            <span className="font-medium text-foreground/85">
              ${candidate.unitPrice.toFixed(2)}
              <span className="text-muted-foreground">/{candidate.uom ?? "unit"}</span>
            </span>
            {candidate.availability && (
              <span className="text-emerald-700">{candidate.availability}</span>
            )}
          </div>

          <ul className="mt-2.5 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
            {candidate.fitPoints.map((point) => (
              <li
                key={point}
                className="flex items-start gap-1.5 text-[11.5px] text-foreground/75"
              >
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" strokeWidth={3} />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className={cn(
          "mx-4 mb-3 flex gap-2 border-l-2 px-3 py-2 text-[11.5px] leading-relaxed",
          recommended
            ? "border-emerald-500/50 bg-emerald-500/[0.05] text-emerald-900/80"
            : "border-border bg-muted/30 text-foreground/70"
        )}
      >
        <Sparkles
          className={cn(
            "mt-0.5 h-3.5 w-3.5 shrink-0",
            recommended ? "text-emerald-600" : "text-muted-foreground"
          )}
        />
        <p>
          <span className="font-medium">
            {recommended ? "Why Hexa recommends it: " : "Why it wasn't recommended: "}
          </span>
          {candidate.recommendationNote}
        </p>
      </div>

      {candidate.specs && candidate.specs.length > 0 && (
        <div className="border-t border-border/70 px-4">
          <button
            type="button"
            onClick={() => setShowDetails((s) => !s)}
            className="flex w-full items-center gap-1.5 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <FileText className="h-3 w-3" />
            {showDetails ? "Hide" : "View"} full specification
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                showDetails && "rotate-180"
              )}
            />
          </button>
          {showDetails && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 pb-3 sm:grid-cols-3">
              {candidate.specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {spec.label}
                  </dt>
                  <dd className="text-[11.5px] text-foreground/85">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {selectable && (
        <div className="border-t border-border/70 px-4 py-3">
          <button
            type="button"
            onClick={onSelect}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 text-[12px] font-medium transition-opacity hover:opacity-90",
              recommended
                ? "bg-emerald-600 text-white"
                : "bg-foreground text-background"
            )}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            Select {recommended ? "recommended" : "this"} part &amp; build quote
          </button>
        </div>
      )}
    </div>
  );
}

export function SkuRecommendationSection({ order, mode, demoCtx }: Props) {
  const advisory = order.demoFlow?.skuAdvisory;

  const isSelectStep = demoCtx?.stepId === "adv_select_sku";
  const [phase, setPhase] = useState<"thinking" | "results">(
    isSelectStep && !advisory?.selectedCandidateId ? "thinking" : "results"
  );

  useEffect(() => {
    if (phase !== "thinking") return;
    const timer = setTimeout(
      () => setPhase("results"),
      SEARCH_STEPS.length * STEP_INTERVAL_MS + 350
    );
    return () => clearTimeout(timer);
  }, [phase]);

  if (!advisory) return null;

  const selectedId = advisory.selectedCandidateId;
  const candidates = advisory.candidates;
  const selectable = mode === "active" && isSelectStep && !selectedId;

  const handleSelect = (candidateId: string) => {
    if (!demoCtx || demoCtx.stepId !== "adv_select_sku") return;
    demoCtx.advanceWith((o) => {
      const sa = o.demoFlow?.skuAdvisory;
      if (!sa) return o;
      return {
        ...o,
        demoFlow: {
          ...o.demoFlow!,
          skuAdvisory: {
            ...sa,
            selectedCandidateId: candidateId,
            selectedAt: new Date().toISOString(),
          },
        },
      };
    });
  };

  if (selectable && phase === "thinking") {
    return <ThinkingAnimation />;
  }

  // Completed / selected view — lead with the chosen part.
  if (selectedId) {
    const chosen = candidates.find((c) => c.id === selectedId);
    const others = candidates.filter((c) => c.id !== selectedId);
    return (
      <div className="space-y-3">
        {chosen && (
          <CandidateCard
            candidate={chosen}
            rank={candidates.indexOf(chosen) + 1}
            selectable={false}
            isSelected
            onSelect={() => {}}
          />
        )}
        {others.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Other options considered
            </p>
            <div className="space-y-2 opacity-70">
              {others.map((c) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  rank={candidates.indexOf(c) + 1}
                  selectable={false}
                  isSelected={false}
                  onSelect={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 border border-blue-500/20 bg-blue-500/[0.04] px-4 py-3">
        <Boxes className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <div>
          <p className="text-[12px] font-semibold text-blue-900">
            {candidates.length} candidate SKUs found — 1 recommended for this
            washdown environment
          </p>
          <p className="text-[11px] text-blue-700/70">
            Matched to the customer&apos;s existing bolt (≈1/2&quot; ·
            through-bolted · 2.5–3&quot; grip) and the washdown corrosion
            requirement. Review the options and select one to build the quote.
          </p>
        </div>
      </div>

      {candidates.map((candidate, idx) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          rank={idx + 1}
          selectable={selectable}
          isSelected={false}
          onSelect={() => handleSelect(candidate.id)}
        />
      ))}
    </div>
  );
}
