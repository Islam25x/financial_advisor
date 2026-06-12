import { requestJson } from "../../../infrastructure/api/http";
import type { ReceiptOcrResponse } from "./ai.dto";
import type { ReceiptOcrRequestDto } from "./ocr.dto";

export async function receiptOcrApi(
  payload: ReceiptOcrRequestDto,
): Promise<ReceiptOcrResponse> {
  const formData = new FormData();
  formData.append("file", payload.file);

  return requestJson<ReceiptOcrResponse>("/api/Transaction/from-ocr", {
    method: "POST",
    body: formData,
    withAuth: true,
  });
}
