import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";
import type {
  GenerateSavingPlanRequestDto,
  SavingPlanResponseDto,
} from "./saving-plan.dto";
import { parseSavingPlanResponse } from "../utils/saving-plan.parser";

export async function generateSavingPlanApi(
  payload: GenerateSavingPlanRequestDto,
  options?: { signal?: AbortSignal },
): Promise<SavingPlanResponseDto> {
  const response = await requestJson<unknown>("/api/saving-plans/generate", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });

  return parseSavingPlanResponse(response);
}
