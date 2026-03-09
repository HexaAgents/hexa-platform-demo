"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getSupplier,
  getSupplierRules,
  getSupplierOpportunities,
  getSupplierPerformance,
  metricLabels,
} from "@/data/sla-data";
import type { RiskTier, Recommendation, Status } from "@/data/sla-data";
import { ArrowLeft, Building2, ChevronRight, User, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

function RiskTierLabel({ tier }: { tier: RiskTier }) {
  return (
    <span className="text-sm text-muted-foreground">
      {tier.charAt(0) + tier.slice(1).toLowerCase()} risk
    </span>
  );
}

function RecommendationLabel({ rec }: { rec: Recommendation }) {
  const label = rec === "CLAIM" ? "Claim" : rec === "DO_NOT_CLAIM" ? "Auto-Close" : "Review";
  return <span className="text-[13px] text-muted-foreground">{label}</span>;
}

function StatusLabel({ status }: { status: Status }) {
  const labels: Record<Status, string> = {
    OPEN: "Open",
    SENT: "Sent",
    ACKNOWLEDGED: "Acknowledged",
    CREDITED: "Recovered",
    CLOSED: "Closed",
  };
  return (
    <span className={cn("text-[13px]", status === "OPEN" ? "text-foreground font-medium" : "text-muted-foreground")}>
      {labels[status]}
    </span>
  );
}

export default function SupplierPage() {
  const params = useParams();
  const router = useRouter();
  const supplier = getSupplier(params.id as string);
  const rules = getSupplierRules(params.id as string);
  const opportunities = getSupplierOpportunities(params.id as string);
  const performance = getSupplierPerformance(params.id as string);

  if (!supplier) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Supplier not found.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/claims")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Claims
        </Button>
      </div>
    );
  }

  const totalCredits = opportunities.reduce(
    (sum, o) => sum + o.creditAmount,
    0
  );
  const openCount = opportunities.filter((o) => o.status === "OPEN").length;

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-start justify-between border-b border-border bg-card px-7 py-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-1">
            <Link href="/suppliers" className="hover:text-foreground transition-colors">
              Suppliers
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{supplier.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[22px] font-medium leading-none text-foreground">
              {supplier.name}
            </h1>
            <RiskTierLabel tier={supplier.riskTier} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {supplier.category}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {supplier.accountOwner}
            </span>
            <span className="flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              {openCount} open claims · £{totalCredits.toLocaleString()} total
            </span>
          </div>
        </div>
      </div>

      <div className="px-7 pb-8 pt-6 space-y-6">
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="rules">SLA Rules</TabsTrigger>
            <TabsTrigger value="opportunities">
              Opportunities ({opportunities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Monthly Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Shipments</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">OTIF</TableHead>
                      <TableHead className="text-right">Fill Rate</TableHead>
                      <TableHead className="text-right">Quality (PPM)</TableHead>
                      <TableHead className="text-right">Avg Response</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performance.map((p) => (
                      <TableRow key={p.month}>
                        <TableCell className="font-medium">{p.month}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{p.totalShipments}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{p.totalUnits.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">£{p.totalValue.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className={p.onTimeDelivery < 90 ? "text-destructive font-medium" : ""}>
                            {p.onTimeDelivery}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={p.fillRate < 95 ? "text-destructive font-medium" : ""}>
                            {p.fillRate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={p.qualityPpm > 300 ? "text-destructive font-medium" : ""}>
                            {p.qualityPpm}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={p.avgResponseHours > 48 ? "text-destructive font-medium" : ""}>
                            {p.avgResponseHours}h
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {performance.length > 0 && (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        OTIF Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {performance.map((p) => {
                        const onTimeCount = Math.round((p.onTimeDelivery / 100) * p.totalShipments);
                        return (
                          <div key={p.month} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-foreground">{p.month} <span className="text-muted-foreground">({onTimeCount}/{p.totalShipments} shipments · {p.totalUnits.toLocaleString()} units)</span></span>
                              <span className="font-medium">{p.onTimeDelivery}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted overflow-hidden">
                              <div
                                className={`h-full ${
                                  p.onTimeDelivery >= 90
                                    ? "bg-emerald-500"
                                    : p.onTimeDelivery >= 80
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${p.onTimeDelivery}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Fill Rate Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {performance.map((p) => {
                        const filledCount = Math.round((p.fillRate / 100) * p.totalShipments);
                        const filledUnits = Math.round((p.fillRate / 100) * p.totalUnits);
                        return (
                          <div key={p.month} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-foreground">{p.month} <span className="text-muted-foreground">({filledCount}/{p.totalShipments} shipments · {filledUnits.toLocaleString()}/{p.totalUnits.toLocaleString()} units)</span></span>
                              <span className="font-medium">{p.fillRate}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted overflow-hidden">
                              <div
                                className={`h-full ${
                                  p.fillRate >= 95
                                    ? "bg-emerald-500"
                                    : p.fillRate >= 85
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${p.fillRate}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Active SLA Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Grace Days</TableHead>
                      <TableHead>Credit Type</TableHead>
                      <TableHead>Credit Value</TableHead>
                      <TableHead className="w-[300px]">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">
                          {metricLabels[rule.metric]}
                        </TableCell>
                        <TableCell>
                          {rule.metric === "QUALITY_PPM"
                            ? `≤ ${rule.threshold} PPM`
                            : rule.metric === "RESPONSE_TIME_HOURS"
                            ? `≤ ${rule.threshold} hrs`
                            : `≥ ${rule.threshold}%`}
                        </TableCell>
                        <TableCell>{rule.graceDays}d</TableCell>
                        <TableCell className="text-muted-foreground">
                          {rule.creditType === "PERCENT_INVOICE"
                            ? "% of invoice"
                            : "Fixed amount"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {rule.creditType === "PERCENT_INVOICE"
                            ? `${rule.creditValue}%`
                            : `£${rule.creditValue}`}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {rule.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Credit Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Breach Type</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunities.map((opp) => (
                      <TableRow
                        key={opp.id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell>
                          <Link
                            href={`/claims/${opp.id}`}
                            className="font-medium hover:underline"
                          >
                            {opp.poNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{metricLabels[opp.metric]}</TableCell>
                        <TableCell className="font-semibold">
                          £{opp.creditAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <RecommendationLabel rec={opp.recommendation} />
                        </TableCell>
                        <TableCell>
                          <StatusLabel status={opp.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(opp.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {opportunities.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No credit opportunities for this supplier.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
