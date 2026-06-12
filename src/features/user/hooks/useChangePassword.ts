import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../api/user.api";
import type { ChangePasswordRequestDto } from "../api/user.dto";

export function useChangePassword() {
  return useMutation({
    mutationFn: (
      payload: ChangePasswordRequestDto,
    ) => changePassword(payload),
  });
}