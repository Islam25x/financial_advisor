import { BanknoteArrowUp, Info, TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ApiError } from "../../../infrastructure/api/api-error";
import { Button, Input, Text, useToast } from "../../../shared/ui";
import { useAdjustBalance } from "../hooks/useAdjustBalance";

type AdjustBalanceModalProps = {
  isOpen: boolean;
  currentBalance: number;
  onClose: () => void;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSignedCurrency(value: number): string {
  const absoluteValue = Math.abs(value);
  const formatted = formatCurrency(absoluteValue);

  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

function AdjustBalanceModal({
  isOpen,
  currentBalance,
  onClose,
}: AdjustBalanceModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const adjustBalanceMutation = useAdjustBalance();
  const { showToast } = useToast();
  const [newBalance, setNewBalance] = useState<string>("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setNewBalance(currentBalance.toFixed(2));
    setNotice(null);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [currentBalance, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !adjustBalanceMutation.isPending) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [adjustBalanceMutation.isPending, isOpen, onClose]);

  const parsedBalance = useMemo(() => Number(newBalance), [newBalance]);
  const hasValidBalance = newBalance.trim() !== "" && Number.isFinite(parsedBalance);
  const difference = hasValidBalance ? parsedBalance - currentBalance : 0;
  const isUnchanged = hasValidBalance && parsedBalance === currentBalance;
  const isPositive = difference > 0;
  const isNegative = difference < 0;
  const isSubmitDisabled =
    adjustBalanceMutation.isPending || !hasValidBalance || isUnchanged;

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (!hasValidBalance) {
      setNotice("Please enter a valid balance.");
      return;
    }

    if (isUnchanged) {
      setNotice("Enter a different balance to apply an update.");
      return;
    }

    try {
      const result = await adjustBalanceMutation.mutateAsync({
        targetBalance: parsedBalance,
      });

      showToast({
        id: "dashboard:adjust-balance:success",
        message: result.message,
        tone: "success",
      });
      onClose();
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Failed to update balance.";

      setNotice(message);
      showToast({
        id: "dashboard:adjust-balance:error",
        message,
        tone: "error",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!adjustBalanceMutation.isPending) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="adjust-balance-title"
        className="w-full max-w-md rounded-[28px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(59,130,246,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <BanknoteArrowUp size={20} />
            </div>
            <div>
              <h2 id="adjust-balance-title" className="text-xl font-semibold text-slate-900">
                Adjust Balance
              </h2>
              <Text variant="caption" className="mt-1 text-slate-500">
                Update your total balance
              </Text>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            shape="circle"
            size="sm"
            className="border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            disabled={adjustBalanceMutation.isPending}
            onClick={onClose}
            aria-label="Close adjust balance modal"
          >
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
          {notice && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {notice}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#FFFFFF,#F8FAFC)] px-4 py-4 shadow-sm">
            <Text variant="caption" weight="medium" className="text-slate-500">
              Current Balance
            </Text>
            <p className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950">
              {formatCurrency(currentBalance)}
            </p>
          </div>

          <div className="space-y-2">
            <Text as="label" variant="caption" weight="medium" className="text-slate-800" htmlFor="targetBalance">
              New Balance
            </Text>
            <div className="relative">
              <Input
                ref={inputRef}
                id="targetBalance"
                type="number"
                min="0"
                step="0.01"
                value={newBalance}
                onChange={(event) => {
                  setNewBalance(event.target.value);
                  setNotice(null);
                }}
                placeholder="0.00"
                inputClassName="h-16 rounded-2xl border-slate-200 px-4 text-center text-3xl font-semibold text-slate-900 shadow-[0_10px_30px_rgba(59,130,246,0.08)]"
              />
            </div>
            <Text variant="caption" className="text-slate-500">
              Enter the new total balance amount
            </Text>
          </div>

          <div className="space-y-2">
            <Text variant="caption" weight="medium" className="text-slate-800">
              Difference
            </Text>
            <div
              className={`flex items-center gap-2 text-2xl font-bold ${isPositive
                  ? "text-emerald-600"
                  : isNegative
                    ? "text-rose-600"
                    : "text-slate-500"
                }`}
            >
              {isPositive && <TrendingUp size={22} />}
              {isNegative && <TrendingDown size={22} />}
              <span>{formatSignedCurrency(difference)}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800">
            <Info size={16} className="mt-0.5 shrink-0" />
            <p>This will adjust your total balance directly.</p>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="h-12 flex-1 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              disabled={adjustBalanceMutation.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={adjustBalanceMutation.isPending}
              disabled={isSubmitDisabled}
              className="h-12 flex-1 rounded-xl shadow-[0_14px_30px_rgba(59,130,246,0.28)]"
            >
              Update Balance
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AdjustBalanceModal;
