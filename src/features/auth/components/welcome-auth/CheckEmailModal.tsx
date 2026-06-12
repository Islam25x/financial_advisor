import { X } from "lucide-react";
import { CheckEmailPanel } from "../../../../routes/pages/CheckEmailPage";

interface CheckEmailModalProps {
  email: string;
  onClose: () => void;
  onGoToLogin: () => void;
}

export default function CheckEmailModal({
  email,
  onClose,
  onGoToLogin,
}: CheckEmailModalProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 z-10 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/70 hover:text-slate-700"
        aria-label="Close authentication modal"
      >
        <X size={18} />
      </button>

      <CheckEmailPanel email={email} embedded onGoToLogin={onGoToLogin} />
    </div>
  );
}
