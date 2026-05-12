import { useEffect, useMemo, useRef } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  LoaderCircle,
  MailCheck,
  Rocket,
  ShieldCheck,
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
    readAuthLinkParam(searchString, "email") ||
    readStoredPendingConfirmationEmail() ||
    "";

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

  const confirmationErrorMessage =
    confirmationQuery.error?.message.toLowerCase() ?? "";

  const confirmationErrorStatus = confirmationQuery.error?.status;

  const isInvalidOrExpiredState =
    !isMissingParams &&
    confirmationQuery.isError &&
    (confirmationErrorStatus === 400 ||
      confirmationErrorStatus === 404 ||
      confirmationErrorStatus === 410) &&
    isInvalidOrExpiredConfirmationError(confirmationErrorMessage);

  const isLoading =
    !isMissingParams &&
    !isInvalidOrExpiredState &&
    confirmationQuery.isPending;

  const isSuccess =
    !isMissingParams &&
    confirmationQuery.isSuccess;

  const isGenericError =
    !isMissingParams &&
    confirmationQuery.isError &&
    !isInvalidOrExpiredState;

  useEffect(() => {
    successHandledRef.current = false;
  }, [confirmationPayload?.token, confirmationPayload?.userId]);

  useEffect(() => {
    if (
      !isSuccess ||
      successHandledRef.current ||
      !confirmationPayload
    ) {
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
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ECF4FF]">
            <LoaderCircle
              className="h-10 w-10 animate-spin text-[#2C6BFF]"
              strokeWidth={1.8}
            />
          </div>

          <h1 className="mt-6 text-[2rem] font-bold tracking-[-0.04em] text-slate-900">
            Confirming your email...
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Please wait while we verify your confirmation link.
          </p>
        </AuthCard>
      )}

      {isSuccess && (
        <AuthCard size="compact" className="text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_rgba(59,130,246,0.05))]">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#E8FFF0] text-[#22A958] shadow-[0_10px_30px_rgba(34,197,94,0.12)]">
              <MailCheck className="h-7 w-7" strokeWidth={1.8} />
            </div>

            <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#22A958] text-white shadow-md">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </div>
          </div>

          <h1 className="mt-5 text-[2.1rem] font-bold tracking-[-0.05em] text-slate-900">
            Email Confirmed!
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Your email has been successfully verified.
            <br />
            You can now securely access your Finexa account.
          </p>

          <div className="mt-5 space-y-2 text-sm text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#22A958]" />
              <span>Your account is now verified and secure.</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Rocket className="h-4 w-4 text-[#2C6BFF]" />
              <span>You can now access all Finexa features.</span>
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={() => navigate("/login", { replace: true })}
            className="mt-6 h-11 w-full rounded-xl bg-[#1D5CE8] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(29,92,232,0.18)] hover:bg-[#184CC0]"
          >
            Go to Login
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="mt-5 text-center text-xs leading-5 text-slate-400 sm:text-sm">
            If you didn&apos;t create an account with Finexa,
            <span className="font-medium text-[#2C6BFF]">
              {" "}
              you can safely ignore this email.
            </span>
          </p>
        </AuthCard>
      )}

      {isInvalidOrExpiredState && (
        <AuthCard size="compact" className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF7E8] text-[#D97706]">
            <AlertTriangle className="h-10 w-10" strokeWidth={1.8} />
          </div>

          <h1 className="mt-6 text-[2rem] font-bold tracking-[-0.04em] text-slate-900">
            Invalid or expired link
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            This confirmation link is no longer valid.
            <br />
            Please try again or continue to login.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                successHandledRef.current = false;
                void confirmationQuery.refetch();
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-6 text-slate-700 hover:bg-slate-50"
            >
              Try Again
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={() => navigate("/login", { replace: true })}
              className="h-11 rounded-xl bg-[#1D5CE8] px-6 text-white hover:bg-[#184CC0]"
            >
              Go to Login
            </Button>
          </div>
        </AuthCard>
      )}

      {isMissingParams && (
        <AuthCard size="compact" className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF4ED] text-[#EA580C]">
            <AlertTriangle className="h-10 w-10" strokeWidth={1.8} />
          </div>

          <h1 className="mt-6 text-[2rem] font-bold tracking-[-0.04em] text-slate-900">
            Invalid confirmation link
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            This link is missing required verification data.
          </p>

          <Button
            type="button"
            size="lg"
            onClick={() => navigate("/login", { replace: true })}
            className="mt-6 h-11 rounded-xl bg-[#1D5CE8] px-6 text-white hover:bg-[#184CC0]"
          >
            Go to Login
          </Button>
        </AuthCard>
      )}

      {isGenericError && (
        <AuthCard size="compact" className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF4ED] text-[#EA580C]">
            <AlertTriangle className="h-10 w-10" strokeWidth={1.8} />
          </div>

          <h1 className="mt-6 text-[2rem] font-bold tracking-[-0.04em] text-slate-900">
            We couldn&apos;t confirm your email
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            A network or server error interrupted the verification request.
            <br />
            Please try again in a moment.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                successHandledRef.current = false;
                void confirmationQuery.refetch();
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-6 text-slate-700 hover:bg-slate-50"
            >
              Try Again
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={() => navigate("/login", { replace: true })}
              className="h-11 rounded-xl bg-[#1D5CE8] px-6 text-white hover:bg-[#184CC0]"
            >
              Go to Login
            </Button>
          </div>
        </AuthCard>
      )}
    </AuthFlowLayout>
  );
}