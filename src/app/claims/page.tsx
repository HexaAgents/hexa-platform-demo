"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  Search,
  Download,
  FileText,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { creditOpportunities, slaSuppliers, metricLabels } from "@/data/sla-data";
import type { Recommendation, Status } from "@/data/sla-data";
import { cn } from "@/lib/utils";

function RecommendationBadge({ rec }: { rec: Recommendation }) {
  const label = rec === "CLAIM" ? "Claim" : rec === "DO_NOT_CLAIM" ? "Auto-Close" : "Review";
  return (
    <span className="text-[12px] text-muted-foreground">{label}</span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const labels: Record<Status, string> = {
    OPEN: "Open",
    SENT: "Sent",
    ACKNOWLEDGED: "Acknowledged",
    CREDITED: "Recovered",
    CLOSED: "Closed",
  };
  return (
    <span className={cn(
      "text-[12px]",
      status === "OPEN" ? "text-foreground font-medium" : "text-muted-foreground"
    )}>
      {labels[status]}
    </span>
  );
}

function ClaimsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState(searchParams.get("supplier") || "all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [recFilter, setRecFilter] = useState(searchParams.get("recommendation") || "all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = creditOpportunities
    .filter((o) => supplierFilter === "all" || o.supplierId === supplierFilter)
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .filter((o) => recFilter === "all" || o.recommendation === recFilter)
    .filter((o) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        o.poNumber.toLowerCase().includes(q) ||
        o.supplierName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "amount") {
        return sortDir === "desc"
          ? b.creditAmount - a.creditAmount
          : a.creditAmount - b.creditAmount;
      }
      return sortDir === "desc"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const toggleSort = (col: "date" | "amount") => {
    if (sortBy === col) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const needAttentionCount = creditOpportunities.filter(
    (o) => o.status === "OPEN"
  ).length;

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header — title left, search right */}
      <div className="flex items-center justify-between border-b border-border px-7 py-4">
        <div>
          <h1 className="font-display text-2xl font-medium leading-none text-foreground">
            Claims Queue
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Review and manage SLA credit claims
          </p>
        </div>
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PO number or supplier..."
            className="h-9 w-52 border-border bg-background pl-8 text-[12px] text-muted-foreground"
          />
        </div>
      </div>

      {/* Filters and actions — separate section below header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-7 py-3">
        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
          <SelectTrigger className="h-9 w-[140px] shrink-0 border-border bg-background text-[12px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground [&>span]:truncate">
            <SelectValue placeholder="Supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {slaSuppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[120px] shrink-0 border-border bg-background text-[12px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground [&>span]:truncate">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="CREDITED">Recovered</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={recFilter} onValueChange={setRecFilter}>
          <SelectTrigger className="h-9 w-[150px] shrink-0 border-border bg-background text-[12px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground [&>span]:truncate">
            <SelectValue placeholder="Recommendation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Recommendations</SelectItem>
            <SelectItem value="CLAIM">Claim</SelectItem>
            <SelectItem value="DO_NOT_CLAIM">Auto-Close</SelectItem>
            <SelectItem value="REVIEW">Review</SelectItem>
          </SelectContent>
        </Select>
        {needAttentionCount > 0 && (
          <Badge
            variant="secondary"
            className="shrink-0 gap-1.5 border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-700"
          >
            <span className="text-xs font-semibold">
              {needAttentionCount} Need Attention
            </span>
          </Badge>
        )}
        <div className="flex-1" />
        <button
          type="button"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 border border-border px-3 text-[12px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
        <button
          type="button"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 bg-foreground px-3 text-[12px] font-medium text-background transition-opacity hover:opacity-90"
        >
          Create Claim
        </button>
      </div>

      {/* Column headers — matches Orders/Procurement */}
      <div className="flex items-center border-b border-border px-7 py-2">
        <div className="flex-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Supplier / PO
        </div>
        <div className="w-48 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Breach Details
        </div>
        <div
          className="w-28 cursor-pointer select-none text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => toggleSort("amount")}
        >
          <span className="inline-flex items-center gap-1">
            Credit Value
            <ArrowUpDown className="h-3 w-3" />
          </span>
        </div>
        <div className="w-24 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Recommendation
        </div>
        <div className="w-24 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Status
        </div>
        <div
          className="w-28 cursor-pointer select-none text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => toggleSort("date")}
        >
          <span className="inline-flex items-center justify-end gap-1">
            Detected
            <ArrowUpDown className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* List — card-style rows matching Orders/Procurement */}
      <ScrollArea className="flex-1">
        <div className="space-y-1.5 px-4 py-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <FileText className="h-8 w-8 opacity-40" />
              <p className="text-[13px] font-medium">No claims found</p>
              <p className="text-[11px]">
                Try a different search or clear filters
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSupplierFilter("all");
                  setStatusFilter("all");
                  setRecFilter("all");
                }}
                className="text-xs"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            filtered.map((opp) => (
              <Link
                key={opp.id}
                href={`/claims/${opp.id}`}
                className="group block w-full border border-border bg-background/30 text-left transition-all duration-200 hover:border-primary/60 hover:bg-primary/5"
              >
                <div className="flex items-center px-4 py-3.5">
                  <div className="flex flex-1 items-center gap-3.5">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                        <FileText className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[13px] font-medium leading-tight text-foreground/85 group-hover:text-primary transition-colors">
                        {opp.supplierName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground font-mono">
                        {opp.poNumber}
                      </p>
                    </div>
                  </div>

                  <div className="w-48">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] font-medium">{metricLabels[opp.metric]}</span>
                      <span className="text-[11px] text-muted-foreground max-w-[180px] truncate">
                        {opp.breachMargin}
                      </span>
                    </div>
                  </div>

                  <div className="w-28 text-right">
                    <span className="text-[12px] font-semibold text-foreground tabular-nums">
                      £{opp.creditAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-24 text-right">
                    <RecommendationBadge rec={opp.recommendation} />
                  </div>

                  <div className="w-24 flex justify-end">
                    <StatusBadge status={opp.status} />
                  </div>

                  <div className="w-28 text-right">
                    <p className="text-[12px] text-muted-foreground">
                      {new Date(opp.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </ScrollArea>

      {filtered.length > 0 && (
        <div className="border-t border-border px-7 py-2 text-[11px] text-muted-foreground">
          Showing {filtered.length} of {creditOpportunities.length} claims
        </div>
      )}
    </div>
  );
}

export default function ClaimsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>}>
      <ClaimsContent />
    </Suspense>
  );
}
