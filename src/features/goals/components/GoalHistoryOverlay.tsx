import { ArrowUpRight, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { PanelCard, Text } from "../../../shared/ui";
import type { Goal, GoalHistoryPage } from "../types/goal.types";
import { formatBackendTimestampForDisplay } from "../../../shared/utils/date-time";

type GoalHistoryOverlayProps = {
  goal: Goal;
  history: GoalHistoryPage | undefined;
  isLoading: boolean;
  pageNumber: number;
  onClose: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value).replace(/\s+/g, " ");
}

function formatDate(value: string) {
  return formatBackendTimestampForDisplay(value, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function GoalHistoryOverlay({
  goal,
  history,
  isLoading,
  pageNumber,
  onClose,
  onPreviousPage,
  onNextPage,
}: GoalHistoryOverlayProps) {
  const items = history?.items ?? [];
  const pageSize = history?.pageSize ?? 2;
  const totalCount = Math.max(history?.totalCount ?? items.length, items.length);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const isServerPaged = items.length <= pageSize && totalCount > items.length;
  const visibleItems = isServerPaged
    ? items
    : items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  const totalContributions = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="absolute inset-0 z-20 rounded-3xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
      <PanelCard className="h-full rounded-3xl !p-0">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-slate-100 px-7 py-6">
            <div>
              <h3 className="text-[18px] font-semibold text-slate-900">Goal History</h3>
              <Text variant="body" className="mt-1 text-slate-500">
                {goal.title}
              </Text>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 transition hover:text-slate-800"
              aria-label="Close goal history"
            >
              <X size={22} />
            </button>
          </div>

          <div className="px-7 py-5">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4">
              <div>
                <Text variant="body" className="text-slate-500">
                  Total Contributions
                </Text>
                <Text as="p" variant="subtitle" weight="bold" className="mt-2 text-slate-900">
                  {formatCurrency(totalContributions)}
                </Text>
              </div>
              <ArrowUpRight size={20} className="text-emerald-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-7 pb-4">
            <div className="space-y-6">
              {isLoading && (
                <div className="space-y-4">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              )}

              {!isLoading &&
                visibleItems.map((entry) => (
                  <div key={entry.id} className="relative pl-11">
                    <div className="absolute left-[15px] top-12 bottom-[-28px] w-px bg-slate-200 last:hidden" />
                    <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                      <Plus size={18} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Text
                        as="p"
                        variant="subtitle"
                        weight="bold"
                        className="text-slate-900 whitespace-nowrap"
                      >
                        {formatCurrency(entry.amount)}
                      </Text>

                      <Text
                        variant="caption"
                        className="text-slate-400 whitespace-nowrap"
                      >
                        {formatDate(entry.occurredAt)}
                      </Text>
                    </div>
                    <Text variant="body" className="mt-2 text-slate-500">
                      Contribution to goal: {goal.title}
                    </Text>
                  </div>
                ))}

              {!isLoading && visibleItems.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  No contributions yet.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-7 py-5">
            <Text variant="body" className="text-slate-700">
              Page {pageNumber} of {totalPages}
            </Text>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onPreviousPage}
                disabled={pageNumber <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={onNextPage}
                disabled={pageNumber >= totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </PanelCard>
    </div>
  );
}

export default GoalHistoryOverlay;
