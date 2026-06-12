import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faChartColumn,
  faCircle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import type { ReactNode } from "react";
import type {
  FinancialMetricId,
  FinancialSummaryData,
  FinancialMetricActionMap,
  FinancialMetricArrowMap,
  FinancialMetricTitleMap,
} from "../utils/financial-summary";
import { buildFinancialMetricCardModels } from "../utils/financial-summary";
import MetricCard from "./MetricCard";
import TrendIndicator from "./TrendIndicator";

type FinancialSummaryCardsProps = {
  summary?: FinancialSummaryData;
  isLoading?: boolean;
  isError?: boolean;
  actions?: FinancialMetricActionMap;
  titles?: FinancialMetricTitleMap;
  arrows?: FinancialMetricArrowMap;
};

const METRIC_ICONS: Record<FinancialMetricId, ReactNode> = {
  balance: <FontAwesomeIcon icon={faCircle} className="text-green-500" />,
  income: <FontAwesomeIcon icon={faClock} className="text-primary" />,
  expenses: <FontAwesomeIcon icon={faChartColumn} className="text-purple-500" />,
  savings: <FontAwesomeIcon icon={faBell} className="text-yellow-500" />,
};

function FinancialSummaryCards({
  summary,
  isLoading = false,
  isError = false,
  actions,
  titles,
  arrows,
}: FinancialSummaryCardsProps) {
  const state = isLoading ? "loading" : isError ? "error" : "ready";
  const cards = buildFinancialMetricCardModels(summary, state, actions, titles, arrows);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <MetricCard
          key={card.id}
          title={card.title}
          icon={METRIC_ICONS[card.id]}
          value={card.value}
          trendContent={<TrendIndicator trend={card.trend} />}
          showArrow={card.showArrow}
          onArrowClick={card.onArrowClick}
        />
      ))}
    </div>
  );
}

export default FinancialSummaryCards;
