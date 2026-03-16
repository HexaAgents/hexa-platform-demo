"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { callHistory } from "@/data/callHistory";
import { callDetails } from "@/data/callDetails";
import CallDetailView from "@/components/calls/CallDetailView";

interface CallPageProps {
  params: Promise<{ id: string }>;
}

export default function CallPage({ params }: CallPageProps) {
  const { id } = use(params);
  const call = callHistory.find((c) => c.id === id);
  const detail = callDetails[id];

  if (!call || !detail) {
    notFound();
  }

  return (
    <div className="h-full">
      <CallDetailView call={call} detail={detail} />
    </div>
  );
}
