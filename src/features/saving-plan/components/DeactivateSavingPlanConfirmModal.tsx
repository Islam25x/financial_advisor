import { AlertTriangle, X } from "lucide-react";
import { Button, Text } from "../../../shared/ui";

type DeactivateSavingPlanConfirmModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

function DeactivateSavingPlanConfirmModal({
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}: DeactivateSavingPlanConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/20 p-4"
      onClick={() => !isSubmitting && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="saving-plan-deactivate-title"
        className="w-full max-w-[380px] rounded-3xl border border-border bg-surface p-5 shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 id="saving-plan-deactivate-title" className="text-lg font-semibold text-text-primary">
                Deactivate Plan
              </h3>
              <Text variant="body" className="text-text-muted">
                Your active saving plan will be deactivated.
              </Text>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-text-muted transition hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close deactivate saving plan dialog"
          >
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

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
            variant="danger"
            size="sm"
            className="rounded-xl px-4"
            loading={isSubmitting}
            onClick={() => {
              void onConfirm();
            }}
          >
            Confirm
          </Button>
        </div>
      </section>
    </div>
  );
}

export default DeactivateSavingPlanConfirmModal;
