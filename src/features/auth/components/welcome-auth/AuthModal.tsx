import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import CheckEmailModal from "./CheckEmailModal";
import ForgotPasswordForm from "./ForgotPasswordForm";
import ForgotPasswordSuccess from "./ForgotPasswordSuccess";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type AuthMode =
  | "login"
  | "signup"
  | "check-email"
  | "forgot-password"
  | "forgot-password-check-email";

interface AuthModalProps {
  isOpen: boolean;
  authMode: AuthMode;
  authBanner: {
    tone: "success" | "error";
    text: string;
  } | null;
  confirmationEmail: string;
  passwordResetEmail: string;
  loginData: {
    email: string;
    password: string;
  };
  loginErrors: {
    email?: string;
    password?: string;
  };
  loginPending: boolean;
  forgotPasswordData: {
    email: string;
  };
  forgotPasswordErrors: {
    email?: string;
    form?: string;
  };
  forgotPasswordPending: boolean;
  registerData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    agree: boolean;
  };
  registerErrors: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agree?: string;
    form?: string;
  };
  registerPending: boolean;
  onClose: () => void;
  onLoginChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onForgotPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onForgotPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRegisterChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onRegisterSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSwitchToForgotPassword: () => void;
  onSwitchToLogin: (email?: string) => void;
  onSwitchToSignup: () => void;
}

const MODAL_TRANSITION = {
  duration: 0.2,
  ease: "easeOut",
} as const;

const panelClassName =
  "relative rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-8";

export default function AuthModal({
  isOpen,
  authMode,
  authBanner,
  confirmationEmail,
  passwordResetEmail,
  loginData,
  loginErrors,
  loginPending,
  forgotPasswordData,
  forgotPasswordErrors,
  forgotPasswordPending,
  registerData,
  registerErrors,
  registerPending,
  onClose,
  onLoginChange,
  onLoginSubmit,
  onForgotPasswordChange,
  onForgotPasswordSubmit,
  onRegisterChange,
  onRegisterSubmit,
  onSwitchToForgotPassword,
  onSwitchToLogin,
  onSwitchToSignup,
}: AuthModalProps) {
  const widthClassName = authMode === "check-email" ? "max-w-4xl" : "max-w-2xl";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MODAL_TRANSITION}
          className="fixed inset-0 z-40 overflow-y-auto bg-slate-900/45 p-4 backdrop-blur-sm sm:p-6"
          onClick={onClose}
        >
          <div className="flex min-h-full items-start justify-center py-6 sm:items-center">
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={MODAL_TRANSITION}
              className={`w-full ${widthClassName}`}
              onClick={(event) => event.stopPropagation()}
            >
              {authMode === "check-email" ? (
                <CheckEmailModal
                  email={confirmationEmail}
                  onClose={onClose}
                  onGoToLogin={() => onSwitchToLogin(confirmationEmail)}
                />
              ) : (
                <div className={panelClassName}>
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/70 hover:text-slate-700"
                    aria-label="Close authentication modal"
                  >
                    <X size={18} />
                  </button>

                  {authMode === "login" ? (
                    <LoginForm
                      data={loginData}
                      errors={loginErrors}
                      isSubmitting={loginPending}
                      onChange={onLoginChange}
                      onSubmit={onLoginSubmit}
                      onForgotPassword={onSwitchToForgotPassword}
                      onSwitchToSignup={onSwitchToSignup}
                    />
                  ) : authMode === "forgot-password" ? (
                    <ForgotPasswordForm
                      data={forgotPasswordData}
                      errors={forgotPasswordErrors}
                      isSubmitting={forgotPasswordPending}
                      onChange={onForgotPasswordChange}
                      onSubmit={onForgotPasswordSubmit}
                      onBackToLogin={() => onSwitchToLogin(forgotPasswordData.email)}
                    />
                  ) : authMode === "forgot-password-check-email" ? (
                    <ForgotPasswordSuccess
                      email={passwordResetEmail}
                      onBackToLogin={() => onSwitchToLogin(passwordResetEmail)}
                    />
                  ) : (
                    <RegisterForm
                      data={registerData}
                      errors={registerErrors}
                      authBanner={authBanner}
                      isSubmitting={registerPending}
                      onChange={onRegisterChange}
                      onSubmit={onRegisterSubmit}
                      onSwitchToLogin={() => onSwitchToLogin()}
                    />
                  )}
                </div>
              )}
            </motion.section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
