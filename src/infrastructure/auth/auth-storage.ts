import type { AuthSession } from "../../features/auth/types/auth.types";

export const AUTH_STORAGE_KEY = "finexa.auth.session";
const PENDING_CONFIRMATION_EMAIL_STORAGE_KEY = "finexa.auth.pending-confirmation-email";

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime());
}

export function readStoredAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as {
      token?: unknown;
      expiresAt?: unknown;
    };
    const expiresAt =
      typeof parsed.expiresAt === "string" ? new Date(parsed.expiresAt) : null;

    if (
      typeof parsed.token !== "string" ||
      !parsed.token
    ) {
      clearStoredAuthSession();
      return null;
    }

    return {
      token: parsed.token,
      expiresAt: expiresAt && isValidDate(expiresAt) ? expiresAt : new Date(0),
    };
  } catch {
    clearStoredAuthSession();
    return null;
  }
}

export function writeStoredAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function readStoredPendingConfirmationEmail(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(PENDING_CONFIRMATION_EMAIL_STORAGE_KEY)?.trim();
  return value || null;
}

export function writeStoredPendingConfirmationEmail(email: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedEmail = email.trim();
  if (!normalizedEmail) {
    window.localStorage.removeItem(PENDING_CONFIRMATION_EMAIL_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(PENDING_CONFIRMATION_EMAIL_STORAGE_KEY, normalizedEmail);
}

export function clearStoredPendingConfirmationEmail(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PENDING_CONFIRMATION_EMAIL_STORAGE_KEY);
}

export function clearPersistedAuthState(): void {
  if (typeof window === "undefined") {
    return;
  }

  clearStoredAuthSession();
  clearStoredPendingConfirmationEmail();
  window.sessionStorage.clear();
}
