import { useEffect, useMemo, useRef } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  LoaderCircle,
  MailCheck,
  Rocket,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthCard from "../../features/auth/components/auth-layout/AuthCard";
import AuthFlowLayout from "../../features/auth/components/auth-layout/AuthFlowLayout";
import { useConfirmEmail } from "../../features/auth/hooks/useConfirmEmail";
import {
  clearStoredPendingConfirmationEmail,
  readStoredPendingConfirmationEmail,
  writeStoredPendingConfirmationEmail,
} from "../../infrastructure/auth/auth-storage";
import { readAuthLinkParam } from "../../shared/auth/auth-link-params";
import { Button, useToast } from "../../shared/ui";

const successHighlights = [
  {
    id: "secure",
    title: "Your account is secure",
    description: "Email verification helps keep your account safe.",
    icon: ShieldCheck,
  },
  {
    id: "features",
    title: "Access all features",
    description: "You can now log in and explore everything.",
    icon: UserRound,
  },
  {
    id: "start",
    title: "Let's get started",
    description: "Manage your finances smarter with Finexa.",
    icon: Rocket,
  },
] as const;

function isInvalidOrExpiredConfirmationError(message: string) {
  return (
    message.includes("expire") ||
    message.includes("invalid") ||
    message.includes("not valid") ||
    message.includes("verification token") ||
    message.includes("confirmation token")
  );
}

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const successHandledRef = useRef(false);
  const searchString = searchParams.toString();
  const confirmationEmail =
    readAuthLinkParam(searchString, "email") || readStoredPendingConfirmationEmail() || "";
  const confirmationPayload = useMemo(() => {
    const userId = readAuthLinkParam(searchString, "userId");
    const token = readAuthLinkParam(searchString, "token");

    if (!userId || !token) {
      return null;
    }

    return { userId, token };
  }, [searchString]);

  useEffect(() => {
    if (!confirmationEmail) {
      return;
    }

    writeStoredPendingConfirmationEmail(confirmationEmail);
  }, [confirmationEmail]);

  const confirmationQuery = useConfirmEmail(confirmationPayload);
  const isMissingParams = !confirmationPayload;
  const confirmationErrorMessage = confirmationQuery.error?.message.toLowerCase() ?? "";
  const confirmationErrorStatus = confirmationQuery.error?.status;
  const isInvalidOrExpiredState =
    !isMissingParams &&
    confirmationQuery.isError &&
    (confirmationErrorStatus === 400 ||
      confirmationErrorStatus === 404 ||
      confirmationErrorStatus === 410) &&
    isInvalidOrExpiredConfirmationError(confirmationErrorMessage);
  const isLoading = !isMissingParams && !isInvalidOrExpiredState && confirmationQuery.isPending;
  const isSuccess = !isMissingParams && confirmationQuery.isSuccess;
  const isGenericError = !isMissingParams && confirmationQuery.isError && !isInvalidOrExpiredState;

  useEffect(() => {
    successHandledRef.current = false;
  }, [confirmationPayload?.token, confirmationPayload?.userId]);

  useEffect(() => {
    if (!isSuccess || successHandledRef.current || !confirmationPayload) {
      return;
    }

    successHandledRef.current = true;
    clearStoredPendingConfirmationEmail();
    showToast({
      id: `confirm-email:${confirmationPayload.userId}`,
      message: "Email confirmed successfully",
      tone: "success",
    });
  }, [confirmationPayload, isSuccess, showToast]);

  return (
    <AuthFlowLayout>
      {isLoading && (
        <AuthCard size="compact" className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#ECF4FF]">
            <LoaderCircle className="h-12 w-12 animate-spin text-[#2C6BFF]" strokeWidth={1.8} />
          </div>
          <h1 className="mt-8 text-3xl font-bold tracking-[-0.03em] text-slate-900">
            Confirming your email...
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-500">
            Please wait while we verify your confirmation link.
          </p>
        </AuthCard>
      )}

      {isSuccess && (
        <AuthCard size="compact" className="text-center">
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.2),_rgba(59,130,246,0.07))]">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#E8FFF0] text-[#22A958] shadow-[0_18px_55px_rgba(34,197,94,0.18)]">
              <MailCheck className="h-8 w-8" strokeWidth={1.8} />
            </div>
            <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#22A958] text-white shadow-lg">
              <Check className="h-4 w-4" strokeWidth={3} />
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-slate-900 sm:text-[2rem]">
            Email Confirmed!
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Your email has been successfully verified. You can now log in to your account and
            start using Finexa.
          </p>

          <div className="mt-6 grid gap-3 text-left">
            {successHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className="rounded-[20px] border border-slate-100 bg-[#FBFDFF] px-4 py-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF4FF] text-[#2C6BFF]">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <h2 className="mt-3 text-sm font-semibold text-slate-900">{item.title}</h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{item.description}</p>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            size="lg"
            onClick={() => navigate("/", { replace: true })}
            className="mt-6 h-12 w-full rounded-xl bg-[#1D5CE8] text-sm font-semibold text-white shadow-[0_18px_45px_rgba(29,92,232,0.3)] hover:bg-[#184CC0]"
          >
            Go to Login
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="mt-6 text-center text-sm text-slate-500">
            If you didn&apos;t create an account with Finexa,{" "}
            <span className="font-semibold text-[#2C6BFF]">you can safely ignore this email.</span>
          </p>
        </AuthCard>
      )}

      {isInvalidOrExpiredState && (
        <AuthCard size="compact" className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF7E8] text-[#D97706]">
            <AlertTriangle className="h-12 w-12" strokeWidth={1.8} />
          </div>
          <h1 className="mt-8 text-3xl font-bold tracking-[-0.03em] text-slate-900">
            Invalid or expired link
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-500">
            This confirmation link is no longer valid. Try the link again, or continue to login if
            your account has already been verified.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                successHandledRef.current = false;
                void confirmationQuery.refetch();
              }}
              className="h-12 rounded-xl border border-slate-200 bg-white px-6 text-slate-700 hover:bg-slate-50"
            >
              Try Again
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => navigate("/login", { replace: true })}
              className="h-12 rounded-xl bg-[#1D5CE8] px-6 text-white hover:bg-[#184CC0]"
            >
              Go to Login
            </Button>
          </div>
        </AuthCard>
      )}

      {isMissingParams && (
        <AuthCard size="compact" className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF4ED] text-[#EA580C]">
            <AlertTriangle className="h-12 w-12" strokeWidth={1.8} />
          </div>
          <h1 className="mt-8 text-3xl font-bold tracking-[-0.03em] text-slate-900">
            Invalid or expired link
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-500">
            This confirmation link is missing required data. Open the latest email and try again,
            or continue to login if your account is already verified.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              size="lg"
              onClick={() => navigate("/login", { replace: true })}
              className="h-12 rounded-xl bg-[#1D5CE8] px-6 text-white hover:bg-[#184CC0]"
            >
              Go to Login
            </Button>
          </div>
        </AuthCard>
      )}

      {isGenericError && (
        <AuthCard size="compact" className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF4ED] text-[#EA580C]">
            <AlertTriangle className="h-12 w-12" strokeWidth={1.8} />
          </div>
          <h1 className="mt-8 text-3xl font-bold tracking-[-0.03em] text-slate-900">
            We couldn&apos;t confirm your email
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-500">
            A network or server error interrupted the verification request. Please try again in a
            moment.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                successHandledRef.current = false;
                void confirmationQuery.refetch();
              }}
              className="h-12 rounded-xl border border-slate-200 bg-white px-6 text-slate-700 hover:bg-slate-50"
            >
              Try Again
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => navigate("/login", { replace: true })}
              className="h-12 rounded-xl bg-[#1D5CE8] px-6 text-white hover:bg-[#184CC0]"
            >
              Go to Login
            </Button>
          </div>
        </AuthCard>
      )}
    </AuthFlowLayout>
  );
}
