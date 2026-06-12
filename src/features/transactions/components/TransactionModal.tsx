import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  WalletCards,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Button, Input, Text } from "../../../shared/ui";
import { ApiError } from "../../../infrastructure/api/api-error";
import { useCategories } from "../hooks/useCategories";
import { useCreateCategory } from "../hooks/useCreateCategory";
import {
  findCategoryByName,
  selectCategoriesByType,
} from "../utils/category.selectors";
import type {
  AddTransactionInput,
  AddTransactionType,
} from "../types/add-transaction.types";
import type { Transaction } from "../types/transaction.types";
import {
  formatNowForDateTimeLocal,
  parseDateTimeLocalValue,
} from "../utils/transaction-dates";
import TransactionCategoryPicker from "./TransactionCategoryPicker";

type TransactionModalProps = {
  isOpen: boolean;
  mode: "add" | "edit";
  initialData?: Transaction;
  forcedType?: "income" | "expense";
  onSubmit: (data: AddTransactionInput) => Promise<void> | void;
  onClose: () => void;
  onDelete?: () => Promise<void> | void;
  isSubmitting?: boolean;
  isDeleting?: boolean;
};

type FormState = {
  amount: string;
  type: AddTransactionType;
  categoryId: string;
  occurredAt: string;
  notes: string;
  merchant: string;
  item: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type NoticeState = {
  tone: "error";
  message: string;
} | null;

function formatDateTimeLocal(value?: string): string {
  if (!value) {
    return formatNowForDateTimeLocal();
  }

  return parseDateTimeLocalValue(value);
}

function createInitialState(): FormState {
  return {
    amount: "",
    type: "Expense",
    categoryId: "",
    occurredAt: formatNowForDateTimeLocal(),
    notes: "",
    merchant: "",
    item: "",
  };
}

function normalizeForcedType(
  forcedType?: "income" | "expense",
): AddTransactionType | undefined {
  if (forcedType === "income") {
    return "Income";
  }

  if (forcedType === "expense") {
    return "Expense";
  }

  return undefined;
}

function createEditState(initialData: Transaction): FormState {
  return {
    amount: `${initialData.amount}`,
    type: initialData.type,
    categoryId: "",
    occurredAt: formatDateTimeLocal(initialData.date),
    notes: initialData.description ?? "",
    merchant: initialData.merchant ?? "",
    item: initialData.item ?? "",
  };
}

function TransactionModal({
  isOpen,
  mode,
  initialData,
  forcedType,
  onSubmit,
  onClose,
  onDelete,
  isSubmitting = false,
  isDeleting = false,
}: TransactionModalProps) {
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  const categoriesQuery = useCategories({ enabled: isOpen });
  const createCategoryMutation = useCreateCategory();

  const [formState, setFormState] =
    useState<FormState>(createInitialState);

  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState<NoticeState>(null);

  const [isMoreDetailsOpen, setIsMoreDetailsOpen] =
    useState(false);

  const [isReceiptViewerOpen, setIsReceiptViewerOpen] =
    useState(false);

  const isEditMode = mode === "edit";

  const refetchCategories = categoriesQuery.refetch;

  const resolvedForcedType =
    normalizeForcedType(forcedType);

  const isTypeSelectionLocked =
    Boolean(resolvedForcedType);

  const hasReceipt =
    Boolean(initialData?.hasReceipt) &&
    Boolean(initialData?.receiptImageUrl);

  const allCategories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );

  const categoryOptions = useMemo(
    () =>
      selectCategoriesByType(
        allCategories,
        formState.type,
      ),
    [allCategories, formState.type],
  );

  const selectedCategory = useMemo(
    () =>
      allCategories.find(
        (category) =>
          category.id === formState.categoryId,
      ) ?? null,
    [allCategories, formState.categoryId],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape" &&
        !isSubmitting &&
        !isDeleting
      ) {
        if (isReceiptViewerOpen) {
          setIsReceiptViewerOpen(false);
          return;
        }

        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
  }, [
    isDeleting,
    isOpen,
    isSubmitting,
    isReceiptViewerOpen,
    onClose,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setErrors({});
    setNotice(null);
    setIsMoreDetailsOpen(false);
    setIsReceiptViewerOpen(false);

    if (isEditMode && initialData) {
      const nextState =
        createEditState(initialData);

      setFormState(
        resolvedForcedType
          ? {
            ...nextState,
            type: resolvedForcedType,
            categoryId:
              initialData.type ===
                resolvedForcedType
                ? nextState.categoryId
                : "",
          }
          : nextState,
      );

      return;
    }

    const nextState = createInitialState();

    setFormState(
      resolvedForcedType
        ? {
          ...nextState,
          type: resolvedForcedType,
        }
        : nextState,
    );
  }, [
    initialData,
    isEditMode,
    isOpen,
    resolvedForcedType,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame =
      window.requestAnimationFrame(() =>
        amountInputRef.current?.focus(),
      );

    return () =>
      window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!formState.categoryId) {
      return;
    }

    if (
      !categoryOptions.some(
        (option) =>
          option.id === formState.categoryId,
      )
    ) {
      setFormState((currentState) => ({
        ...currentState,
        categoryId: "",
      }));
    }
  }, [categoryOptions, formState.categoryId]);

  useEffect(() => {
    if (
      !isOpen ||
      !isEditMode ||
      !initialData ||
      formState.categoryId
    ) {
      return;
    }

    const matchingCategory =
      allCategories.find(
        (category) =>
          category.categoryType ===
          initialData.type &&
          category.name
            .trim()
            .toLowerCase() ===
          initialData.category
            .trim()
            .toLowerCase(),
      );

    if (!matchingCategory) {
      return;
    }

    setFormState((currentState) => ({
      ...currentState,
      categoryId: matchingCategory.id,
    }));
  }, [
    allCategories,
    formState.categoryId,
    initialData,
    isEditMode,
    isOpen,
  ]);

  const handleCreateCategory = useCallback(
    async (name: string) => {
      setNotice(null);

      try {
        const existingCategory =
          findCategoryByName(
            allCategories,
            name,
            formState.type,
          );

        if (existingCategory) {
          setErrors((currentErrors) => ({
            ...currentErrors,
            categoryId: undefined,
          }));

          setFormState((currentState) => ({
            ...currentState,
            categoryId: existingCategory.id,
          }));

          return;
        }

        const createdCategory =
          await createCategoryMutation.mutateAsync(
            {
              name,
              categoryType: formState.type,
            },
          );

        const refreshedCategories =
          (await refetchCategories()).data ??
          [];

        const nextCategory =
          createdCategory ??
          findCategoryByName(
            refreshedCategories,
            name,
            formState.type,
          ) ??
          findCategoryByName(
            allCategories,
            name,
            formState.type,
          );

        if (!nextCategory) {
          throw new ApiError(
            "Category was created but could not be selected automatically.",
            500,
            "INVALID_RESPONSE",
          );
        }

        setErrors((currentErrors) => ({
          ...currentErrors,
          categoryId: undefined,
        }));

        setFormState((currentState) => ({
          ...currentState,
          categoryId: nextCategory.id,
        }));
      } catch (error) {
        setNotice({
          tone: "error",
          message:
            error instanceof ApiError ||
              error instanceof Error
              ? error.message
              : "Failed to create category.",
        });

        throw error;
      }
    },
    [
      allCategories,
      createCategoryMutation,
      formState.type,
      refetchCategories,
    ],
  );

  if (!isOpen) {
    return null;
  }

  const handleInputChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setNotice(null);

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }));

    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  };

  const handleTypeChange = (
    type: AddTransactionType,
  ) => {
    if (isTypeSelectionLocked) {
      return;
    }

    setNotice(null);

    setErrors((currentErrors) => ({
      ...currentErrors,
      categoryId: undefined,
    }));

    setFormState((currentState) => ({
      ...currentState,
      type,
      categoryId: "",
    }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    const parsedAmount = Number(
      formState.amount,
    );

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      nextErrors.amount =
        "Amount must be greater than zero.";
    }

    if (!formState.categoryId.trim()) {
      nextErrors.categoryId =
        "Please choose a category.";
    }

    if (!formState.occurredAt) {
      nextErrors.occurredAt =
        "Date is required.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setNotice(null);

    if (!validate()) {
      return;
    }

    try {
      await onSubmit({
        transactionName:
          formState.notes ||
          formState.item ||
          formState.merchant ||
          "Transaction",

        amount: Number(formState.amount),

        type: formState.type,

        categoryId: formState.categoryId,

        categoryType:
          selectedCategory?.categoryType ??
          formState.type,

        occurredAt: formState.occurredAt,

        notes: formState.notes,

        merchant: formState.merchant,

        item: formState.item,
      });

      onClose();
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof ApiError ||
            error instanceof Error
            ? error.message
            : "Failed to save transaction.",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
      onClick={() => {
        if (
          !isSubmitting &&
          !isDeleting
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
        className="w-full max-w-[500px] rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <WalletCards size={22} />
            </div>

            <div>
              <h2
                id="transaction-modal-title"
                className="text-lg font-semibold text-slate-900"
              >
                {isEditMode
                  ? "Edit Transaction"
                  : "Add Transaction"}
              </h2>

              <Text
                variant="caption"
                className="mt-1 text-slate-500"
              >
                {isEditMode
                  ? "Update the details and save changes."
                  : "Record an income or expense."}
              </Text>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            shape="circle"
            size="sm"
            className="border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            disabled={
              isSubmitting || isDeleting
            }
            onClick={onClose}
            aria-label="Close transaction modal"
          >
            <X size={18} />
          </Button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 px-4 py-4"
        >
          {notice && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {notice.message}
            </div>
          )}

          {hasReceipt &&
            initialData?.receiptImageUrl && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <div className="flex items-center gap-2.5">
                  <img
                    src={initialData.receiptImageUrl}
                    alt="Receipt preview"
                    className="h-14 w-11 rounded-md border border-slate-200 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Text
                        className="text-[13px] leading-none text-slate-900"
                      >
                        Receipt scanned
                      </Text>

                      <span className="rounded-full bg-emerald-100 px-1.5 py-[2px] text-[10px] font-semibold text-emerald-700">
                        OCR
                      </span>
                    </div>

                    <Text
                      variant="caption"
                      className="mt-1 truncate text-[11px] text-slate-600"
                    >
                      {initialData.merchant ??
                        "Scanned receipt"}
                    </Text>

                    <Text
                      variant="caption"
                      className="text-[10px] text-slate-500"
                    >
                      {initialData.date
                        ? new Date(
                          initialData.date,
                        ).toLocaleString()
                        : ""}
                    </Text>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 rounded-md px-2.5 text-[11px]"
                    onClick={() =>
                      setIsReceiptViewerOpen(true)
                    }
                  >
                    View
                  </Button>
                </div>
              </div>
            )}

          <div className="space-y-1.5">
            <Text
              as="label"
              variant="caption"
              weight="medium"
              className="text-slate-800"
              htmlFor="amount"
            >
              Amount
            </Text>

            <Input
              ref={amountInputRef}
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              autoFocus
              placeholder="0.00"
              value={formState.amount}
              onChange={handleInputChange}
              error={errors.amount}
              inputClassName="h-10 rounded-lg px-3 text-base font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_190px]">
            {!isTypeSelectionLocked && (
              <div className="space-y-1.5">
                <Text
                  variant="caption"
                  weight="medium"
                  className="text-slate-800"
                >
                  Type
                </Text>

                <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1">
                  {(
                    [
                      "Expense",
                      "Income",
                    ] as const
                  ).map((type) => {
                    const isActive =
                      formState.type === type;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          handleTypeChange(type)
                        }
                        className={`rounded-md px-3 py-2 text-[13px] font-semibold transition ${isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-slate-600 hover:bg-white"
                          }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Input
              id="occurredAt"
              name="occurredAt"
              type="datetime-local"
              label="Date"
              value={formState.occurredAt}
              onChange={handleInputChange}
              error={errors.occurredAt}
              containerClassName="space-y-1.5"
              inputClassName="h-10 rounded-lg text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <CalendarDays
                size={14}
                className="text-primary"
              />

              <Text
                variant="caption"
                weight="medium"
                className="text-slate-800"
              >
                Category
              </Text>
            </div>

            <TransactionCategoryPicker
              options={categoryOptions}
              selectedCategoryId={
                formState.categoryId
              }
              onSelect={(categoryId) => {
                setErrors(
                  (currentErrors) => ({
                    ...currentErrors,
                    categoryId:
                      undefined,
                  }),
                );

                setFormState(
                  (currentState) => ({
                    ...currentState,
                    categoryId,
                  }),
                );
              }}
              onCreateCategory={
                handleCreateCategory
              }
              isLoading={
                categoriesQuery.isLoading
              }
              isCreating={
                createCategoryMutation.isPending
              }
              errorMessage={
                categoriesQuery.isError
                  ? categoriesQuery.error
                    ?.message ??
                  "Failed to load categories."
                  : undefined
              }
            />

            {errors.categoryId && (
              <p className="text-xs text-rose-500">
                {errors.categoryId}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() =>
                setIsMoreDetailsOpen(
                  (current) => !current,
                )
              }
              className="flex w-full items-center justify-between px-3 py-2.5 text-left"
            >
              <div>
                <Text
                  variant="caption"
                  weight="medium"
                  className="text-slate-900"
                >
                  More details
                </Text>

                <Text
                  variant="caption"
                  className="text-slate-500"
                >
                  Notes, merchant, and item
                </Text>
              </div>

              {isMoreDetailsOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {isMoreDetailsOpen && (
              <div className="space-y-3 border-t border-slate-100 px-3 py-3">
                <Input
                  id="notes"
                  name="notes"
                  label="Notes"
                  as="textarea"
                  rows={3}
                  value={formState.notes}
                  onChange={
                    handleInputChange
                  }
                  placeholder="Add a note..."
                  containerClassName="space-y-1.5"
                  inputClassName="rounded-lg resize-none text-sm"
                />

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Input
                    id="merchant"
                    name="merchant"
                    label="Merchant"
                    value={
                      formState.merchant
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Amazon, Uber..."
                    containerClassName="space-y-1.5"
                    inputClassName="h-9 rounded-lg text-sm"
                  />

                  <Input
                    id="item"
                    name="item"
                    label="Item"
                    value={formState.item}
                    onChange={
                      handleInputChange
                    }
                    placeholder="Wireless Headphones"
                    containerClassName="space-y-1.5"
                    inputClassName="h-9 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <div>
              {isEditMode &&
                onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full px-2.5 text-xs text-rose-600 hover:bg-rose-50"
                    disabled={
                      isSubmitting ||
                      isDeleting
                    }
                    onClick={() => {
                      void onDelete();
                    }}
                  >
                    {isDeleting
                      ? "Deleting..."
                      : "Delete"}
                  </Button>
                )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-lg px-3.5 text-[13px]"
                disabled={
                  isSubmitting ||
                  isDeleting
                }
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="rounded-lg px-3.5 text-[13px]"
                loading={isSubmitting}
              >
                {isEditMode
                  ? "Save Changes"
                  : "Add Transaction"}
              </Button>
            </div>
          </div>
        </form>
      </section>

      {hasReceipt &&
        isReceiptViewerOpen &&
        initialData?.receiptImageUrl && (
          <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <div
              className="relative w-full max-w-2xl rounded-[28px] bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.35)]"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                onClick={() =>
                  setIsReceiptViewerOpen(
                    false,
                  )
                }
                className="absolute right-4 top-4 z-10 rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50"
              >
                <X size={18} />
              </button>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src={
                    initialData.receiptImageUrl
                  }
                  alt="Receipt"
                  className="max-h-[80vh] w-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export type { TransactionModalProps };

export default TransactionModal;