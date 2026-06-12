import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { Calendar, CircleUser, Mail, Phone, Save } from "lucide-react";
import { useUserProfile } from "../hooks/useUserProfile";
import { useUpdateUserProfile } from "../hooks/useUpdateUserProfile";

type FormDataType = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
};

type ErrorsType = Partial<Record<keyof FormDataType, string>>;

type FieldType = {
  id: keyof FormDataType;
  label: string;
  type: string;
  icon?: ReactNode;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
};

type FormNotice = {
  tone: "success" | "error";
  message: string;
} | null;

function formatDateForInput(
  value: Date | string | null,
): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.split("T")[0];
  }

  return [
    value.getFullYear(),
    `${value.getMonth() + 1}`.padStart(2, "0"),
    `${value.getDate()}`.padStart(2, "0"),
  ].join("-");
}

const ProfileInfo = () => {
  const { data: profile, isLoading, isError, error } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
  });
  const [errors, setErrors] = useState<ErrorsType>({});
  const [notice, setNotice] = useState<FormNotice>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      username: profile.username,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      dateOfBirth: formatDateForInput(profile.dateOfBirth),
    });
  }, [profile]);

  const hasChanges = profile
    ? formData.firstName !== profile.firstName ||
    formData.lastName !== profile.lastName ||
    formData.phoneNumber !== profile.phoneNumber ||
    formData.dateOfBirth !==
    formatDateForInput(profile.dateOfBirth)
    : false;

  const validate = (): boolean => {
    const newErrors: ErrorsType = {};
    const nameRegex = /^[A-Za-z\s'-]+$/;
    const phoneRegex = /^[0-9]+$/;

    if (
      formData.firstName &&
      !nameRegex.test(formData.firstName)
    ) {
      newErrors.firstName =
        "First name must contain only letters";
    }

    if (
      formData.firstName &&
      !nameRegex.test(formData.lastName)
    ) {
      newErrors.firstName =
        "First name must contain only letters";
    }

    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must contain only numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNotice(null);
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotice(null);

    if (!validate()) {
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth || "",
      });

      setNotice({
        tone: "success",
        message: "Profile updated successfully.",
      });
    } catch (submitError) {
      setNotice({
        tone: "error",
        message:
          submitError instanceof Error
            ? submitError.message
            : "Failed to update profile. Please try again.",
      });
    }
  };

  const inputClass =
    "flex h-9 w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200";

  const fields: FieldType[][] = [
    [
      {
        id: "firstName",
        label: "First Name",
        type: "text",
        icon: <CircleUser size={18} />,
        placeholder: "First Name",
      },
      {
        id: "lastName",
        label: "Last Name",
        type: "text",
        placeholder: "Last Name",
      },
    ],
    [
      {
        id: "username",
        label: "Username",
        type: "text",
        icon: <CircleUser size={18} />,
        disabled: true,
        value: formData.username,
      },
      {
        id: "email",
        label: "Email",
        type: "email",
        icon: <Mail size={18} />,
        placeholder: "Email",
        disabled: true,
        value: formData.email,
      },
    ],
    [
      {
        id: "dateOfBirth",
        label: "Date of Birth",
        type: "date",
        icon: <Calendar size={18} />,
      },
      {
        id: "phoneNumber",
        label: "Phone",
        type: "tel",
        icon: <Phone size={18} />,
        placeholder: "Phone",
      },
    ],
  ];

  return (
    <section id="ProfileInfo">
      <div className="mb-3 flex flex-col gap-1">
        <h3 className="text-xl font-semibold text-slate-900">Identity & details</h3>
        <p className="text-sm leading-5 text-slate-500">
          Update your personal information to keep your financial workspace accurate and
          personalized.
        </p>
      </div>

      {isLoading && (
        <p className="mb-4 text-sm text-slate-500">Loading profile information...</p>
      )}
      {isError && <p className="mb-4 text-sm text-red-500">{error.message}</p>}
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

      <form className="space-y-3" data-aos="zoom-in" data-aos-duration="500" onSubmit={handleSubmit}>
        {fields.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {row.map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{field.label}</label>
                <div className="relative">
                  {field.icon && (
                    <span className="absolute left-3.5 top-2.5 text-slate-400">
                      {field.icon}
                    </span>
                  )}
                  <input
                    type={field.type}
                    name={field.id}
                    value={field.disabled ? field.value ?? "" : formData[field.id] ?? ""}
                    onChange={field.disabled ? undefined : handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={field.disabled || updateProfileMutation.isPending}
                    className={`${inputClass} ${field.icon ? "pl-10" : ""} ${field.disabled
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : ""
                      }`}
                  />
                  {errors[field.id] && (
                    <p className="mt-1.5 text-sm text-red-500">{errors[field.id]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="flex justify-start pt-0.5">
          <button
            type="submit"
            disabled={
              updateProfileMutation.isPending ||
              !hasChanges
            }
            className="inline-flex h-9 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(14,165,233,0.24)] transition hover:from-sky-500 hover:to-sky-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            <Save size={18} className="mr-2" />
            {updateProfileMutation.isPending ? "Saving..." : "Update Profile"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ProfileInfo;
