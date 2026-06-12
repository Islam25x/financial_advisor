import { AlertTriangle, X } from "lucide-react";
import { Button, Text } from "../../../shared/ui";

type BillConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "default" | "danger";
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

function BillConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  tone = "default",
  isSubmitting = false,
  onClose,
  onConfirm,
}: BillConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-text-primary/25 p-4"
      onClick={() => !isSubmitting && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="bill-confirm-title"
        className="w-full max-w-[380px] rounded-3xl border border-border bg-surface p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 id="bill-confirm-title" className="text-lg font-semibold text-text-primary">
                {title}
              </h3>
              <Text variant="body" className="text-text-muted">
                {description}
              </Text>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-text-muted transition hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close confirmation dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-xl px-4"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={tone === "danger" ? "danger" : "primary"}
            size="sm"
            className="rounded-xl px-4"
            loading={isSubmitting}
            onClick={() => {
              void onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default BillConfirmDialog;
