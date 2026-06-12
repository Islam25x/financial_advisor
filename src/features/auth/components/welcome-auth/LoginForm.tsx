import type { ChangeEvent, FormEvent } from "react";
import Input from "../../../../shared/ui/Input";
import { AuthPasswordField } from "../AuthPasswordField";

interface LoginFormProps {
  data: {
    email: string;
    password: string;
  };
  errors: {
    email?: string;
    password?: string;
  };
  isSubmitting: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onForgotPassword: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginForm({
  data,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  onForgotPassword,
  onSwitchToSignup,
}: LoginFormProps) {
  return (
    <>
      <div className="mb-6 text-center">
        <h2 id="auth-modal-title" className="text-2xl font-semibold text-slate-900">
          Sign into your account
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          id="modal-login-email"
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

        <AuthPasswordField
          id="modal-login-password"
          name="password"
          label="Password"
          value={data.password}
          onChange={onChange}
          disabled={isSubmitting}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-primary-600 transition hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <p className="text-sm leading-6 text-gray-500">
          By submitting your info, you agree to our policy at{" "}
          <span className="text-primary-600">finexa</span>
        </p>

        <p className="text-sm">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-primary-600 hover:underline"
          >
            Sign up
          </button>
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary-700 py-2 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-400"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </>
  );
}
