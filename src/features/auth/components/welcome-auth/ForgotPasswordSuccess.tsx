import { ArrowLeft, Mail } from "lucide-react";

interface ForgotPasswordSuccessProps {
  email: string;
  onBackToLogin: () => void;
}

export default function ForgotPasswordSuccess({
  email,
  onBackToLogin,
}: ForgotPasswordSuccessProps) {
  return (
    <div className="px-1 py-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.22),_rgba(37,99,235,0.08))]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-[0_18px_40px_rgba(59,130,246,0.18)]">
          <Mail className="h-6 w-6 text-[#5B8CFF]" strokeWidth={1.8} />
        </div>
      </div>

      <h2 id="auth-modal-title" className="mt-5 text-2xl font-semibold text-slate-900">
        Check your email
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        If an account exists for{" "}
        <span className="font-semibold text-slate-900">{email}</span>, we&apos;ve sent a password
        reset link to that email address.
      </p>

      <button
        type="button"
        onClick={onBackToLogin}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </button>
    </div>
  );
}
