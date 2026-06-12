import { ApiError } from "../../../infrastructure/api/api-error";
import type {
  DashboardResponseDto,
  DashboardTrendDto,
  ExpenseBreakdownDto,
  MoneyFlowDto,
} from "../api/dashboard.dto";
import type {
    DashboardData,
    DashboardExpenseBreakdownItem,
    DashboardMoneyFlowPoint,
    DashboardTrend,
} from "../types/dashboard.models";
import { parseBackendTimestamp } from "../../../shared/utils/date-time";

function logDashboardDebug(message: string, payload?: unknown): void {
    if (!import.meta.env.DEV) {
        return;
    }

    console.debug(`[dashboard] ${message}`, payload);
}

function parseNumber(value: unknown, fieldName: string): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsedValue = Number(value);
        if (Number.isFinite(parsedValue)) {
            return parsedValue;
        }
    }

    throw new ApiError(`Dashboard field "${fieldName}" is invalid.`, 500, "INVALID_RESPONSE");
}

function parseLabel(value: unknown, fieldName: string): string {
    if (typeof value === "string") {
        return value;
    }

    throw new ApiError(`Dashboard field "${fieldName}" is invalid.`, 500, "INVALID_RESPONSE");
}

function parseDate(value: unknown, fieldName: string): Date {
    if (typeof value !== "string" || value.trim() === "") {
        throw new ApiError(`Dashboard field "${fieldName}" is invalid.`, 500, "INVALID_RESPONSE");
    }

    const parsedDate = parseBackendTimestamp(value);
    if (!parsedDate) {
        throw new ApiError(`Dashboard field "${fieldName}" is invalid.`, 500, "INVALID_RESPONSE");
    }

    return parsedDate;
}

function parseTrendDirection(value: unknown, fieldName: string): DashboardTrend["trend"] {
    if (value === "up" || value === "down" || value === "neutral") {
        return value;
    }

    if (value === "stable") {
        logDashboardDebug(`Normalizing legacy trend value for ${fieldName}`, value);
        return "neutral";
    }

    throw new ApiError(`Dashboard field "${fieldName}" is invalid.`, 500, "INVALID_RESPONSE");
}

export function parseTrend(
    dto: DashboardTrendDto,
    fieldName = "trend",
): DashboardTrend {
    if (!dto || typeof dto !== "object") {
        throw new ApiError(`Dashboard field "${fieldName}" is invalid.`, 500, "INVALID_RESPONSE");
    }

    return {
        value: parseNumber(dto.value, `${fieldName}.value`),
        label: parseLabel(dto.label, `${fieldName}.label`),
        trend: parseTrendDirection(dto.trend, `${fieldName}.trend`),
    };
}

export function parseMoneyFlow(
    dto: MoneyFlowDto[],
): DashboardMoneyFlowPoint[] {
    if (!Array.isArray(dto)) {
        throw new ApiError('Dashboard field "moneyFlow" is invalid.', 500, "INVALID_RESPONSE");
    }

    return dto.map((item, index) => {
        const income = parseNumber(item.income, `moneyFlow[${index}].income`);
        const expense = parseNumber(item.expense, `moneyFlow[${index}].expense`);

        return {
            label: parseLabel(item.label, `moneyFlow[${index}].label`),
            income,
            expense,
            savings: income - expense,
        };
    });
}

export function parseExpenseBreakdown(
    dto: ExpenseBreakdownDto[],
): DashboardExpenseBreakdownItem[] {
    if (!Array.isArray(dto)) {
        throw new ApiError(
            'Dashboard field "expenseBreakdown" is invalid.',
            500,
            "INVALID_RESPONSE",
        );
    }

    return dto.map((item, index) => ({
        categoryName: parseLabel(
            item.categoryName,
            `expenseBreakdown[${index}].categoryName`,
        ),
        amount: parseNumber(item.amount, `expenseBreakdown[${index}].amount`),
        change: parseTrend(item.change, `expenseBreakdown[${index}].change`),
    }));
}

export function parseDashboardSummary(
    dto: DashboardResponseDto,
): DashboardData {
    const parsedDashboard = {
        totalBalance: parseNumber(dto.totalBalance, "totalBalance"),
        totalIncome: parseNumber(dto.totalIncome, "totalIncome"),
        totalExpense: parseNumber(dto.totalExpense, "totalExpense"),
        totalSavings: parseNumber(dto.totalSavings, "totalSavings"),
        rangeStart: parseDate(dto.from, "from"),
        rangeEnd: parseDate(dto.to, "to"),
        incomeChangePercentage: parseTrend(
            dto.incomeChangePercentage,
            "incomeChangePercentage",
        ),
        expenseChangePercentage: parseTrend(
            dto.expenseChangePercentage,
            "expenseChangePercentage",
        ),
        savingsChangePercentage: parseTrend(
            dto.savingsChangePercentage,
            "savingsChangePercentage",
        ),
        expenseBreakdown: parseExpenseBreakdown(dto.expenseBreakdown),
        moneyFlow: parseMoneyFlow(dto.moneyFlow),
    };

    logDashboardDebug("Parsed dashboard summary", parsedDashboard);

    return parsedDashboard;
}
