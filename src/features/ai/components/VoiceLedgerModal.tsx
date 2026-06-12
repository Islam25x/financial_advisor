import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Mic, PencilLine, RotateCcw, X } from "lucide-react";
import { useCreateTransactionsFromSpeech } from "../hooks/useCreateTransactionsFromSpeech";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { useVoiceToText } from "../hooks/useVoiceToText";
import { Button, Input, Text, useToast } from "../../../shared/ui";

interface VoiceLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type VoiceLedgerState =
  | "idle"
  | "recording"
  | "transcribing"
  | "review"
  | "submitting"
  | "success";

const MODAL_TRANSITION = {
  duration: 0.22,
  ease: "easeOut",
} as const;

function createVoiceFile(blob: Blob) {
  const extension = blob.type.includes("mpeg")
    ? "mp3"
    : blob.type.includes("mp4")
      ? "m4a"
      : "webm";

  return new File([blob], `voice-ledger-${Date.now()}.${extension}`, {
    type: "audio/webm",
  });
}

function VoiceLedgerModal({ isOpen, onClose }: VoiceLedgerModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wasOpenRef = useRef(isOpen);
  const [transcript, setTranscript] = useState("");
  const recorder = useVoiceRecorder();
  const voiceToTextMutation = useVoiceToText();
  const createTransactionsMutation = useCreateTransactionsFromSpeech();
  const { showToast } = useToast();

  const isPending =
    recorder.isPreparing ||
    voiceToTextMutation.isPending ||
    createTransactionsMutation.isPending;
  const hasSuccess = Boolean(createTransactionsMutation.data);

  const state = useMemo<VoiceLedgerState>(() => {
    if (hasSuccess) {
      return "success";
    }

    if (createTransactionsMutation.isPending) {
      return "submitting";
    }

    if (voiceToTextMutation.isPending) {
      return "transcribing";
    }

    if (recorder.isRecording) {
      return "recording";
    }

    if (transcript.trim()) {
      return "review";
    }

    return "idle";
  }, [
    createTransactionsMutation.isPending,
    hasSuccess,
    recorder.isRecording,
    transcript,
    voiceToTextMutation.isPending,
  ]);

  const errorMessage =
    recorder.error ??
    voiceToTextMutation.error?.message ??
    createTransactionsMutation.error?.message ??
    null;

  const statusLabel = useMemo(() => {
    if (state === "recording") {
      return "Listening...";
    }

    if (state === "transcribing") {
      return "Converting your speech to text...";
    }

    if (state === "submitting") {
      return "Creating transactions from your transcript...";
    }

    if (state === "success") {
      return "Transactions created successfully.";
    }

    if (recorder.isPreparing) {
      return "Preparing your microphone...";
    }

    if (state === "review") {
      return "Review and edit the transcript before you confirm.";
    }

    return "Press record and describe your transaction.";
  }, [recorder.isPreparing, state]);

  useEffect(() => {
    if (isOpen && state === "review") {
      const frame = window.requestAnimationFrame(() => textareaRef.current?.focus());
      return () => window.cancelAnimationFrame(frame);
    }
  }, [isOpen, state]);

  useEffect(() => {
    if (!createTransactionsMutation.data) {
      return;
    }

    showToast({
      message:
        createTransactionsMutation.data.count === 1
          ? "1 transaction was created from voice input."
          : `${createTransactionsMutation.data.count} transactions were created from voice input.`,
      tone: "success",
    });
  }, [createTransactionsMutation.data, showToast]);

  useEffect(() => {
    if (!isOpen && wasOpenRef.current) {
      recorder.reset();
      setTranscript("");
      voiceToTextMutation.reset();
      createTransactionsMutation.reset();
    }

    wasOpenRef.current = isOpen;
  }, [isOpen]);

  const handleClose = () => {
    if (isPending) {
      return;
    }

    recorder.reset();
    setTranscript("");
    voiceToTextMutation.reset();
    createTransactionsMutation.reset();
    onClose();
  };

  const handleStartRecording = async () => {
    if (isPending) {
      return;
    }

    createTransactionsMutation.reset();
    voiceToTextMutation.reset();
    setTranscript("");

    try {
      await recorder.startRecording();
    } catch {
      return;
    }
  };

  const handleStopRecording = async () => {
    if (!recorder.isRecording || isPending) {
      return;
    }

    try {
      const audioBlob = await recorder.stopRecording();
      const response = await voiceToTextMutation.mutateAsync(createVoiceFile(audioBlob));
      setTranscript(response.text);
    } catch {
      return;
    }
  };

  const handleConfirm = async () => {
    if (isPending) {
      return;
    }

    const normalizedTranscript = transcript.trim();

    if (!normalizedTranscript) {
      return;
    }

    try {
      await createTransactionsMutation.mutateAsync(normalizedTranscript);
    } catch {
      return;
    }
  };

  const confirmDisabled = !transcript.trim() || isPending;
  const showTranscriptEditor = state === "review" || state === "submitting";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MODAL_TRANSITION}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="voice-ledger-title"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={MODAL_TRANSITION}
            className="flex w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <Text
                  as="h2"
                  variant="title"
                  weight="bold"
                  id="voice-ledger-title"
                  className="text-slate-900"
                >
                  Voice Ledger
                </Text>
                <Text variant="body" className="mt-2 text-slate-500">
                  {statusLabel}
                </Text>
              </div>
              <Button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                variant="ghost"
                size="sm"
                shape="circle"
                className="p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close Voice Ledger"
              >
                <X size={18} />
              </Button>
            </header>

            <div className="space-y-4 p-6">
              {state !== "success" && !showTranscriptEditor && (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <motion.span
                      aria-hidden="true"
                      animate={{ scale: [1, 1.22, 1], opacity: [0.24, 0.1, 0.24] }}
                      transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
                      className={`absolute inset-0 rounded-full ${
                        state === "recording" ? "bg-rose-500" : "bg-primary"
                      }`}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        void (state === "recording"
                          ? handleStopRecording()
                          : handleStartRecording());
                      }}
                      disabled={isPending && state !== "recording"}
                      variant="primary"
                      size="lg"
                      shape="circle"
                      className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full p-0 text-white shadow-lg ${
                        state === "recording" ? "bg-rose-500 hover:bg-rose-600" : "bg-primary"
                      }`}
                    >
                      {recorder.isPreparing || voiceToTextMutation.isPending ? (
                        <Loader2 size={28} className="animate-spin" />
                      ) : (
                        <Mic size={30} strokeWidth={2.4} />
                      )}
                    </Button>
                  </div>

                  {state === "recording" && (
                    <div className="flex items-center gap-1.5" aria-hidden="true">
                      {[0, 1, 2, 3, 4].map((bar) => (
                        <motion.span
                          key={bar}
                          animate={{ scaleY: [0.5, 1, 0.6, 1.15, 0.5] }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: bar * 0.08,
                            ease: "easeInOut",
                          }}
                          className="h-6 w-1.5 origin-bottom rounded-full bg-rose-400"
                        />
                      ))}
                    </div>
                  )}

                  <Text variant="body" weight="medium" className="text-slate-700">
                    {state === "recording"
                      ? "Tap again to stop recording."
                      : "Tap the mic to start recording."}
                  </Text>
                </div>
              )}

              {showTranscriptEditor && (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    <PencilLine size={16} />
                    <Text as="span" variant="body" weight="medium" className="text-emerald-700">
                      Editable transcript
                    </Text>
                  </div>
                  <Input
                    as="textarea"
                    ref={textareaRef}
                    value={transcript}
                    onChange={(event) => setTranscript(event.target.value)}
                    placeholder="Review and edit your transcribed transaction..."
                    className="min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                    disabled={isPending}
                  />
                  <Text variant="caption" className="text-slate-500">
                    Confirming this transcript will create transactions using the current backend speech parser.
                  </Text>
                </div>
              )}

              {state === "success" && createTransactionsMutation.data && (
                <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={16} />
                    <Text as="span" variant="body" weight="medium" className="text-emerald-700">
                      Success
                    </Text>
                  </div>
                  <Text variant="body" weight="bold" className="text-emerald-900">
                    {createTransactionsMutation.data.message}
                  </Text>
                  <Text variant="body" className="text-emerald-800">
                    {createTransactionsMutation.data.count === 1
                      ? "1 transaction was created."
                      : `${createTransactionsMutation.data.count} transactions were created.`}
                  </Text>
                </div>
              )}

              {errorMessage && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  <Text variant="body" className="text-rose-700">
                    {errorMessage}
                  </Text>
                </div>
              )}
            </div>

            <footer className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 p-4">
              {state !== "success" && (
                <Button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  variant="secondary"
                  size="sm"
                  className="rounded-xl border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
                >
                  Cancel
                </Button>
              )}

              {state === "review" && (
                <Button
                  type="button"
                  onClick={() => {
                    voiceToTextMutation.reset();
                    createTransactionsMutation.reset();
                    setTranscript("");
                  }}
                  disabled={isPending}
                  variant="secondary"
                  size="sm"
                  className="rounded-xl px-4 py-2 text-sm"
                >
                  <RotateCcw size={14} />
                  Record Again
                </Button>
              )}

              {state === "review" || state === "submitting" ? (
                <Button
                  type="button"
                  onClick={() => {
                    void handleConfirm();
                  }}
                  disabled={confirmDisabled}
                  variant="primary"
                  size="sm"
                  className="rounded-xl px-4 py-2 text-sm"
                >
                  {state === "submitting" ? "Creating..." : "Confirm Transcript"}
                </Button>
              ) : null}

              {state === "success" && (
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="primary"
                  size="sm"
                  className="rounded-xl px-4 py-2 text-sm"
                >
                  Done
                </Button>
              )}
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default VoiceLedgerModal;
export type { VoiceLedgerModalProps };
