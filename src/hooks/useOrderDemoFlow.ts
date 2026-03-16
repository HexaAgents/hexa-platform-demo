"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import type { Order } from "@/lib/types";
import { getDemoSteps, isDemoEligible, getStartStepIndex, type DemoStep } from "@/lib/demo-flow-steps";

interface DemoState {
  order: Order;
  steps: DemoStep[];
  stepIndex: number;
  isAutoProgressing: boolean;
}

type DemoAction =
  | { type: "advance" }
  | { type: "set_auto_progressing"; value: boolean };

function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "advance": {
      const nextStep = state.steps[state.stepIndex];
      if (!nextStep) return state;
      const newOrder = nextStep.apply(state.order);
      return {
        ...state,
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

export function useOrderDemoFlow(initialOrder: Order) {
  const eligible = isDemoEligible(initialOrder);

  const steps = eligible ? getDemoSteps(initialOrder) : [];
  const startIndex = eligible ? getStartStepIndex(initialOrder) : 0;

  const [state, dispatch] = useReducer(reducer, {
    order: initialOrder,
    steps,
    stepIndex: startIndex,
    isAutoProgressing: false,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    if (!eligible) return;
    dispatch({ type: "advance" });
  }, [eligible]);

  useEffect(() => {
    if (!eligible) return;

    const nextStep = state.steps[state.stepIndex];
    if (!nextStep || nextStep.type !== "auto") return;

    dispatch({ type: "set_auto_progressing", value: true });

    timerRef.current = setTimeout(() => {
      dispatch({ type: "advance" });
    }, nextStep.delayMs ?? 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.stepIndex, eligible, state.steps]);

  const currentStepId = state.steps[state.stepIndex]?.id ?? "complete";
  const isComplete = state.stepIndex >= state.steps.length;

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
