import type { User } from "../types/user.types";

export function getUserDisplayName(user?: User | null): string {
  if (!user) {
    return "";
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  return fullName || user.username || user.email;
}

export function getUserInitial(user: User): string {
  return getUserDisplayName(user).charAt(0).toUpperCase() || "F";
}
