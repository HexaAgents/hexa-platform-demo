"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SpeedProvider, useSpeed } from "@/hooks/useSpeedControl";
import { useCallTimer } from "@/hooks/useCallTimer";
import { useDemoFlow } from "@/hooks/useDemoFlow";
import SpeedControl from "@/components/shared/SpeedControl";
import PhoneFrame from "@/components/phone/PhoneFrame";
import HomeScreen from "@/components/phone/HomeScreen";
import IncomingCall from "@/components/phone/IncomingCall";
import MiniPhone from "@/components/phone/MiniPhone";
import AppSidebar from "@/components/AppSidebar";
import CallList from "@/components/calls/CallList";
import CallDetail from "@/components/calls/CallDetail";
import CallDetailView from "@/components/calls/CallDetailView";
import { callHistory } from "@/data/callHistory";
import { callDetails } from "@/data/callDetails";

function useWindowSize() {
  const [size, setSize] = useState({ width: 1280, height: 800 });
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

function DemoApp() {
  const router = useRouter();
  const {
    screen, goToScreen,
    callAccepted, setCallAccepted,
    hexaToggled, setHexaToggled,
    screen5State, setScreen5State,
    callCompleted, setCallCompleted,
  } = useDemoFlow();

  const timer = useCallTimer();
  const { speed } = useSpeed();
  const windowSize = useWindowSize();
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [phonePhase, setPhonePhase] = useState<"centered" | "shrinking" | "mini">("centered");
  const [showWebApp, setShowWebApp] = useState(false);
  const [webAppView, setWebAppView] = useState<"list" | "detail" | "completed-detail">("list");
  const [selectedCompletedCallId, setSelectedCompletedCallId] = useState<string | null>(null);

  const [hexaNotificationVisible, setHexaNotificationVisible] = useState(false);
  const [hexaNotificationResponded, setHexaNotificationResponded] = useState(false);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && screen === 1 && !showIncomingCall) {
        e.preventDefault();
        setShowIncomingCall(true);
        goToScreen(3);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screen, showIncomingCall, goToScreen]);

  useEffect(() => {
    if (showIncomingCall && !hexaNotificationResponded) {
      notificationTimerRef.current = setTimeout(() => {
        setHexaNotificationVisible(true);
      }, 800 / speed);
    }
    return () => {
      if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    };
  }, [showIncomingCall, hexaNotificationResponded, speed]);

  const handleAccept = useCallback(() => {
    setCallAccepted(true);
    timer.start();
    setTimeout(() => {
      setPhonePhase("shrinking");
      setShowWebApp(true);
      setTimeout(() => {
        setPhonePhase("mini");
        goToScreen(4);
      }, 1000 / speed);
    }, 500 / speed);
  }, [setCallAccepted, timer, goToScreen, speed]);

  const handleTrackChoice = useCallback(
    (choice: "yes" | "no") => {
      if (choice === "yes") setHexaToggled(true);
      setHexaNotificationResponded(true);
      setTimeout(() => {
        setHexaNotificationVisible(false);
      }, 300);
    },
    [setHexaToggled]
  );

  const handleSelectLive = useCallback(() => {
    setWebAppView("detail");
    goToScreen(5);
  }, [goToScreen]);

  const handleSelectCompleted = useCallback((callId: string) => {
    setSelectedCompletedCallId(callId);
    setWebAppView("completed-detail");
  }, []);

  const handleBackToList = useCallback(() => {
    setWebAppView("list");
    setCallCompleted(true);
    goToScreen(4);
  }, [goToScreen, setCallCompleted]);

  const handleBackFromCompleted = useCallback(() => {
    setWebAppView("list");
    setSelectedCompletedCallId(null);
  }, []);

  const handleCallEnd = useCallback(() => timer.stop(), [timer]);

  const handleOrderCreated = useCallback((orderId: string) => {
    router.push(`/orders/${orderId}`);
  }, [router]);

  const targetX = -(windowSize.width / 2 - 100 - 24);
  const targetY = windowSize.height / 2 - 180 - 24;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <SpeedControl />

      {screen === 1 && !showIncomingCall && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-[11px] font-medium text-muted-foreground/80">
          Press spacebar to start
        </div>
      )}

      {phonePhase !== "mini" && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: phonePhase === "shrinking" ? 60 : 10 }}
          animate={
            phonePhase === "shrinking"
              ? { scale: 0.4, x: targetX, y: targetY, opacity: 0 }
              : { scale: 1, x: 0, y: 0, opacity: 1 }
          }
          transition={
            phonePhase === "shrinking"
              ? { type: "spring", stiffness: 180, damping: 22 }
              : { duration: 0 }
          }
        >
          <PhoneFrame
            hexaToggled={hexaToggled}
            dynamicIslandExpanded={hexaNotificationVisible}
            dynamicIslandResponded={hexaNotificationResponded}
            onDynamicIslandChoice={handleTrackChoice}
          >
            <AnimatePresence mode="wait">
              {(screen === 1 || (screen === 3 && !showIncomingCall)) && (
                <motion.div key="home" className="h-full"
                  exit={{ opacity: 0, scale: 1.06 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <HomeScreen />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showIncomingCall && screen >= 3 && (
                <IncomingCall
                  callAccepted={callAccepted}
                  timerFormatted={timer.formatted}
                  onAccept={handleAccept}
                />
              )}
            </AnimatePresence>
          </PhoneFrame>
        </motion.div>
      )}

      <AnimatePresence>
        {showWebApp && (
          <motion.div key="webapp" className="absolute inset-0 flex" style={{ zIndex: 20 }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
          >
            <div className="h-px w-full absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/30 via-primary/70 to-primary/30" />
            <AppSidebar activeItem="Call Tracker" />
            <div className="flex-1 min-h-0 overflow-hidden">
              <AnimatePresence mode="wait">
                {webAppView === "list" && (
                  <motion.div key="list" className="h-full min-h-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CallList
                      timerFormatted={timer.formatted}
                      onSelectLiveCall={handleSelectLive}
                      onSelectCompletedCall={handleSelectCompleted}
                      callCompleted={callCompleted}
                    />
                  </motion.div>
                )}
                {webAppView === "detail" && (
                  <motion.div key="detail" className="h-full min-h-0"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CallDetail
                      timerFormatted={timer.formatted}
                      elapsedSeconds={timer.elapsedSeconds}
                      isTimerRunning={timer.isRunning}
                      onBack={handleBackToList}
                      screen5State={screen5State}
                      setScreen5State={setScreen5State}
                      onCallEnd={handleCallEnd}
                      onOrderCreated={handleOrderCreated}
                    />
                  </motion.div>
                )}
                {webAppView === "completed-detail" && selectedCompletedCallId && (() => {
                  const selectedCall = callHistory.find((c) => c.id === selectedCompletedCallId);
                  const selectedDetail = callDetails[selectedCompletedCallId];
                  if (!selectedCall || !selectedDetail) return null;
                  return (
                    <motion.div key="completed-detail" className="h-full min-h-0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CallDetailView
                        call={selectedCall}
                        detail={selectedDetail}
                        onBack={handleBackFromCompleted}
                      />
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phonePhase === "mini" && (
        <MiniPhone
          timerFormatted={timer.formatted}
          callEnded={!timer.isRunning && callAccepted}
          visible={!callCompleted}
        />
      )}
    </div>
  );
}

export default function DemoPage() {
  return (
    <SpeedProvider>
      <DemoApp />
    </SpeedProvider>
  );
}
