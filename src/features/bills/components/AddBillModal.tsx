import {
  Bell,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  FileText,
  LockKeyhole,
  Plus,
  RefreshCw,
  TrendingUp,
  Waves,
  X,
} from "lucide-react";
import {
  useMemo,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { ApiError } from "../../../infrastructure/api/api-error";
import { Button, Input, Text, useToast, cn } from "../../../shared/ui";
import TransactionCategoryPicker from "../../transactions/components/TransactionCategoryPicker";
import { useBillCategories } from "../../transactions/hooks/useBillCategories";
import { useCreateBillCategory } from "../../transactions/hooks/useCreateBillCategory";
import { TransactionType } from "../../transactions/types/transaction.enums";
import type { BillAmountType, BillDetails, BillFrequency } from "../types/bill.types";
import { useBillDetails } from "../hooks/useBillDetails";
import { useCreateBill } from "../hooks/useCreateBill";
import { useUpdateBill } from "../hooks/useUpdateBill";
import { buildBillPayload } from "../utils/bill.parser";

type AddBillModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  billSeriesId?: string | null;
};

type FormState = {
  name: string;
  categoryId: string;
  defaultAmount: string;
  amountType: BillAmountType;
  frequency: BillFrequency | "";
  dueDay: string;
  dueDate: string;
  allowsEarlyRenewal: boolean;
  allowsTopUp: boolean;
  description: string;
  reminderDaysBefore: string;
  startDate: string;
  endDate: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type NoticeState = {
  tone: "error";
  message: string;
} | null;

const FREQUENCY_OPTIONS: BillFrequency[] = ["OneTime", "Monthly", "Yearly"];
const REMINDER_OPTIONS = [0, 1, 3, 5, 7, 14, 30] as const;
const DESCRIPTION_LIMIT = 200;

function getDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getTodayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function createInitialState(): FormState {
  return {
    name: "",
    categoryId: "",
    defaultAmount: "",
    amountType: "Fixed",
    frequency: "",
    dueDate: "",
    dueDay: "",
    allowsEarlyRenewal: false,
    allowsTopUp: false,
    description: "",
    reminderDaysBefore: "3",
    endDate: "",
    startDate: getTodayDateInputValue(),
  };
}

function mapBillDetailsToFormState(details: BillDetails): FormState {
  return {
    name: details.name,
    categoryId: details.categoryId,
    defaultAmount: details.amountType === "Variable" ? "0" : String(details.defaultAmount ?? ""),
    amountType: details.amountType,
    frequency: FREQUENCY_OPTIONS.includes(details.frequency as BillFrequency)
      ? (details.frequency as BillFrequency)
      : "",
    dueDate: getDateInputValue(details.dueDate),
    dueDay: details.dueDay ? String(details.dueDay) : "",
    allowsEarlyRenewal: details.allowsEarlyRenewal,
    allowsTopUp: details.allowsTopUp,
    description: details.description,
    reminderDaysBefore: String(details.reminderDaysBefore),
    endDate: getDateInputValue(details.endDate),
    startDate: getDateInputValue(details.startDate),
  };
}

function getFieldLabel(label: string) {
  return (
    <span className="text-xs font-semibold text-text-primary">
      {label} <span className="text-rose-500">*</span>
    </span>
  );
}

function TogglePill({
  label,
  checked,
  onChange,
  icon,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition",
        checked
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-surface text-text-secondary hover:bg-background",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function AddBillModal({
  isOpen,
  onClose,
  mode = "create",
  billSeriesId = null,
}: AddBillModalProps) {
  const isEditMode = mode === "edit";
  const createBillMutation = useCreateBill();
  const updateBillMutation = useUpdateBill();
  const createBillCategoryMutation = useCreateBillCategory();
  const billDetailsQuery = useBillDetails(billSeriesId, isOpen && isEditMode);
  const categoriesQuery = useBillCategories({ enabled: isOpen });
  const { showToast } = useToast();
  const [formState, setFormState] = useState<FormState>(createInitialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState<NoticeState>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !createBillMutation.isPending && !updateBillMutation.isPending) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormState(
      isEditMode && billDetailsQuery.data
        ? mapBillDetailsToFormState(billDetailsQuery.data)
        : createInitialState(),
    );
    setErrors({});
    setNotice(null);
    setIsAdvancedOpen(false);
  }, [billDetailsQuery.data, isEditMode, isOpen]);

  const categories = useMemo(() => {
    const billCategories = categoriesQuery.data ?? [];
    const hasSelectedCategory = billCategories.some(
      (category) => category.id === formState.categoryId,
    );

    if (
      !hasSelectedCategory &&
      formState.categoryId &&
      isEditMode &&
      billDetailsQuery.data?.categoryName
    ) {
      return [
        ...billCategories,
        {
          id: formState.categoryId,
          name: billDetailsQuery.data.categoryName,
          categoryType: TransactionType.Expense,
          isBillCategory: true,
        },
      ];
    }

    return billCategories;
  }, [
    billDetailsQuery.data?.categoryName,
    categoriesQuery.data,
    formState.categoryId,
    isEditMode,
  ]);

  if (!isOpen) return null;

  const parsedAmount = Number(formState.defaultAmount);
  const parsedDueDay = Number(formState.dueDay);
  const parsedReminderDaysBefore = Number(formState.reminderDaysBefore);
  const isFixedAmount = formState.amountType === "Fixed";
  const isVariableAmount = formState.amountType === "Variable";
  const isMonthlyFrequency = formState.frequency === "Monthly";
  const usesDueDate = formState.frequency === "OneTime" || formState.frequency === "Yearly";
  const isSubmitting = createBillMutation.isPending || updateBillMutation.isPending;
  const isDetailsLoading = isEditMode && billDetailsQuery.isLoading;
  const isFormDisabled = isSubmitting || isDetailsLoading;
  const title = isEditMode ? "Edit Bill" : "Add New Bill";
  const submitLabel = isEditMode ? "Save Changes" : "Add Bill";

  const handleClose = () => {
    if (isSubmitting) return;
    setFormState(createInitialState());
    setErrors({});
    setNotice(null);
    setIsAdvancedOpen(false);
    createBillMutation.reset();
    updateBillMutation.reset();
    createBillCategoryMutation.reset();
    onClose();
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setNotice(null);
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
    setFormState((currentState) => ({
      ...currentState,
      [name]: name === "description" ? value.slice(0, DESCRIPTION_LIMIT) : value,
      ...(name === "frequency" && value === "Monthly" ? { dueDate: "" } : {}),
      ...(name === "frequency" && value !== "Monthly" ? { dueDay: "" } : {}),
    }));
  };

  const handleAmountTypeChange = (amountType: BillAmountType) => {
    setNotice(null);
    setErrors((currentErrors) => ({ ...currentErrors, amountType: undefined }));
    setFormState((currentState) => ({
      ...currentState,
      amountType,
      defaultAmount: amountType === "Variable" ? "0" : currentState.defaultAmount,
    }));
  };

  const findBillCategoryByName = (
    categoryName: string,
    categoryOptions = categories,
  ) => {
    const normalizedName = categoryName.trim().toLowerCase();

    return categoryOptions.find(
      (category) => category.name.trim().toLowerCase() === normalizedName,
    );
  };

  const handleCreateBillCategory = async (name: string) => {
    const trimmedName = name.trim();
    setNotice(null);

    if (!trimmedName) {
      throw new ApiError("Category name is required.", 400, "INVALID_RESPONSE");
    }

    const existingCategory = findBillCategoryByName(trimmedName);

    if (existingCategory) {
      setErrors((currentErrors) => ({ ...currentErrors, categoryId: undefined }));
      setFormState((currentState) => ({
        ...currentState,
        categoryId: existingCategory.id,
      }));
      return;
    }

    try {
      const createdCategory = await createBillCategoryMutation.mutateAsync({
        name: trimmedName,
      });
      const refreshedCategories = (await categoriesQuery.refetch()).data ?? [];
      const nextCategory =
        createdCategory ??
        findBillCategoryByName(trimmedName, refreshedCategories);

      if (!nextCategory) {
        throw new ApiError(
          "Category was created but could not be selected automatically.",
          500,
          "INVALID_RESPONSE",
        );
      }

      setErrors((currentErrors) => ({ ...currentErrors, categoryId: undefined }));
      setFormState((currentState) => ({
        ...currentState,
        categoryId: nextCategory.id,
      }));
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof ApiError || error instanceof Error
            ? error.message
            : "Failed to create category.",
      });
      throw error;
    }
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!formState.name.trim()) nextErrors.name = "Bill name is required.";
    if (!formState.categoryId.trim()) nextErrors.categoryId = "Please choose a category.";
    if (isFixedAmount && (!Number.isFinite(parsedAmount) || parsedAmount <= 0)) {
      nextErrors.defaultAmount = "Amount must be greater than zero.";
    }
    if (!formState.amountType) nextErrors.amountType = "Bill type is required.";
    if (!formState.frequency.trim()) nextErrors.frequency = "Please choose a frequency.";
    if (!formState.startDate) nextErrors.startDate = "Start date is required.";
    if (!Number.isFinite(parsedReminderDaysBefore) || parsedReminderDaysBefore < 0) {
      nextErrors.reminderDaysBefore = "Reminder must be zero or greater.";
    }
    if (isMonthlyFrequency && (!Number.isFinite(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31)) {
      nextErrors.dueDay = "Due day must be between 1 and 31.";
    }
    if (usesDueDate && !formState.dueDate) {
      nextErrors.dueDate = "Due date is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (!validate()) return;

    const payload = buildBillPayload(
      formState,
      isEditMode && billDetailsQuery.data ? billDetailsQuery.data.isActive : true,
    );

    try {
      if (isEditMode) {
        if (!billSeriesId) {
          throw new ApiError("Bill series id is required.", 400, "INVALID_RESPONSE");
        }

        await updateBillMutation.mutateAsync({
          billSeriesId,
          input: payload,
        });
      } else {
        await createBillMutation.mutateAsync(payload);
      }

      showToast({
        message: isEditMode ? "Bill updated successfully." : "Bill added successfully.",
        tone: "success",
      });
      handleClose();
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : isEditMode
            ? "Failed to update bill."
            : "Failed to add bill.";

      setNotice({
        tone: "error",
        message,
      });
      showToast({
        message,
        tone: "error",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-text-primary/35 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-bill-title"
        className="w-full max-w-[760px] overflow-hidden rounded-2xl border border-border bg-surface text-text-secondary shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-7 pb-2 pt-6">
          <div>
            <h2 id="add-bill-title" className="text-2xl font-bold text-text-primary">
              {title}
            </h2>
            <Text variant="body" className="mt-1 text-sm text-text-muted">
              {isEditMode
                ? "Update this recurring bill and keep future occurrences accurate."
                : "Add a new recurring bill to track and never miss a payment."}
            </Text>
          </div>
          <Button
            type="button"
            variant="ghost"
            shape="circle"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-text-muted hover:text-text-primary"
            aria-label="Close add bill modal"
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[82vh] overflow-y-auto px-7 pb-5 pt-3">
          <div className="space-y-4">
            {notice && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                {notice.message}
              </div>
            )}
            {billDetailsQuery.isError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                {billDetailsQuery.error?.message ?? "Failed to load bill details."}
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-primary" />
              <Text as="h3" variant="body" weight="bold" className="text-text-primary">
                Basic Information
              </Text>
            </div>

            <div className="space-y-2">
              {getFieldLabel("Bill Name")}
              <div className="relative">
                <FileText
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Netflix Subscription"
                  error={errors.name}
                  disabled={isFormDisabled}
                  inputClassName="h-12 rounded-xl pl-11 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                {getFieldLabel("Category")}
                <TransactionCategoryPicker
                  options={categories}
                  selectedCategoryId={formState.categoryId}
                  onSelect={(categoryId) => {
                    setNotice(null);
                    setErrors((currentErrors) => ({
                      ...currentErrors,
                      categoryId: undefined,
                    }));
                    setFormState((currentState) => ({
                      ...currentState,
                      categoryId,
                    }));
                  }}
                  onCreateCategory={handleCreateBillCategory}
                  isLoading={categoriesQuery.isLoading}
                  isCreating={createBillCategoryMutation.isPending}
                  errorMessage={createBillCategoryMutation.error?.message}
                  disabled={isFormDisabled}
                />
                {errors.categoryId && <p className="text-xs text-rose-500">{errors.categoryId}</p>}
                {categoriesQuery.isError && (
                  <p className="text-xs text-rose-500">
                    {categoriesQuery.error?.message ?? "Failed to load bill categories."}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {getFieldLabel("Amount")}
                <div className="relative">
                  <CircleDollarSign
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <Input
                    id="defaultAmount"
                    name="defaultAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.defaultAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    error={errors.defaultAmount}
                    disabled={isFormDisabled || isVariableAmount}
                    inputClassName="h-12 rounded-xl pl-11 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                {getFieldLabel("Bill Type")}
                <div className="grid h-12 grid-cols-2 rounded-xl border border-border bg-surface p-1">
                  {(["Fixed", "Variable"] as const).map((type) => {
                    const isActive = formState.amountType === type;
                    const Icon = type === "Fixed" ? LockKeyhole : Waves;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleAmountTypeChange(type)}
                        disabled={isFormDisabled}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition",
                          isActive
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-text-secondary hover:bg-background",
                        )}
                      >
                        <Icon size={16} />
                        {type}
                      </button>
                    );
                  })}
                </div>
                {errors.amountType && <p className="text-xs text-rose-500">{errors.amountType}</p>}
              </div>

              <div className="space-y-2">
                {getFieldLabel("Frequency")}
                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <select
                    id="frequency"
                    name="frequency"
                    value={formState.frequency}
                    onChange={handleInputChange}
                    disabled={isFormDisabled}
                    className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-surface px-11 text-sm text-text-secondary outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">Select frequency</option>
                    {FREQUENCY_OPTIONS.map((frequency) => (
                      <option key={frequency} value={frequency}>
                        {frequency}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.frequency && <p className="text-xs text-rose-500">{errors.frequency}</p>}
              </div>
            </div>

            {isMonthlyFrequency && (
              <div className="space-y-2">
                {getFieldLabel("Due Day")}
                <Input
                  id="dueDay"
                  name="dueDay"
                  type="number"
                  min="1"
                  max="31"
                  value={formState.dueDay}
                  onChange={handleInputChange}
                  error={errors.dueDay}
                  disabled={isFormDisabled}
                  inputClassName="h-12 rounded-xl text-sm"
                />
                <Text variant="caption" className="text-xs text-text-muted">
                  Choose a day from 1 to 31
                </Text>
              </div>
            )}

            {usesDueDate && (
              <div className="space-y-2">
                {getFieldLabel("Due Date")}
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formState.dueDate}
                  onChange={handleInputChange}
                  error={errors.dueDate}
                  disabled={isFormDisabled}
                  inputClassName="h-12 rounded-xl text-sm"
                />
              </div>
            )}

            <div className="rounded-xl border border-border bg-surface">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen((current) => !current)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                aria-expanded={isAdvancedOpen}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Text variant="body" weight="bold" className="text-sm text-text-primary">
                      Advanced Options
                    </Text>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      Optional
                    </span>
                  </div>
                  <Text variant="caption" className="text-xs text-text-muted">
                    Additional settings and preferences
                  </Text>
                </div>
                <ChevronDown
                  size={18}
                  className={cn(
                    "text-text-secondary transition-transform duration-200",
                    isAdvancedOpen && "rotate-180",
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-in-out",
                  isAdvancedOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="space-y-3 px-4 pb-4">
                    <div className="flex flex-wrap gap-2">
                      <TogglePill
                        label="Early Renewal"
                        checked={formState.allowsEarlyRenewal}
                        onChange={(allowsEarlyRenewal) =>
                          setFormState((currentState) => ({
                            ...currentState,
                            allowsEarlyRenewal,
                          }))
                        }
                        icon={<RefreshCw size={14} />}
                        disabled={isFormDisabled}
                      />
                      <TogglePill
                        label="Top Up"
                        checked={formState.allowsTopUp}
                        onChange={(allowsTopUp) =>
                          setFormState((currentState) => ({
                            ...currentState,
                            allowsTopUp,
                          }))
                        }
                        icon={<TrendingUp size={14} />}
                        disabled={isFormDisabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="description" className="text-xs font-semibold text-text-primary">
                        Description
                      </label>
                      <div className="relative">
                        <Input
                          id="description"
                          name="description"
                          as="textarea"
                          rows={3}
                          value={formState.description}
                          onChange={handleInputChange}
                          placeholder="Add notes about this bill (optional)"
                          disabled={isFormDisabled}
                          inputClassName="min-h-[78px] resize-none rounded-xl pb-7 text-sm"
                        />
                        <span className="absolute bottom-3 right-4 text-xs font-medium text-text-muted">
                          {formState.description.length}/{DESCRIPTION_LIMIT}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      <div className="space-y-2">
                        <label htmlFor="reminderDaysBefore" className="text-xs font-semibold text-text-primary">
                          Reminder
                        </label>
                        <div className="relative">
                          <Bell
                            size={17}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                          />
                          <ChevronDown
                            size={17}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
                          />
                          <select
                            id="reminderDaysBefore"
                            name="reminderDaysBefore"
                            value={formState.reminderDaysBefore}
                            onChange={handleInputChange}
                            disabled={isFormDisabled}
                            className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-surface px-11 text-sm text-text-secondary outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary/40"
                          >
                            {REMINDER_OPTIONS.map((days) => (
                              <option key={days} value={days}>
                                {days === 0 ? "Due date" : `${days} days before`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Text variant="caption" className="text-xs text-text-muted">
                          Get reminded before the due date
                        </Text>
                        {errors.reminderDaysBefore && (
                          <p className="text-xs text-rose-500">{errors.reminderDaysBefore}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        {getFieldLabel("Start Date")}
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          value={formState.startDate}
                          onChange={handleInputChange}
                          error={errors.startDate}
                          disabled={isFormDisabled}
                          inputClassName="h-11 rounded-xl text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="endDate" className="text-xs font-semibold text-text-primary">
                          End Date (Optional)
                        </label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="date"
                          value={formState.endDate}
                          onChange={handleInputChange}
                          disabled={isFormDisabled}
                          inputClassName="h-11 rounded-xl text-sm"
                        />
                        <Text variant="caption" className="text-xs text-text-muted">
                          Leave empty for no end date
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
                className="min-w-32 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isDetailsLoading}
                className="min-w-36 rounded-xl"
              >
                <Plus size={17} />
                {isDetailsLoading ? "Loading..." : submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AddBillModal;
