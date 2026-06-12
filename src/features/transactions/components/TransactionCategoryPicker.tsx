import { Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, Input, Text } from "../../../shared/ui";
import type { TransactionCategory } from "../types/category.types";

type TransactionCategoryPickerProps = {
  options: TransactionCategory[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
  onCreateCategory: (name: string) => Promise<void>;
  isLoading?: boolean;
  isCreating?: boolean;
  errorMessage?: string;
  disabled?: boolean;
};

function TransactionCategoryPicker({
  options,
  selectedCategoryId,
  onSelect,
  onCreateCategory,
  isLoading = false,
  isCreating = false,
  errorMessage,
  disabled = false,
}: TransactionCategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => options.find((option) => option.id === selectedCategoryId) ?? null,
    [options, selectedCategoryId],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      option.name.trim().toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  const handleCreateClick = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      setLocalError("Category name is required.");
      return;
    }

    setLocalError(null);
    try {
      await onCreateCategory(trimmedName);
      setNewCategoryName("");
      setIsAddingCategory(false);
      setQuery("");
    } catch {
      // Parent handles request messaging.
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2">
        <div className="min-w-0">
          <Text variant="caption" className="text-slate-500">
            Selected category
          </Text>
          <Text as="p" variant="body" weight="bold" className="truncate text-text-primary">
            {selectedCategory?.name ?? "Select category"}
          </Text>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-full px-3 text-[12px]"
          disabled={disabled}
          onClick={() => setIsOpen((current) => !current)}
        >
          {selectedCategory ? "Change" : "Choose"}
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-2 rounded-lg border border-border bg-surface p-2.5 shadow-sm">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-2.5">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search categories..."
              disabled={disabled}
              className="h-9 w-full bg-transparent text-sm text-text-secondary outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-slate-400 transition hover:text-slate-600"
                aria-label="Clear category search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="max-h-24 space-y-1.5 overflow-y-auto pr-1">
            {isLoading && (
              <div className="rounded-lg border border-border bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Loading categories...
              </div>
            )}

            {!isLoading && filteredOptions.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-slate-50 px-3 py-3 text-xs text-slate-500">
                No matching categories.
              </div>
            )}

            {!isLoading &&
              filteredOptions.map((option) => {
                const isSelected = option.id === selectedCategoryId;

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onSelect(option.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-white hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <span className="text-xs font-medium text-text-primary">{option.name}</span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isSelected ? "bg-primary" : "bg-slate-300"
                      }`}
                    />
                  </button>
                );
              })}
          </div>

          {!isAddingCategory ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 text-[12px] text-primary hover:bg-primary/10"
              disabled={disabled}
              onClick={() => {
                setIsAddingCategory(true);
                setLocalError(null);
              }}
            >
              <Plus size={14} />
              Add Category
            </Button>
          ) : (
            <div className="space-y-2 rounded-lg border border-border bg-slate-50 p-2.5">
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(event) => {
                  setNewCategoryName(event.target.value);
                  setLocalError(null);
                }}
                placeholder="New category name"
                autoFocus
                error={localError ?? undefined}
                disabled={disabled || isCreating}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleCreateClick();
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-md text-[12px]"
                  disabled={disabled || isCreating}
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName("");
                    setLocalError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  loading={isCreating}
                  disabled={disabled}
                  className="rounded-md text-[12px]"
                  onClick={() => {
                    void handleCreateClick();
                  }}
                >
                  Create
                </Button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TransactionCategoryPicker;
