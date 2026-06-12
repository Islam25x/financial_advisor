import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";
import type { DateRangeValue } from "../../../shared/ui/DateRangeSelector";
import type { DashboardResponseDto } from "./dashboard.dto";

function buildDashboardQueryParams(period: DateRangeValue): string {
  const params = new URLSearchParams();
  params.set("Period", period);
  return params.toString();
}

export async function getDashboardApi(
  period: DateRangeValue,
  options?: { signal?: AbortSignal },
): Promise<DashboardResponseDto> {
  return requestJson<DashboardResponseDto>(
    `/api/Dashboard?${buildDashboardQueryParams(period)}`,
    {
      method: "GET",
      signal: options?.signal,
      baseUrl: getAppApiBaseUrl(),
      withAuth: true,
    },
  );
}
