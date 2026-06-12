import { useMutation } from "@tanstack/react-query";
import { deleteUser } from "../api/user.api";

export function useDeleteUser() {
    return useMutation({
        mutationFn: () => deleteUser(),
    });
}