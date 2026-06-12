import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Target, Wallet, X } from "lucide-react";
import { Button, Input } from "../../../shared/ui";
import { ApiError } from "../../../infrastructure/api/api-error";
import { useCreateGoal } from "../hooks/useCreateGoal";
import type { CreateGoalFormInput } from "../types/goal.types";

type GoalCalculationMode = "monthly" | "duration";

type CreateGoalModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type GoalFormState = {
  title: string;
  description: string;
  targetAmount: string;
  monthlyAmount: string;
  durationValue: string;
};

type GoalFormErrors = Partial<Record<keyof GoalFormState, string>>;

type NoticeState = {
  tone: "error";
  message: string;
} | null;

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatNumber(value: number): string {
  return roundToTwoDecimals(value).toFixed(2);
}

function createInitialState(): GoalFormState {
  return {
    title: "",
    description: "",
    targetAmount: "",
    monthlyAmount: "",
    durationValue: "",
  };
}

function CreateGoalModal({ isOpen, onClose }: CreateGoalModalProps) {
  const createGoalMutation = useCreateGoal();
  const [calculationMode, setCalculationMode] = useState<GoalCalculationMode>("monthly");
  const [formState, setFormState] = useState<GoalFormState>(createInitialState);
  const [errors, setErrors] = useState<GoalFormErrors>({});
  const [notice, setNotice] = useState<NoticeState>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !createGoalMutation.isPending) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createGoalMutation.isPending, isOpen, onClose]);

  const targetAmount = Number(formState.targetAmount);
  const monthlyAmount = Number(formState.monthlyAmount);
  const durationValue = Number(formState.durationValue);

  const computedDuration = useMemo(() => {
    if (
      calculationMode !== "monthly" ||
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0 ||
      !Number.isFinite(monthlyAmount) ||
      monthlyAmount <= 0
    ) {
      return "";
    }

    return formatNumber(targetAmount / monthlyAmount);
  }, [calculationMode, monthlyAmount, targetAmount]);

  const computedMonthlyAmount = useMemo(() => {
    if (
      calculationMode !== "duration" ||
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0 ||
      !Number.isFinite(durationValue) ||
      durationValue <= 0
    ) {
      return "";
    }

    return formatNumber(targetAmount / durationValue);
  }, [calculationMode, durationValue, targetAmount]);

  if (!isOpen) {
    return null;
  }

  const resetState = () => {
    setCalculationMode("monthly");
    setFormState(createInitialState());
    setErrors({});
    setNotice(null);
    createGoalMutation.reset();
  };

  const handleClose = () => {
    if (createGoalMutation.isPending) {
      return;
    }

    resetState();
    onClose();
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setNotice(null);
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
    setFormState((currentState) => ({ ...currentState, [name]: value }));
  };

  const handleModeChange = (mode: GoalCalculationMode) => {
    setCalculationMode(mode);
    setNotice(null);
    setErrors((currentErrors) => ({
      ...currentErrors,
      monthlyAmount: undefined,
      durationValue: undefined,
    }));
    setFormState((currentState) => ({
      ...currentState,
      monthlyAmount: mode === "monthly" ? currentState.monthlyAmount : "",
      durationValue: mode === "duration" ? currentState.durationValue : "",
    }));
  };

  const validate = (): boolean => {
    const nextErrors: GoalFormErrors = {};

    if (!formState.title.trim()) {
      nextErrors.title = "Goal title is required.";
    }

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      nextErrors.targetAmount = "Target amount must be greater than zero.";
    }

    if (calculationMode === "monthly") {
      if (!Number.isFinite(monthlyAmount) || monthlyAmount <= 0) {
        nextErrors.monthlyAmount = "Monthly amount must be greater than zero.";
      }
    } else if (!Number.isFinite(durationValue) || durationValue <= 0) {
      nextErrors.durationValue = "Duration must be greater than zero.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (!validate()) {
      return;
    }

    const payload: CreateGoalFormInput = {
      title: formState.title,
      description: formState.description,
      targetAmount,
      durationValue:
        calculationMode === "monthly"
          ? Number(computedDuration)
          : Number(formatNumber(durationValue)),
      monthlyAmount:
        calculationMode === "duration"
          ? Number(computedMonthlyAmount)
          : Number(formatNumber(monthlyAmount)),
    };

    try {
      await createGoalMutation.mutateAsync(payload);
      resetState();
      onClose();
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Failed to create goal. Please try again.";

      setNotice({
        tone: "error",
        message,
      });
    }
  };

  const readOnlyValue =
    calculationMode === "monthly" ? computedDuration : computedMonthlyAmount;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-goal-title"
        className="w-full max-w-[520px] overflow-hidden rounded-3xl border border-border bg-surface text-text-secondary shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-border bg-primary/5 px-5 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Goals
              </p>
              <h2
                id="create-goal-title"
                className="mt-1.5 text-lg font-semibold text-text-primary"
              >
                Create a new goal
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Set your target and choose how you want to plan toward it.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              shape="circle"
              size="md"
              onClick={handleClose}
              disabled={createGoalMutation.isPending}
              className="border border-border bg-surface text-gray-500 hover:bg-gray-100 hover:text-text-primary"
              aria-label="Close create goal modal"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        <form className="max-h-[80vh] overflow-y-auto px-4 py-3" onSubmit={handleSubmit}>
          <div className="space-y-3">
            {notice && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
                {notice.message}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                id="title"
                name="title"
                label="Goal Title"
                placeholder="Emergency fund, travel..."
                value={formState.title}
                onChange={handleInputChange}
                error={errors.title}
                containerClassName="space-y-2"
                inputClassName="h-10 rounded-xl"
              />

              <Input
                id="targetAmount"
                name="targetAmount"
                type="number"
                min="0"
                step="0.01"
                label="Target Amount"
                placeholder="0.00"
                value={formState.targetAmount}
                onChange={handleInputChange}
                error={errors.targetAmount}
                containerClassName="space-y-2"
                inputClassName="h-10 rounded-xl"
              />
            </div>

            <Input
              id="description"
              name="description"
              label="Description"
              placeholder="Add a short note about this goal"
              value={formState.description}
              onChange={handleInputChange}
              as="textarea"
              containerClassName="space-y-2"
              inputClassName="min-h-[96px] rounded-xl py-3"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Planning Mode</label>
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-gray-100 p-1.5">
                {([
                  {
                    value: "monthly",
                    label: "By Monthly Amount",
                    icon: <Wallet size={16} />,
                  },
                  {
                    value: "duration",
                    label: "By Duration",
                    icon: <Target size={16} />,
                  },
                ] as const).map((option) => {
                  const isActive = calculationMode === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleModeChange(option.value)}
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive
                          ? "bg-primary text-white shadow-sm"
                          : "bg-transparent text-gray-600 hover:bg-surface"
                        }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {calculationMode === "monthly" ? (
                <>
                  <Input
                    id="monthlyAmount"
                    name="monthlyAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    label="Monthly Amount"
                    placeholder="0.00"
                    value={formState.monthlyAmount}
                    onChange={handleInputChange}
                    error={errors.monthlyAmount}
                    containerClassName="space-y-2"
                    inputClassName="h-10 rounded-xl"
                  />
                  <Input
                    id="durationValue"
                    name="durationValue"
                    label="Duration (Months)"
                    value={readOnlyValue}
                    readOnly
                    containerClassName="space-y-2"
                    inputClassName="h-10 rounded-xl bg-gray-100"
                  />
                </>
              ) : (
                <>
                  <Input
                    id="durationValue"
                    name="durationValue"
                    type="number"
                    min="0"
                    step="0.01"
                    label="Duration (Months)"
                    placeholder="0"
                    value={formState.durationValue}
                    onChange={handleInputChange}
                    error={errors.durationValue}
                    containerClassName="space-y-2"
                    inputClassName="h-10 rounded-xl"
                  />
                  <Input
                    id="monthlyAmount"
                    name="monthlyAmount"
                    label="Monthly Amount"
                    value={readOnlyValue}
                    readOnly
                    containerClassName="space-y-2"
                    inputClassName="h-10 rounded-xl bg-gray-100"
                  />
                </>
              )}
            </div>

            <div className="rounded-xl border border-primary/10 bg-primary/5 px-3 py-3 text-sm text-gray-500">
              Duration unit is fixed to <span className="font-semibold text-text-secondary">Months</span>.
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleClose}
                disabled={createGoalMutation.isPending}
                className="rounded-xl px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={createGoalMutation.isPending}
                className="rounded-xl px-4"
              >
                {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateGoalModal;
