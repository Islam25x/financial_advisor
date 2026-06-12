import { Landmark, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Input, Text } from "../../../shared/ui";
import type { Goal } from "../types/goal.types";

type GoalAddMoneyModalProps = {
  goal: Goal | null;
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void> | void;
};

const QUICK_AMOUNTS = [500, 1000, 2000, 5000] as const;

function GoalAddMoneyModal({
  goal,
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
}: GoalAddMoneyModalProps) {
  const amountRef = useRef<HTMLInputElement | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAmount("");
    setError(null);
    const frame = window.requestAnimationFrame(() => amountRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  if (!isOpen || !goal) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    setError(null);
    await onSubmit(parsedAmount);
  };

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/20 p-4"
      onClick={() => !isSubmitting && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-add-money-title"
        className="w-full max-w-[370px] rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-primary">
              <Landmark size={22} />
            </div>
            <div>
              <h3 id="goal-add-money-title" className="text-[18px] font-semibold text-slate-900">
                Add Money
              </h3>
              <Text variant="body" className="text-slate-500">
                Add money to your goal
              </Text>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 transition hover:text-slate-800"
            aria-label="Close add money modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Input
            id="goal-name"
            label="Goal"
            value={goal.title}
            readOnly
            inputClassName="h-10 rounded-xl bg-slate-100 text-slate-700"
          />

          <Input
            ref={amountRef}
            id="amount"
            type="number"
            label="Amount"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setError(null);
            }}
            error={error ?? undefined}
            inputClassName="h-11 rounded-xl text-lg"
          />

          <div className="space-y-2">
            <Text variant="body" weight="medium" className="text-slate-800">
              Quick amounts
            </Text>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((quickAmount) => {
                const isActive = Number(amount) === quickAmount;

                return (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => {
                      setAmount(String(quickAmount));
                      setError(null);
                    }}
                    className={`rounded-xl border px-2 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 text-slate-600 hover:border-primary/30 hover:bg-sky-50"
                    }`}
                  >
                    {quickAmount.toLocaleString()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              type="submit"
              variant="primary"
              size="sm"
              className="rounded-xl px-4"
              loading={isSubmitting}
            >
              Add Money
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default GoalAddMoneyModal;
