import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthPasswordField } from "../../features/auth/components/AuthPasswordField";
import AuthCard from "../../features/auth/components/auth-layout/AuthCard";
import AuthFlowLayout from "../../features/auth/components/auth-layout/AuthFlowLayout";
import { useResetPassword } from "../../features/auth/hooks/useResetPassword";
import { readAuthLinkParam } from "../../shared/auth/auth-link-params";
import { Button, useToast } from "../../shared/ui";

type ResetPasswordErrors = {
  newPassword?: string;
  confirmPassword?: string;
  form?: string;
};

function isInvalidOrExpiredResetError(message: string) {
  return (
    message.includes("expire") ||
    message.includes("invalid") ||
    message.includes("not valid") ||
    message.includes("reset token") ||
    message.includes("token")
  );
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const resetPasswordMutation = useResetPassword();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ResetPasswordErrors>({});

  const resetPayload = useMemo(() => {
    const token =
      readAuthLinkParam(location.search, "token") || readAuthLinkParam(location.hash, "token");
    const email =
      readAuthLinkParam(location.search, "email") || readAuthLinkParam(location.hash, "email");

    if (!token || !email) {
      return null;
    }

    return { token, email };
  }, [location.hash, location.search]);

  const mutationErrorMessage = resetPasswordMutation.error?.message.toLowerCase() ?? "";
  const mutationErrorStatus = resetPasswordMutation.error?.status;
  const isInvalidOrExpiredState =
    resetPasswordMutation.isError &&
    (mutationErrorStatus === 400 ||
      mutationErrorStatus === 404 ||
      mutationErrorStatus === 410) &&
    isInvalidOrExpiredResetError(mutationErrorMessage);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const validateForm = () => {
    const nextErrors: ResetPasswordErrors = {};

    if (!formData.newPassword.trim()) {
      nextErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      nextErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!resetPayload) {
      setErrors({
        form: "This reset link is missing required data. Open the latest email and try again.",
      });
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await resetPasswordMutation.mutateAsync({
        email: resetPayload.email,
        token: resetPayload.token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setErrors({});
      showToast({
        id: `reset-password:${resetPayload.email.toLowerCase()}`,
        message: result.message || "Password reset successfully",
        tone: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't reset your password right now. Please try again.";

      if (!isInvalidOrExpiredResetError(message.toLowerCase())) {
        setErrors((current) => ({ ...current, form: message }));
      }
    }
  };

  const goToLogin = () => navigate("/", { replace: true });

  return (
    <AuthFlowLayout illustrationClassName="top-[64%]">
      {resetPasswordMutation.isSuccess ? (
        <AuthCard size="compact">
              <button
                type="button"
                onClick={goToLogin}
                className="absolute right-5 top-5 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                aria-label="Close reset password page"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.22),_rgba(37,99,235,0.08))]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-[0_18px_40px_rgba(59,130,246,0.18)]">
                    <CheckCircle2 className="h-6 w-6 text-[#2C6BFF]" strokeWidth={1.8} />
                  </div>
                </div>

                <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-900 sm:text-[1.75rem]">
                  Password reset successful
                </h1>
                <p className="max-w-sm text-sm leading-6 text-slate-500 sm:text-base">
                  Your password has been updated. You can now sign in with your new password.
                </p>
              </div>

              <Button
                type="button"
                size="lg"
                onClick={goToLogin}
                className="mt-6 h-12 w-full rounded-xl bg-[#1D5CE8] text-sm font-semibold text-white hover:bg-[#184CC0]"
              >
                Back to sign in
              </Button>
        </AuthCard>
      ) : !resetPayload || isInvalidOrExpiredState ? (
        <AuthCard size="compact" className="text-center">
              <button
                type="button"
                onClick={goToLogin}
                className="absolute right-5 top-5 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                aria-label="Close reset password page"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF4ED] text-[#EA580C]">
                <AlertTriangle className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <h1 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-slate-900 sm:text-[1.75rem]">
                Invalid or expired link
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                {!resetPayload
                  ? "This reset link is missing required data. Open the latest email and try again."
                  : "This reset link is no longer valid. Request a new password reset email and try again."}
              </p>

              <Button
                type="button"
                size="lg"
                onClick={goToLogin}
                className="mt-6 h-12 w-full rounded-xl bg-[#1D5CE8] text-sm font-semibold text-white hover:bg-[#184CC0]"
              >
                Back to sign in
              </Button>
        </AuthCard>
      ) : (
        <AuthCard size="default">
              <button
                type="button"
                onClick={goToLogin}
                className="absolute right-5 top-5 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                aria-label="Close reset password page"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.22),_rgba(37,99,235,0.08))]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-[0_18px_40px_rgba(59,130,246,0.18)]">
                    <LockKeyhole className="h-6 w-6 text-[#2C6BFF]" strokeWidth={1.8} />
                  </div>
                </div>

                <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-900 sm:text-[1.75rem]">
                  Reset your password
                </h1>
                <p className="max-w-sm text-sm leading-6 text-slate-500 sm:text-base">
                  Enter your new password below. Make sure it&apos;s something strong and secure.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {errors.form && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {errors.form}
                  </div>
                )}

                <AuthPasswordField
                  id="reset-password-new-password"
                  name="newPassword"
                  label="New password"
                  value={formData.newPassword}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  disabled={resetPasswordMutation.isPending}
                  error={errors.newPassword}
                  onChange={handleChange}
                />

                <AuthPasswordField
                  id="reset-password-confirm-password"
                  name="confirmPassword"
                  label="Confirm new password"
                  value={formData.confirmPassword}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  disabled={resetPasswordMutation.isPending}
                  error={errors.confirmPassword}
                  onChange={handleChange}
                />

                <Button
                  type="submit"
                  size="lg"
                  loading={resetPasswordMutation.isPending}
                  disabled={resetPasswordMutation.isPending}
                  className="mt-2 h-12 w-full rounded-xl bg-[#1D5CE8] text-sm font-semibold text-white hover:bg-[#184CC0]"
                >
                  {resetPasswordMutation.isPending ? "Resetting password..." : "Reset Password"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={goToLogin}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C6BFF] transition hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </button>
              </div>
        </AuthCard>
      )}
    </AuthFlowLayout>
  );
}
