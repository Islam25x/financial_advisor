import type { ReactNode } from "react";
import { Card } from "../../../../shared/ui";
import { cn } from "../../../../shared/ui/types";

type AuthCardProps = {
  children: ReactNode;
  size?: "compact" | "default";
  className?: string;
};

const SIZE_STYLES = {
  compact: "max-w-[420px] px-5 py-6 sm:px-6",
  default: "max-w-[440px] px-5 py-6 sm:px-6",
} as const;

export default function AuthCard({
  children,
  size = "default",
  className,
}: AuthCardProps) {
  return (
    <Card
      variant="elevated"
      padding="md"
      className={cn(
        "relative z-10 mx-auto w-full rounded-[30px] border border-white/80 bg-white/92 shadow-[0_30px_90px_rgba(59,130,246,0.14)] backdrop-blur-xl",
        SIZE_STYLES[size],
        className,
      )}
    >
      {children}
    </Card>
  );
}
