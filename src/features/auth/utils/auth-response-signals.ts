function normalizeMessage(message: string): string {
  return message.trim().toLowerCase();
}

export function isRegisterSuccessMessage(message: string): boolean {
  const normalizedMessage = normalizeMessage(message);

  return (
    normalizedMessage.includes("registration successful") ||
    normalizedMessage.includes("confirm your account")
  );
}

export function isConfirmationRequiredMessage(message: string): boolean {
  const normalizedMessage = normalizeMessage(message);

  return (
    normalizedMessage.includes("confirm your email") ||
    normalizedMessage.includes("confirm your account") ||
    normalizedMessage.includes("email confirmation") ||
    normalizedMessage.includes("confirm") && normalizedMessage.includes("email")
  );
}
