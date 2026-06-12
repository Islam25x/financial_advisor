import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, WandSparkles, X } from "lucide-react";
import { ApiError } from "../../../../infrastructure/api/api-error";
import { Button, Text, cn } from "../../../../shared/ui";
import type { SavingPlanResponseDto } from "../../api/saving-plan.dto";
import { useApplySavingPlan } from "../../hooks/useApplySavingPlan";
import { useGenerateSavingPlan } from "../../hooks/useGenerateSavingPlan";
import type {
  SavingPlanFormErrors,
  SavingPlanFormState,
} from "../../types/saving-plan.types";
import { parseSavingPlanFormInput } from "../../utils/saving-plan.parser";
import SavingPlanForm from "./SavingPlanForm";
import SavingPlanPreview from "./SavingPlanPreview";

type SavingPlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const INITIAL_FORM_STATE: SavingPlanFormState = {
  months: 6,
  planType: "Balanced",
  targetMonthlySaving: "",
};

type SavingPlanModalStep = "form" | "preview";

function StepItem({
  step,
  label,
  active,
  complete,
}: {
  step: number;
  label: string;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
          active || complete
            ? "border-primary bg-primary text-white"
            : "border-border bg-gray-50 text-text-secondary",
        )}
      >
        {complete ? <CheckCircle2 size={15} aria-hidden="true" /> : step}
      </span>
      <Text as="span" variant="body" className="whitespace-nowrap text-text-secondary">
        {label}
      </Text>
    </div>
  );
}

function SavingPlanModal({ isOpen, onClose }: SavingPlanModalProps) {
  const generateSavingPlanMutation = useGenerateSavingPlan();
  const applySavingPlanMutation = useApplySavingPlan();
  const [formState, setFormState] = useState<SavingPlanFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<SavingPlanFormErrors>({});
  const [generateNotice, setGenerateNotice] = useState<string | null>(null);
  const [applyNotice, setApplyNotice] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<SavingPlanModalStep>("form");
  const [previewData, setPreviewData] = useState<SavingPlanResponseDto | null>(null);

  const isGenerating = generateSavingPlanMutation.isPending;
  const isApplying = applySavingPlanMutation.isPending;
  const isBusy = isGenerating || isApplying;

  const resetState = useCallback(() => {
    setFormState(INITIAL_FORM_STATE);
    setErrors({});
    setGenerateNotice(null);
    setApplyNotice(null);
    setCurrentStep("form");
    setPreviewData(null);
    generateSavingPlanMutation.reset();
    applySavingPlanMutation.reset();
  }, [applySavingPlanMutation, generateSavingPlanMutation]);

  const handleClose = useCallback(() => {
    if (isBusy) {
      return;
    }

    resetState();
    onClose();
  }, [isBusy, onClose, resetState]);

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
      if (event.key === "Escape" && !isBusy) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, isBusy, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleFormChange = (nextState: SavingPlanFormState) => {
    setFormState(nextState);
    setGenerateNotice(null);
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGenerateNotice(null);

    const result = parseSavingPlanFormInput(formState);
    setErrors(result.errors);

    if (!result.input) {
      return;
    }

    try {
      const response = await generateSavingPlanMutation.mutateAsync(result.input);
      setPreviewData(response);
      setCurrentStep("preview");
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Failed to generate saving plan. Please try again.";

      setGenerateNotice(message);
    }
  };

  const handleGenerateAgain = () => {
    if (isBusy) {
      return;
    }

    setCurrentStep("form");
    setPreviewData(null);
    setApplyNotice(null);
    generateSavingPlanMutation.reset();
    applySavingPlanMutation.reset();
  };

  const handleApply = async () => {
    if (!previewData) {
      return;
    }

    setApplyNotice(null);

    try {
      await applySavingPlanMutation.mutateAsync(previewData);
      resetState();
      onClose();
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Failed to apply saving plan. Please try again.";

      setApplyNotice(message);
    }
  };

  const isPreview = currentStep === "preview" && previewData !== null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="saving-plan-modal-title"
        className="w-full max-w-[940px] overflow-hidden rounded-3xl border border-border bg-surface text-text-secondary shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 py-4 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <WandSparkles size={25} aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="saving-plan-modal-title"
                  className="text-lg font-bold text-text-primary"
                >
                  {isPreview ? "Your AI Saving Plan Review" : "Create Your Saving Plan"}
                </h2>
                <Text variant="body" className="mt-1 text-text-secondary">
                  {isPreview
                    ? "Review your personalized plan before applying."
                    : "Let AI create the best saving plan for you"}
                </Text>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isPreview && previewData && (
                <span className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                  {previewData.PlanType} Plan
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                shape="circle"
                size="md"
                onClick={handleClose}
                disabled={isBusy}
                className="text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                aria-label="Close saving plan modal"
              >
                <X size={20} />
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
            <StepItem step={1} label="Plan Details" active={currentStep === "form" && !isGenerating} complete={currentStep === "preview"} />
            <span className="hidden h-px bg-border sm:block" />
            <StepItem step={2} label="AI Generating" active={isGenerating} complete={currentStep === "preview"} />
            <span className="hidden h-px bg-border sm:block" />
            <StepItem step={3} label="Plan Preview" active={currentStep === "preview"} />
          </div>
        </div>

        <div className="border-t border-border">
          {isPreview && previewData ? (
            <SavingPlanPreview
              plan={previewData}
              notice={applyNotice}
              isApplying={isApplying}
              onCancel={handleClose}
              onGenerateAgain={handleGenerateAgain}
              onApply={handleApply}
            />
          ) : (
            <SavingPlanForm
              formState={formState}
              errors={errors}
              notice={generateNotice}
              isSubmitting={isGenerating}
              onChange={handleFormChange}
              onCancel={handleClose}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default SavingPlanModal;
