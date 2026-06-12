import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { receiptOcrApi } from "../api/receiptOcr.api";
import type { ReceiptOcrRequestDto } from "../api/ocr.dto";
import type { ReceiptOcrResponse } from "../api/ai.dto";

export function useReceiptOcr(): UseMutationResult<
  ReceiptOcrResponse,
  ApiError,
  ReceiptOcrRequestDto
> {
  return useMutation<ReceiptOcrResponse, ApiError, ReceiptOcrRequestDto>({
    mutationFn: receiptOcrApi,
    retry: 0,
  });
}
