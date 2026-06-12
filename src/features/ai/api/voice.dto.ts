import { z } from "zod";

export const VoiceToTextResponseSchema = z.object({
  text: z.string(),
});

export interface VoiceToTextRequestDto {
  file: File;
}

export interface VoiceToTextResponseDto {
  text: string;
}

export type VoiceToTextResponse = z.infer<typeof VoiceToTextResponseSchema>;
