"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileText,
  Mic,
  MicOff,
  Keyboard,
  Check,
  Loader2,
  File,
  ImageIcon,
  Clock,
  FileSpreadsheet,
  PenLine,
  Type,
} from "lucide-react";
import {
  saveCart,
  simulateMatching,
  getDefaultCartItems,
  getCartItemsForSample,
  RECENT_UPLOADS,
  type RecentUpload,
} from "@/lib/cart-utils";

type Tab = "recent" | "upload" | "dictate" | "type";
type Phase = "input" | "processing" | "done";

interface ProcessingStep {
  label: string;
  duration: number;
}

const STEPS: ProcessingStep[] = [
  { label: "Reading your input...", duration: 800 },
  { label: "Identifying items...", duration: 1000 },
  { label: "Matching to catalog...", duration: 1200 },
  { label: "Building your cart...", duration: 800 },
];

export default function UploadOrderModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("recent");
  const [phase, setPhase] = useState<Phase>("input");

  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [currentStep, setCurrentStep] = useState(-1);

  const fileRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const hasInput =
    (tab === "recent" && selectedSample !== null) ||
    (tab === "upload" && file !== null) ||
    (tab === "dictate" && transcript.trim().length > 0) ||
    (tab === "type" && textInput.trim().length > 0);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const SR =
      typeof window !== "undefined" &&
      ((window as unknown as Record<string, unknown>).SpeechRecognition ||
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition);
    if (!SR) {
      setTranscript(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SR as any)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleProcess = useCallback(async () => {
    setPhase("processing");
    setCurrentStep(0);

    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, STEPS[i].duration));
    }

    let items;
    if (tab === "recent" && selectedSample) {
      items = getCartItemsForSample(selectedSample);
    } else if (tab === "type" && textInput.trim()) {
      items = simulateMatching(textInput);
    } else if (tab === "dictate" && transcript.trim()) {
      items = simulateMatching(transcript);
    } else {
      items = getDefaultCartItems();
    }

    saveCart(items);
    setPhase("done");
    await new Promise((r) => setTimeout(r, 400));
    onClose();
    router.push("/storefront/cart");
  }, [tab, textInput, transcript, selectedSample, onClose, router]);

  const fileIcon = (f: File) => {
    if (f.type.startsWith("image/")) return <ImageIcon className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9ECEF]">
          <h2 className="text-lg font-bold text-[#212529]">
            {phase === "input" ? "Upload Your Order" : "Processing Order"}
          </h2>
          {phase === "input" && (
            <button
              onClick={onClose}
              className="text-[#6C757D] hover:text-[#212529] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {phase === "input" ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              {/* Tabs */}
              <div className="flex gap-1 bg-[#F1F3F5] rounded-lg p-1 mb-5">
                {(
                  [
                    { id: "recent", label: "Recent", icon: Clock },
                    { id: "upload", label: "Upload", icon: Upload },
                    { id: "dictate", label: "Dictate", icon: Mic },
                    { id: "type", label: "Type", icon: Keyboard },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      tab === id
                        ? "bg-white text-[#003366] shadow-sm"
                        : "text-[#6C757D] hover:text-[#212529]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[220px]">
                {tab === "recent" && (
                  <div className="space-y-2.5">
                    {RECENT_UPLOADS.map((sample) => {
                      const iconMap: Record<RecentUpload["type"], React.ReactNode> = {
                        pdf: <FileText className="w-5 h-5 text-[#E63312]" />,
                        csv: <FileSpreadsheet className="w-5 h-5 text-[#28A745]" />,
                        image: <PenLine className="w-5 h-5 text-[#6C63FF]" />,
                        text: <Type className="w-5 h-5 text-[#003366]" />,
                      };
                      const selected = selectedSample === sample.id;
                      return (
                        <button
                          key={sample.id}
                          onClick={() => setSelectedSample(selected ? null : sample.id)}
                          className={`w-full flex items-center gap-3.5 p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                            selected
                              ? "border-[#003366] bg-[#003366]/5 ring-1 ring-[#003366]/20"
                              : "border-[#E9ECEF] hover:border-[#ADB5BD] hover:bg-[#F8F9FA]"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            selected ? "bg-[#003366]/10" : "bg-[#F1F3F5]"
                          }`}>
                            {iconMap[sample.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#212529] truncate">
                              {sample.label}
                            </p>
                            <p className="text-xs text-[#6C757D] mt-0.5">
                              {sample.description}
                            </p>
                          </div>
                          <span className="text-[11px] text-[#ADB5BD] whitespace-nowrap flex-shrink-0">
                            {sample.timestamp}
                          </span>
                          {selected && (
                            <div className="w-5 h-5 rounded-full bg-[#003366] flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {tab === "upload" && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      file
                        ? "border-[#28A745] bg-[#28A745]/5"
                        : "border-[#CED4DA] hover:border-[#003366] hover:bg-[#F8F9FA]"
                    }`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      className="hidden"
                      accept=".csv,.pdf,.jpg,.jpeg,.png,.heic"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setFile(f);
                      }}
                    />
                    {file ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-[#28A745]">{fileIcon(file)}</div>
                        <div>
                          <p className="font-semibold text-sm text-[#212529]">
                            {file.name}
                          </p>
                          <p className="text-xs text-[#6C757D] mt-1">
                            {(file.size / 1024).toFixed(1)} KB — Click to
                            change
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="w-10 h-10 text-[#ADB5BD]" />
                        <div>
                          <p className="font-semibold text-sm text-[#212529]">
                            Drag &amp; drop your file here
                          </p>
                          <p className="text-xs text-[#6C757D] mt-1">
                            or click to browse — CSV, PDF, JPG, PNG, HEIC
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tab === "dictate" && (
                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={toggleRecording}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isRecording
                          ? "bg-[#E63312] text-white animate-pulse"
                          : "bg-[#F1F3F5] text-[#003366] hover:bg-[#003366]/10"
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="w-8 h-8" />
                      ) : (
                        <Mic className="w-8 h-8" />
                      )}
                    </button>
                    <p className="text-sm text-[#6C757D]">
                      {isRecording
                        ? "Listening... tap to stop"
                        : "Tap to start dictating your item list"}
                    </p>
                    {transcript && (
                      <div className="w-full bg-[#F8F9FA] rounded-lg p-4 text-sm text-[#212529] max-h-32 overflow-y-auto border border-[#E9ECEF]">
                        {transcript}
                      </div>
                    )}
                  </div>
                )}

                {tab === "type" && (
                  <div>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={`Enter items, one per line or separated by commas.\n\nExamples:\n24 bearing kits IBK-400\n60 stainless flanges 3 inch\n100 hex bolts M12\n10 safety glasses`}
                      className="w-full h-48 border border-[#CED4DA] rounded-lg p-4 text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#003366] resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleProcess}
                disabled={!hasInput}
                className={`w-full mt-5 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  hasInput
                    ? "bg-[#E63312] hover:bg-[#CC2200] text-white"
                    : "bg-[#E9ECEF] text-[#ADB5BD] cursor-not-allowed"
                }`}
              >
                <File className="w-4 h-4" />
                Process Order
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 py-12"
            >
              <div className="flex flex-col items-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-12 h-12 rounded-full border-3 border-[#E9ECEF] border-t-[#003366] mb-4"
                />
                <p className="text-sm font-medium text-[#6C757D]">
                  Analyzing your order...
                </p>
              </div>

              <div className="space-y-4 max-w-xs mx-auto">
                {STEPS.map((step, i) => {
                  const isActive = i === currentStep;
                  const isDone = i < currentStep;
                  return (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: i <= currentStep ? 1 : 0.3,
                        x: 0,
                      }}
                      transition={{ delay: i * 0.15, duration: 0.3 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          isDone
                            ? "bg-[#28A745] text-white"
                            : isActive
                              ? "bg-[#003366] text-white"
                              : "bg-[#E9ECEF] text-[#ADB5BD]"
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-4 h-4" />
                        ) : isActive ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="text-xs font-bold">{i + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          isDone
                            ? "text-[#28A745] font-medium"
                            : isActive
                              ? "text-[#212529] font-medium"
                              : "text-[#ADB5BD]"
                        }`}
                      >
                        {step.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {phase === "done" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex items-center justify-center gap-2 text-[#28A745] font-semibold text-sm"
                >
                  <Check className="w-5 h-5" />
                  Cart ready — redirecting...
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
