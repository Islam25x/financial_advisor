import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useParseTransaction } from "../hooks/useParseTransaction";
import { useReceiptOcr } from "../hooks/useReceiptOcr";
import { useVoiceToText } from "../hooks/useVoiceToText";
import type { ReceiptOcrItem } from "../api/ai.dto";
import { formatTransactionDate } from "../../transactions/utils/transaction.formatters";
import type { ParsedTransaction } from "../../transactions/utils/parsed-transaction.schema";
import { Button, Card, Input, Text } from "../../../shared/ui";

// Example UI layer: consumes hooks only, keeps API details outside the component.
interface AiApiFlowsExampleProps {
  onConfirmParsedTransaction?: (transaction: ParsedTransaction) => Promise<void>;
  onConfirmReceiptTransactions?: (transactions: ParsedTransaction[]) => Promise<void>;
}

interface InlineToastProps {
  message: string;
  onClose: () => void;
}

function InlineToast({ message, onClose }: InlineToastProps) {
  return (
    <div className="fixed right-6 top-6 z-[70] rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-lg">
      <div className="flex items-center gap-3">
        <Text as="span" variant="body" className="text-rose-700">
          {message}
        </Text>
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="rounded px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}

function SpinnerLabel({ label }: { label: string }) {
  return (
    <Text as="span" variant="body" className="inline-flex items-center gap-2">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </Text>
  );
}

const NOOP_CONFIRM = async () => {};

function AiApiFlowsExample({
  onConfirmParsedTransaction = NOOP_CONFIRM,
  onConfirmReceiptTransactions = NOOP_CONFIRM,
}: AiApiFlowsExampleProps) {
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [transcriptText, setTranscriptText] = useState("");
  const [parsedPreview, setParsedPreview] = useState<ParsedTransaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmingVoice, setConfirmingVoice] = useState(false);
  const [confirmingReceipt, setConfirmingReceipt] = useState(false);

  const voiceToTextMutation = useVoiceToText();
  const parseTransactionMutation = useParseTransaction({
    invalidateTransactions: true,
    transactionsQueryKey: ["transactions"],
  });
  const receiptOcrMutation = useReceiptOcr();

  const isVoiceFlowPending =
    voiceToTextMutation.isPending || parseTransactionMutation.isPending || confirmingVoice;
  const isReceiptFlowPending = receiptOcrMutation.isPending || confirmingReceipt;

  const receiptTransactions = useMemo(
    () =>
      (receiptOcrMutation.data?.items ?? []).map((item: ReceiptOcrItem) => ({
        amount: item.line_total ?? item.unit_price ?? 0,
        category: "Receipt",
        description:
          item.name ?? receiptOcrMutation.data?.merchant ?? "Receipt item",
        date: receiptOcrMutation.data?.issued_at,
      })),
    [receiptOcrMutation.data],
  );

  useEffect(() => {
    if (voiceToTextMutation.error) {
      setToastMessage(voiceToTextMutation.error.message);
    }
  }, [voiceToTextMutation.error]);

  useEffect(() => {
    if (parseTransactionMutation.error) {
      setToastMessage(parseTransactionMutation.error.message);
    }
  }, [parseTransactionMutation.error]);

  useEffect(() => {
    if (receiptOcrMutation.error) {
      setToastMessage(receiptOcrMutation.error.message);
    }
  }, [receiptOcrMutation.error]);

  const handleVoiceFlow = async () => {
    if (!voiceFile || isVoiceFlowPending) {
      return;
    }

    const transcript = await voiceToTextMutation.mutateAsync(voiceFile);
    setTranscriptText(transcript.text);

    const parsed = await parseTransactionMutation.mutateAsync(transcript.text);
    setParsedPreview(parsed);
    setVoiceFile(null);
  };

  const handleReceiptFlow = async () => {
    if (!receiptFile || isReceiptFlowPending) {
      return;
    }

    await receiptOcrMutation.mutateAsync({ file: receiptFile });
    setReceiptFile(null);
  };

  const handleConfirmParsed = async () => {
    if (!parsedPreview || confirmingVoice) {
      return;
    }

    setConfirmingVoice(true);
    try {
      await onConfirmParsedTransaction(parsedPreview);
      setParsedPreview(null);
      setTranscriptText("");
      voiceToTextMutation.reset();
      parseTransactionMutation.reset();
    } catch {
      setToastMessage("Unable to save transaction right now.");
    } finally {
      setConfirmingVoice(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (receiptTransactions.length === 0 || confirmingReceipt) {
      return;
    }

    setConfirmingReceipt(true);
    try {
      await onConfirmReceiptTransactions(receiptTransactions);
      receiptOcrMutation.reset();
    } catch {
      setToastMessage("Unable to save receipt transactions right now.");
    } finally {
      setConfirmingReceipt(false);
    }
  };

  return (
    <Card variant="outline" padding="md" className="space-y-6 rounded-2xl shadow-sm">
      {toastMessage && (
        <InlineToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      <div className="space-y-4">
        <Text as="h3" variant="body" weight="bold" className="text-slate-900">
          Voice Flow
        </Text>
        <Input
          type="file"
          accept="audio/*"
          onChange={(event) => {
            const target = event.currentTarget;
            const files = "files" in target ? target.files : null;
            setVoiceFile(files?.[0] ?? null);
          }}
          className="block w-full p-2 text-sm text-slate-700"
        />
        <Button
          type="button"
          disabled={!voiceFile || isVoiceFlowPending}
          onClick={handleVoiceFlow}
          variant="primary"
          size="sm"
          className="rounded-lg px-4 py-2 text-sm"
        >
          {isVoiceFlowPending ? (
            <SpinnerLabel label="Processing..." />
          ) : (
            "Transcribe and Parse"
          )}
        </Button>

        {transcriptText && (
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
            <Text variant="body" weight="medium" className="text-slate-900">
              Transcript
            </Text>
            <Text variant="body" className="mt-1">
              {transcriptText}
            </Text>
          </div>
        )}

        {parsedPreview && (
          <div className="rounded-lg border border-slate-200 p-4">
            <Text variant="body" weight="bold" className="text-slate-900">
              Parsed Preview
            </Text>
            <div className="mt-2 space-y-1 text-sm text-slate-700">
              <Text variant="body">Amount: {parsedPreview.amount}</Text>
              <Text variant="body">Category: {parsedPreview.category}</Text>
              <Text variant="body">Description: {parsedPreview.description}</Text>
              <Text variant="body">
                Date: {formatTransactionDate(parsedPreview.date)}
              </Text>
            </div>
            <Button
              type="button"
              disabled={confirmingVoice}
              onClick={handleConfirmParsed}
              variant="primary"
              size="sm"
              className="mt-3 rounded-lg px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700"
            >
              {confirmingVoice ? <SpinnerLabel label="Saving..." /> : "Confirm Transaction"}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Text as="h3" variant="body" weight="bold" className="text-slate-900">
          Receipt Flow
        </Text>
        <Input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const target = event.currentTarget;
            const files = "files" in target ? target.files : null;
            setReceiptFile(files?.[0] ?? null);
          }}
          className="block w-full p-2 text-sm text-slate-700"
        />
        <Button
          type="button"
          disabled={!receiptFile || isReceiptFlowPending}
          onClick={handleReceiptFlow}
          variant="primary"
          size="sm"
          className="rounded-lg px-4 py-2 text-sm"
        >
          {isReceiptFlowPending ? <SpinnerLabel label="Extracting..." /> : "Run OCR"}
        </Button>

        {receiptTransactions.length > 0 && (
          <div className="rounded-lg border border-slate-200 p-4">
            <Text variant="body" weight="bold" className="text-slate-900">
              Extracted Transactions
            </Text>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {receiptTransactions.map((transaction: ParsedTransaction, index: number) => (
                <li key={`${transaction.description}-${index}`} className="rounded bg-slate-50 p-2">
                  {transaction.description} - {transaction.amount} ({transaction.category}){" "}
                  - {formatTransactionDate(transaction.date)}
                </li>
              ))}
            </ul>
            <Button
              type="button"
              disabled={confirmingReceipt}
              onClick={handleConfirmReceipt}
              variant="primary"
              size="sm"
              className="mt-3 rounded-lg px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700"
            >
              {confirmingReceipt ? <SpinnerLabel label="Saving..." /> : "Confirm Bulk Add"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export default AiApiFlowsExample;
