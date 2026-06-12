import type { ChangeEvent, FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import Input from "../../../../shared/ui/Input";

interface ForgotPasswordFormProps {
  data: {
    email: string;
  };
  errors: {
    email?: string;
    form?: string;
  };
  isSubmitting: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({
  data,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  onBackToLogin,
}: ForgotPasswordFormProps) {
  return (
    <>
      <div className="mb-6 text-center">
        <h2 id="auth-modal-title" className="text-2xl font-semibold text-slate-900">
          Reset your password
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter the email associated with your account and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {errors.form && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.form}
          </div>
        )}

        <Input
          id="modal-forgot-password-email"
          name="email"
          type="email"
          label="Email"
          value={data.email}
          onChange={(event) => onChange(event as ChangeEvent<HTMLInputElement>)}
          disabled={isSubmitting}
          placeholder="Enter your email"
          autoComplete="email"
          error={errors.email}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary-700 py-2 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-400"
        >
          {isSubmitting ? "Sending reset link..." : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </button>
      </div>
    </>
  );
}
