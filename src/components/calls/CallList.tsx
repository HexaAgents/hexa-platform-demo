"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Search, Phone, ChevronRight } from "lucide-react";
import Timer from "@/components/shared/Timer";
import { callHistory, type CallRecord } from "@/data/callHistory";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CallListProps {
  timerFormatted?: string;
  onSelectLiveCall?: () => void;
  onSelectCompletedCall?: (callId: string) => void;
  callCompleted?: boolean;
}

export default function CallList({ timerFormatted = "", onSelectLiveCall, onSelectCompletedCall, callCompleted }: CallListProps) {
  const standalone = !onSelectLiveCall;
  const router = useRouter();

  const handleCallClick = (call: CallRecord) => {
    if (call.status === "live" && !standalone) {
      onSelectLiveCall?.();
    } else if (call.status === "completed") {
      if (onSelectCompletedCall) {
        onSelectCompletedCall(call.id);
      } else {
        router.push(`/calls/${call.id}`);
      }
    }
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-7 py-4">
        <div>
          <h1 className="font-display text-2xl font-medium leading-none text-foreground">Call Tracker</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">AI-monitored sales calls</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input readOnly value="Search calls..." className="h-9 w-52 border-border bg-background pl-8 text-xs text-muted-foreground" />
          </div>
          {!standalone && !callCompleted && (
            <Badge variant="secondary" className="gap-2 border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-600">
              <motion.div
                className="h-[6px] w-[6px] rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-semibold">1 Live</span>
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center border-b border-border px-7 py-2">
        <div className="flex-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Contact</div>
        <div className="w-40 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">When</div>
        <div className="w-28 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Duration</div>
        <div className="w-28 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1.5 px-4 py-3">
          {callHistory
          .filter((call) => !standalone || call.status !== "live")
          .map((call, i) => {
            const isClickable =
              (call.status === "live" && !standalone) ||
              call.status === "completed";
            return (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: "easeOut" }}
              >
                <CallCard
                  call={call}
                  timerFormatted={timerFormatted}
                  onClick={isClickable ? () => handleCallClick(call) : undefined}
                  isCompleted={standalone || (callCompleted && call.status === "live")}
                />
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function CallCard({
  call,
  timerFormatted,
  onClick,
  isCompleted,
}: {
  call: CallRecord;
  timerFormatted: string;
  onClick?: () => void;
  isCompleted?: boolean;
}) {
  const isLive = call.status === "live" && !isCompleted;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full border text-left transition-all duration-200",
        isLive
          ? "border-primary/40 bg-primary/10"
          : "border-border bg-background/30",
        onClick ? "cursor-pointer hover:border-primary/60 hover:bg-primary/5" : "cursor-default"
      )}
    >
      <div className="flex items-center px-4 py-3.5">
        <div className="flex flex-1 items-center gap-3.5">
          <Avatar className="h-9 w-9">
            <AvatarFallback className={cn("text-xs font-semibold", isLive ? "bg-primary/30 text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {call.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className={cn("text-[13px] font-medium leading-tight", isLive ? "text-foreground" : "text-foreground/85")}>{call.name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{call.company}</p>
          </div>
        </div>

        <div className="w-40 text-right">
          <p className="text-[12px] text-muted-foreground">{call.date}</p>
        </div>

        <div className="w-28 text-right">
          {isLive ? (
            <div className="flex items-center justify-end gap-1.5">
              <motion.div
                className="h-[5px] w-[5px] rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <Timer
                formatted={timerFormatted}
                className="text-[12px] font-mono text-foreground/70"
              />
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground">{call.duration}</p>
          )}
        </div>

        <div className="w-28 flex justify-end">
          {isLive ? (
            <motion.div
              className="flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Phone size={11} strokeWidth={2} />
              Tracking
            </motion.div>
          ) : (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400/50" />
              <span className="text-[12px] text-muted-foreground">
                {isCompleted ? "4 items" : `${call.items} items`}
              </span>
            </div>
          )}
        </div>

        {onClick && !isLive && (
          <div className="w-6 flex justify-end">
            <ChevronRight size={14} className="text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground/50" />
          </div>
        )}
      </div>
    </button>
  );
}
