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
  | { type: "advance"; mutate?: (order: Order) => Order }
  | { type: "set_auto_progressing"; value: boolean }
  | { type: "reset"; order: Order; steps: DemoStep[]; startIndex: number };

function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "advance": {
      const baseOrder = action.mutate ? action.mutate(state.order) : state.order;
      const nextStep = state.steps[state.stepIndex];
      if (!nextStep) {
        return baseOrder === state.order ? state : { ...state, order: baseOrder };
      }
      const newOrder = nextStep.apply(baseOrder);
      return {
        ...state,
        order: newOrder,
        stepIndex: state.stepIndex + 1,
        isAutoProgressing: false,
      };
    }
    case "set_auto_progressing":
      return { ...state, isAutoProgressing: action.value };
    case "reset":
      return {
        order: action.order,
        steps: action.steps,
        stepIndex: action.startIndex,
        isAutoProgressing: false,
      };
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
  const orderStageRef = useRef(initialOrder.stage);

  const advance = useCallback(() => {
    if (!eligible) return;
    dispatch({ type: "advance" });
  }, [eligible]);

  const advanceWith = useCallback((mutate: (order: Order) => Order) => {
    if (!eligible) return;
    dispatch({ type: "advance", mutate });
  }, [eligible]);

  useEffect(() => {
    const stageChanged = initialOrder.stage !== orderStageRef.current;
    if (eligible && stageChanged) {
      const newSteps = getDemoSteps(initialOrder);
      const newStartIndex = getStartStepIndex(initialOrder);
      dispatch({ type: "reset", order: initialOrder, steps: newSteps, startIndex: newStartIndex });
    }
    orderStageRef.current = initialOrder.stage;
  }, [eligible, initialOrder]);

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
    advanceWith,
    isDemoActive: eligible,
  };
}
