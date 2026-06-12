import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { ImageUp, Upload, X } from "lucide-react";
import { ApiError } from "../../../infrastructure/api/api-error";
import { Button, Text, useToast } from "../../../shared/ui";
import { useUploadImage } from "../hooks/useUploadImage";

type ProfileImageUploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type AvatarUploadCircleProps = {
  previewUrl: string | null;
  inputId: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  onTriggerUpload: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function AvatarUploadCircle({
  previewUrl,
  inputId,
  inputRef,
  isUploading,
  onTriggerUpload,
  onFileChange,
}: AvatarUploadCircleProps) {
  return (
    <div className="relative flex justify-center">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
        disabled={isUploading}
      />

      <button
        type="button"
        onClick={onTriggerUpload}
        disabled={isUploading}
        className="group relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-sky-300/80 bg-gradient-to-br from-white via-sky-50 to-slate-50 shadow-[0_20px_50px_rgba(14,165,233,0.12)] transition hover:border-primary hover:shadow-[0_22px_56px_rgba(14,165,233,0.18)] focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-70"
        aria-label={previewUrl ? "Change profile picture" : "Upload profile picture"}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Selected profile preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center text-slate-500">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-[0_12px_24px_rgba(14,165,233,0.14)]">
              <ImageUp size={26} strokeWidth={1.8} />
            </span>
            <div className="space-y-1">
              <Text weight="bold" className="text-sm text-slate-800">
                Click to upload
              </Text>
            </div>
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={onTriggerUpload}
        disabled={isUploading}
        className="absolute bottom-0 right-19 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-[0_14px_28px_rgba(15,23,42,0.14)] transition hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-70"
        aria-label={previewUrl ? "Edit profile picture" : "Upload profile picture"}
      >
        <Upload size={20} strokeWidth={1.9} />
      </button>
    </div>
  );
}

function ProfileImageUploadModal({
  isOpen,
  onClose,
}: ProfileImageUploadModalProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const uploadImageMutation = useUploadImage();
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setErrorMessage(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }

        return null;
      });
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return nextPreviewUrl;
    });

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [selectedFile]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !uploadImageMutation.isPending) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, uploadImageMutation.isPending]);

  const handleTriggerUpload = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setErrorMessage(null);

    if (!nextFile) {
      setSelectedFile(null);
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      setSelectedFile(null);
      setErrorMessage("Please choose a valid image file.");
      event.target.value = "";
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setErrorMessage("Image must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedFile(nextFile);
  };

  const handleClose = () => {
    if (uploadImageMutation.isPending) {
      return;
    }

    onClose();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setErrorMessage(null);

    try {
      await uploadImageMutation.mutateAsync(selectedFile);
      showToast({
        message: "Profile picture uploaded successfully.",
        tone: "success",
      });
      onClose();
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Failed to upload profile picture.";

      setErrorMessage(message);
      showToast({
        message,
        tone: "error",
      });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-image-upload-title"
        className="w-full max-w-[420px] rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.14)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <Text
            as="h2"
            id="profile-image-upload-title"
            variant="subtitle"
            weight="bold"
            className="text-slate-900"
          >
            Upload Profile Picture
          </Text>

          <Button
            type="button"
            variant="ghost"
            shape="circle"
            size="sm"
            className="text-slate-500 hover:bg-slate-100"
            onClick={handleClose}
            disabled={uploadImageMutation.isPending}
            aria-label="Close upload modal"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="px-5 pb-5">
          <div className="rounded-[24px] border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 px-5 py-6 text-center">
            <AvatarUploadCircle
              previewUrl={previewUrl}
              inputId={inputId}
              inputRef={inputRef}
              isUploading={uploadImageMutation.isPending}
              onTriggerUpload={handleTriggerUpload}
              onFileChange={handleFileChange}
            />

            <div className="mt-5 space-y-1">
              {!previewUrl && (
                <Text className="text-sm text-slate-500">
                  Click the circle to choose your image
                </Text>
              )}
              <Text className="text-sm text-slate-500">PNG, JPG up to 5MB</Text>
              {errorMessage && (
                <Text className="text-sm text-rose-600" aria-live="polite">
                  {errorMessage}
                </Text>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="h-11 flex-1 rounded-2xl"
                onClick={handleClose}
                disabled={uploadImageMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                className="h-11 flex-1 rounded-2xl shadow-[0_14px_28px_rgba(14,165,233,0.24)]"
                onClick={() => {
                  void handleUpload();
                }}
                disabled={!selectedFile}
                loading={uploadImageMutation.isPending}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export type { ProfileImageUploadModalProps };
export default ProfileImageUploadModal;
