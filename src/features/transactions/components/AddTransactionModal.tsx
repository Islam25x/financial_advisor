import { useCallback } from "react";
import { useAddTransaction } from "../hooks/useAddTransaction";
import { useDeleteTransaction } from "../hooks/useDeleteTransaction";
import { useUpdateTransaction } from "../hooks/useUpdateTransaction";
import type { AddTransactionInput } from "../types/add-transaction.types";
import type { Transaction } from "../types/transaction.types";
import TransactionModal from "./TransactionModal";

type AddTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: Transaction;
  forcedType?: "income" | "expense";
};

function AddTransactionModal({
  isOpen,
  onClose,
  mode,
  initialData,
  forcedType,
}: AddTransactionModalProps) {
  const addTransactionMutation = useAddTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();
  const isEditMode = mode === "edit";

  const handleSubmit = useCallback(
    async (data: AddTransactionInput) => {
      if (isEditMode && initialData) {
        await updateTransactionMutation.mutateAsync({
          transactionId: initialData.id,
          input: data,
        });
        return;
      }

      await addTransactionMutation.mutateAsync(data);
    },
    [addTransactionMutation, initialData, isEditMode, updateTransactionMutation],
  );

  const handleDelete = useCallback(async () => {
    if (!isEditMode || !initialData) {
      return;
    }

    await deleteTransactionMutation.mutateAsync(initialData.id);
    onClose();
  }, [deleteTransactionMutation, initialData, isEditMode, onClose]);

  return (
    <TransactionModal
      isOpen={isOpen}
      mode={isEditMode ? "edit" : "add"}
      initialData={initialData}
      forcedType={forcedType}
      onSubmit={handleSubmit}
      onClose={onClose}
      onDelete={isEditMode ? handleDelete : undefined}
      isSubmitting={addTransactionMutation.isPending || updateTransactionMutation.isPending}
      isDeleting={deleteTransactionMutation.isPending}
    />
  );
}

export default AddTransactionModal;
