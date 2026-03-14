"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import type { Order } from "@/lib/types";
import { DEMO_STEPS, isDemoEligible } from "@/lib/demo-flow-steps";

interface DemoState {
  order: Order;
  stepIndex: number;
  isAutoProgressing: boolean;
}

type DemoAction =
  | { type: "advance" }
  | { type: "set_auto_progressing"; value: boolean };

function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "advance": {
      const nextStep = DEMO_STEPS[state.stepIndex];
      if (!nextStep) return state;
      const newOrder = nextStep.apply(state.order);
      return {
        order: newOrder,
        stepIndex: state.stepIndex + 1,
        isAutoProgressing: false,
      };
    }
    case "set_auto_progressing":
      return { ...state, isAutoProgressing: action.value };
    default:
      return state;
  }
}

export function useDemoFlow(initialOrder: Order) {
  const eligible = isDemoEligible(initialOrder);

  const [state, dispatch] = useReducer(reducer, {
    order: initialOrder,
    stepIndex: 0,
    isAutoProgressing: false,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    if (!eligible) return;
    dispatch({ type: "advance" });
  }, [eligible]);

  useEffect(() => {
    if (!eligible) return;

    const nextStep = DEMO_STEPS[state.stepIndex];
    if (!nextStep || nextStep.type !== "auto") return;

    dispatch({ type: "set_auto_progressing", value: true });

    timerRef.current = setTimeout(() => {
      dispatch({ type: "advance" });
    }, nextStep.delayMs ?? 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.stepIndex, eligible]);

  const currentStepId = DEMO_STEPS[state.stepIndex]?.id ?? "complete";
  const isComplete = state.stepIndex >= DEMO_STEPS.length;

  return {
    order: eligible ? state.order : initialOrder,
    stepIndex: state.stepIndex,
    currentStepId,
    isAutoProgressing: state.isAutoProgressing,
    isComplete,
    advance,
    isDemoActive: eligible,
  };
}
