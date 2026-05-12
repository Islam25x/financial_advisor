import { useEffect } from "react";
import { ArrowRight, Check, Link as LinkIcon, Mail, RefreshCw, Shield } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthCard from "../../features/auth/components/auth-layout/AuthCard";
import AuthFlowLayout from "../../features/auth/components/auth-layout/AuthFlowLayout";
import { useResendConfirmation } from "../../features/auth/hooks/useResendConfirmation";
import {
  readStoredPendingConfirmationEmail,
  writeStoredPendingConfirmationEmail,
} from "../../infrastructure/auth/auth-storage";
import { Button } from "../../shared/ui";

const steps = [
  {
    id: "open-email",
    title: "Open your email",
    description: "We sent you a confirmation link",
    icon: Mail,
  },
  {
    id: "click-link",
    title: "Click the link",
    description: "Verify your account to activate login",
    icon: LinkIcon,
  },
  {
    id: "start",
    title: "Start using Finexa",
    description: "After verification, you can log in",
    icon: Check,
  },
] as const;

type CheckEmailPanelProps = {
  email?: string | null;
  embedded?: boolean;
  onGoToLogin?: () => void;
};

function readEmail(searchParams: URLSearchParams): string {
  return searchParams.get("email")?.trim() ?? "";
}

export function CheckEmailPanel({
  email,
  embedded = false,
  onGoToLogin,
}: CheckEmailPanelProps) {
  const resendConfirmationMutation = useResendConfirmation();
  const normalizedEmail = email?.trim() ?? "";
  const hasEmail = Boolean(normalizedEmail);

  useEffect(() => {
    if (!normalizedEmail) {
      return;
    }

    writeStoredPendingConfirmationEmail(normalizedEmail);
  }, [normalizedEmail]);

  const handleResend = () => {
    if (!normalizedEmail) {
      return;
    }

    void resendConfirmationMutation.mutateAsync({
      email: normalizedEmail,
    });
  };

  return (
    <AuthCard
      size="compact"
      className={`px-5 py-5 ${
        embedded ? "" : "sm:py-6"
      }`}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.22),_rgba(37,99,235,0.08))]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-[0_18px_40px_rgba(59,130,246,0.18)]">
            <Mail className="h-6 w-6 text-[#5B8CFF]" strokeWidth={1.8} />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-900 sm:text-[1.75rem]">
          Check your email
        </h1>

        <p className="max-w-sm text-sm leading-6 text-slate-500 sm:text-base">
          We&apos;ve sent a confirmation link{" "}
          {hasEmail ? (
            <>
              to{" "}
              <span className="text-base font-semibold text-slate-900 sm:text-[1.05rem]">
                {normalizedEmail}
              </span>
            </>
          ) : (
            "to your email address"
          )}
        </p>
      </div>

      <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="grid gap-3">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="flex items-start gap-3 rounded-[20px] border border-slate-100 bg-[#FBFDFF] px-3 py-3 text-left"
            >
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-[#2C6BFF]">
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">{step.title}</h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-[24px] border border-[#DCE7FF] bg-[#F7FAFF] p-4">
        <div className="flex items-start gap-3 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#2C6BFF] shadow-sm">
            <Shield className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Didn&apos;t receive the email?</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Check your spam folder first, then resend the confirmation email if needed.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={resendConfirmationMutation.isPending}
          disabled={!hasEmail}
          onClick={handleResend}
          className="self-start rounded-xl border border-[#AFC7FF] bg-white text-sm font-semibold text-[#2C6BFF] hover:bg-[#EDF4FF]"
        >
          <RefreshCw className="h-4 w-4" />
          Resend Email
        </Button>
      </div>

      {!hasEmail && (
        <p className="mt-3 text-center text-sm text-slate-500">
          Sign in again to request a new confirmation email for your account.
        </p>
      )}

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={onGoToLogin}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C6BFF] transition hover:underline"
        >
          Go to login
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </AuthCard>
  );
}

export default function CheckEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = readEmail(searchParams) || readStoredPendingConfirmationEmail() || "";

  return (
    <AuthFlowLayout
      headerAside={
        <a
          href="mailto:support@finexa.app"
          className="hidden text-sm font-medium text-slate-500 transition hover:text-[#2C6BFF] sm:inline-flex"
        >
          Need help? <span className="ml-1 text-[#2C6BFF]">Contact Support</span>
        </a>
      }
    >
      <CheckEmailPanel email={email} onGoToLogin={() => navigate("/login")} />
    </AuthFlowLayout>
  );
}
