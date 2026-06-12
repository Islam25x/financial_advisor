import type { ChangeEvent, FormEvent } from "react";
import Input from "../../../../shared/ui/Input";
import { AuthPasswordField } from "../AuthPasswordField";

interface RegisterFormProps {
  data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    agree: boolean;
  };
  errors: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agree?: string;
    form?: string;
  };
  authBanner: {
    tone: "success" | "error";
    text: string;
  } | null;
  isSubmitting: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({
  data,
  errors,
  authBanner,
  isSubmitting,
  onChange,
  onSubmit,
  onSwitchToLogin,
}: RegisterFormProps) {
  return (
    <>
      <div className="mb-6 text-center">
        <h2 id="auth-modal-title" className="text-3xl font-bold text-primary-700 drop-shadow-md">
          Create an Account
        </h2>
      </div>

      {authBanner && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            authBanner.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
          aria-live="polite"
        >
          {authBanner.text}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            id="modal-register-username"
            name="username"
            type="text"
            label="Username"
            value={data.username}
            onChange={(event) => onChange(event as ChangeEvent<HTMLInputElement>)}
            disabled={isSubmitting}
            autoComplete="username"
            error={errors.username}
          />

          <Input
            id="modal-register-email"
            name="email"
            type="email"
            label="Email Address"
            value={data.email}
            onChange={(event) => onChange(event as ChangeEvent<HTMLInputElement>)}
            disabled={isSubmitting}
            autoComplete="email"
            error={errors.email}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AuthPasswordField
            id="modal-register-password"
            name="password"
            label="Password"
            value={data.password}
            onChange={onChange}
            disabled={isSubmitting}
            placeholder="Create a password"
            autoComplete="new-password"
            error={errors.password}
          />

          <AuthPasswordField
            id="modal-register-confirm"
            name="confirmPassword"
            label="Confirm Password"
            value={data.confirmPassword}
            onChange={onChange}
            disabled={isSubmitting}
            placeholder="Confirm your password"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="modal-register-agree"
              name="agree"
              checked={data.agree}
              onChange={onChange}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-gray-300 text-primary-600"
            />
            <label htmlFor="modal-register-agree" className="text-sm text-gray-700">
              I agree to the <span className="font-semibold text-primary-600">finexa policy</span>
            </label>
          </div>
          {errors.agree && <p className="mt-1 text-xs text-rose-600">{errors.agree}</p>}
        </div>

        <p className="text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary-600 hover:underline"
          >
            Login
          </button>
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary-700 py-2 text-white transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-400"
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>
    </>
  );
}
