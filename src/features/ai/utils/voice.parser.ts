import {
  VoiceToTextResponseSchema,
  type VoiceToTextResponse,
} from "../api/voice.dto";

export function parseVoiceToTextResponse(payload: unknown): VoiceToTextResponse {
  return VoiceToTextResponseSchema.parse(payload);
}
