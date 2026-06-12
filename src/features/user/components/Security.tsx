import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Lock, Trash2 } from "lucide-react";
import { useChangePassword } from "../hooks/useChangePassword";
import { useDeleteUser } from "../hooks/useDeleteUser";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/auth/AuthContext";

type FormDataType = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ErrorsType = Partial<Record<keyof FormDataType, string>>;

type NoticeType = {
  tone: "success" | "error";
  message: string;
} | null;

const Security = () => {
  const changePasswordMutation = useChangePassword();
  const deleteUserMutation = useDeleteUser();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [formData, setFormData] = useState<FormDataType>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ErrorsType>({});
  const [notice, setNotice] = useState<NoticeType>(null);

  const hasChanges = useMemo(() => {
    return (
      formData.currentPassword.trim() !== "" ||
      formData.newPassword.trim() !== "" ||
      formData.confirmPassword.trim() !== ""
    );
  }, [formData]);

  const validate = (): boolean => {
    const nextErrors: ErrorsType = {};

    if (formData.currentPassword.length < 6) {
      nextErrors.currentPassword =
        "Current password must be at least 6 characters.";
    }

    if (formData.newPassword.length < 6) {
      nextErrors.newPassword =
        "New password must be at least 6 characters.";
    }

    if (
      formData.newPassword &&
      formData.newPassword === formData.currentPassword
    ) {
      nextErrors.newPassword =
        "Please choose a different password.";
    }

    if (
      formData.confirmPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      nextErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setNotice(null);

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }));

    setFormData((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setErrors({});
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setNotice(null);

    if (!validate()) {
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setNotice({
        tone: "success",
        message: "Password changed successfully.",
      });

      resetForm();
    } catch (submitError) {
      setNotice({
        tone: "error",
        message:
          submitError instanceof Error
            ? submitError.message
            : "Failed to change password.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account?",
    );

    if (!confirmed) {
      return;
    }

    setNotice(null);

    try {
      await deleteUserMutation.mutateAsync();
      await logout();
      navigate("/", { replace: true });
    } catch (deleteError) {
      setNotice({
        tone: "error",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete account.",
      });
    }
  };

  const inputClass =
    "flex h-9 w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 pl-10 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200";

  return (
    <section id="Security">
      <div className="mb-3 flex flex-col gap-1">
        <h3 className="text-xl font-semibold text-slate-900">
          Credential controls
        </h3>

        <p className="text-sm leading-5 text-slate-500">
          Manage password hygiene and keep your
          financial account protected.
        </p>
      </div>

      {notice && (
        <div
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${notice.tone === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
            }`}
          aria-live="polite"
        >
          {notice.message}
        </div>
      )}

      <form
        className="space-y-3"
        data-aos="zoom-in"
        data-aos-duration="500"
        onSubmit={handleSubmit}
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Current Password
          </label>

          <div className="relative">
            <Lock
              className="absolute left-3.5 top-2.5 text-slate-400"
              size={18}
            />

            <input
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              className={inputClass}
              name="currentPassword"
              placeholder="Current Password"
              disabled={
                changePasswordMutation.isPending ||
                deleteUserMutation.isPending
              }
            />

            {errors.currentPassword && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.currentPassword}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            New Password
          </label>

          <div className="relative">
            <Lock
              className="absolute left-3.5 top-2.5 text-slate-400"
              size={18}
            />

            <input
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              className={inputClass}
              name="newPassword"
              placeholder="New Password"
              disabled={
                changePasswordMutation.isPending ||
                deleteUserMutation.isPending
              }
            />

            {errors.newPassword && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.newPassword}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Confirm Password
          </label>

          <div className="relative">
            <Lock
              className="absolute left-3.5 top-2.5 text-slate-400"
              size={18}
            />

            <input
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={inputClass}
              name="confirmPassword"
              placeholder="Confirm Password"
              disabled={
                changePasswordMutation.isPending ||
                deleteUserMutation.isPending
              }
            />

            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-1.5 md:flex-row">
          <button
            type="submit"
            disabled={
              changePasswordMutation.isPending ||
              deleteUserMutation.isPending ||
              !hasChanges
            }
            className="inline-flex h-9 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(14,165,233,0.24)] transition hover:from-sky-500 hover:to-sky-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            <Lock className="mr-2" size={18} />

            {changePasswordMutation.isPending
              ? "Updating..."
              : "Change Password"}
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleteUserMutation.isPending}
            className="inline-flex h-9 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="mr-2" size={18} />

            {deleteUserMutation.isPending
              ? "Deleting..."
              : "Delete Account"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Security;
