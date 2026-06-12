import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";
import type { VoiceToTextResponse } from "./voice.dto";
import { parseVoiceToTextResponse } from "../utils/voice.parser";

export async function voiceToTextApi(
  file: File,
  options?: { signal?: AbortSignal },
): Promise<VoiceToTextResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await requestJson<unknown>("/api/AI/voice-to-text", {
    method: "POST",
    body: formData,
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });

  return parseVoiceToTextResponse(response);
}
