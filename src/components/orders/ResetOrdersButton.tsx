"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResetOrdersButton() {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = useCallback(async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/orders/reset", { method: "POST" });
      if (res.ok) {
        setConfirmOpen(false);
        router.push("/orders");
        router.refresh();
      }
    } finally {
      setResetting(false);
    }
  }, [router]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 border-border text-muted-foreground hover:text-foreground"
        onClick={() => setConfirmOpen(true)}
        title="Remove demo orders added from email, storefront, etc. Keeps the 5 basic orders."
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset to basic
      </Button>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl">
            <h3 className="text-[15px] font-medium text-foreground">
              Reset orders?
            </h3>
            <p className="mt-2 text-[13px] text-muted-foreground">
              This will remove all orders added from email, storefront, and
              other sources. Only the 5 original demo orders will remain.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmOpen(false)}
                disabled={resetting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReset}
                disabled={resetting}
              >
                {resetting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Resetting…
                  </>
                ) : (
                  "Reset"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
