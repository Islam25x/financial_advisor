import { AlertTriangle, X } from "lucide-react";
import { Button, Text } from "../../../shared/ui";
import type { Goal } from "../types/goal.types";

type GoalCancelConfirmModalProps = {
  goal: Goal | null;
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

function GoalCancelConfirmModal({
  goal,
  isOpen,
  isSubmitting = false,
  onClose,
  onConfirm,
}: GoalCancelConfirmModalProps) {
  if (!isOpen || !goal) {
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
        aria-labelledby="goal-cancel-title"
        className="w-full max-w-[360px] rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 id="goal-cancel-title" className="text-[18px] font-semibold text-slate-900">
                Cancel Goal
              </h3>
              <Text variant="body" className="text-slate-500">
                {goal.title}
              </Text>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 transition hover:text-slate-800"
            aria-label="Close cancel goal modal"
          >
            <X size={20} />
          </button>
        </div>

        <Text variant="body" className="mt-4 text-slate-600">
          This will cancel the goal first, then refund your saved amount.
        </Text>

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

export default GoalCancelConfirmModal;
