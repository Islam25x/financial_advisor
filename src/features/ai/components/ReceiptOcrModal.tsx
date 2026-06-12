import { useCallback, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { useToast } from "../../../shared/ui";
import type { ReceiptOcrState } from "../hooks/useReceiptOcrFlow";
import { Button, Input, Text } from "../../../shared/ui";
import { useReceiptOcr } from "../hooks/useReceiptOcr";

interface ReceiptOcrModalProps {
  isOpen: boolean;
  state: ReceiptOcrState;
  selectedFile: File | null;
  previewUrl: string | null;
  onClose: () => void;
  onFileChange: (file: File | null) => void;
}

const MODAL_TRANSITION = {
  duration: 0.22,
  ease: "easeOut",
} as const;

function ReceiptOcrModal({
  isOpen,
  state,
  selectedFile,
  previewUrl,
  onClose,
  onFileChange,
}: ReceiptOcrModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  const {
    mutate: performOcr,
    isPending,
    error,
  } = useReceiptOcr();

  const pickFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDrop = useCallback(
    (files: FileList | File[]) => {
      if (!files || files.length === 0) return;

      const file = files[0];

      if (!file.type.startsWith("image/")) return;

      onFileChange(file);
    },
    [onFileChange],
  );

  const handleConfirm = useCallback(() => {
    if (!selectedFile) return;

    performOcr(
      { file: selectedFile },
      {
        onSuccess: (response) => {
          showToast({
            message:
              response.message ?? "Receipt processed successfully",
            tone: "success",
          });


          onClose();
        },
        onError: (error) => {
          console.error(error.message);
        },
      },
    );
  }, [performOcr, selectedFile, onClose]);

  const statusLabel = useMemo(() => {
    if (state === "processing") {
      return "Extracting transactions...";
    }

    if (state === "error") {
      return "Unable to extract transactions.";
    }

    if (previewUrl) {
      return "Review your receipt before processing.";
    }

    return "Upload a receipt image to extract transactions.";
  }, [state, previewUrl]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MODAL_TRANSITION}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-ocr-title"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={MODAL_TRANSITION}
            className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* HEADER */}
            <header className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <Text
                  as="h2"
                  id="receipt-ocr-title"
                  variant="title"
                  weight="bold"
                  className="text-slate-900"
                >
                  Smart Receipt
                </Text>

                <Text variant="body" className="mt-2 text-slate-500">
                  {statusLabel}
                </Text>
              </div>

              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                size="sm"
                shape="circle"
                className="p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close Smart Receipt"
              >
                <X size={18} />
              </Button>
            </header>

            {/* BODY */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const target = event.currentTarget as HTMLInputElement;

                  handleDrop(target.files ?? []);
                }}
              />

              {!previewUrl && (
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();

                    handleDrop(event.dataTransfer.files);
                  }}
                  onClick={pickFile}
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-primary/50 hover:bg-slate-100/70"
                >
                  <Upload size={20} className="mx-auto text-slate-500" />

                  <Text
                    variant="body"
                    weight="medium"
                    className="mt-2 text-slate-700"
                  >
                    Drag and drop a receipt image
                  </Text>

                  <Text variant="caption" className="text-slate-500">
                    or click to browse
                  </Text>
                </div>
              )}

              {previewUrl && (
                <div className="flex justify-center rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className={`h-40 w-auto rounded-lg object-contain shadow-sm ${isPending ? "opacity-60" : ""
                      }`}
                  />
                </div>
              )}

              {selectedFile && (
                <Text
                  as="p"
                  variant="caption"
                  className="truncate text-slate-600"
                  title={selectedFile.name}
                >
                  {selectedFile.name}
                </Text>
              )}


              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  <Text variant="body" className="text-rose-700">
                    {error.message}
                  </Text>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <footer className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 p-4">
              <Button
                type="button"
                onClick={onClose}
                disabled={isPending}
                variant="secondary"
                size="sm"
                className="rounded-xl border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedFile || isPending}
                variant="primary"
                size="sm"
                className="rounded-xl px-4 py-2 text-sm"
              >
                {isPending ? "Processing..." : "Confirm"}
              </Button>
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReceiptOcrModal;

export type { ReceiptOcrModalProps };